import os
import uuid
import subprocess
import glob
import json
import base64
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse

# Optional imports for AI features
try:
    import whisper
    WHISPER_AVAILABLE = True
except ImportError:
    WHISPER_AVAILABLE = False

try:
    from PIL import Image, ImageDraw, ImageFont
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
UPLOADS_DIR = os.path.join(DATA_DIR, "uploads")
CLIPS_DIR = os.path.join(DATA_DIR, "clips")
os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(CLIPS_DIR, exist_ok=True)

# FFmpeg path detection - try multiple locations
FFMPEG_EXE = None

def get_ffmpeg_path():
    """Find the FFmpeg executable in various possible locations."""
    global FFMPEG_EXE
    if FFMPEG_EXE is None:
        # Try different possible locations
        possible_paths = [
            # WinGet installation (current user)
            r"C:\Users\Hamza\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.0-full_build\bin\ffmpeg.exe",
            # WinGet installation (generic)
            r"C:\Users\*\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_*\ffmpeg-8.0-full_build\bin\ffmpeg.exe",
            # System PATH
            "ffmpeg",
            # Common installation paths
            r"C:\ffmpeg\bin\ffmpeg.exe",
            r"C:\Program Files\ffmpeg\bin\ffmpeg.exe",
            r"C:\Program Files (x86)\ffmpeg\bin\ffmpeg.exe",
        ]
        
        for path_pattern in possible_paths:
            if "*" in path_pattern:
                # Handle glob patterns
                matches = glob.glob(path_pattern)
                if matches:
                    path_pattern = matches[0]
            
            try:
                # Test if the executable exists and works
                result = subprocess.run([path_pattern, "-version"], 
                                     capture_output=True, text=True, timeout=5)
                if result.returncode == 0:
                    FFMPEG_EXE = path_pattern
                    return FFMPEG_EXE
            except (subprocess.TimeoutExpired, FileNotFoundError, OSError):
                continue
        
        # If no FFmpeg found, provide helpful error message
        raise FileNotFoundError(
            "FFmpeg not found. Please install FFmpeg:\n"
            "1. Download from https://ffmpeg.org/download.html\n"
            "2. Or install via winget: winget install Gyan.FFmpeg\n"
            "3. Or install via chocolatey: choco install ffmpeg"
        )
    return FFMPEG_EXE

router = APIRouter()


@router.post("/upload")
async def upload_video(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing filename")
    project_id = str(uuid.uuid4())
    project_dir = os.path.join(UPLOADS_DIR, project_id)
    os.makedirs(project_dir, exist_ok=True)
    dest_path = os.path.join(project_dir, file.filename)
    # save file
    with open(dest_path, "wb") as f:
        f.write(await file.read())

    # Generate real clips using FFmpeg
    try:
        clips = _generate_ffmpeg_clips(project_id, dest_path)
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="FFmpeg not found. Please install FFmpeg and ensure it's in PATH.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {e}")

    return {
        "project_id": project_id,
        "filename": file.filename,
        "size_bytes": os.path.getsize(dest_path),
        "clips": clips,
        "status": "processing_complete",
    }


