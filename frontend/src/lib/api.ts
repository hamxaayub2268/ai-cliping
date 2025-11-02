export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export const api = {
  async uploadVideo(file: File) {
    const form = new FormData();
    form.append("file", file);
    console.log('Uploading to:', `${API_BASE_URL}/api/upload`);
    const res = await fetch(`${API_BASE_URL}/api/upload`, {
      method: "POST",
      body: form,
    });
    console.log('Upload response status:', res.status);
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Upload error response:', errorText);
      throw new Error(`Upload failed: ${res.status} - ${errorText}`);
    }
    return res.json();
  },
  async importVideo(url: string) {
    const form = new FormData();
    form.append("url", url);
    const res = await fetch(`${API_BASE_URL}/api/import`, {
      method: "POST",
      body: form,
    });
    if (!res.ok) throw new Error(`Import failed: ${res.status}`);
    return res.json();
  },
  async listClips(projectId: string) {
    const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/clips`);
    if (!res.ok) throw new Error(`List clips failed: ${res.status}`);
    return res.json();
  },
  
  // New AI-powered endpoints
  async generateMobileClips(projectId: string) {
    const res = await fetch(`${API_BASE_URL}/api/mobile-clips/${projectId}`, {
      method: "POST",
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Mobile clips generation failed: ${res.status} - ${errorText}`);
    }
    return res.json();
  },
  
  async generateCaptions(projectId: string) {
    const res = await fetch(`${API_BASE_URL}/api/captions/${projectId}`, {
      method: "POST",
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Captions generation failed: ${res.status} - ${errorText}`);
    }
    return res.json();
  },
  
  async translateCaptions(projectId: string, targetLanguage: string) {
    const form = new FormData();
    form.append("target_language", targetLanguage);
    const res = await fetch(`${API_BASE_URL}/api/translate/${projectId}`, {
      method: "POST",
      body: form,
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Translation failed: ${res.status} - ${errorText}`);
    }
    return res.json();
  },
  
  async generateAIThumbnails(projectId: string) {
    const res = await fetch(`${API_BASE_URL}/api/ai-thumbnails/${projectId}`, {
      method: "POST",
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`AI thumbnails generation failed: ${res.status} - ${errorText}`);
    }
    return res.json();
  },
};


