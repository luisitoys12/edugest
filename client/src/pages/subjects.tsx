import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Pencil, BookOpen } from "lucide-react";
import { Subject } from "@shared/schema";
import PerplexityAttribution from "@/components/PerplexityAttribution";

const COLORS = ["#4f98a3","#e8613a","#6daa45","#d19900","#7a39bb","#006494","#a13544","#da7101","#01696f","#437a22"];

function SubjectForm({ onClose, initial }: { onClose: () => void; initial?: Subject }) {
  const { toast } = useToast();
  const [name, setName] = useState(initial?.name ?? "");
  const [code, setCode] = useState(initial?.code ?? "");
  const [color, setColor] = useState(initial?.color ?? COLORS[0]);

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/subjects", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/subjects"] }); toast({ title: "Materia creada" }); onClose(); },
    onError: () => toast({ title: "Error al crear", variant: "destructive" }),
  });
  const updateMutation = useMutation({
    mutationFn: (data: any) => apiRequest("PATCH", `/api/subjects/${initial?.id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/subjects"] }); toast({ title: "Materia actualizada" }); onClose(); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { name, code: code || null, color };
    if (initial) updateMutation.mutate(data);
    else createMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="space-y-1.5"><Label>Nombre de la materia</Label><Input data-testid="input-subject-name" value={name} onChange={e => setName(e.target.value)} required placeholder="Ej. Matematicas" /></div>
      <div className="space-y-1.5"><Label>Clave (opcional)</Label><Input data-testid="input-subject-code" value={code} onChange={e => setCode(e.target.value)} placeholder="Ej. MAT" maxLength={6} /></div>
      <div className="space-y-1.5">
        <Label>Color identificador</Label>
        <div className="flex flex-wrap gap-2">
          {COLORS.map(c => (
            <button key={c} type="button" onClick={() => setColor(c)}
              className={`w-7 h-7 rounded-full border-2 transition-all ${color === c ? "border-foreground scale-110" : "border-transparent"}`}
              style={{ backgroundColor: c }} data-testid={`color-swatch-${c}`}
            />
          ))}
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-subject">
          {createMutation.isPending || updateMutation.isPending ? "Guardando..." : initial ? "Actualizar" : "Crear materia"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function Subjects() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Subject | undefined>();
  const { toast } = useToast();

  const { data: subjects, isLoading } = useQuery<Subject[]>({ queryKey: ["/api/subjects"] });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/subjects/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/subjects"] }); toast({ title: "Materia eliminada" }); },
  });

  return (
    <div className="p-6 space-y-5 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-display font-bold text-foreground flex items-center gap-2"><BookOpen className="w-5 h-5 text-primary" /> Materias</h1>
          <p className="text-sm text-muted-foreground">{subjects?.length ?? 0} materias configuradas</p>
        </div>
        <Button onClick={() => { setEditing(undefined); setDialogOpen(true); }} data-testid="button-new-subject"><Plus className="w-4 h-4 mr-1.5" /> Nueva materia</Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {subjects?.map(subj => (
            <Card key={subj.id} className="hover-elevate overflow-hidden" data-testid={`subject-card-${subj.id}`}>
              <div className="h-1.5 w-full" style={{ backgroundColor: subj.color }} />
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${subj.color}20`, color: subj.color }}>
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{subj.name}</p>
                      {subj.code && <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{subj.code}</p>}
                    </div>
                  </div>
                  <div className="flex gap-0.5 flex-shrink-0">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditing(subj); setDialogOpen(true); }} data-testid={`button-edit-subject-${subj.id}`}><Pencil className="w-3 h-3" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => deleteMutation.mutate(subj.id)} data-testid={`button-delete-subject-${subj.id}`}><Trash2 className="w-3 h-3 text-destructive" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Editar materia" : "Nueva materia"}</DialogTitle></DialogHeader>
          <SubjectForm onClose={() => setDialogOpen(false)} initial={editing} />
        </DialogContent>
      </Dialog>

      <PerplexityAttribution />
    </div>
  );
}
