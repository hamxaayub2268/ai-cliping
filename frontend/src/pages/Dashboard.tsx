import { Link } from "react-router-dom";
import { Upload, Video, Clock, TrendingUp, Zap, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const Dashboard = () => {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Welcome back, John!</h1>
        <p className="text-muted-foreground">
          Ready to create some amazing videos? Let's get started.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="gradient-glow border-primary/20 hover:glow-primary transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Video
            </CardTitle>
            <CardDescription>
              Start by uploading your video or pasting a link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="hero" className="w-full">
              <Link to="/dashboard/upload">Get Started</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              Recent Projects
            </CardTitle>
            <CardDescription>
              Continue working on your latest projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link to="/dashboard/projects">View All</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Analytics
            </CardTitle>
            <CardDescription>
              Track your video performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              View Stats
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Video className="w-4 h-4 text-primary" />
              <div className="space-y-1">
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs text-muted-foreground">Total Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-accent" />
              <div className="space-y-1">
                <p className="text-2xl font-bold">156</p>
                <p className="text-xs text-muted-foreground">Clips Generated</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-warning" />
              <div className="space-y-1">
                <p className="text-2xl font-bold">2.4h</p>
                <p className="text-xs text-muted-foreground">Processing Time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-success" />
              <div className="space-y-1">
                <p className="text-2xl font-bold">8</p>
                <p className="text-xs text-muted-foreground">Languages</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest video projects and AI processes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                title: "Marketing Video - Q4 Campaign",
                status: "Processing clips",
                time: "2 minutes ago",
                badge: "In Progress"
              },
              {
                title: "Product Demo Tutorial", 
                status: "Generated 8 clips, 12 captions",
                time: "1 hour ago",
                badge: "Completed"
              },
              {
                title: "Customer Testimonials",
                status: "Translated to 5 languages",
                time: "3 hours ago", 
                badge: "Completed"
              }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="space-y-1">
                  <p className="font-medium">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">{activity.status}</p>
                </div>
                <div className="flex items-center gap-3">
                <Badge variant={activity.badge === "Completed" ? "default" : "secondary"}>
                  {activity.badge}
                </Badge>
                  <span className="text-sm text-muted-foreground">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Usage This Month</CardTitle>
          <CardDescription>Track your AI processing usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Video Processing (120 / 500 minutes)</span>
                <span>24%</span>
              </div>
              <Progress value={24} className="gradient-primary" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>AI Translations (45 / 100 projects)</span>
                <span>45%</span>
              </div>
              <Progress value={45} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;