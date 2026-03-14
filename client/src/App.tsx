import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider, ThemeToggle } from "@/components/theme-provider";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Students from "@/pages/students";
import Teachers from "@/pages/teachers";
import Groups from "@/pages/groups";
import Subjects from "@/pages/subjects";
import Grades from "@/pages/grades";
import AttendancePage from "@/pages/attendance";
import Announcements from "@/pages/announcements";
import Periods from "@/pages/periods";
import Plans from "@/pages/plans";
import Boletas from "@/pages/boletas";
import Reportes from "@/pages/reportes";
import PortalPadres from "@/pages/portal-padres";
import { Bell, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Announcement } from "@shared/schema";

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/students" component={Students} />
      <Route path="/teachers" component={Teachers} />
      <Route path="/groups" component={Groups} />
      <Route path="/subjects" component={Subjects} />
      <Route path="/grades" component={Grades} />
      <Route path="/attendance" component={AttendancePage} />
      <Route path="/announcements" component={Announcements} />
      <Route path="/periods" component={Periods} />
      <Route path="/plans" component={Plans} />
      <Route path="/boletas" component={Boletas} />
      <Route path="/reportes" component={Reportes} />
      <Route path="/portal-padres" component={PortalPadres} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppHeader() {
  const { data: announcements } = useQuery<Announcement[]>({ queryKey: ["/api/announcements"] });
  const pinned = announcements?.filter(a => a.isPinned).length ?? 0;
  return (
    <header className="flex items-center justify-between px-4 h-14 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <SidebarTrigger data-testid="button-sidebar-toggle" className="text-muted-foreground" />
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-primary" />
          <span className="font-display font-bold text-sm text-foreground tracking-tight">EduGest</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {pinned > 0 && (
          <button className="relative p-2 rounded-md text-muted-foreground hover:text-foreground transition-colors" data-testid="button-notifications">
            <Bell className="w-4 h-4" />
            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]" variant="destructive">{pinned}</Badge>
          </button>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}

export default function App() {
  const style = {
    "--sidebar-width": "15rem",
    "--sidebar-width-icon": "3.5rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex h-screen w-full">
              <AppSidebar />
              <div className="flex flex-col flex-1 min-w-0">
                <AppHeader />
                <main className="flex-1 overflow-auto bg-background">
                  <Router hook={useHashLocation}>
                    <AppRouter />
                  </Router>
                </main>
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
