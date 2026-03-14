import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ClipboardList, Save } from "lucide-react";
import { Group, Period, Subject, User, Enrollment, GradeRecord, Grade } from "@shared/schema";
import PerplexityAttribution from "@/components/PerplexityAttribution";

function gradeColor(score: number | null) {
  if (score === null) return "";
  if (score >= 9) return "grade-excellent";
  if (score >= 7) return "grade-good";
  if (score >= 6) return "grade-regular";
  return "grade-fail";
}

function gradeBg(score: number | null) {
  if (score === null) return "bg-muted/30";
  if (score >= 9) return "bg-green-50 dark:bg-green-950/30";
  if (score >= 7) return "bg-blue-50 dark:bg-blue-950/30";
  if (score >= 6) return "bg-yellow-50 dark:bg-yellow-950/30";
  return "bg-red-50 dark:bg-red-950/30";
}

export default function GradesPage() {
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [edits, setEdits] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const { data: groups } = useQuery<Group[]>({ queryKey: ["/api/groups"] });
  const { data: gradeLevels } = useQuery<Grade[]>({ queryKey: ["/api/grade-levels"] });
  const { data: periods } = useQuery<Period[]>({ queryKey: ["/api/periods"] });
  const { data: subjects } = useQuery<Subject[]>({ queryKey: ["/api/subjects"] });
  const { data: users } = useQuery<User[]>({ queryKey: ["/api/users"] });

  const { data: enrollments } = useQuery<Enrollment[]>({
    queryKey: ["/api/enrollments", selectedGroup],
    enabled: !!selectedGroup,
  });
  const { data: gradeRecords, isLoading: grLoading } = useQuery<GradeRecord[]>({
    queryKey: ["/api/grade-records", selectedGroup, selectedPeriod],
    enabled: !!selectedGroup && !!selectedPeriod,
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/grade-records", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/grade-records"] }),
  });

  const students = users?.filter(u => u.role === "student") ?? [];
  const groupStudents = enrollments?.map(e => students.find(s => s.id === e.studentId)).filter(Boolean) as User[];
  const currentGroup = groups?.find(g => String(g.id) === selectedGroup);

  const getGradeName = (id: number) => gradeLevels?.find(g => g.id === id)?.name ?? "";

  const getScore = (studentId: number, subjectId: number): number | null => {
    const key = `${studentId}-${subjectId}`;
    if (edits[key] !== undefined) return edits[key] === "" ? null : Number(edits[key]);
    return gradeRecords?.find(r => r.studentId === studentId && r.subjectId === subjectId)?.score ?? null;
  };

  const handleChange = (studentId: number, subjectId: number, val: string) => {
    setEdits(prev => ({ ...prev, [`${studentId}-${subjectId}`]: val }));
  };

  const handleSaveAll = async () => {
    if (!selectedGroup || !selectedPeriod) return;
    const promises = Object.entries(edits).map(([key, val]) => {
      const [studentId, subjectId] = key.split("-").map(Number);
      const group = groups?.find(g => String(g.id) === selectedGroup);
      return saveMutation.mutateAsync({
        studentId, subjectId,
        groupId: Number(selectedGroup),
        periodId: Number(selectedPeriod),
        cycleId: group?.cycleId ?? 1,
        score: val === "" ? null : Number(val),
      });
    });
    await Promise.all(promises);
    setEdits({});
    toast({ title: "Calificaciones guardadas correctamente" });
  };

  const hasEdits = Object.keys(edits).length > 0;

  return (
    <div className="p-6 space-y-5 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-display font-bold text-foreground flex items-center gap-2"><ClipboardList className="w-5 h-5 text-primary" /> Calificaciones</h1>
          <p className="text-sm text-muted-foreground">Selecciona grupo y periodo para capturar</p>
        </div>
        {hasEdits && (
          <Button onClick={handleSaveAll} disabled={saveMutation.isPending} data-testid="button-save-grades">
            <Save className="w-4 h-4 mr-1.5" /> {saveMutation.isPending ? "Guardando..." : `Guardar ${Object.keys(edits).length} cambio(s)`}
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={selectedGroup} onValueChange={setSelectedGroup}>
          <SelectTrigger className="w-48" data-testid="select-grade-group"><SelectValue placeholder="Seleccionar grupo" /></SelectTrigger>
          <SelectContent>
            {groups?.map(g => (
              <SelectItem key={g.id} value={String(g.id)}>{getGradeName(g.gradeId)} {g.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-48" data-testid="select-grade-period"><SelectValue placeholder="Seleccionar periodo" /></SelectTrigger>
          <SelectContent>
            {periods?.map(p => (
              <SelectItem key={p.id} value={String(p.id)}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedGroup || !selectedPeriod ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-muted-foreground">
            <ClipboardList className="w-10 h-10 mb-3 text-muted-foreground/30" />
            <p className="font-medium">Selecciona grupo y periodo</p>
            <p className="text-sm">para ver o capturar calificaciones</p>
          </CardContent>
        </Card>
      ) : grLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Grupo {getGradeName(currentGroup?.gradeId ?? 0)} {currentGroup?.name} - {periods?.find(p => String(p.id) === selectedPeriod)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground w-44">Alumno</th>
                    {subjects?.map(s => (
                      <th key={s.id} className="text-center px-2 py-2.5 text-xs font-semibold text-muted-foreground min-w-[80px]">
                        <span className="flex flex-col items-center gap-1">
                          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: s.color }} />
                          {s.code ?? s.name.slice(0, 3)}
                        </span>
                      </th>
                    ))}
                    <th className="text-center px-3 py-2.5 text-xs font-semibold text-muted-foreground">Prom.</th>
                  </tr>
                </thead>
                <tbody>
                  {groupStudents.length === 0 ? (
                    <tr><td colSpan={(subjects?.length ?? 0) + 2} className="text-center py-8 text-muted-foreground text-sm">Sin alumnos inscritos</td></tr>
                  ) : groupStudents.map(student => {
                    const scores = subjects?.map(s => getScore(student.id, s.id)).filter(v => v !== null) as number[];
                    const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : null;
                    return (
                      <tr key={student.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors" data-testid={`grades-row-${student.id}`}>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-[10px] font-bold text-primary">{student.name.charAt(0)}</span>
                            </div>
                            <span className="text-xs font-medium truncate max-w-[120px]">{student.name}</span>
                          </div>
                        </td>
                        {subjects?.map(s => {
                          const key = `${student.id}-${s.id}`;
                          const score = getScore(student.id, s.id);
                          const isEdited = edits[key] !== undefined;
                          return (
                            <td key={s.id} className="px-1.5 py-1.5 text-center">
                              <Input
                                type="number"
                                min={0} max={10} step={0.1}
                                value={edits[key] !== undefined ? edits[key] : (score !== null ? String(score) : "")}
                                onChange={e => handleChange(student.id, s.id, e.target.value)}
                                className={`w-16 text-center text-xs px-1 h-7 font-semibold ${gradeBg(score)} ${gradeColor(score)} ${isEdited ? "ring-1 ring-primary" : ""}`}
                                data-testid={`grade-input-${student.id}-${s.id}`}
                                placeholder=""
                              />
                            </td>
                          );
                        })}
                        <td className="px-3 py-2 text-center">
                          {avg ? <span className={`text-sm font-bold font-display ${gradeColor(Number(avg))}`}>{avg}</span> : <span className="text-muted-foreground text-xs"></span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <PerplexityAttribution />
    </div>
  );
}
