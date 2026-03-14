import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, Check, Users, UserCheck, Zap } from "lucide-react";
import { Plan } from "@shared/schema";
import PerplexityAttribution from "@/components/PerplexityAttribution";

const PLAN_ICONS = [CreditCard, Zap, Users];
const PLAN_ACCENTS = [
  "border-blue-200 dark:border-blue-800",
  "border-primary ring-2 ring-primary/20",
  "border-purple-200 dark:border-purple-800",
];
const PLAN_BADGE_COLORS = [
  "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  "bg-primary/10 text-primary",
  "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
];

export default function Plans() {
  const { data: plans, isLoading } = useQuery<Plan[]>({ queryKey: ["/api/plans"] });

  return (
    <div className="p-6 space-y-8 max-w-screen-xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-xl font-display font-bold text-foreground">Planes y Precios</h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Elige el plan que mejor se adapte al tamano y necesidades de tu institucion educativa.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-96" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans?.map((plan, i) => {
            const isPro = i === 1;
            const Icon = PLAN_ICONS[i] ?? CreditCard;
            return (
              <Card key={plan.id} className={`relative hover-elevate flex flex-col ${PLAN_ACCENTS[i]}`} data-testid={`plan-card-${plan.id}`}>
                {isPro && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="text-[10px] bg-primary text-primary-foreground px-3">Mas popular</Badge>
                  </div>
                )}
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold mb-3 ${PLAN_BADGE_COLORS[i]}`}>
                        <Icon className="w-3 h-3" /> {plan.name}
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-display font-bold text-foreground">${plan.priceMonthly.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground">/mes</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">${plan.priceYearly.toLocaleString()}/ano - Ahorra {Math.round((1 - plan.priceYearly / (plan.priceMonthly * 12)) * 100)}%</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col flex-1 gap-4">
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      <span>{plan.maxStudents === 99999 ? "Ilimitados" : plan.maxStudents} alumnos</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <UserCheck className="w-3.5 h-3.5 text-primary" />
                      <span>{plan.maxTeachers === 99999 ? "Ilimitados" : plan.maxTeachers} docentes</span>
                    </div>
                  </div>

                  <ul className="flex-1 space-y-2.5">
                    {plan.features.map((f, fi) => (
                      <li key={fi} className="flex items-start gap-2 text-sm text-foreground">
                        <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full mt-auto ${isPro ? "" : "variant-outline"}`}
                    variant={isPro ? "default" : "outline"}
                    data-testid={`button-select-plan-${plan.id}`}
                  >
                    {isPro ? "Comenzar ahora" : "Seleccionar plan"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="max-w-2xl mx-auto space-y-4">
        <h2 className="text-base font-display font-bold text-foreground text-center">Roadmap de funciones</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: "Generacion de boletas PDF", status: "Disponible", available: true },
            { label: "Reportes analiticos avanzados", status: "Disponible", available: true },
            { label: "Portal para padres", status: "Disponible", available: true },
            { label: "Integracion SEP / SIPREM", status: "Q3 2026", available: false },
            { label: "API publica REST", status: "Q3 2026", available: false },
            { label: "Multi-sede y grupos de escuelas", status: "Q4 2026", available: false },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 text-sm" data-testid={`roadmap-${item.label}`}>
              <span className="text-foreground font-medium">{item.label}</span>
              <Badge variant={item.available ? "default" : "secondary"} className={`text-[10px] ${item.available ? "bg-green-600 text-white" : ""}`}>{item.status}</Badge>
            </div>
          ))}
        </div>
      </div>

      <PerplexityAttribution />
    </div>
  );
}
