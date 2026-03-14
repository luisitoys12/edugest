import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { CalendarCheck, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { Group, User, Enrollment, Attendance, Grade } from "@shared/schema";
import PerplexityAttribution from "@/components/PerplexityAttribution";

type Status = "present" | "absent" | "late" | "excused";

const STATUS_CONFIG: Record<Status, { label: string; color: string; icon: any; badge: "default" | "destructive" | "secondary" | "outline" }> = {
  present: { label: "Presente", color: "text-green-600 dark:text-green-400", icon: CheckCircle, badge: "default" },
  absent: { label: "Falta", color: "text-red-600 dark:text-red-400", icon: XCircle, badge: "destructive" },
  late: { label: "Tarde", color: "text-yellow-600 dark:text-yellow-400", icon: Clock, badge: "secondary" },
  excused: { label: "Justificado", color: "text-blue-600 dark:text-blue-400", icon: AlertCircle, badge: "outline" },
};

export default function AttendancePage() {
  const today = new Date().toISOString().split("T")[0];
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [statuses, setStatuses] = useState<Record<number, Status>>({});
  const { toast } = useToast();

  const { data: groups } = useQuery<Group[]>({ queryKey: ["/api/groups"] });
  const { data: gradeLevels } = useQuery<Grade[]>({ queryKey: ["/api/grade-levels"] });
  const { data: users } = useQuery<User[]>({ queryKey: ["/api/users"] });
  const { data: enrollments } = useQuery<Enrollment[]>({ queryKey: ["/api/enrollments", selectedGroup], enabled: !!selectedGroup });
  const { data: existingAttendance } = useQuery<Attendance[]>({
    queryKey: ["/api/attendance", selectedGroup, selectedDate],
    enabled: !!selectedGroup,
    queryFn: async () => {
      const r = await fetch(`/api/attendance?groupId=${selectedGroup}&date=${selectedDate}`);
      return r.json();
    },
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/attendance", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/attendance"] }),
  });

  const students = users?.filter(u => u.role === "student") ?? [];
  const groupStudents = enrollments?.map(e => students.find(s => s.id === e.studentId)).filter(Boolean) as User[];

  const getGradeName = (id: number) => gradeLevels?.find(g => g.id === id)?.name ?? "";

  const getStatus = (studentId: number): Status => {
    if (statuses[studentId]) return statuses[studentId];
    const existing = existingAttendance?.find(a => a.studentId === studentId);
    return (existing?.status as Status) ?? "present";
  };

  const handleSave = async () => {
    if (!selectedGroup) return;
    const group = groups?.find(g => String(g.id) === selectedGroup);
    const allStudentIds = groupStudents.map(s => s.id);
    const promises = allStudentIds.map(sid => {
      return saveMutation.mutateAsync({
        studentId: sid,
        groupId: Number(selectedGroup),
        date: new Date(selectedDate).toISOString(),
        status: getStatus(sid),
      });
    });
    await Promise.all(promises);
    setStatuses({});
    toast({ title: "Asistencia guardada" });
  };

  const setAll = (status: Status) => {
    const newStatuses: Record<number, Status> = {};
    groupStudents.forEach(s => { newStatuses[s.id] = status; });
    setStatuses(newStatuses);
  };

  const stats = groupStudents.reduce((acc, s) => {
    const st = getStatus(s.id);
    acc[st] = (acc[st] ?? 0) + 1;
    return acc;
  }, {} as Record<Status, number>);

  return (
    <div className="p-6 space-y-5 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-display font-bold text-foreground flex items-center gap-2"><CalendarCheck className="w-5 h-5 text-primary" /> Asistencias</h1>
          <p className="text-sm text-muted-foreground">Registro diario por grupo</p>
        </div>
        {selectedGroup && (
          <Button onClick={handleSave} disabled={saveMutation.isPending} data-testid="button-save-attendance">
            <CalendarCheck className="w-4 h-4 mr-1.5" /> {saveMutation.isPending ? "Guardando..." : "Guardar asistencia"}
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={selectedGroup} onValueChange={v => { setSelectedGroup(v); setStatuses({}); }}>
          <SelectTrigger className="w-48" data-testid="select-attendance-group"><SelectValue placeholder="Seleccionar grupo" /></SelectTrigger>
          <SelectContent>
            {groups?.map(g => <SelectItem key={g.id} value={String(g.id)}>{getGradeName(g.gradeId)} {g.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
          className="h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground"
          data-testid="input-attendance-date" />
      </div>

      {!selectedGroup ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-muted-foreground">
            <CalendarCheck className="w-10 h-10 mb-3 text-muted-foreground/30" />
            <p className="font-medium">Selecciona un grupo para continuar</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-wrap gap-3">
            {(Object.keys(STATUS_CONFIG) as Status[]).map(s => {
              const cfg = STATUS_CONFIG[s];
              return (
                <div key={s} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/40 text-sm ${cfg.color}`}>
                  <cfg.icon className="w-3.5 h-3.5" />
                  <span className="font-medium">{stats[s] ?? 0}</span>
                  <span className="text-muted-foreground text-xs">{cfg.label}</span>
                </div>
              );
            })}
            <div className="flex gap-2 ml-auto">
              <Button size="sm" variant="outline" onClick={() => setAll("present")} data-testid="button-all-present">Todos presente</Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0 divide-y divide-border">
              {groupStudents.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-muted-foreground">
                  <p className="font-medium">Sin alumnos inscritos</p>
                </div>
              ) : groupStudents.map(student => {
                const status = getStatus(student.id);
                const cfg = STATUS_CONFIG[status];
                return (
                  <div key={student.id} className="flex items-center justify-between px-4 py-3" data-testid={`attendance-row-${student.id}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-primary">{student.name.charAt(0)}</span>
                      </div>
                      <span className="text-sm font-medium">{student.name}</span>
                    </div>
                    <div className="flex gap-1.5">
                      {(Object.keys(STATUS_CONFIG) as Status[]).map(s => {
                        const c = STATUS_CONFIG[s];
                        return (
                          <button key={s}
                            onClick={() => setStatuses(prev => ({ ...prev, [student.id]: s }))}
                            className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${status === s ? `${c.color} border-current bg-current/10` : "border-border text-muted-foreground hover:border-current hover:text-foreground"}`}
                            data-testid={`attendance-${student.id}-${s}`}
                          >
                            {c.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </>
      )}

      <PerplexityAttribution />
    </div>
  );
}
