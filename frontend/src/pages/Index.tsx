import { Link } from "react-router-dom";
import { Play, Sparkles, Globe, Zap, Users, ArrowRight, Upload, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import heroImage from "@/assets/hero-video-ai.jpg";
import workspaceImage from "@/assets/video-workspace.jpg";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 gradient-primary rounded-lg">
              <Video className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold">AI Studio</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">Features</a>
            <a href="#pricing" className="text-muted-foreground hover:text-primary transition-colors">Pricing</a>
            <a href="#about" className="text-muted-foreground hover:text-primary transition-colors">About</a>
          </div>

          <div className="flex items-center space-x-4">
            <Button asChild variant="ghost">
              <Link to="/auth/login">Sign In</Link>
            </Button>
            <Button asChild variant="hero">
              <Link to="/auth/register">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-10" />
        <div className="container mx-auto px-6 py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  ✨ AI-Powered Video Editor
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  Transform Videos with{" "}
                  <span className="gradient-primary bg-clip-text text-transparent">
                    AI Magic
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-md">
                  Create viral clips, auto-generate captions, translate to 50+ languages, 
                  and produce AI dubbing in minutes, not hours.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild variant="hero" size="xl" className="animate-glow">
                  <Link to="/auth/register">
                    Start Creating Free
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="glass" size="xl">
                  <Link to="#demo">
                    <Play className="w-4 h-4 mr-2" />
                    Watch Demo
                  </Link>
                </Button>
              </div>

              <div className="flex items-center gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span>10K+ creators</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-accent" />
                  <span>1M+ clips generated</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 gradient-glow rounded-2xl opacity-20 animate-pulse" />
              <img
                src={heroImage}
                alt="AI Video Studio Interface"
                className="relative z-10 rounded-2xl shadow-2xl border border-border animate-float"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted/20">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Everything you need to create{" "}
              <span className="gradient-accent bg-clip-text text-transparent">
                amazing content
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered tools handle the heavy lifting so you can focus on creativity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "AI Clip Generation",
                description: "Automatically extract the most engaging moments from your videos with our advanced AI algorithms."
              },
              {
                icon: Globe,
                title: "Smart Captions",
                description: "Generate accurate subtitles in seconds with support for 50+ languages and custom styling."
              },
              {
                icon: Users,
                title: "Voice Dubbing", 
                description: "Create natural-sounding voice overs in multiple languages using cutting-edge AI voice synthesis."
              },
              {
                icon: Sparkles,
                title: "Auto Thumbnails",
                description: "Generate eye-catching thumbnails that maximize click-through rates with AI-powered design."
              },
              {
                icon: Video,
                title: "Multi-Platform Export",
                description: "Optimize your content for YouTube, TikTok, Instagram, and more with platform-specific formats."
              },
              {
                icon: Upload,
                title: "Easy Integration",
                description: "Import videos from any platform or upload directly. Support for all major video formats."
              }
            ].map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/50">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Workspace Preview */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img
                src={workspaceImage}
                alt="AI Video Workspace"
                className="rounded-2xl shadow-2xl border border-border"
              />
            </div>
            <div className="order-1 lg:order-2 space-y-6">
              <div className="space-y-4">
                <Badge variant="secondary" className="bg-accent/10 text-accent">
                  🎬 Professional Workspace
                </Badge>
                <h2 className="text-3xl lg:text-4xl font-bold">
                  Everything in one{" "}
                  <span className="gradient-primary bg-clip-text text-transparent">
                    intuitive workspace
                  </span>
                </h2>
                <p className="text-lg text-muted-foreground">
                  Upload your video, and watch AI work its magic. Generate clips, captions, 
                  translations, and thumbnails all from a single, beautiful interface.
                </p>
              </div>
              
              <div className="space-y-3">
                {[
                  "One-click clip generation",
                  "Real-time caption editing", 
                  "Instant language translation",
                  "AI-powered thumbnail creation"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full gradient-accent" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <Button asChild variant="hero" size="lg">
                <Link to="/auth/register">
                  Try It Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-90" />
        <div className="relative z-10 container mx-auto px-6 text-center text-white">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Ready to transform your video content?
            </h2>
            <p className="text-xl opacity-90">
              Join thousands of creators who are already using AI to create better content faster.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="glass" size="xl" className="glow-accent">
                <Link to="/auth/register">
                  Get Started Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
            <p className="text-sm opacity-75">
              No credit card required • 5 free projects • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 gradient-primary rounded-lg">
                  <Video className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold">AI Studio</span>
              </div>
              <p className="text-muted-foreground">
                Transform your videos with the power of AI
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Product</h4>
              <div className="space-y-2 text-sm">
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">Features</a>
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">Pricing</a>
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">API</a>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Company</h4>
              <div className="space-y-2 text-sm">
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">About</a>
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">Blog</a>
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">Careers</a>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Support</h4>
              <div className="space-y-2 text-sm">
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">Help Center</a>
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">Contact</a>
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">Status</a>
              </div>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 AI Studio. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;