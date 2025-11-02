import { useState } from "react";
import { useParams } from "react-router-dom";
import { Play, Download, Share2, Settings, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ProjectWorkspace = () => {
  const { id } = useParams();
  const [selectedLanguage, setSelectedLanguage] = useState("spanish");

  // Mock data
  const project = {
    title: "Marketing Campaign Q4",
    duration: "3:45",
    status: "Processing Complete",
    thumbnail: "/api/placeholder/400/225"
  };

  const clips = [
    { id: 1, title: "Hook Segment", duration: "0:15", score: 98 },
    { id: 2, title: "Product Demo", duration: "0:23", score: 95 },
    { id: 3, title: "Customer Testimonial", duration: "0:18", score: 92 },
    { id: 4, title: "Call to Action", duration: "0:12", score: 89 },
  ];

  const thumbnails = [
    { id: 1, title: "Energetic Hook", clicks: "12.3K" },
    { id: 2, title: "Product Focus", clicks: "9.8K" },
    { id: 3, title: "Emotional Appeal", clicks: "15.1K" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Project Header */}
      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="flex-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold">{project.title}</h1>
                <p className="text-muted-foreground">Duration: {project.duration}</p>
              </div>
              <Badge variant="secondary" className="bg-success/10 text-success">
                {project.status}
              </Badge>
            </div>
            
            {/* Video Player Placeholder */}
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
              <div className="text-center">
                <Play className="w-16 h-16 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">Video Preview</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="hero" className="flex-1">
                <Play className="w-4 h-4 mr-2" />
                Play Original
              </Button>
              <Button variant="outline">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Project Stats */}
        <div className="w-full lg:w-80 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Clips Generated</span>
                <span className="font-medium">8</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Languages</span>
                <span className="font-medium">5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Processing Time</span>
                <span className="font-medium">2m 34s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">2 hours ago</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Share2 className="w-4 h-4 mr-2" />
                Share Project
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Export All
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="clips" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="clips">Clips</TabsTrigger>
          <TabsTrigger value="captions">Captions</TabsTrigger>
          <TabsTrigger value="translations">Translations</TabsTrigger>
          <TabsTrigger value="dubbing">Dubbing</TabsTrigger>
          <TabsTrigger value="thumbnails">Thumbnails</TabsTrigger>
        </TabsList>

        <TabsContent value="clips" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">AI Generated Clips</h2>
            <Button variant="outline">Regenerate</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clips.map((clip) => (
              <Card key={clip.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <Play className="w-8 h-8 text-muted-foreground" />
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{clip.title}</h3>
                    <Badge variant="secondary">{clip.score}%</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{clip.duration}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      Preview
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="captions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Auto-Generated Captions</h2>
            <div className="flex gap-2">
              <Select defaultValue="srt">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="srt">.SRT</SelectItem>
                  <SelectItem value="vtt">.VTT</SelectItem>
                  <SelectItem value="txt">.TXT</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">00:00 - 00:05</span>
                  </div>
                  <p>"Welcome to our new product launch! Today we're excited to share something revolutionary."</p>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">00:05 - 00:12</span>
                  </div>
                  <p>"This innovative solution will transform how you work and play."</p>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">00:12 - 00:18</span>
                  </div>
                  <p>"Join thousands of satisfied customers who have already made the switch."</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="translations" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Translations</h2>
            <div className="flex gap-2">
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spanish">Spanish</SelectItem>
                  <SelectItem value="french">French</SelectItem>
                  <SelectItem value="german">German</SelectItem>
                  <SelectItem value="italian">Italian</SelectItem>
                  <SelectItem value="portuguese">Portuguese</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">00:00 - 00:05</span>
                  </div>
                  <p>"¡Bienvenidos al lanzamiento de nuestro nuevo producto! Hoy estamos emocionados de compartir algo revolucionario."</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dubbing" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">AI Voice Dubbing</h2>
            <Button variant="outline">Generate New Voice</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Original Audio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 p-4 rounded-lg flex items-center justify-between">
                  <span>English (Original)</span>
                  <Button size="sm" variant="outline">
                    <Play className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Spanish Dub</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 p-4 rounded-lg flex items-center justify-between">
                  <span>Spanish (AI Voice)</span>
                  <Button size="sm" variant="outline">
                    <Play className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="thumbnails" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">AI Generated Thumbnails</h2>
            <Button variant="outline">Generate More</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {thumbnails.map((thumbnail) => (
              <Card key={thumbnail.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <span className="text-lg font-bold">{thumbnail.title}</span>
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">{thumbnail.title}</h3>
                    <span className="text-sm text-muted-foreground">{thumbnail.clicks} views</span>
                  </div>
                  <Button size="sm" variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectWorkspace;