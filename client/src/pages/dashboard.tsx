import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserCheck, Grid3X3, BookOpen, TrendingUp, CalendarCheck, Megaphone, Pin } from "lucide-react";
import { Announcement } from "@shared/schema";
import PerplexityAttribution from "@/components/PerplexityAttribution";

interface Stats {
  totalStudents: number;
  totalTeachers: number;
  totalGroups: number;
  totalSubjects: number;
  avgScore: number;
  attendanceRate: number;
}

function StatCard({ icon: Icon, label, value, color, sub }: { icon: any; label: string; value: string | number; color: string; sub?: string }) {
  return (
    <Card className="hover-elevate" data-testid={`stat-${label.toLowerCase().replace(/ /g, "-")}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-1">{label}</p>
            <p className="text-2xl font-display font-bold text-foreground">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({ queryKey: ["/api/stats"] });
  const { data: announcements, isLoading: annLoading } = useQuery<Announcement[]>({ queryKey: ["/api/announcements"] });
  const { data: school } = useQuery<any>({ queryKey: ["/api/school"] });

  const gradeColor = (score: number) => {
    if (score >= 9) return "text-green-600 dark:text-green-400";
    if (score >= 7) return "text-blue-600 dark:text-blue-400";
    if (score >= 6) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      <div>
        <h1 className="text-xl font-display font-bold text-foreground">
          {school?.name ?? "Panel Principal"}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Ciclo 2025-2026 - Parcial 3 activo
        </p>
      </div>

      {statsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard icon={Users} label="Alumnos" value={stats?.totalStudents ?? 0} color="bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400" />
          <StatCard icon={UserCheck} label="Docentes" value={stats?.totalTeachers ?? 0} color="bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400" />
          <StatCard icon={Grid3X3} label="Grupos" value={stats?.totalGroups ?? 0} color="bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400" />
          <StatCard icon={BookOpen} label="Materias" value={stats?.totalSubjects ?? 0} color="bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400" />
          <StatCard
            icon={TrendingUp}
            label="Promedio Gral."
            value={stats?.avgScore?.toFixed(1) ?? ""}
            color="bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400"
            sub="escala 10"
          />
          <StatCard
            icon={CalendarCheck}
            label="Asistencia"
            value={`${stats?.attendanceRate ?? 0}%`}
            color="bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-primary" />
                Comunicados recientes
              </CardTitle>
              <a href="#/announcements" className="text-xs text-primary hover:underline">Ver todos</a>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {annLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))
            ) : announcements?.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Sin comunicados recientes</p>
            ) : (
              announcements?.map(a => (
                <div key={a.id} className="p-3 rounded-lg bg-muted/50 space-y-1" data-testid={`announcement-${a.id}`}>
                  <div className="flex items-start gap-2">
                    {a.isPinned && <Pin className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />}
                    <p className="text-sm font-medium text-foreground leading-tight">{a.title}</p>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{a.content}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Acciones rapidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { href: "#/grades", label: "Registrar calificaciones", icon: "📝", color: "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800" },
                { href: "#/attendance", label: "Tomar asistencia", icon: "✅", color: "bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800" },
                { href: "#/students", label: "Gestionar alumnos", icon: "👨‍🎓", color: "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800" },
                { href: "#/announcements", label: "Nuevo comunicado", icon: "📢", color: "bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800" },
                { href: "#/groups", label: "Ver grupos", icon: "🏫", color: "bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800" },
                { href: "#/plans", label: "Planes y precios", icon: "💳", color: "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800" },
              ].map(({ href, label, icon, color }) => (
                <a
                  key={href}
                  href={href}
                  className={`flex items-center gap-2.5 p-3 rounded-lg border text-sm font-medium transition-all hover:scale-[1.02] ${color}`}
                  data-testid={`quick-action-${href.replace("#/", "")}`}
                >
                  <span className="text-lg">{icon}</span>
                  <span className="leading-tight">{label}</span>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Rendimiento por materia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { name: "Espanol", avg: 8.4, color: "#4f98a3" },
              { name: "Matematicas", avg: 7.6, color: "#e8613a" },
              { name: "Ciencias Nat.", avg: 8.1, color: "#6daa45" },
              { name: "Historia", avg: 8.8, color: "#d19900" },
              { name: "Geografia", avg: 8.2, color: "#7a39bb" },
              { name: "Ed. Fisica", avg: 9.1, color: "#006494" },
              { name: "Ingles", avg: 7.9, color: "#a13544" },
              { name: "Artes", avg: 9.3, color: "#da7101" },
            ].map(s => (
              <div key={s.name} className="p-3 rounded-lg bg-muted/40 space-y-2" data-testid={`subject-score-${s.name}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">{s.name}</span>
                  <span className={`text-sm font-bold font-display ${gradeColor(s.avg)}`}>{s.avg}</span>
                </div>
                <div className="h-1.5 rounded-full bg-border overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${s.avg * 10}%`, backgroundColor: s.color }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <PerplexityAttribution />
    </div>
  );
}
