import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Clock } from "lucide-react";
import { Period, Cycle } from "@shared/schema";
import PerplexityAttribution from "@/components/PerplexityAttribution";

function PeriodForm({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const { data: cycles } = useQuery<Cycle[]>({ queryKey: ["/api/cycles"] });
  const [name, setName] = useState("");
  const [cycleId, setCycleId] = useState("");
  const [order, setOrder] = useState("1");

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/periods", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/periods"] }); toast({ title: "Periodo creado" }); onClose(); },
    onError: () => toast({ title: "Error al crear periodo", variant: "destructive" }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ name, cycleId: Number(cycleId), order: Number(order), isOpen: false });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="space-y-1.5"><Label>Nombre</Label><Input data-testid="input-period-name" value={name} onChange={e => setName(e.target.value)} required placeholder="Ej. Parcial 1" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Ciclo</Label>
          <Select value={cycleId} onValueChange={setCycleId} required>
            <SelectTrigger data-testid="select-period-cycle"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
            <SelectContent>{cycles?.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5"><Label>Orden</Label><Input data-testid="input-period-order" type="number" value={order} onChange={e => setOrder(e.target.value)} min={1} /></div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-period">
          {createMutation.isPending ? "Creando..." : "Crear periodo"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function Periods() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const { data: periods, isLoading } = useQuery<Period[]>({ queryKey: ["/api/periods"] });
  const { data: cycles } = useQuery<Cycle[]>({ queryKey: ["/api/cycles"] });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/periods/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/periods"] }); toast({ title: "Periodo eliminado" }); },
  });
  const toggleOpen = useMutation({
    mutationFn: ({ id, isOpen }: { id: number; isOpen: boolean }) => apiRequest("PATCH", `/api/periods/${id}`, { isOpen }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/periods"] }),
  });

  const getCycleName = (id: number) => cycles?.find(c => c.id === id)?.name ?? "";

  return (
    <div className="p-6 space-y-5 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-display font-bold text-foreground flex items-center gap-2"><Clock className="w-5 h-5 text-primary" /> Periodos de evaluacion</h1>
          <p className="text-sm text-muted-foreground">Controla que periodos aceptan calificaciones</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} data-testid="button-new-period"><Plus className="w-4 h-4 mr-1.5" /> Nuevo periodo</Button>
      </div>

      <div className="space-y-3">
        {isLoading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-lg" />) :
          periods?.map(period => (
            <Card key={period.id} className="hover-elevate" data-testid={`period-card-${period.id}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">{period.order}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{period.name}</p>
                      <p className="text-xs text-muted-foreground">Ciclo: {getCycleName(period.cycleId)}</p>
                    </div>
                    {period.isOpen && <Badge className="text-[10px] bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300">Activo</Badge>}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={period.isOpen}
                        onCheckedChange={v => toggleOpen.mutate({ id: period.id, isOpen: v })}
                        data-testid={`switch-period-open-${period.id}`}
                      />
                      <span className="text-xs text-muted-foreground">{period.isOpen ? "Abierto" : "Cerrado"}</span>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(period.id)} data-testid={`button-delete-period-${period.id}`}>
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nuevo periodo</DialogTitle></DialogHeader>
          <PeriodForm onClose={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <PerplexityAttribution />
    </div>
  );
}