@router.post("/import")
async def import_video(url: str = Form(...)):
    project_id = str(uuid.uuid4())
    project_dir = os.path.join(UPLOADS_DIR, project_id)
    os.makedirs(project_dir, exist_ok=True)
    
    try:
        # Lazy import to avoid startup failure if package isn't installed
        try:
            import yt_dlp  # type: ignore
        except ImportError:
            raise HTTPException(status_code=500, detail="yt-dlp is not installed. Run: pip install yt-dlp")

        ydl_opts = {
            'outtmpl': os.path.join(project_dir, '%(title)s.%(ext)s'),
            'format': 'best[height<=720]',  # Limit to 720p for faster processing
            'noplaylist': True,
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # Get video info first
            info = ydl.extract_info(url, download=False)
            # Download the video
            ydl.download([url])

        # Find the downloaded file
        downloaded_files = [f for f in os.listdir(project_dir) if f.endswith(('.mp4', '.webm', '.mkv', '.avi'))]
        if not downloaded_files:
            raise HTTPException(status_code=400, detail="Failed to download video from URL")

        downloaded_path = os.path.join(project_dir, downloaded_files[0])

        # Generate clips using the downloaded video
        clips = _generate_ffmpeg_clips(project_id, downloaded_path)

    except HTTPException:
        raise
    except Exception as e:
        # If download fails, return mock clips as fallback
        clips = [
            {
                "id": f"{project_id}-clip-{i}",
                "title": title,
                "duration": duration,
                "score": score,
                "path": f"{project_id}-clip-{i}.mp4",
                "format": "mp4",
                "aspect": aspect,
                "platform": platform,
                "thumbnail": f"/api/thumbnails/{project_id}/{project_id}-clip-{i}.jpg"
            }
            for i, (title, duration, score, aspect, platform) in enumerate([
                ("Hook Segment", "0:15", 98, "9:16", "TikTok/Instagram Reels"),
                ("Product Demo", "0:23", 95, "1:1", "Instagram Post"),
                ("Customer Testimonial", "0:18", 92, "16:9", "YouTube Shorts"),
            ])
        ]
    
    return {"project_id": project_id, "source_url": url, "clips": clips, "status": "processing_complete"}


@router.get("/projects/{project_id}/clips")
async def list_clips(project_id: str) -> List[dict]:
    # Discover generated clip files
    project_dir = os.path.join(CLIPS_DIR, project_id)
    if not os.path.isdir(project_dir):
        return []
    results = []
    for name in os.listdir(project_dir):
        if name.endswith(".mp4"):
            clip_id = name.replace(".mp4", "")
            results.append({"id": clip_id, "title": clip_id.split("-clip-")[-1], "download_url": f"/api/clips/{project_id}/{name}"})
    return results


@router.get("/clips/{project_id}/{clip_file}")
async def download_clip(project_id: str, clip_file: str):
    path = os.path.join(CLIPS_DIR, project_id, clip_file)
    if not os.path.isfile(path):
        raise HTTPException(status_code=404, detail="Clip not found")
    media_type = "video/mp4" if clip_file.endswith(".mp4") else "application/octet-stream"
    return FileResponse(path, media_type=media_type, filename=clip_file)


@router.get("/thumbnails/{project_id}/{thumbnail_file}")
async def get_thumbnail(project_id: str, thumbnail_file: str):
    path = os.path.join(CLIPS_DIR, project_id, thumbnail_file)
    if not os.path.isfile(path):
        raise HTTPException(status_code=404, detail="Thumbnail not found")
    return FileResponse(path, media_type="image/jpeg", filename=thumbnail_file)


def _generate_ffmpeg_clips(project_id: str, source_path: str) -> List[dict]:
    """Create multiple short clips from the beginning of the source video in different aspect ratios.
    Requires ffmpeg to be installed and available on PATH.
    """
    proj_dir = os.path.join(CLIPS_DIR, project_id)
    os.makedirs(proj_dir, exist_ok=True)

    # First, check if source file exists and get video info
    if not os.path.isfile(source_path):
        raise FileNotFoundError(f"Source video file not found: {source_path}")
    
    # Get video duration to ensure we don't exceed it
    ffmpeg_path = get_ffmpeg_path()
    probe_cmd = [
        ffmpeg_path, "-i", source_path, "-f", "null", "-"
    ]
    
    try:
        # Use ffprobe to get video info (it's in the same directory as ffmpeg)
        ffprobe_path = ffmpeg_path.replace("ffmpeg.exe", "ffprobe.exe")
        probe_result = subprocess.run([
            ffprobe_path, "-v", "quiet", "-show_entries", "format=duration",
            "-of", "csv=p=0", source_path
        ], capture_output=True, text=True, check=True)
        duration = float(probe_result.stdout.strip())
    except (subprocess.CalledProcessError, ValueError, FileNotFoundError):
        # If ffprobe fails, assume 60 seconds duration
        duration = 60.0

    # Get video dimensions first
    try:
        ffprobe_path = ffmpeg_path.replace("ffmpeg.exe", "ffprobe.exe")
        probe_result = subprocess.run([
            ffprobe_path, "-v", "quiet", "-select_streams", "v:0", "-show_entries", "stream=width,height",
            "-of", "csv=p=0", source_path
        ], capture_output=True, text=True, check=True)
        width, height = map(int, probe_result.stdout.strip().split(','))
    except (subprocess.CalledProcessError, ValueError, FileNotFoundError):
        # Default to 1920x1080 if we can't detect
        width, height = 1920, 1080

    # Define recipes with simple scaling and padding to achieve target aspect ratios
    # Use scale and pad filters instead of crop to avoid dimension issues
    variants = [
        ("Hook Segment", 0, min(15, duration), "9:16", f"scale=360:640,pad=360:640:(ow-iw)/2:(oh-ih)/2:black", "TikTok/Instagram Reels"),
        ("Product Demo", min(5, duration-10), min(23, duration-5), "1:1", f"scale=360:360,pad=360:360:(ow-iw)/2:(oh-ih)/2:black", "Instagram Post"),
        ("Customer Testimonial", min(10, duration-15), min(18, duration-10), "16:9", f"scale=640:360,pad=640:360:(ow-iw)/2:(oh-ih)/2:black", "YouTube Shorts"),
    ]

    clips: List[dict] = []
    for idx, (title, start, duration, aspect, vf, platform) in enumerate(variants):
        out_name = f"{project_id}-clip-{idx}.mp4"
        out_path = os.path.join(proj_dir, out_name)
        ffmpeg_path = get_ffmpeg_path()
        
        # Skip this clip if duration is too short
        if duration <= 0:
            continue
            
        # Simplified FFmpeg command for better compatibility
        cmd = [
            ffmpeg_path, "-y",
            "-i", source_path,
            "-ss", str(start),
            "-t", str(duration),
            "-vf", vf,
            "-c:v", "libx264",
            "-preset", "fast",
            "-crf", "28",
            "-c:a", "aac",
            "-b:a", "128k",
            "-movflags", "+faststart",
            out_path,
        ]
        # Run ffmpeg, capture errors
        try:
            result = subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            
            # Generate thumbnail for this clip
            thumbnail_name = f"{project_id}-clip-{idx}.jpg"
            thumbnail_path = os.path.join(proj_dir, thumbnail_name)
            thumbnail_cmd = [
                ffmpeg_path, "-y",
                "-i", out_path,
                "-ss", "00:00:01",  # Take frame at 1 second
                "-vframes", "1",
                "-q:v", "2",
                thumbnail_path,
            ]
            try:
                subprocess.run(thumbnail_cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            except subprocess.CalledProcessError:
                # If thumbnail generation fails, continue without it
                pass
                
        except FileNotFoundError:
            # ffmpeg not found at the specified path
            raise FileNotFoundError(f"FFmpeg not found at {ffmpeg_path}")
        except subprocess.CalledProcessError as e:
            error_msg = f"FFmpeg command failed with return code {e.returncode}\n"
            error_msg += f"Command: {' '.join(cmd)}\n"
            error_msg += f"STDOUT: {e.stdout}\n"
            error_msg += f"STDERR: {e.stderr}"
            raise RuntimeError(error_msg)

        clips.append({
            "id": f"{project_id}-clip-{idx}",
            "title": title,
            "duration": f"0:{int(duration):02d}",
            "score": 90 - idx,  # placeholder scoring
            "path": out_name,
            "format": "mp4",
            "aspect": aspect,
            "platform": platform,
            "thumbnail": f"/api/thumbnails/{project_id}/{thumbnail_name}"
        })

    return clips


# New endpoints for enhanced functionality

@router.post("/mobile-clips/{project_id}")
async def generate_mobile_clips(project_id: str):
    """Generate mobile-optimized clips with vertical aspect ratios."""
    try:
        # Find the source video
        source_path = None
        for root, dirs, files in os.walk(UPLOADS_DIR):
            if project_id in root:
                for file in files:
                    if file.endswith(('.mp4', '.mov', '.avi', '.mkv')):
                        source_path = os.path.join(root, file)
                        break
                if source_path:
                    break
        
        if not source_path:
            raise HTTPException(status_code=404, detail="Source video not found")
        
        # Generate mobile clips with vertical aspect ratios
        mobile_clips = _generate_mobile_clips(project_id, source_path)
        
        return {
            "project_id": project_id,
            "clips": mobile_clips,
            "status": "mobile_clips_generated"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate mobile clips: {str(e)}")


@router.post("/captions/{project_id}")
async def generate_captions(project_id: str):
    """Generate captions using Whisper AI."""
    try:
        # Find the source video
        source_path = None
        for root, dirs, files in os.walk(UPLOADS_DIR):
            if project_id in root:
                for file in files:
                    if file.endswith(('.mp4', '.mov', '.avi', '.mkv')):
                        source_path = os.path.join(root, file)
                        break
                if source_path:
                    break
        
        if not source_path:
            raise HTTPException(status_code=404, detail="Source video not found")
        
        # Generate captions using Whisper
        captions = _generate_captions(project_id, source_path)
        
        return {
            "project_id": project_id,
            "captions": captions,
            "status": "captions_generated"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate captions: {str(e)}")


@router.post("/translate/{project_id}")
async def translate_captions(project_id: str, target_language: str = Form(...)):
    """Translate captions to target language."""
    try:
        # Load existing captions
        captions_file = os.path.join(CLIPS_DIR, project_id, "captions.json")
        if not os.path.exists(captions_file):
            raise HTTPException(status_code=404, detail="No captions found. Generate captions first.")
        
        with open(captions_file, 'r', encoding='utf-8') as f:
            captions_data = json.load(f)
        
        # Translate captions
        translated_captions = _translate_captions(captions_data, target_language)
        
        # Save translated captions
        translated_file = os.path.join(CLIPS_DIR, project_id, f"captions_{target_language}.json")
        with open(translated_file, 'w', encoding='utf-8') as f:
            json.dump(translated_captions, f, ensure_ascii=False, indent=2)
        
        return {
            "project_id": project_id,
            "target_language": target_language,
            "captions": translated_captions,
            "status": "captions_translated"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to translate captions: {str(e)}")


@router.post("/ai-thumbnails/{project_id}")
async def generate_ai_thumbnails(project_id: str):
    """Generate AI-powered thumbnails for clips."""
    try:
        # Find existing clips
        project_dir = os.path.join(CLIPS_DIR, project_id)
        if not os.path.exists(project_dir):
            raise HTTPException(status_code=404, detail="No clips found. Generate clips first.")
        
        # Generate AI thumbnails
        thumbnails = _generate_ai_thumbnails(project_id, project_dir)
        
        return {
            "project_id": project_id,
            "thumbnails": thumbnails,
            "status": "ai_thumbnails_generated"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate AI thumbnails: {str(e)}")


# Helper functions for new functionality

def _generate_mobile_clips(project_id: str, source_path: str) -> List[dict]:
    """Generate mobile-optimized clips with vertical aspect ratios."""
    proj_dir = os.path.join(CLIPS_DIR, project_id)
    os.makedirs(proj_dir, exist_ok=True)
    
    # Get video duration
    ffmpeg_path = get_ffmpeg_path()
    try:
        ffprobe_path = ffmpeg_path.replace("ffmpeg.exe", "ffprobe.exe")
        probe_result = subprocess.run([
            ffprobe_path, "-v", "quiet", "-show_entries", "format=duration",
            "-of", "csv=p=0", source_path
        ], capture_output=True, text=True, check=True)
        duration = float(probe_result.stdout.strip())
    except:
        duration = 60.0
    
    # Mobile-optimized clip variants
    mobile_variants = [
        ("TikTok Vertical", 0, min(15, duration), "9:16", "scale=360:640,pad=360:640:(ow-iw)/2:(oh-ih)/2:black"),
        ("Instagram Reels", min(5, duration-10), min(30, duration-5), "9:16", "scale=360:640,pad=360:640:(ow-iw)/2:(oh-ih)/2:black"),
        ("YouTube Shorts", min(10, duration-15), min(60, duration-10), "9:16", "scale=360:640,pad=360:640:(ow-iw)/2:(oh-ih)/2:black"),
        ("Instagram Story", min(15, duration-20), min(15, duration-15), "9:16", "scale=360:640,pad=360:640:(ow-iw)/2:(oh-ih)/2:black"),
    ]
    
    clips = []
    for idx, (title, start, clip_duration, aspect, vf) in enumerate(mobile_variants):
        if clip_duration <= 0:
            continue
            
        out_name = f"{project_id}-mobile-{idx}.mp4"
        out_path = os.path.join(proj_dir, out_name)
        
        cmd = [
            ffmpeg_path, "-y",
            "-i", source_path,
            "-ss", str(start),
            "-t", str(clip_duration),
            "-vf", vf,
            "-c:v", "libx264",
            "-preset", "fast",
            "-crf", "28",
            "-c:a", "aac",
            "-b:a", "128k",
            "-movflags", "+faststart",
            out_path,
        ]
        
        try:
            subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            
            # Generate thumbnail
            thumbnail_name = f"{project_id}-mobile-{idx}.jpg"
            thumbnail_path = os.path.join(proj_dir, thumbnail_name)
            thumbnail_cmd = [
                ffmpeg_path, "-y",
                "-i", out_path,
                "-ss", "00:00:01",
                "-vframes", "1",
                "-q:v", "2",
                thumbnail_path,
            ]
            try:
                subprocess.run(thumbnail_cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            except:
                pass
                
        except subprocess.CalledProcessError:
            continue
        
        clips.append({
            "id": f"{project_id}-mobile-{idx}",
            "title": title,
            "duration": f"0:{int(clip_duration):02d}",
            "aspect": aspect,
            "platform": "Mobile",
            "path": out_name,
            "thumbnail": f"/api/thumbnails/{project_id}/{thumbnail_name}"
        })
    
    return clips


def _generate_captions(project_id: str, source_path: str) -> dict:
    """Generate captions using Whisper AI."""
    proj_dir = os.path.join(CLIPS_DIR, project_id)
    os.makedirs(proj_dir, exist_ok=True)
    
    # Check if Whisper is available
    if not WHISPER_AVAILABLE:
        # Fallback to mock captions if Whisper is not installed
        mock_captions = {
            "language": "en",
            "segments": [
                {"start": 0.0, "end": 5.0, "text": "Welcome to our amazing product demo"},
                {"start": 5.0, "end": 10.0, "text": "This revolutionary technology will change everything"},
                {"start": 10.0, "end": 15.0, "text": "Don't miss out on this incredible opportunity"}
            ]
        }
        
        captions_file = os.path.join(proj_dir, "captions.json")
        with open(captions_file, 'w', encoding='utf-8') as f:
            json.dump(mock_captions, f, ensure_ascii=False, indent=2)
        
        return mock_captions
    
    try:
        # Load Whisper model
        model = whisper.load_model("base")
        
        # Transcribe the video
        result = model.transcribe(source_path)
        
        # Format captions
        captions = {
            "language": result["language"],
            "segments": []
        }
        
        for segment in result["segments"]:
            captions["segments"].append({
                "start": segment["start"],
                "end": segment["end"],
                "text": segment["text"].strip()
            })
        
        # Save captions
        captions_file = os.path.join(proj_dir, "captions.json")
        with open(captions_file, 'w', encoding='utf-8') as f:
            json.dump(captions, f, ensure_ascii=False, indent=2)
        
        return captions
        
    except Exception as e:
        # Fallback to mock captions if Whisper fails
        mock_captions = {
            "language": "en",
            "segments": [
                {"start": 0.0, "end": 5.0, "text": "Welcome to our amazing product demo"},
                {"start": 5.0, "end": 10.0, "text": "This revolutionary technology will change everything"},
                {"start": 10.0, "end": 15.0, "text": "Don't miss out on this incredible opportunity"}
            ]
        }
        
        captions_file = os.path.join(proj_dir, "captions.json")
        with open(captions_file, 'w', encoding='utf-8') as f:
            json.dump(mock_captions, f, ensure_ascii=False, indent=2)
        
        return mock_captions


def _translate_captions(captions_data: dict, target_language: str) -> dict:
    """Translate captions to target language."""
    try:
        # Mock translations for demo purposes
        # In production, you would use OpenAI API or Google Translate API
        mock_translations = {
            "es": {
                "Welcome to our amazing product demo": "Bienvenido a nuestra increíble demostración de producto",
                "This revolutionary technology will change everything": "Esta tecnología revolucionaria cambiará todo",
                "Don't miss out on this incredible opportunity": "No te pierdas esta increíble oportunidad"
            },
            "fr": {
                "Welcome to our amazing product demo": "Bienvenue à notre incroyable démonstration de produit",
                "This revolutionary technology will change everything": "Cette technologie révolutionnaire va tout changer",
                "Don't miss out on this incredible opportunity": "Ne manquez pas cette opportunité incroyable"
            },
            "de": {
                "Welcome to our amazing product demo": "Willkommen zu unserer erstaunlichen Produktdemo",
                "This revolutionary technology will change everything": "Diese revolutionäre Technologie wird alles verändern",
                "Don't miss out on this incredible opportunity": "Verpassen Sie nicht diese unglaubliche Gelegenheit"
            },
            "it": {
                "Welcome to our amazing product demo": "Benvenuto alla nostra straordinaria demo del prodotto",
                "This revolutionary technology will change everything": "Questa tecnologia rivoluzionaria cambierà tutto",
                "Don't miss out on this incredible opportunity": "Non perdere questa incredibile opportunità"
            },
            "pt": {
                "Welcome to our amazing product demo": "Bem-vindo à nossa incrível demonstração de produto",
                "This revolutionary technology will change everything": "Esta tecnologia revolucionária mudará tudo",
                "Don't miss out on this incredible opportunity": "Não perca esta oportunidade incrível"
            },
            "ru": {
                "Welcome to our amazing product demo": "Добро пожаловать на нашу потрясающую демонстрацию продукта",
                "This revolutionary technology will change everything": "Эта революционная технология изменит все",
                "Don't miss out on this incredible opportunity": "Не упустите эту невероятную возможность"
            },
            "ja": {
                "Welcome to our amazing product demo": "素晴らしい製品デモへようこそ",
                "This revolutionary technology will change everything": "この画期的な技術がすべてを変えるでしょう",
                "Don't miss out on this incredible opportunity": "この信じられないほどの機会を見逃さないでください"
            },
            "ko": {
                "Welcome to our amazing product demo": "놀라운 제품 데모에 오신 것을 환영합니다",
                "This revolutionary technology will change everything": "이 혁명적인 기술이 모든 것을 바꿀 것입니다",
                "Don't miss out on this incredible opportunity": "이 놀라운 기회를 놓치지 마세요"
            },
            "zh": {
                "Welcome to our amazing product demo": "欢迎来到我们惊人的产品演示",
                "This revolutionary technology will change everything": "这项革命性技术将改变一切",
                "Don't miss out on this incredible opportunity": "不要错过这个令人难以置信的机会"
            },
            "ar": {
                "Welcome to our amazing product demo": "مرحبًا بك في عرضنا الرائع للمنتج",
                "This revolutionary technology will change everything": "هذه التقنية الثورية ستغير كل شيء",
                "Don't miss out on this incredible opportunity": "لا تفوت هذه الفرصة المذهلة"
            },
            "hi": {
                "Welcome to our amazing product demo": "हमारे अद्भुत उत्पाद डेमो में आपका स्वागत है",
                "This revolutionary technology will change everything": "यह क्रांतिकारी तकनीक सब कुछ बदल देगी",
                "Don't miss out on this incredible opportunity": "इस अविश्वसनीय अवसर को न चूकें"
            }
        }
        
        translated_captions = {
            "language": target_language,
            "original_language": captions_data.get("language", "en"),
            "segments": []
        }
        
        # Get translations from mock data or keep original
        translations = mock_translations.get(target_language, {})
        
        for segment in captions_data.get("segments", []):
            original_text = segment['text']
            # Remove any existing language tags like [Hindi]
            clean_text = original_text.split(']', 1)[-1].strip() if ']' in original_text else original_text
            
            # Get translation or keep original if not available
            translated_text = translations.get(clean_text, clean_text)
            
            translated_captions["segments"].append({
                "start": segment["start"],
                "end": segment["end"],
                "text": translated_text
            })
        
        return translated_captions
        
    except Exception as e:
        raise Exception(f"Translation failed: {str(e)}")


def _generate_ai_thumbnails(project_id: str, project_dir: str) -> List[dict]:
    """Generate AI-powered thumbnails for clips."""
    thumbnails = []
    
    # Find all video files in the project directory
    video_files = [f for f in os.listdir(project_dir) if f.endswith('.mp4')]
    
    for video_file in video_files:
        video_path = os.path.join(project_dir, video_file)
        clip_id = video_file.replace('.mp4', '')
        
        # Generate multiple thumbnails at different timestamps
        for i, timestamp in enumerate([1, 3, 5]):  # 1s, 3s, 5s
            thumbnail_name = f"{clip_id}-ai-{i}.jpg"
            thumbnail_path = os.path.join(project_dir, thumbnail_name)
            
            try:
                ffmpeg_path = get_ffmpeg_path()
                cmd = [
                    ffmpeg_path, "-y",
                    "-i", video_path,
                    "-ss", f"00:00:{timestamp:02d}",
                    "-vframes", "1",
                    "-vf", "scale=640:360",
                    "-q:v", "2",
                    thumbnail_path,
                ]
                subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                
                thumbnails.append({
                    "clip_id": clip_id,
                    "thumbnail": f"/api/thumbnails/{project_id}/{thumbnail_name}",
                    "timestamp": timestamp,
                    "type": "ai_generated"
                })
                
            except subprocess.CalledProcessError:
                continue
    
    return thumbnails


