import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Megaphone, Pin } from "lucide-react";
import { Announcement } from "@shared/schema";
import PerplexityAttribution from "@/components/PerplexityAttribution";
import { format } from "date-fns";
import { es } from "date-fns/locale";

function AnnouncementForm({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/announcements", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/announcements"] }); toast({ title: "Comunicado publicado" }); onClose(); },
    onError: () => toast({ title: "Error al publicar", variant: "destructive" }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ title, content, isPinned, targetRole: "all" });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="space-y-1.5"><Label>Titulo</Label><Input data-testid="input-ann-title" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Titulo del comunicado" /></div>
      <div className="space-y-1.5"><Label>Contenido</Label><Textarea data-testid="input-ann-content" value={content} onChange={e => setContent(e.target.value)} required rows={4} placeholder="Escribe el mensaje..." /></div>
      <div className="flex items-center gap-3">
        <Switch checked={isPinned} onCheckedChange={setIsPinned} data-testid="switch-pin" />
        <Label>Fijar en el tablero</Label>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-announcement">
          {createMutation.isPending ? "Publicando..." : "Publicar comunicado"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function Announcements() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const { data: announcements, isLoading } = useQuery<Announcement[]>({ queryKey: ["/api/announcements"] });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/announcements/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/announcements"] }); toast({ title: "Comunicado eliminado" }); },
  });
  const togglePin = useMutation({
    mutationFn: ({ id, isPinned }: { id: number; isPinned: boolean }) => apiRequest("PATCH", `/api/announcements/${id}`, { isPinned }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/announcements"] }),
  });

  return (
    <div className="p-6 space-y-5 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-display font-bold text-foreground flex items-center gap-2"><Megaphone className="w-5 h-5 text-primary" /> Comunicados</h1>
          <p className="text-sm text-muted-foreground">{announcements?.length ?? 0} publicaciones</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} data-testid="button-new-announcement"><Plus className="w-4 h-4 mr-1.5" /> Nuevo comunicado</Button>
      </div>

      <div className="space-y-3">
        {isLoading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-lg" />) :
          announcements?.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-muted-foreground">
              <Megaphone className="w-10 h-10 mb-3 text-muted-foreground/30" />
              <p className="font-medium">Sin comunicados</p>
            </div>
          ) : announcements?.map(a => (
            <Card key={a.id} className={`hover-elevate ${a.isPinned ? "border-primary/30 bg-primary/5" : ""}`} data-testid={`announcement-card-${a.id}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {a.isPinned && <Pin className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                      <h3 className="text-sm font-semibold text-foreground">{a.title}</h3>
                      {a.targetRole && a.targetRole !== "all" && <Badge variant="secondary" className="text-[10px]">{a.targetRole}</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{a.content}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-2">
                      {a.publishedAt ? format(new Date(a.publishedAt), "d 'de' MMMM yyyy, HH:mm", { locale: es }) : ""}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => togglePin.mutate({ id: a.id, isPinned: !a.isPinned })} data-testid={`button-pin-${a.id}`}>
                      <Pin className={`w-3.5 h-3.5 ${a.isPinned ? "text-primary" : "text-muted-foreground"}`} />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => deleteMutation.mutate(a.id)} data-testid={`button-delete-announcement-${a.id}`}>
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
          <DialogHeader><DialogTitle>Nuevo comunicado</DialogTitle></DialogHeader>
          <AnnouncementForm onClose={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <PerplexityAttribution />
    </div>
  );
}
