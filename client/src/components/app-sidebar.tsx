import { useLocation } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard, Users, UserCheck, BookOpen, Grid3X3,
  ClipboardList, CalendarCheck, Megaphone, Clock, CreditCard, GraduationCap,
  FileText, BarChart3, Smartphone
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Alumnos", icon: Users, href: "/students" },
  { label: "Docentes", icon: UserCheck, href: "/teachers" },
  { label: "Grupos", icon: Grid3X3, href: "/groups" },
  { label: "Materias", icon: BookOpen, href: "/subjects" },
  { label: "Calificaciones", icon: ClipboardList, href: "/grades" },
  { label: "Asistencias", icon: CalendarCheck, href: "/attendance" },
  { label: "Comunicados", icon: Megaphone, href: "/announcements" },
  { label: "Periodos", icon: Clock, href: "/periods" },
  { label: "Boletas PDF", icon: FileText, href: "/boletas" },
  { label: "Reportes", icon: BarChart3, href: "/reportes" },
];

const adminItems = [
  { label: "Portal Padres", icon: Smartphone, href: "/portal-padres" },
  { label: "Planes & Precios", icon: CreditCard, href: "/plans" },
];

export function AppSidebar() {
  const [location, navigate] = useHashLocation();

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-display font-bold text-sm text-sidebar-foreground leading-tight truncate">EduGest</span>
            <span className="text-[11px] text-sidebar-foreground/50 truncate">Gestion Escolar</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 uppercase text-[10px] tracking-wider px-3">Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      data-active={isActive}
                      className={isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"}
                    >
                      <a href={`#${item.href}`} data-testid={`nav-${item.href.replace("/", "") || "home"}`}>
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        <span className="font-medium text-sm">{item.label}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 uppercase text-[10px] tracking-wider px-3">Administracion</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => {
                const isActive = location === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      data-active={isActive}
                      className={isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"}
                    >
                      <a href={`#${item.href}`} data-testid={`nav-${item.href.replace("/", "")}`}>
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        <span className="font-medium text-sm">{item.label}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-1">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-[11px] font-bold text-primary">DR</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-medium text-sidebar-foreground/80 truncate">Director Reyes</span>
            <span className="text-[10px] text-sidebar-foreground/40 truncate">Admin</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
