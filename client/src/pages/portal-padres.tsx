import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen, CalendarCheck, Megaphone, GraduationCap,
  Search, LogOut, User, AlertCircle, CheckCircle2
} from "lucide-react";
import PerplexityAttribution from "@/components/PerplexityAttribution";

interface StudentData {
  student: {
    id: number;
    name: string;
    accessCode: string;
    email: string;
  };
  enrollments: Array<{
    id: number;
    groupId: number;
    cycleId: number;
  }>;
  grades: Array<{
    id: number;
    subjectId: number;
    periodId: number;
    groupId: number;
    score: number | null;
    comment: string | null;
  }>;
  attendance: Array<{
    id: number;
    date: string;
    status: string;
    note: string | null;
  }>;
}

type SubjectRow = { id: number; name: string; code: string; color: string };
type PeriodRow = { id: number; name: string; order: number };
type AnnouncementRow = { id: number; title: string; content: string; isPinned: boolean; publishedAt: string };

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    present: { label: "Presente", className: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" },
    absent:  { label: "Falta",    className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" },
    late:    { label: "Retardo",  className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300" },
    excused: { label: "Justif.",  className: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" },
  };
  const cfg = map[status] ?? { label: status, className: "bg-muted text-muted-foreground" };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${cfg.className}`}>{cfg.label}</span>;
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-muted-foreground text-sm">-</span>;
  const color = score >= 8 ? "text-green-600 dark:text-green-400" : score >= 6 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400";
  return <span className={`font-bold text-base ${color}`}>{score.toFixed(1)}</span>;
}

export default function PortalPadres() {
  const [inputCode, setInputCode] = useState("");
  const [searchCode, setSearchCode] = useState<string | null>(null);
  const [loggedStudent, setLoggedStudent] = useState<StudentData | null>(null);

  const { data: subjects } = useQuery<SubjectRow[]>({
    queryKey: ["/api/subjects"],
  });
  const { data: periods } = useQuery<PeriodRow[]>({
    queryKey: ["/api/periods"],
  });
  const { data: announcements } = useQuery<AnnouncementRow[]>({
    queryKey: ["/api/announcements"],
  });

  const { data: studentData, isFetching, isError, error } = useQuery<StudentData>({
    queryKey: ["/api/students/by-code", searchCode],
    queryFn: async () => {
      const res = await fetch(`/api/students/by-code/${searchCode}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Error al buscar alumno");
      }
      return res.json();
    },
    enabled: !!searchCode,
    retry: false,
  });

  useEffect(() => {
    if (studentData) setLoggedStudent(studentData);
  }, [studentData]);

  const handleSearch = () => {
    const code = inputCode.trim().toUpperCase();
    if (!code) return;
    setLoggedStudent(null);
    setSearchCode(code);
  };

  const handleLogout = () => {
    setLoggedStudent(null);
    setSearchCode(null);
    setInputCode("");
  };

  if (!loggedStudent) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
              <GraduationCap className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-foreground">Portal para Padres</h1>
              <p className="text-sm text-muted-foreground mt-1">Ingresa el codigo unico del alumno para ver su informacion.</p>
            </div>
          </div>
          <Card className="border-border shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Codigo de alumno</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ej: BJ-0001"
                    value={inputCode}
                    onChange={e => setInputCode(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === "Enter" && handleSearch()}
                    className="font-mono text-sm tracking-widest"
                    maxLength={10}
                  />
                  <Button onClick={handleSearch} disabled={isFetching || !inputCode.trim()} size="icon" className="flex-shrink-0">
                    {isFetching ? <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> : <Search className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              {isError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{(error as Error)?.message ?? "Codigo no encontrado"}</span>
                </div>
              )}
              <p className="text-[11px] text-muted-foreground text-center">
                Los codigos son proporcionados por la escuela. Formato: <span className="font-mono font-semibold">BJ-0001</span>
              </p>
            </CardContent>
          </Card>
          <PerplexityAttribution />
        </div>
      </div>
    );
  }

  const { student, grades, attendance } = loggedStudent;
  const gradesBySubject: Record<number, Record<number, number | null>> = {};
  grades.forEach(g => {
    if (!gradesBySubject[g.subjectId]) gradesBySubject[g.subjectId] = {};
    gradesBySubject[g.subjectId][g.periodId] = g.score;
  });
  const allScores = grades.map(g => g.score).filter((s): s is number => s !== null);
  const avgScore = allScores.length ? (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(1) : "-";
  const attTotal = attendance.length;
  const attPresent = attendance.filter(a => a.status === "present").length;
  const attAbsent = attendance.filter(a => a.status === "absent").length;
  const attLate = attendance.filter(a => a.status === "late").length;
  const attRate = attTotal ? Math.round((attPresent / attTotal) * 100) : 0;
  const sortedPeriods = [...(periods ?? [])].sort((a, b) => a.order - b.order);

  return (
    <div className="p-6 space-y-6 max-w-screen-lg mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-display font-bold text-foreground">{student.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{student.accessCode}</span>
              <Badge variant="secondary" className="text-[10px]">Alumno activo</Badge>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground gap-1.5 flex-shrink-0">
          <LogOut className="w-4 h-4" /> Salir
        </Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Promedio general", value: avgScore, icon: BookOpen, color: "text-primary" },
          { label: "Asistencia", value: `${attRate}%`, icon: CheckCircle2, color: attRate >= 85 ? "text-green-500" : "text-yellow-500" },
          { label: "Faltas", value: String(attAbsent), icon: AlertCircle, color: attAbsent > 3 ? "text-red-500" : "text-muted-foreground" },
          { label: "Retardos", value: String(attLate), icon: CalendarCheck, color: "text-muted-foreground" },
        ].map(kpi => (
          <Card key={kpi.label} className="border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <kpi.icon className={`w-8 h-8 ${kpi.color} flex-shrink-0`} />
              <div>
                <p className="text-2xl font-display font-bold text-foreground">{kpi.value}</p>
                <p className="text-[11px] text-muted-foreground leading-tight">{kpi.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Tabs defaultValue="calificaciones">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="calificaciones" className="gap-1.5 text-xs"><BookOpen className="w-3.5 h-3.5" />Calificaciones</TabsTrigger>
          <TabsTrigger value="asistencia" className="gap-1.5 text-xs"><CalendarCheck className="w-3.5 h-3.5" />Asistencia</TabsTrigger>
          <TabsTrigger value="avisos" className="gap-1.5 text-xs"><Megaphone className="w-3.5 h-3.5" />Avisos</TabsTrigger>
        </TabsList>
        <TabsContent value="calificaciones">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-display font-semibold">Boleta de calificaciones</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Materia</th>
                    {sortedPeriods.map(p => (
                      <th key={p.id} className="text-center px-3 py-2.5 text-xs font-semibold text-muted-foreground min-w-[80px]">{p.name}</th>
                    ))}
                    <th className="text-center px-3 py-2.5 text-xs font-semibold text-muted-foreground">Prom.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(subjects ?? []).map(subj => {
                    const subGrades = gradesBySubject[subj.id] ?? {};
                    const scores = Object.values(subGrades).filter((s): s is number => s !== null);
                    const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
                    return (
                      <tr key={subj.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: subj.color }} />
                            <span className="font-medium text-foreground">{subj.name}</span>
                          </div>
                        </td>
                        {sortedPeriods.map(p => (
                          <td key={p.id} className="text-center px-3 py-2.5">
                            <ScoreBadge score={subGrades[p.id] ?? null} />
                          </td>
                        ))}
                        <td className="text-center px-3 py-2.5">
                          <ScoreBadge score={avg !== null ? Math.round(avg * 10) / 10 : null} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {grades.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">No hay calificaciones registradas aun.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="asistencia">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-display font-semibold">Registro de asistencia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-[160px]">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Asistencia</span>
                    <span className="font-semibold text-foreground">{attRate}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${attRate}%` }} />
                  </div>
                </div>
                <div className="flex gap-3 text-xs">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" />{attPresent} pres.</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />{attAbsent} faltas</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" />{attLate} ret.</span>
                </div>
              </div>
              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {[...attendance].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(att => (
                  <div key={att.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30">
                    <span className="text-sm text-foreground">
                      {new Date(att.date).toLocaleDateString("es-MX", { weekday: "short", day: "2-digit", month: "short" })}
                    </span>
                    <StatusBadge status={att.status} />
                  </div>
                ))}
                {attendance.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-6">No hay registros de asistencia.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="avisos">
          <div className="space-y-3">
            {(announcements ?? []).map(ann => (
              <Card key={ann.id} className={ann.isPinned ? "border-primary/40 bg-primary/5" : "border-border"}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${ann.isPinned ? "bg-primary/10" : "bg-muted"}`}>
                      <Megaphone className={`w-4 h-4 ${ann.isPinned ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-sm text-foreground">{ann.title}</span>
                        {ann.isPinned && <Badge className="text-[10px] bg-primary/10 text-primary border-0">Fijado</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{ann.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {(announcements ?? []).length === 0 && (
              <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No hay avisos disponibles.</CardContent></Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
      <PerplexityAttribution />
    </div>
  );
}
