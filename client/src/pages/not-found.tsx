import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
      <div className="text-6xl font-display font-bold text-primary/20 mb-4">404</div>
      <h2 className="text-lg font-display font-bold text-foreground mb-2">Pagina no encontrada</h2>
      <p className="text-sm text-muted-foreground mb-6">La seccion que buscas no existe o fue movida.</p>
      <Button asChild variant="outline">
        <a href="#/"><Home className="w-4 h-4 mr-1.5" /> Volver al inicio</a>
      </Button>
    </div>
  );
}
