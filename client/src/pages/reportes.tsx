import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";
import { BarChart2, TrendingUp, Users, BookOpen } from "lucide-react";
import { User, GradeRecord, Attendance, Subject, Group, Enrollment, Grade } from "@shared/schema";
import PerplexityAttribution from "@/components/PerplexityAttribution";

const COLORS = ["#4f98a3","#e8613a","#6daa45","#d19900","#7a39bb","#006494","#a13544","#da7101"];

export default function Reportes() {
  const { data: users } = useQuery<User[]>({ queryKey: ["/api/users"] });
  const { data: subjects } = useQuery<Subject[]>({ queryKey: ["/api/subjects"] });
  const { data: groups } = useQuery<Group[]>({ queryKey: ["/api/groups"] });
  const { data: gradeLevels } = useQuery<Grade[]>({ queryKey: ["/api/grade-levels"] });
  const { data: gradeRecords } = useQuery<GradeRecord[]>({ queryKey: ["/api/grade-records"] });
  const { data: enrollments } = useQuery<Enrollment[]>({ queryKey: ["/api/enrollments"] });

  const students = users?.filter(u => u.role === "student") ?? [];
  const teachers = users?.filter(u => u.role === "teacher") ?? [];

  const avgBySubject = subjects?.map(s => {
    const records = gradeRecords?.filter(r => r.subjectId === s.id && r.score !== null) ?? [];
    const avg = records.length > 0 ? records.reduce((acc, r) => acc + (r.score ?? 0), 0) / records.length : 0;
    return { name: s.code ?? s.name.slice(0, 3), fullName: s.name, avg: Math.round(avg * 10) / 10, color: s.color };
  }) ?? [];

  const gradeDistribution = [
    { range: "9-10", label: "Excelente", count: gradeRecords?.filter(r => r.score !== null && r.score >= 9).length ?? 0, color: "#6daa45" },
    { range: "7-8.9", label: "Bueno", count: gradeRecords?.filter(r => r.score !== null && r.score >= 7 && r.score < 9).length ?? 0, color: "#4f98a3" },
    { range: "6-6.9", label: "Suficiente", count: gradeRecords?.filter(r => r.score !== null && r.score >= 6 && r.score < 7).length ?? 0, color: "#d19900" },
    { range: "0-5.9", label: "No aprobado", count: gradeRecords?.filter(r => r.score !== null && r.score < 6).length ?? 0, color: "#a13544" },
  ];

  const studentsByGroup = groups?.map(g => {
    const enrolled = enrollments?.filter(e => e.groupId === g.id).length ?? 0;
    const grade = gradeLevels?.find(gl => gl.id === g.gradeId);
    return { name: `${grade?.name ?? ""} ${g.name}`, alumnos: enrolled };
  }) ?? [];

  const trendData = [1, 2, 3].map(order => {
    const records = gradeRecords?.filter(r => r.periodId && r.score !== null) ?? [];
    const slice = records.slice(0, Math.ceil(records.length * order / 3));
    const avg = slice.length > 0 ? slice.reduce((a, r) => a + (r.score ?? 0), 0) / slice.length : 0;
    return { periodo: `Parcial ${order}`, promedio: Math.round(avg * 10) / 10 };
  });

  const radarData = avgBySubject.map(s => ({ subject: s.name, value: s.avg }));

  const roleData = [
    { name: "Alumnos", value: students.length, color: "#4f98a3" },
    { name: "Docentes", value: teachers.length, color: "#7a39bb" },
    { name: "Admins", value: users?.filter(u => u.role === "admin").length ?? 0, color: "#e8613a" },
  ];

  const isLoading = !users || !subjects || !gradeRecords;

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      <div>
        <h1 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-primary" /> Reportes Analiticos
        </h1>
        <p className="text-sm text-muted-foreground">Visualizacion del rendimiento academico de la institucion</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {[
          { label: "Total registros", value: gradeRecords?.length ?? 0, color: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300" },
          { label: "Promedio global", value: (() => { const r = gradeRecords?.filter(r => r.score !== null) ?? []; return r.length > 0 ? (r.reduce((a, b) => a + (b.score ?? 0), 0) / r.length).toFixed(1) : ""; })(), color: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300" },
          { label: "Alumnos activos", value: students.filter(s => s.isActive).length, color: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300" },
          { label: "Materias evaluadas", value: subjects?.length ?? 0, color: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300" },
        ].map(kpi => (
          <div key={kpi.label} className={`px-4 py-2 rounded-lg ${kpi.color} text-sm font-medium flex items-center gap-2`}>
            <span className="text-muted-foreground text-xs">{kpi.label}:</span>
            <span className="font-bold font-display">{kpi.value}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" /> Promedio por materia
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-56" /> : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={avgBySubject} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }}
                    formatter={(v: any, _n: any, props: any) => [v, props.payload?.fullName]}
                  />
                  <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
                    {avgBySubject.map((s, i) => <Cell key={i} fill={s.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Distribucion de calificaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-56" /> : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="60%" height={220}>
                  <PieChart>
                    <Pie data={gradeDistribution} dataKey="count" nameKey="label" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {gradeDistribution.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 flex-1">
                  {gradeDistribution.map(d => (
                    <div key={d.range} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: d.color }} />
                        <span className="text-xs text-foreground">{d.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">{d.range}</Badge>
                        <span className="text-xs font-bold text-foreground w-8 text-right">{d.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Tendencia por parcial
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-56" /> : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="periodo" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis domain={[6, 10]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
                  <Line type="monotone" dataKey="promedio" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: "hsl(var(--primary))", r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Alumnos por grupo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-56" /> : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={studentsByGroup} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={55} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
                  <Bar dataKey="alumnos" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Radar de rendimiento por materia</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-56" /> : (
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius={80}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Radar name="Promedio" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Distribucion de usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-56" /> : (
              <div className="flex items-center justify-around h-56">
                {roleData.map(r => (
                  <div key={r.name} className="flex flex-col items-center gap-2">
                    <div className="relative w-24 h-24">
                      <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke={r.color} strokeWidth="3"
                          strokeDasharray={`${(r.value / (users?.length ?? 1)) * 100} 100`}
                          strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-display font-bold text-foreground">{r.value}</span>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">{r.name}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <PerplexityAttribution />
    </div>
  );
}
