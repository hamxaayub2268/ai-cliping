import { useState, useRef, useCallback } from "react";
import { Upload, Link as LinkIcon, Play, Loader2, X, CheckCircle, FileVideo, Globe, Smartphone, Video, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { api, API_BASE_URL } from "@/lib/api";

const LANGUAGES = [
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
];

const UploadVideo = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedVideoInfo, setUploadedVideoInfo] = useState<any>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [clips, setClips] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewingClip, setPreviewingClip] = useState<string | null>(null);
  const [mobileClips, setMobileClips] = useState<any[]>([]);
  const [captions, setCaptions] = useState<any>(null);
  const [translatedCaptions, setTranslatedCaptions] = useState<any>(null);
  const [aiThumbnails, setAIThumbnails] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = (file: File) => {
    const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
    const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/quicktime', 'video/x-msvideo'];
    
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 2GB.",
        variant: "destructive",
      });
      return false;
    }
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please select a valid video file (MP4, MOV, AVI).",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const getVideoDuration = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const duration = video.duration;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        resolve(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      };
      video.onerror = () => resolve('0:00');
      video.src = URL.createObjectURL(file);
    });
  };

  const processFile = async (file: File) => {
    if (!validateFile(file)) return;
    setSelectedFile(file);
    setIsProcessing(true);
    setUploadProgress(0);
    
    try {
      console.log('Starting upload for file:', file.name);
      
      // Create FormData
      const formData = new FormData();
      formData.append("file", file);
      
      // Create XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
          console.log('Upload progress:', percentComplete + '%');
        }
      });
      
      // Handle response
      const uploadPromise = new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (e) {
              reject(new Error('Invalid response format'));
            }
          } else {
            reject(new Error(`Upload failed: ${xhr.status} - ${xhr.responseText}`));
          }
        };
        
        xhr.onerror = () => {
          reject(new Error('Upload failed: Network error'));
        };
        
        xhr.open('POST', `${API_BASE_URL}/api/upload`);
        xhr.send(formData);
      });
      
      const res = await uploadPromise as any;
      console.log('Upload response:', res);
      
      setUploadProgress(100);
      setIsProcessing(false);
      setProjectId(res.project_id);
      setClips(res.clips || []);
      
      // Get actual video duration
      const duration = await getVideoDuration(file);
      console.log('Video duration:', duration);
      
      setUploadedVideoInfo({
        name: res.filename || file.name,
        size: `${((res.size_bytes || file.size) / (1024 * 1024)).toFixed(2)} MB`,
        duration: duration,
        format: file.type.split('/')[1]?.toUpperCase() || 'MP4',
      });
    } catch (e: any) {
      console.error('Upload error:', e);
      setIsProcessing(false);
      toast({ title: "Upload failed", description: e?.message || String(e), variant: "destructive" });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input changed:', event.target.files);
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, file.size);
      processFile(file);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, []);

  const validateUrl = (url: string) => {
    const patterns = [
      /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/,
      /^https?:\/\/(www\.)?tiktok\.com/,
      /^https?:\/\/(www\.)?instagram\.com/,
      /^https?:\/\/(www\.)?twitter\.com/,
      /^https?:\/\/(www\.)?x\.com/,
      /^https?:\/\/(www\.)?vimeo\.com/,
      /^https?:\/\/(www\.)?facebook\.com/,
    ];
    
    return patterns.some(pattern => pattern.test(url));
  };

  const handleUrlSubmit = async () => {
    if (!videoUrl.trim()) {
      toast({
        title: "URL required",
        description: "Please enter a valid video URL.",
        variant: "destructive",
      });
      return;
    }
    
    if (!validateUrl(videoUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL from supported platforms.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    setUploadProgress(30);
    try {
      const res = await api.importVideo(videoUrl);
      setIsProcessing(false);
      setUploadProgress(100);
      setProjectId(res.project_id);
      setClips(res.clips || []);
      setUploadedVideoInfo({
        name: "Imported Video",
        size: "Unknown",
        duration: "0:00",
        format: "IMPORTED",
        url: videoUrl,
      });
    } catch (e: any) {
      setIsProcessing(false);
      toast({ title: "Import failed", description: e?.message || String(e), variant: "destructive" });
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setIsProcessing(false);
    setVideoUrl("");
    setUploadedVideoInfo(null);
    setProjectId(null);
    setClips([]);
    setMobileClips([]);
    setCaptions(null);
    setTranslatedCaptions(null);
    setAIThumbnails([]);
    setIsGenerating(null);
    setShowLanguageDialog(false);
    setShowPreview(false);
    setPreviewingClip(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePreview = () => {
    setShowPreview(!showPreview);
  };

  const handleClipPreview = (clipId: string) => {
    setPreviewingClip(previewingClip === clipId ? null : clipId);
  };

  const handleMobileClips = async () => {
    if (!projectId) return;
    
    setIsGenerating("mobile");
    try {
      const result = await api.generateMobileClips(projectId);
      setMobileClips(result.clips);
      toast({
        title: "Mobile Clips Generated",
        description: `Generated ${result.clips.length} mobile-optimized clips`,
      });
    } catch (e: any) {
      toast({
        title: "Generation Failed",
        description: e?.message || "Failed to generate mobile clips",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(null);
    }
  };

  const handleGenerateCaptions = async () => {
    if (!projectId) return;
    
    setIsGenerating("captions");
    try {
      const result = await api.generateCaptions(projectId);
      setCaptions(result.captions);
      toast({
        title: "Captions Generated",
        description: "AI captions have been generated for your video",
      });
    } catch (e: any) {
      toast({
        title: "Generation Failed",
        description: e?.message || "Failed to generate captions",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(null);
    }
  };

  const handleTranslate = async (targetLanguage?: string) => {
    if (!projectId || !captions) {
      toast({
        title: "No Captions",
        description: "Please generate captions first",
        variant: "destructive",
      });
      return;
    }
    
    // If no language provided, show dialog (default to Spanish for now)
    if (!targetLanguage) {
      // For now, just translate to Spanish
      targetLanguage = "es";
    }
    
    setIsGenerating("translate");
    try {
      const result = await api.translateCaptions(projectId, targetLanguage);
      setTranslatedCaptions(result.captions);
      const languageNames: any = {
        "es": "Spanish", "fr": "French", "de": "German", "it": "Italian",
        "pt": "Portuguese", "ru": "Russian", "ja": "Japanese", "ko": "Korean",
        "zh": "Chinese", "ar": "Arabic", "hi": "Hindi"
      };
      toast({
        title: "Translation Complete",
        description: `Captions have been translated to ${languageNames[targetLanguage] || targetLanguage}`,
      });
    } catch (e: any) {
      toast({
        title: "Translation Failed",
        description: e?.message || "Failed to translate captions",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(null);
    }
  };

  const handleAIThumbnails = async () => {
    if (!projectId) return;
    
    setIsGenerating("thumbnails");
    try {
      const result = await api.generateAIThumbnails(projectId);
      setAIThumbnails(result.thumbnails);
      toast({
        title: "AI Thumbnails Generated",
        description: `Generated ${result.thumbnails.length} AI-powered thumbnails`,
      });
    } catch (e: any) {
      toast({
        title: "Generation Failed",
        description: e?.message || "Failed to generate AI thumbnails",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4 sm:p-0">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Upload Video</h1>
        <p className="text-muted-foreground">
          Get started by uploading your video or pasting a link from YouTube, TikTok, Instagram, and more
        </p>
      </div>

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <FileVideo className="w-4 h-4" />
            <span className="hidden sm:inline">Upload File</span>
            <span className="sm:hidden">Upload</span>
          </TabsTrigger>
          <TabsTrigger value="link" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">Paste Link</span>
            <span className="sm:hidden">Link</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Video File
              </CardTitle>
              <CardDescription>
                Support for MP4, MOV, AVI files up to 2GB
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Debug section */}
              <div className="mb-4 space-y-2">
                <Button 
                  onClick={() => {
                    console.log('Test button clicked');
                    console.log('File input ref:', fileInputRef.current);
                    if (fileInputRef.current) {
                      fileInputRef.current.click();
                    } else {
                      console.error('File input ref is null');
                    }
                  }}
                  variant="outline"
                  size="sm"
                >
                  Test File Selection
                </Button>
                
                {/* Visible file input for testing */}
                <div>
                  <label className="text-sm text-muted-foreground">Direct file input test:</label>
                  <input
                    type="file"
                    accept="video/mp4,video/mov,video/avi,video/quicktime,video/x-msvideo"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                </div>
              </div>
              
              <div 
                className={`relative border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-colors cursor-pointer ${
                  isDragOver 
                    ? 'border-primary bg-primary/10' 
                    : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={(e) => {
                  console.log('Upload area clicked');
                  console.log('File input ref:', fileInputRef.current);
                  e.preventDefault();
                  if (fileInputRef.current) {
                    fileInputRef.current.click();
                  } else {
                    console.error('File input ref is null');
                  }
                }}
              >
                {selectedFile ? (
                  <div className="space-y-4">
                    <CheckCircle className="w-12 h-12 mx-auto text-success" />
                    <div>
                      <p className="text-lg font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <Button variant="outline" onClick={(e) => {
                      e.stopPropagation();
                      resetUpload();
                    }}>
                      <X className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div className="space-y-2">
                      <p className="text-base sm:text-lg font-medium">
                        {isDragOver ? 'Drop your video here' : 'Drag and drop your video here, or click to browse'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Supports: MP4, MOV, AVI • Maximum: 2GB
                      </p>
                    </div>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/mov,video/avi,video/quicktime,video/x-msvideo"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  style={{ pointerEvents: 'auto' }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="link" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5" />
                Paste Video Link
              </CardTitle>
              <CardDescription>
                Import from YouTube, TikTok, Instagram, Twitter, Vimeo, and more
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="video-url">Video URL</Label>
                <Input
                  id="video-url"
                  placeholder="https://www.youtube.com/watch?v=... or https://www.tiktok.com/@user/video/..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="text-sm"
                />
              </div>
              
              {/* URL Preview */}
              {videoUrl && validateUrl(videoUrl) && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-success">Valid URL detected</span>
                  </div>
                </div>
              )}
              
              <Button 
                onClick={handleUrlSubmit}
                disabled={!videoUrl.trim() || isProcessing}
                className="w-full"
                variant="hero"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importing Video...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Import Video
                  </>
                )}
              </Button>
              
              {uploadedVideoInfo?.url && (
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={resetUpload}
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear and Start Over
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Processing Status */}
      {isProcessing && (
        <Card className="gradient-glow border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              {selectedFile ? 'Uploading Video' : 'Importing Video'}
            </CardTitle>
            <CardDescription>
              {selectedFile 
                ? 'Please wait while we upload and process your video...' 
                : 'Please wait while we import and process your video...'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{selectedFile ? 'Upload Progress' : 'Import Progress'}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="gradient-primary" />
              </div>
              
              {uploadProgress > 50 && (
                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>Video uploaded successfully</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing video content...</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success State */}
      {uploadProgress === 100 && !isProcessing && uploadedVideoInfo && (
        <Card className="gradient-glow border-success/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-success">
              <CheckCircle className="w-5 h-5" />
              Video Ready!
            </CardTitle>
            <CardDescription>
              Your video has been processed and is ready for AI enhancement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Video Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium truncate">{uploadedVideoInfo.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Size</p>
                <p className="font-medium">{uploadedVideoInfo.size}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">{uploadedVideoInfo.duration}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Format</p>
                <p className="font-medium">{uploadedVideoInfo.format}</p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" className="flex-1">
                <Video className="w-4 h-4 mr-2" />
                Generate AI Clips
              </Button>
              <Button variant="outline" className="flex-1" onClick={handlePreview}>
                <Play className="w-4 h-4 mr-2" />
                {showPreview ? 'Hide Preview' : 'Preview Video'}
              </Button>
              <Button variant="outline" onClick={resetUpload}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Another
              </Button>
            </div>
            
            {/* Video Preview */}
            {showPreview && selectedFile && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Video Preview</h3>
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <video
                    src={URL.createObjectURL(selectedFile)}
                    controls
                    className="w-full h-full object-contain"
                    onLoadStart={() => URL.revokeObjectURL(URL.createObjectURL(selectedFile))}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            )}
            
            {/* Generated Clips with thumbnails and platform info */}
            {projectId && clips.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Generated Clips</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clips.map((clip) => (
                    <div key={clip.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                      {/* Thumbnail */}
                      <div className="aspect-video bg-muted relative">
                        {clip.thumbnail ? (
                          <img 
                            src={`${API_BASE_URL}${clip.thumbnail}`}
                            alt={clip.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const sibling = e.currentTarget.nextElementSibling as HTMLElement;
                              if (sibling) sibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className="absolute inset-0 flex items-center justify-center bg-muted" style={{display: clip.thumbnail ? 'none' : 'flex'}}>
                          <Play className="w-8 h-8 text-muted-foreground" />
                        </div>
                        {/* Platform badge */}
                        <div className="absolute top-2 right-2">
                          <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                            {clip.platform || 'Social Media'}
                          </span>
                        </div>
                        {/* Duration badge */}
                        <div className="absolute bottom-2 left-2">
                          <span className="bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {clip.duration}
                          </span>
                        </div>
                      </div>
                      
                      {/* Clip info */}
                      <div className="p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{clip.title}</h4>
                          <span className="text-xs text-muted-foreground">{clip.aspect}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => handleClipPreview(clip.id)}
                          >
                            <Play className="w-3 h-3 mr-1" />
                            {previewingClip === clip.id ? 'Hide' : 'Preview'}
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <a
                              href={`${API_BASE_URL}/api/clips/${projectId}/${clip.path}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <Download className="w-3 h-3" />
                            </a>
                          </Button>
                        </div>
                      </div>
                      
                      {/* Clip Preview Video */}
                      {previewingClip === clip.id && (
                        <div className="p-3 border-t">
                          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                            <video
                              src={`${API_BASE_URL}/api/clips/${projectId}/${clip.path}`}
                              controls
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                console.error('Video load error:', e);
                                toast({ title: "Preview Error", description: "Could not load video preview", variant: "destructive" });
                              }}
                            >
                              Your browser does not support the video tag.
                            </video>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mobile Clips */}
            {mobileClips.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Mobile Clips</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {mobileClips.map((clip) => (
                    <div key={clip.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                      {/* Thumbnail */}
                      <div className="aspect-[9/16] bg-muted relative">
                        {clip.thumbnail ? (
                          <img 
                            src={`${API_BASE_URL}${clip.thumbnail}`}
                            alt={clip.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const sibling = e.currentTarget.nextElementSibling as HTMLElement;
                              if (sibling) sibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className="absolute inset-0 flex items-center justify-center bg-muted" style={{display: clip.thumbnail ? 'none' : 'flex'}}>
                          <Play className="w-8 h-8 text-muted-foreground" />
                        </div>
                        {/* Platform badge */}
                        <div className="absolute top-2 right-2">
                          <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                            {clip.platform}
                          </span>
                        </div>
                        {/* Duration badge */}
                        <div className="absolute bottom-2 left-2">
                          <span className="bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {clip.duration}
                          </span>
                        </div>
                      </div>
                      
                      {/* Clip info */}
                      <div className="p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-sm">{clip.title}</h4>
                          <span className="text-xs text-muted-foreground">{clip.aspect}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => handleClipPreview(clip.id)}
                          >
                            <Play className="w-3 h-3 mr-1" />
                            {previewingClip === clip.id ? 'Hide' : 'Preview'}
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <a
                              href={`${API_BASE_URL}/api/clips/${projectId}/${clip.path}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <Download className="w-3 h-3" />
                            </a>
                          </Button>
                        </div>
                      </div>
                      
                      {/* Clip Preview Video */}
                      {previewingClip === clip.id && (
                        <div className="p-3 border-t">
                          <div className="aspect-[9/16] bg-muted rounded-lg overflow-hidden">
                            <video
                              src={`${API_BASE_URL}/api/clips/${projectId}/${clip.path}`}
                              controls
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                console.error('Video load error:', e);
                                toast({ title: "Preview Error", description: "Could not load video preview", variant: "destructive" });
                              }}
                            >
                              Your browser does not support the video tag.
                            </video>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Captions Display */}
            {captions && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Generated Captions</h3>
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Language: {captions.language}</span>
                      <span>•</span>
                      <span>{captions.segments.length} segments</span>
                    </div>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {captions.segments.map((segment: any, index: number) => (
                        <div key={index} className="text-sm">
                          <span className="text-muted-foreground">
                            {Math.floor(segment.start / 60)}:{(segment.start % 60).toFixed(1).padStart(4, '0')}
                          </span>
                          <span className="ml-2">{segment.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Translated Captions Display */}
            {translatedCaptions && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Translated Captions</h3>
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Language: {translatedCaptions.language}</span>
                      <span>•</span>
                      <span>{translatedCaptions.segments.length} segments</span>
                    </div>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {translatedCaptions.segments.map((segment: any, index: number) => (
                        <div key={index} className="text-sm">
                          <span className="text-muted-foreground">
                            {Math.floor(segment.start / 60)}:{(segment.start % 60).toFixed(1).padStart(4, '0')}
                          </span>
                          <span className="ml-2">{segment.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Thumbnails Display */}
            {aiThumbnails.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">AI-Generated Thumbnails</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {aiThumbnails.map((thumbnail: any, index: number) => (
                    <div key={index} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-video bg-muted relative">
                        <img 
                          src={`${API_BASE_URL}${thumbnail.thumbnail}`}
                          alt={`Thumbnail ${thumbnail.timestamp}s`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const sibling = e.currentTarget.nextElementSibling as HTMLElement;
                            if (sibling) sibling.style.display = 'flex';
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-muted" style={{display: 'none'}}>
                          <span className="text-muted-foreground">No thumbnail</span>
                        </div>
                        {/* Timestamp badge */}
                        <div className="absolute bottom-2 left-2">
                          <span className="bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {thumbnail.timestamp}s
                          </span>
                        </div>
                      </div>
                      <div className="p-2">
                        <a
                          href={`${API_BASE_URL}${thumbnail.thumbnail}`}
                          download
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Button size="sm" variant="outline" className="w-full">
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={handleMobileClips}
                disabled={isGenerating === "mobile"}
              >
                {isGenerating === "mobile" ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Smartphone className="w-4 h-4 mr-1" />
                )}
                Mobile Clips
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={handleGenerateCaptions}
                disabled={isGenerating === "captions"}
              >
                {isGenerating === "captions" ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <span className="w-4 h-4 mr-1">📝</span>
                )}
                Generate Captions
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={() => handleTranslate("es")}
                disabled={isGenerating === "translate" || !captions}
              >
                {isGenerating === "translate" ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <span className="w-4 h-4 mr-1">🌐</span>
                )}
                Translate
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={handleAIThumbnails}
                disabled={isGenerating === "thumbnails"}
              >
                {isGenerating === "thumbnails" ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <span className="w-4 h-4 mr-1">🎨</span>
                )}
                AI Thumbnails
              </Button>
            </div>

            {/* Language Selection (if captions exist) */}
            {captions && !translatedCaptions && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Translate to:</h4>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map((lang) => (
                      <Button
                        key={lang.code}
                        variant="outline"
                        size="sm"
                        onClick={() => handleTranslate(lang.code)}
                        disabled={isGenerating === "translate"}
                        className="text-xs"
                      >
                        {isGenerating === "translate" ? (
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        ) : null}
                        {lang.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Supported Platforms & Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Supported Platforms</CardTitle>
            <CardDescription>
              Import videos from popular social media platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { name: "YouTube", color: "text-red-500", icon: "🎥" },
                { name: "TikTok", color: "text-white", icon: "🎵" },
                { name: "Instagram", color: "text-pink-500", icon: "📸" },
                { name: "Twitter/X", color: "text-blue-500", icon: "🐦" },
                { name: "Vimeo", color: "text-blue-400", icon: "🎬" },
                { name: "Facebook", color: "text-blue-600", icon: "👥" },
              ].map((platform) => (
                <div
                  key={platform.name}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-lg">{platform.icon}</span>
                  <span className="font-medium">{platform.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Features</CardTitle>
            <CardDescription>
              Enhance your videos with AI-powered tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Auto Clip Generation", desc: "Create viral short clips automatically" },
                { name: "Smart Captions", desc: "Generate accurate subtitles with styling" },
                { name: "Multi-language Translation", desc: "Translate to 40+ languages" },
                { name: "AI Voice Dubbing", desc: "Natural voice cloning and dubbing" },
                { name: "Thumbnail Generator", desc: "Create eye-catching thumbnails" },
                { name: "Content Analysis", desc: "Analyze engagement potential" },
              ].map((feature) => (
                <div key={feature.name} className="space-y-1">
                  <p className="font-medium text-sm">{feature.name}</p>
                  <p className="text-xs text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UploadVideo;