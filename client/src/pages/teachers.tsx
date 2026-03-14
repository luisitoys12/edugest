import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Trash2, Pencil, UserCheck } from "lucide-react";
import { User } from "@shared/schema";
import PerplexityAttribution from "@/components/PerplexityAttribution";

function TeacherForm({ onClose, initial }: { onClose: () => void; initial?: User }) {
  const { toast } = useToast();
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/users", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/users"] }); toast({ title: "Docente creado" }); onClose(); },
    onError: () => toast({ title: "Error al crear", variant: "destructive" }),
  });
  const updateMutation = useMutation({
    mutationFn: (data: any) => apiRequest("PATCH", `/api/users/${initial?.id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/users"] }); toast({ title: "Docente actualizado" }); onClose(); },
    onError: () => toast({ title: "Error al actualizar", variant: "destructive" }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { name, email, role: "teacher", password: "temp1234" };
    if (initial) updateMutation.mutate(data);
    else createMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="space-y-1.5"><Label>Nombre completo</Label><Input data-testid="input-teacher-name" value={name} onChange={e => setName(e.target.value)} required placeholder="Prof. Nombre Apellido" /></div>
      <div className="space-y-1.5"><Label>Correo</Label><Input data-testid="input-teacher-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="docente@escuela.edu.mx" /></div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-teacher">
          {createMutation.isPending || updateMutation.isPending ? "Guardando..." : initial ? "Actualizar" : "Crear docente"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function Teachers() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<User | undefined>();
  const { toast } = useToast();

  const { data: users, isLoading } = useQuery<User[]>({ queryKey: ["/api/users"] });
  const teachers = users?.filter(u => u.role === "teacher") ?? [];
  const filtered = teachers.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/users/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/users"] }); toast({ title: "Docente eliminado" }); },
  });

  return (
    <div className="p-6 space-y-5 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-display font-bold text-foreground flex items-center gap-2"><UserCheck className="w-5 h-5 text-primary" /> Docentes</h1>
          <p className="text-sm text-muted-foreground">{teachers.length} docentes registrados</p>
        </div>
        <Button onClick={() => { setEditing(undefined); setDialogOpen(true); }} data-testid="button-new-teacher">
          <Plus className="w-4 h-4 mr-1.5" /> Nuevo docente
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Buscar docente..." value={search} onChange={e => setSearch(e.target.value)} data-testid="input-search-teachers" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28" />) :
          filtered.length === 0 ? (
            <div className="col-span-full flex flex-col items-center py-16 text-muted-foreground">
              <UserCheck className="w-10 h-10 mb-3 text-muted-foreground/30" />
              <p className="font-medium">Sin docentes</p>
            </div>
          ) : filtered.map(teacher => (
            <Card key={teacher.id} className="hover-elevate" data-testid={`teacher-card-${teacher.id}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-purple-600 dark:text-purple-300">{teacher.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{teacher.name}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{teacher.email}</p>
                    <Badge variant="secondary" className="mt-2 text-[10px]">{teacher.isActive ? "Activo" : "Inactivo"}</Badge>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button size="icon" variant="ghost" onClick={() => { setEditing(teacher); setDialogOpen(true); }} data-testid={`button-edit-teacher-${teacher.id}`}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(teacher.id)} data-testid={`button-delete-teacher-${teacher.id}`}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Editar docente" : "Nuevo docente"}</DialogTitle></DialogHeader>
          <TeacherForm onClose={() => setDialogOpen(false)} initial={editing} />
        </DialogContent>
      </Dialog>

      <PerplexityAttribution />
    </div>
  );
}
