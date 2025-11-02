import { 
  Home, 
  Upload, 
  FolderOpen, 
  CreditCard, 
  Settings, 
  Video,
  Sparkles
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Upload Video", url: "/dashboard/upload", icon: Upload },
  { title: "My Projects", url: "/dashboard/projects", icon: FolderOpen },
  { title: "Billing", url: "/dashboard/billing", icon: CreditCard },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return currentPath === "/dashboard";
    }
    return currentPath.startsWith(path);
  };

  const getNavCls = (path: string) => {
    const active = isActive(path);
    return active 
      ? "bg-primary text-primary-foreground font-medium glow-primary" 
      : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";
  };

  return (
    <Sidebar className={!open ? "w-16" : "w-64"}>
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 gradient-primary rounded-lg">
            <Video className="w-4 h-4 text-white" />
          </div>
          {open && (
            <div>
              <h2 className="text-lg font-bold gradient-primary bg-clip-text text-transparent">
                AI Studio
              </h2>
              <p className="text-xs text-muted-foreground">Video Editor</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {open && "Main Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavCls(item.url)}
                      title={!open ? item.title : undefined}
                    >
                      <item.icon className="w-4 h-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {open && (
          <SidebarGroup className="mt-auto">
            <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg m-4 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Pro Plan</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                120 / 500 minutes used
              </p>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="gradient-primary h-2 rounded-full" style={{ width: '24%' }} />
              </div>
            </div>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}