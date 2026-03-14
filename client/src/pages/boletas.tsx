import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Download, Printer, GraduationCap } from "lucide-react";
import { Group, User, Enrollment, GradeRecord, Subject, Period, Grade, School } from "@shared/schema";
import PerplexityAttribution from "@/components/PerplexityAttribution";

function gradeColor(score: number | null) {
  if (score === null) return "text-muted-foreground";
  if (score >= 9) return "text-green-600 dark:text-green-400 font-bold";
  if (score >= 7) return "text-blue-600 dark:text-blue-400 font-semibold";
  if (score >= 6) return "text-yellow-600 dark:text-yellow-400 font-semibold";
  return "text-red-600 dark:text-red-400 font-bold";
}

function gradeStatus(score: number | null) {
  if (score === null) return { label: "", color: "secondary" as const };
  if (score >= 9) return { label: "Excelente", color: "default" as const };
  if (score >= 7) return { label: "Bueno", color: "secondary" as const };
  if (score >= 6) return { label: "Suficiente", color: "outline" as const };
  return { label: "No aprobado", color: "destructive" as const };
}

function BoletaPreview({ student, grades, subjects, periods, group, gradeLevel, school }: {
  student: User;
  grades: GradeRecord[];
  subjects: Subject[];
  periods: Period[];
  group: Group | undefined;
  gradeLevel: Grade | undefined;
  school: School | undefined;
}) {
  const studentGrades = grades.filter(g => g.studentId === student.id);

  const getScore = (subjectId: number, periodId: number) => {
    return studentGrades.find(g => g.subjectId === subjectId && g.periodId === periodId)?.score ?? null;
  };

  const getAvg = (subjectId: number) => {
    const scores = periods.map(p => getScore(subjectId, p.id)).filter(s => s !== null) as number[];
    return scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : null;
  };

  const globalAvg = () => {
    const avgs = subjects.map(s => getAvg(s.id)).filter(v => v !== null) as number[];
    return avgs.length > 0 ? Math.round((avgs.reduce((a, b) => a + b, 0) / avgs.length) * 10) / 10 : null;
  };

  const avg = globalAvg();

  return (
    <div className="bg-white dark:bg-card border border-border rounded-xl overflow-hidden" id="boleta-preview">
      <div className="bg-primary px-6 py-4 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base">{school?.name ?? "Institucion Educativa"}</h2>
              <p className="text-xs text-white/70">CCT: {school?.cct ?? ""}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/70 uppercase tracking-wider">Boleta de Calificaciones</p>
            <p className="text-sm font-semibold">Ciclo 2025-2026</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-b border-border bg-muted/30">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Alumno</p>
            <p className="font-semibold text-foreground">{student.name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Grupo</p>
            <p className="font-semibold text-foreground">{gradeLevel?.name} {group?.name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Promedio General</p>
            <p className={`text-lg font-display font-bold ${gradeColor(avg)}`}>{avg ?? ""}</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40 border-b border-border">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground w-40">Materia</th>
              {periods.map(p => (
                <th key={p.id} className="text-center px-3 py-2.5 text-xs font-semibold text-muted-foreground min-w-[80px]">
                  {p.name}
                </th>
              ))}
              <th className="text-center px-3 py-2.5 text-xs font-semibold text-muted-foreground">Promedio</th>
              <th className="text-center px-3 py-2.5 text-xs font-semibold text-muted-foreground">Estado</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subj, i) => {
              const avg = getAvg(subj.id);
              const status = gradeStatus(avg);
              return (
                <tr key={subj.id} className={`border-b border-border/40 ${i % 2 === 0 ? "bg-background" : "bg-muted/20"}`}>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: subj.color }} />
                      <span className="font-medium text-foreground text-xs">{subj.name}</span>
                    </div>
                  </td>
                  {periods.map(p => {
                    const score = getScore(subj.id, p.id);
                    return (
                      <td key={p.id} className={`text-center px-3 py-2.5 text-sm ${gradeColor(score)}`}>
                        {score !== null ? score.toFixed(1) : ""}
                      </td>
                    );
                  })}
                  <td className={`text-center px-3 py-2.5 text-base font-display ${gradeColor(avg)}`}>
                    {avg !== null ? avg.toFixed(1) : ""}
                  </td>
                  <td className="text-center px-3 py-2.5">
                    <Badge variant={status.color} className="text-[10px]">{status.label}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-primary/5 border-t-2 border-primary/20">
              <td className="px-4 py-3 font-bold text-sm text-foreground" colSpan={periods.length + 1}>Promedio General</td>
              <td className={`text-center px-3 py-3 text-xl font-display font-bold ${gradeColor(avg)}`}>{avg ?? ""}</td>
              <td className="text-center px-3 py-3">
                {avg !== null && <Badge variant={gradeStatus(avg).color}>{gradeStatus(avg).label}</Badge>}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="px-6 py-3 bg-muted/20 border-t border-border">
        <p className="text-[10px] text-muted-foreground text-center">
          Documento generado por EduGest - {school?.name} - {new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>
    </div>
  );
}

export default function Boletas() {
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const boletaRef = useRef<HTMLDivElement>(null);

  const { data: groups } = useQuery<Group[]>({ queryKey: ["/api/groups"] });
  const { data: gradeLevels } = useQuery<Grade[]>({ queryKey: ["/api/grade-levels"] });
  const { data: users } = useQuery<User[]>({ queryKey: ["/api/users"] });
  const { data: subjects } = useQuery<Subject[]>({ queryKey: ["/api/subjects"] });
  const { data: periods } = useQuery<Period[]>({ queryKey: ["/api/periods"] });
  const { data: school } = useQuery<School>({ queryKey: ["/api/school"] });
  const { data: enrollments } = useQuery<Enrollment[]>({
    queryKey: ["/api/enrollments", selectedGroup],
    enabled: !!selectedGroup,
  });
  const { data: gradeRecords } = useQuery<GradeRecord[]>({
    queryKey: ["/api/grade-records", selectedGroup],
    enabled: !!selectedGroup,
  });

  const students = users?.filter(u => u.role === "student") ?? [];
  const groupStudents = enrollments?.map(e => students.find(s => s.id === e.studentId)).filter(Boolean) as User[];
  const selectedStudentObj = students.find(s => String(s.id) === selectedStudent);
  const currentGroup = groups?.find(g => String(g.id) === selectedGroup);
  const gradeLevel = gradeLevels?.find(g => g.id === currentGroup?.gradeId);

  const getGradeName = (id: number) => gradeLevels?.find(g => g.id === id)?.name ?? "";

  const handlePrint = () => {
    const el = document.getElementById("boleta-preview");
    if (!el) return;
    const originalBody = document.body.innerHTML;
    document.body.innerHTML = el.outerHTML;
    window.print();
    document.body.innerHTML = originalBody;
    window.location.reload();
  };

  const handleDownloadPDF = async () => {
    const el = document.getElementById("boleta-preview");
    if (!el) return;
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`boleta-${selectedStudentObj?.name?.replace(/ /g, "_") ?? "alumno"}.pdf`);
    } catch (e) {
      console.error("Error generando PDF:", e);
    }
  };

  return (
    <div className="p-6 space-y-5 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" /> Boletas de Calificaciones
          </h1>
          <p className="text-sm text-muted-foreground">Genera y exporta boletas en PDF por alumno</p>
        </div>
        {selectedStudentObj && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint} data-testid="button-print-boleta">
              <Printer className="w-4 h-4 mr-1.5" /> Imprimir
            </Button>
            <Button onClick={handleDownloadPDF} data-testid="button-download-boleta">
              <Download className="w-4 h-4 mr-1.5" /> Descargar PDF
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={selectedGroup} onValueChange={v => { setSelectedGroup(v); setSelectedStudent(""); }}>
          <SelectTrigger className="w-48" data-testid="select-boleta-group">
            <SelectValue placeholder="Seleccionar grupo" />
          </SelectTrigger>
          <SelectContent>
            {groups?.map(g => (
              <SelectItem key={g.id} value={String(g.id)}>{getGradeName(g.gradeId)} {g.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedGroup && (
          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
            <SelectTrigger className="w-56" data-testid="select-boleta-student">
              <SelectValue placeholder="Seleccionar alumno" />
            </SelectTrigger>
            <SelectContent>
              {groupStudents.map(s => (
                <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {!selectedGroup || !selectedStudent ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-muted-foreground">
            <FileText className="w-10 h-10 mb-3 text-muted-foreground/30" />
            <p className="font-medium">Selecciona grupo y alumno</p>
            <p className="text-sm">para generar la boleta de calificaciones</p>
          </CardContent>
        </Card>
      ) : selectedStudentObj && subjects && periods && gradeRecords ? (
        <div ref={boletaRef}>
          <BoletaPreview
            student={selectedStudentObj}
            grades={gradeRecords}
            subjects={subjects}
            periods={periods.filter(p => p.order <= 3)}
            group={currentGroup}
            gradeLevel={gradeLevel}
            school={school}
          />
        </div>
      ) : (
        <Skeleton className="h-96 w-full" />
      )}

      <PerplexityAttribution />
    </div>
  );
}
