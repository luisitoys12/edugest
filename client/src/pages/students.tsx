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
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Trash2, Pencil, Users } from "lucide-react";
import { User } from "@shared/schema";
import PerplexityAttribution from "@/components/PerplexityAttribution";

function StudentForm({ onClose, initial }: { onClose: () => void; initial?: User }) {
  const { toast } = useToast();
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/users", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "Alumno creado correctamente" });
      onClose();
    },
    onError: () => toast({ title: "Error al crear alumno", variant: "destructive" }),
  });
  const updateMutation = useMutation({
    mutationFn: (data: any) => apiRequest("PATCH", `/api/users/${initial?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "Alumno actualizado" });
      onClose();
    },
    onError: () => toast({ title: "Error al actualizar", variant: "destructive" }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { name, email, role: "student", password: "temp1234" };
    if (initial) updateMutation.mutate(data);
    else createMutation.mutate(data);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="space-y-1.5">
        <Label>Nombre completo</Label>
        <Input data-testid="input-student-name" value={name} onChange={e => setName(e.target.value)} placeholder="Nombre del alumno" required />
      </div>
      <div className="space-y-1.5">
        <Label>Correo electronico</Label>
        <Input data-testid="input-student-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@escuela.edu.mx" required />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit" disabled={isPending} data-testid="button-submit-student">
          {isPending ? "Guardando..." : initial ? "Actualizar" : "Crear alumno"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function Students() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<User | undefined>();
  const { toast } = useToast();

  const { data: users, isLoading } = useQuery<User[]>({ queryKey: ["/api/users"] });
  const students = users?.filter(u => u.role === "student") ?? [];
  const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()));

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "Alumno eliminado" });
    },
  });

  const openEdit = (u: User) => { setEditing(u); setDialogOpen(true); };
  const openCreate = () => { setEditing(undefined); setDialogOpen(true); };

  return (
    <div className="p-6 space-y-5 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> Alumnos
          </h1>
          <p className="text-sm text-muted-foreground">{students.length} alumnos registrados</p>
        </div>
        <Button onClick={openCreate} data-testid="button-new-student">
          <Plus className="w-4 h-4 mr-1.5" /> Nuevo alumno
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          data-testid="input-search-students"
          className="pl-9"
          placeholder="Buscar alumno..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center text-muted-foreground">
              <Users className="w-10 h-10 mb-3 text-muted-foreground/30" />
              <p className="font-medium">No se encontraron alumnos</p>
              <p className="text-sm">Intenta con otro termino o agrega un alumno nuevo</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map(student => (
                <div key={student.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors" data-testid={`student-row-${student.id}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">{student.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={student.isActive ? "secondary" : "outline"} className="text-[10px]">
                      {student.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                    <Button size="icon" variant="ghost" onClick={() => openEdit(student)} data-testid={`button-edit-student-${student.id}`}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(student.id)} disabled={deleteMutation.isPending} data-testid={`button-delete-student-${student.id}`}>
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar alumno" : "Nuevo alumno"}</DialogTitle>
          </DialogHeader>
          <StudentForm onClose={() => setDialogOpen(false)} initial={editing} />
        </DialogContent>
      </Dialog>

      <PerplexityAttribution />
    </div>
  );
}
