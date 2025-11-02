import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, MoreVertical, Play, Calendar, Clock, Eye, Grid3X3, List, Download, Share2, Copy, Trash2, Star, SortAsc, SortDesc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

const MyProjects = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  const projects = [
    {
      id: 1,
      title: "Marketing Campaign Q4",
      description: "Product launch video with multiple clips and translations",
      thumbnail: "/api/placeholder/300/200",
      duration: "3:45",
      created: "2 hours ago",
      createdDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: "completed",
      clips: 8,
      views: "1.2K",
      size: "245 MB",
      favorite: true
    },
    {
      id: 2,
      title: "Customer Testimonials",
      description: "Compilation of customer reviews and feedback",
      thumbnail: "/api/placeholder/300/200", 
      duration: "2:30",
      created: "1 day ago",
      createdDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: "processing",
      clips: 5,
      views: "892",
      size: "180 MB",
      favorite: false
    },
    {
      id: 3,
      title: "Product Demo Tutorial",
      description: "Step-by-step guide for new users",
      thumbnail: "/api/placeholder/300/200",
      duration: "5:12",
      created: "3 days ago", 
      createdDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      status: "completed",
      clips: 12,
      views: "2.4K",
      size: "420 MB",
      favorite: false
    },
    {
      id: 4,
      title: "Behind the Scenes",
      description: "Company culture and team introduction",
      thumbnail: "/api/placeholder/300/200",
      duration: "4:18",
      created: "1 week ago",
      createdDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      status: "completed", 
      clips: 6,
      views: "756",
      size: "310 MB",
      favorite: true
    },
    {
      id: 5,
      title: "Webinar Highlights",
      description: "Key moments from monthly webinar series",
      thumbnail: "/api/placeholder/300/200",
      duration: "8:22",
      created: "2 weeks ago",
      createdDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      status: "completed",
      clips: 15,
      views: "3.1K",
      size: "680 MB",
      favorite: false
    },
    {
      id: 6,
      title: "Event Coverage",
      description: "Conference highlights and interviews",
      thumbnail: "/api/placeholder/300/200",
      duration: "6:45",
      created: "3 weeks ago",
      createdDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
      status: "completed",
      clips: 10,
      views: "1.8K",
      size: "520 MB",
      favorite: false
    },
    {
      id: 7,
      title: "Social Media Content",
      description: "Quick clips for Instagram and TikTok",
      thumbnail: "/api/placeholder/300/200",
      duration: "1:15",
      created: "1 month ago",
      createdDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      status: "draft",
      clips: 3,
      views: "245",
      size: "95 MB",
      favorite: true
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="secondary" className="bg-success/10 text-success">Completed</Badge>;
      case "processing":
        return <Badge variant="secondary" className="bg-warning/10 text-warning">Processing</Badge>;
      case "draft":
        return <Badge variant="secondary" className="bg-muted/10 text-muted-foreground">Draft</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const sortedAndFilteredProjects = useMemo(() => {
    let filtered = projects.filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(project.status);
      return matchesSearch && matchesStatus;
    });

    // Sort projects
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return b.createdDate.getTime() - a.createdDate.getTime();
        case "oldest":
          return a.createdDate.getTime() - b.createdDate.getTime();
        case "name":
          return a.title.localeCompare(b.title);
        case "duration":
          const aDuration = a.duration.split(':').reduce((acc, time) => (60 * acc) + +time, 0);
          const bDuration = b.duration.split(':').reduce((acc, time) => (60 * acc) + +time, 0);
          return bDuration - aDuration;
        default:
          return 0;
      }
    });

    return filtered;
  }, [projects, searchTerm, sortBy, statusFilter]);

  const handleBulkAction = (action: string) => {
    if (selectedProjects.length === 0) {
      toast({
        title: "No projects selected",
        description: "Please select projects to perform bulk actions.",
        variant: "destructive",
      });
      return;
    }

    switch (action) {
      case "delete":
        toast({
          title: "Projects deleted",
          description: `${selectedProjects.length} projects have been moved to trash.`,
        });
        break;
      case "export":
        toast({
          title: "Export started",
          description: `Exporting ${selectedProjects.length} projects...`,
        });
        break;
      case "share":
        toast({
          title: "Share links generated",
          description: `Share links created for ${selectedProjects.length} projects.`,
        });
        break;
    }
    setSelectedProjects([]);
  };

  const toggleProjectSelection = (projectId: number) => {
    setSelectedProjects(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const toggleAllProjects = () => {
    if (selectedProjects.length === sortedAndFilteredProjects.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(sortedAndFilteredProjects.map(p => p.id));
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Projects</h1>
          <p className="text-muted-foreground">
            Manage and organize all your video projects ({sortedAndFilteredProjects.length} total)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="hero">
            <Link to="/dashboard/upload">Create New Project</Link>
          </Button>
        </div>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="duration">Duration</SelectItem>
                </SelectContent>
              </Select>
              <Dialog open={showFilters} onOpenChange={setShowFilters}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                    {statusFilter.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {statusFilter.length}
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Filter Projects</DialogTitle>
                    <DialogDescription>
                      Filter your projects by status and other criteria
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Status</h4>
                      <div className="space-y-2">
                        {["completed", "processing", "draft"].map((status) => (
                          <div key={status} className="flex items-center space-x-2">
                            <Checkbox
                              id={status}
                              checked={statusFilter.includes(status)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setStatusFilter([...statusFilter, status]);
                                } else {
                                  setStatusFilter(statusFilter.filter(s => s !== status));
                                }
                              }}
                            />
                            <label htmlFor={status} className="capitalize">
                              {status}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setStatusFilter([])}>
                        Clear All
                      </Button>
                      <Button onClick={() => setShowFilters(false)}>
                        Apply Filters
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Bulk Actions */}
            {selectedProjects.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">
                  {selectedProjects.length} project{selectedProjects.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction("export")}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction("share")}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction("delete")}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Projects Display */}
      {sortedAndFilteredProjects.length > 0 ? (
        <>
          {/* Select All Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedProjects.length === sortedAndFilteredProjects.length}
                onCheckedChange={toggleAllProjects}
              />
              <span className="text-sm text-muted-foreground">
                Select all projects
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              {sortedAndFilteredProjects.length} project{sortedAndFilteredProjects.length > 1 ? 's' : ''}
            </div>
          </div>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedAndFilteredProjects.map((project) => (
                <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                  {/* Selection Checkbox */}
                  <div className="absolute top-3 left-3 z-10">
                    <Checkbox
                      checked={selectedProjects.includes(project.id)}
                      onCheckedChange={() => toggleProjectSelection(project.id)}
                      className="bg-background/80 backdrop-blur-sm"
                    />
                  </div>
                  
                  {/* Favorite Star */}
                  {project.favorite && (
                    <div className="absolute top-3 right-3 z-10">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    </div>
                  )}

                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <Play className="w-12 h-12 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-2 left-2">
                      {getStatusBadge(project.status)}
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                      {project.duration}
                    </div>
                  </div>

                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{project.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {project.description}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="ml-2">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Link to={`/dashboard/project/${project.id}`} className="flex w-full">
                              Open Project
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            Export
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{project.created}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        <span>{project.views}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{project.duration}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">{project.clips}</span>
                        <span className="text-muted-foreground"> clips</span>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground mb-4">
                      Size: {project.size}
                    </div>

                    <Button asChild className="w-full" variant="outline">
                      <Link to={`/dashboard/project/${project.id}`}>
                        Open Project
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedAndFilteredProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-md transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={selectedProjects.includes(project.id)}
                        onCheckedChange={() => toggleProjectSelection(project.id)}
                      />
                      
                      <div className="w-20 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded flex items-center justify-center flex-shrink-0">
                        <Play className="w-6 h-6 text-white opacity-80" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{project.title}</h3>
                          {project.favorite && <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />}
                          {getStatusBadge(project.status)}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{project.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{project.created}</span>
                          <span>{project.duration}</span>
                          <span>{project.clips} clips</span>
                          <span>{project.views} views</span>
                          <span>{project.size}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link to={`/dashboard/project/${project.id}`}>
                            Open Project
                          </Link>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share2 className="w-4 h-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="w-4 h-4 mr-2" />
                              Export
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-medium">No projects found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or create a new project.
              </p>
            </div>
            <Button asChild variant="hero">
              <Link to="/dashboard/upload">Create Your First Project</Link>
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MyProjects;