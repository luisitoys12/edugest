import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Grid3X3, Users } from "lucide-react";
import { Group, Cycle, Grade, User, Enrollment } from "@shared/schema";
import PerplexityAttribution from "@/components/PerplexityAttribution";

function GroupForm({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const { data: cycles } = useQuery<Cycle[]>({ queryKey: ["/api/cycles"] });
  const { data: gradeLevels } = useQuery<Grade[]>({ queryKey: ["/api/grade-levels"] });
  const { data: teachers } = useQuery<User[]>({ queryKey: ["/api/users"] });
  const teacherList = teachers?.filter(u => u.role === "teacher") ?? [];

  const [name, setName] = useState("A");
  const [cycleId, setCycleId] = useState("");
  const [gradeId, setGradeId] = useState("");
  const [tutorId, setTutorId] = useState("");
  const [capacity, setCapacity] = useState("30");

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/groups", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/groups"] }); toast({ title: "Grupo creado" }); onClose(); },
    onError: () => toast({ title: "Error al crear grupo", variant: "destructive" }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ name, cycleId: Number(cycleId), gradeId: Number(gradeId), tutorId: tutorId ? Number(tutorId) : null, capacity: Number(capacity) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Ciclo escolar</Label>
          <Select value={cycleId} onValueChange={setCycleId} required>
            <SelectTrigger data-testid="select-cycle"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
            <SelectContent>{cycles?.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Grado</Label>
          <Select value={gradeId} onValueChange={setGradeId} required>
            <SelectTrigger data-testid="select-grade"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
            <SelectContent>{gradeLevels?.map(g => <SelectItem key={g.id} value={String(g.id)}>{g.name} - {g.level}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Grupo (letra)</Label>
          <Input data-testid="input-group-name" value={name} onChange={e => setName(e.target.value)} required placeholder="A, B, C..." />
        </div>
        <div className="space-y-1.5">
          <Label>Capacidad</Label>
          <Input data-testid="input-group-capacity" type="number" value={capacity} onChange={e => setCapacity(e.target.value)} min={1} max={60} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Maestro tutor</Label>
        <Select value={tutorId} onValueChange={setTutorId}>
          <SelectTrigger data-testid="select-tutor"><SelectValue placeholder="Sin asignar" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sin asignar</SelectItem>
            {teacherList.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-group">
          {createMutation.isPending ? "Creando..." : "Crear grupo"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function Groups() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: groups, isLoading } = useQuery<Group[]>({ queryKey: ["/api/groups"] });
  const { data: gradeLevels } = useQuery<Grade[]>({ queryKey: ["/api/grade-levels"] });
  const { data: users } = useQuery<User[]>({ queryKey: ["/api/users"] });
  const { data: enrollments } = useQuery<Enrollment[]>({ queryKey: ["/api/enrollments"] });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/groups/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/groups"] }); toast({ title: "Grupo eliminado" }); },
  });

  const getGradeName = (id: number) => gradeLevels?.find(g => g.id === id)?.name ?? "";
  const getTutorName = (id: number | null) => id ? (users?.find(u => u.id === id)?.name ?? "") : "Sin tutor";
  const getEnrollCount = (groupId: number) => enrollments?.filter(e => e.groupId === groupId).length ?? 0;

  const byGrade = groups?.reduce((acc, g) => {
    const key = String(g.gradeId);
    if (!acc[key]) acc[key] = [];
    acc[key].push(g);
    return acc;
  }, {} as Record<string, Group[]>) ?? {};

  return (
    <div className="p-6 space-y-5 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-display font-bold text-foreground flex items-center gap-2"><Grid3X3 className="w-5 h-5 text-primary" /> Grupos</h1>
          <p className="text-sm text-muted-foreground">{groups?.length ?? 0} grupos en el ciclo actual</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} data-testid="button-new-group"><Plus className="w-4 h-4 mr-1.5" /> Nuevo grupo</Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-36" />)}
        </div>
      ) : Object.keys(byGrade).length === 0 ? (
        <div className="flex flex-col items-center py-16 text-muted-foreground">
          <Grid3X3 className="w-10 h-10 mb-3 text-muted-foreground/30" />
          <p className="font-medium">Sin grupos</p>
        </div>
      ) : (
        Object.entries(byGrade).map(([gradeId, gradeGroups]) => (
          <div key={gradeId} className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{getGradeName(Number(gradeId))}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {gradeGroups.map(group => {
                const enrolled = getEnrollCount(group.id);
                const pct = Math.round((enrolled / group.capacity) * 100);
                return (
                  <Card key={group.id} className="hover-elevate" data-testid={`group-card-${group.id}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base font-display font-bold">{getGradeName(group.gradeId)} {group.name}</CardTitle>
                          <p className="text-xs text-muted-foreground mt-0.5">{getTutorName(group.tutorId)}</p>
                        </div>
                        <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(group.id)} data-testid={`button-delete-group-${group.id}`}>
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-foreground font-medium">{enrolled}</span>
                        <span className="text-muted-foreground">/ {group.capacity} alumnos</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-muted-foreground"><span>Ocupacion</span><span>{pct}%</span></div>
                        <div className="h-1.5 rounded-full bg-border overflow-hidden">
                          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nuevo grupo</DialogTitle></DialogHeader>
          <GroupForm onClose={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <PerplexityAttribution />
    </div>
  );
}
