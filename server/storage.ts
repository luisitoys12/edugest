import {
  Plan, InsertPlan,
  School, InsertSchool,
  User, InsertUser,
  Cycle, InsertCycle,
  Grade, InsertGrade,
  Group, InsertGroup,
  Subject, InsertSubject,
  Assignment, InsertAssignment,
  Enrollment, InsertEnrollment,
  Period, InsertPeriod,
  GradeRecord, InsertGradeRecord,
  Attendance, InsertAttendance,
  Announcement, InsertAnnouncement,
} from "@shared/schema";

export interface IStorage {
  getPlans(): Promise<Plan[]>;
  getPlan(id: number): Promise<Plan | undefined>;
  createPlan(plan: InsertPlan): Promise<Plan>;
  updatePlan(id: number, plan: Partial<InsertPlan>): Promise<Plan | undefined>;

  getSchools(): Promise<School[]>;
  getSchool(id: number): Promise<School | undefined>;
  createSchool(school: InsertSchool): Promise<School>;
  updateSchool(id: number, school: Partial<InsertSchool>): Promise<School | undefined>;
  deleteSchool(id: number): Promise<boolean>;

  getUsers(schoolId?: number): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;

  getCycles(schoolId: number): Promise<Cycle[]>;
  getCycle(id: number): Promise<Cycle | undefined>;
  createCycle(cycle: InsertCycle): Promise<Cycle>;
  updateCycle(id: number, cycle: Partial<InsertCycle>): Promise<Cycle | undefined>;
  deleteCycle(id: number): Promise<boolean>;

  getGrades(schoolId: number): Promise<Grade[]>;
  getGrade(id: number): Promise<Grade | undefined>;
  createGrade(grade: InsertGrade): Promise<Grade>;
  updateGrade(id: number, grade: Partial<InsertGrade>): Promise<Grade | undefined>;
  deleteGrade(id: number): Promise<boolean>;

  getGroups(schoolId: number, cycleId?: number): Promise<Group[]>;
  getGroup(id: number): Promise<Group | undefined>;
  createGroup(group: InsertGroup): Promise<Group>;
  updateGroup(id: number, group: Partial<InsertGroup>): Promise<Group | undefined>;
  deleteGroup(id: number): Promise<boolean>;

  getSubjects(schoolId: number): Promise<Subject[]>;
  getSubject(id: number): Promise<Subject | undefined>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  updateSubject(id: number, subject: Partial<InsertSubject>): Promise<Subject | undefined>;
  deleteSubject(id: number): Promise<boolean>;

  getAssignments(schoolId: number, groupId?: number): Promise<Assignment[]>;
  getAssignment(id: number): Promise<Assignment | undefined>;
  createAssignment(assignment: InsertAssignment): Promise<Assignment>;
  deleteAssignment(id: number): Promise<boolean>;

  getEnrollments(schoolId: number, groupId?: number): Promise<Enrollment[]>;
  getStudentEnrollments(studentId: number): Promise<Enrollment[]>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  deleteEnrollment(id: number): Promise<boolean>;

  getPeriods(schoolId: number, cycleId?: number): Promise<Period[]>;
  getPeriod(id: number): Promise<Period | undefined>;
  createPeriod(period: InsertPeriod): Promise<Period>;
  updatePeriod(id: number, period: Partial<InsertPeriod>): Promise<Period | undefined>;
  deletePeriod(id: number): Promise<boolean>;

  getGradeRecords(schoolId: number, groupId?: number, periodId?: number): Promise<GradeRecord[]>;
  getStudentGrades(studentId: number, cycleId?: number): Promise<GradeRecord[]>;
  upsertGradeRecord(record: InsertGradeRecord): Promise<GradeRecord>;
  deleteGradeRecord(id: number): Promise<boolean>;

  getAttendance(schoolId: number, groupId: number, date?: string): Promise<Attendance[]>;
  getStudentAttendance(studentId: number, groupId?: number): Promise<Attendance[]>;
  createAttendance(record: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: number, record: Partial<InsertAttendance>): Promise<Attendance | undefined>;

  getAnnouncements(schoolId: number): Promise<Announcement[]>;
  createAnnouncement(a: InsertAnnouncement): Promise<Announcement>;
  deleteAnnouncement(id: number): Promise<boolean>;
  updateAnnouncement(id: number, a: Partial<InsertAnnouncement>): Promise<Announcement | undefined>;

  getSchoolStats(schoolId: number): Promise<{
    totalStudents: number;
    totalTeachers: number;
    totalGroups: number;
    totalSubjects: number;
    avgScore: number;
    attendanceRate: number;
  }>;
}

export class MemStorage implements IStorage {
  private plans: Map<number, Plan> = new Map();
  private schools: Map<number, School> = new Map();
  private users: Map<number, User> = new Map();
  private cycles: Map<number, Cycle> = new Map();
  private gradesLevels: Map<number, Grade> = new Map();
  private groups: Map<number, Group> = new Map();
  private subjects: Map<number, Subject> = new Map();
  private assignments: Map<number, Assignment> = new Map();
  private enrollments: Map<number, Enrollment> = new Map();
  private periods: Map<number, Period> = new Map();
  private gradeRecords: Map<number, GradeRecord> = new Map();
  private attendanceRecords: Map<number, Attendance> = new Map();
  private announcementsData: Map<number, Announcement> = new Map();
  private nextId = 1;

  private genId() { return this.nextId++; }

  constructor() {
    this.seed();
  }

  private seed() {
    const planBasico: Plan = { id: this.genId(), name: "Basico", maxStudents: 100, maxTeachers: 10, priceMonthly: 299, priceYearly: 2990, features: ["Calificaciones", "Asistencias", "Grupos", "Reportes basicos"], isActive: true };
    const planPro: Plan = { id: this.genId(), name: "Profesional", maxStudents: 500, maxTeachers: 50, priceMonthly: 799, priceYearly: 7990, features: ["Todo Basico", "Comunicados", "Boletas PDF", "Ciclos multiples", "Soporte prioritario"], isActive: true };
    const planEnt: Plan = { id: this.genId(), name: "Enterprise", maxStudents: 99999, maxTeachers: 99999, priceMonthly: 1999, priceYearly: 19990, features: ["Todo Profesional", "Multiples sedes", "API acceso", "SSO/LDAP", "Gestor de cuenta", "Personalizacion"], isActive: true };
    [planBasico, planPro, planEnt].forEach(p => this.plans.set(p.id, p));

    const school: School = { id: this.genId(), name: "Colegio Benito Juarez", cct: "11DPR0001X", address: "Av. Insurgentes 123, Irapuato, Gto.", phone: "+52 462 123 4567", email: "admin@colegiojuarez.edu.mx", logoUrl: null, planId: planPro.id, planExpiresAt: new Date("2026-12-31"), isActive: true, createdAt: new Date() };
    this.schools.set(school.id, school);
    const schoolId = school.id;

    const cycle: Cycle = { id: this.genId(), schoolId, name: "2025-2026", startDate: new Date("2025-08-25"), endDate: new Date("2026-06-30"), isCurrent: true };
    this.cycles.set(cycle.id, cycle);
    const cycleId = cycle.id;

    const gradeNames = ["1", "2", "3", "4", "5", "6"];
    const gradeObjs: Grade[] = gradeNames.map((name, i) => {
      const g: Grade = { id: this.genId(), schoolId, name, level: "primaria", order: i + 1 };
      this.gradesLevels.set(g.id, g);
      return g;
    });

    const groupData: { gradeIdx: number; name: string; }[] = [
      { gradeIdx: 0, name: "A" }, { gradeIdx: 0, name: "B" },
      { gradeIdx: 1, name: "A" }, { gradeIdx: 1, name: "B" },
      { gradeIdx: 2, name: "A" },
      { gradeIdx: 3, name: "A" }, { gradeIdx: 3, name: "B" },
      { gradeIdx: 4, name: "A" },
      { gradeIdx: 5, name: "A" }, { gradeIdx: 5, name: "B" },
    ];
    const groupObjs: Group[] = groupData.map(gd => {
      const g: Group = { id: this.genId(), schoolId, cycleId, gradeId: gradeObjs[gd.gradeIdx].id, name: gd.name, tutorId: null, capacity: 30 };
      this.groups.set(g.id, g);
      return g;
    });

    const subjectData = [
      { name: "Espanol", code: "ESP", color: "#4f98a3" },
      { name: "Matematicas", code: "MAT", color: "#e8613a" },
      { name: "Ciencias Naturales", code: "CN", color: "#6daa45" },
      { name: "Historia", code: "HIS", color: "#d19900" },
      { name: "Geografia", code: "GEO", color: "#7a39bb" },
      { name: "Educacion Fisica", code: "EF", color: "#006494" },
      { name: "Ingles", code: "ING", color: "#a13544" },
      { name: "Artes", code: "ART", color: "#da7101" },
    ];
    const subjectObjs: Subject[] = subjectData.map(sd => {
      const s: Subject = { id: this.genId(), schoolId, name: sd.name, code: sd.code, color: sd.color, description: null };
      this.subjects.set(s.id, s);
      return s;
    });

    const teacherNames = ["Profra. Ana Garcia", "Prof. Carlos Lopez", "Profra. Maria Rodriguez", "Prof. Juan Martinez", "Profra. Laura Hernandez", "Prof. Roberto Sanchez"];
    const teacherObjs: User[] = teacherNames.map((name, i) => {
      const u: User = { id: this.genId(), schoolId, name, email: `teacher${i + 1}@colegiojuarez.edu.mx`, password: "hashed", role: "teacher", accessCode: null, avatarUrl: null, isActive: true, createdAt: new Date() };
      this.users.set(u.id, u);
      return u;
    });

    const admin: User = { id: this.genId(), schoolId, name: "Director Luis Reyes", email: "admin@colegiojuarez.edu.mx", password: "hashed", role: "admin", accessCode: null, avatarUrl: null, isActive: true, createdAt: new Date() };
    this.users.set(admin.id, admin);

    const firstNames = ["Sofia", "Diego", "Valentina", "Mateo", "Isabella", "Sebastian", "Camila", "Nicolas", "Lucia", "Santiago", "Emma", "Alejandro", "Martina", "Daniel", "Valeria", "Emilio", "Paula", "Andres", "Fernanda", "Rodrigo", "Mariana", "Gabriel", "Ana", "Javier", "Daniela", "Miguel", "Natalia", "Carlos", "Elena", "Fernando"];
    const lastNames = ["Garcia", "Lopez", "Martinez", "Sanchez", "Rodriguez", "Hernandez", "Gonzalez", "Torres", "Ramirez", "Flores", "Diaz", "Morales", "Castro", "Reyes", "Mendoza"];

    const studentObjs: User[] = [];
    for (let i = 0; i < 50; i++) {
      const name = `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`;
      const accessCode = `BJ-${String(i + 1).padStart(4, "0")}`;
      const u: User = { id: this.genId(), schoolId, name, email: `student${i + 1}@colegiojuarez.edu.mx`, password: "hashed", role: "student", accessCode, avatarUrl: null, isActive: true, createdAt: new Date() };
      this.users.set(u.id, u);
      studentObjs.push(u);
    }

    groupObjs.forEach((group, gi) => {
      const start = gi * 5;
      for (let si = start; si < start + 5 && si < studentObjs.length; si++) {
        const e: Enrollment = { id: this.genId(), schoolId, studentId: studentObjs[si].id, groupId: group.id, cycleId, enrolledAt: new Date() };
        this.enrollments.set(e.id, e);
      }
      const upd = { ...group, tutorId: teacherObjs[gi % teacherObjs.length].id };
      this.groups.set(group.id, upd);
    });

    subjectObjs.forEach((subj, si) => {
      groupObjs.forEach((group, gi) => {
        const a: Assignment = { id: this.genId(), schoolId, teacherId: teacherObjs[(si + gi) % teacherObjs.length].id, groupId: group.id, subjectId: subj.id, cycleId };
        this.assignments.set(a.id, a);
      });
    });

    const periodData = [
      { name: "Parcial 1", order: 1, isOpen: false },
      { name: "Parcial 2", order: 2, isOpen: false },
      { name: "Parcial 3", order: 3, isOpen: true },
      { name: "Final", order: 4, isOpen: false },
    ];
    const periodObjs: Period[] = periodData.map(pd => {
      const p: Period = { id: this.genId(), schoolId, cycleId, name: pd.name, order: pd.order, startDate: null, endDate: null, isOpen: pd.isOpen };
      this.periods.set(p.id, p);
      return p;
    });

    const enrollmentList = Array.from(this.enrollments.values()).filter(e => e.schoolId === schoolId);
    enrollmentList.forEach(enr => {
      subjectObjs.forEach(subj => {
        periodObjs.slice(0, 3).forEach(period => {
          const base = 6 + Math.random() * 4;
          const score = Math.round(base * 10) / 10;
          const gr: GradeRecord = { id: this.genId(), schoolId, studentId: enr.studentId, subjectId: subj.id, groupId: enr.groupId, periodId: period.id, cycleId, score, comment: null, updatedAt: new Date() };
          this.gradeRecords.set(gr.id, gr);
        });
      });
    });

    enrollmentList.slice(0, 25).forEach(enr => {
      for (let d = 0; d < 10; d++) {
        const date = new Date();
        date.setDate(date.getDate() - d);
        const rand = Math.random();
        const status = rand > 0.9 ? "absent" : rand > 0.82 ? "late" : "present";
        const att: Attendance = { id: this.genId(), schoolId, studentId: enr.studentId, groupId: enr.groupId, subjectId: null, date, status, note: null };
        this.attendanceRecords.set(att.id, att);
      }
    });

    const annData = [
      { title: "Entrega de boletas Parcial 2", content: "Se recuerda que la entrega de boletas del segundo parcial se realizara el proximo viernes.", isPinned: true },
      { title: "Junta de consejo tecnico", content: "Se convoca a todos los docentes a la junta de consejo tecnico del viernes 20 de marzo a las 16:00 hrs.", isPinned: false },
      { title: "Semana Deportiva 2026", content: "Del 25 al 29 de marzo se llevara a cabo la semana deportiva anual.", isPinned: false },
    ];
    annData.forEach(ad => {
      const a: Announcement = { id: this.genId(), schoolId, authorId: admin.id, title: ad.title, content: ad.content, targetRole: "all", targetGroupId: null, publishedAt: new Date(), isPinned: ad.isPinned };
      this.announcementsData.set(a.id, a);
    });
  }

  async getPlans() { return Array.from(this.plans.values()); }
  async getPlan(id: number) { return this.plans.get(id); }
  async createPlan(plan: InsertPlan) { const p = { ...plan, id: this.genId() } as Plan; this.plans.set(p.id, p); return p; }
  async updatePlan(id: number, plan: Partial<InsertPlan>) { const ex = this.plans.get(id); if (!ex) return undefined; const upd = { ...ex, ...plan }; this.plans.set(id, upd); return upd; }

  async getSchools() { return Array.from(this.schools.values()); }
  async getSchool(id: number) { return this.schools.get(id); }
  async createSchool(school: InsertSchool) { const s = { ...school, id: this.genId(), createdAt: new Date() } as School; this.schools.set(s.id, s); return s; }
  async updateSchool(id: number, school: Partial<InsertSchool>) { const ex = this.schools.get(id); if (!ex) return undefined; const upd = { ...ex, ...school }; this.schools.set(id, upd); return upd; }
  async deleteSchool(id: number) { return this.schools.delete(id); }

  async getUsers(schoolId?: number) {
    const all = Array.from(this.users.values());
    return schoolId !== undefined ? all.filter(u => u.schoolId === schoolId) : all;
  }
  async getUser(id: number) { return this.users.get(id); }
  async getUserByEmail(email: string) { return Array.from(this.users.values()).find(u => u.email === email); }
  async createUser(user: InsertUser) { const u = { ...user, id: this.genId(), createdAt: new Date() } as User; this.users.set(u.id, u); return u; }
  async updateUser(id: number, user: Partial<InsertUser>) { const ex = this.users.get(id); if (!ex) return undefined; const upd = { ...ex, ...user }; this.users.set(id, upd); return upd; }
  async deleteUser(id: number) { return this.users.delete(id); }

  async getCycles(schoolId: number) { return Array.from(this.cycles.values()).filter(c => c.schoolId === schoolId); }
  async getCycle(id: number) { return this.cycles.get(id); }
  async createCycle(cycle: InsertCycle) { const c = { ...cycle, id: this.genId() } as Cycle; this.cycles.set(c.id, c); return c; }
  async updateCycle(id: number, cycle: Partial<InsertCycle>) { const ex = this.cycles.get(id); if (!ex) return undefined; const upd = { ...ex, ...cycle }; this.cycles.set(id, upd); return upd; }
  async deleteCycle(id: number) { return this.cycles.delete(id); }

  async getGrades(schoolId: number) { return Array.from(this.gradesLevels.values()).filter(g => g.schoolId === schoolId).sort((a, b) => a.order - b.order); }
  async getGrade(id: number) { return this.gradesLevels.get(id); }
  async createGrade(grade: InsertGrade) { const g = { ...grade, id: this.genId() } as Grade; this.gradesLevels.set(g.id, g); return g; }
  async updateGrade(id: number, grade: Partial<InsertGrade>) { const ex = this.gradesLevels.get(id); if (!ex) return undefined; const upd = { ...ex, ...grade }; this.gradesLevels.set(id, upd); return upd; }
  async deleteGrade(id: number) { return this.gradesLevels.delete(id); }

  async getGroups(schoolId: number, cycleId?: number) {
    return Array.from(this.groups.values()).filter(g => g.schoolId === schoolId && (cycleId === undefined || g.cycleId === cycleId));
  }
  async getGroup(id: number) { return this.groups.get(id); }
  async createGroup(group: InsertGroup) { const g = { ...group, id: this.genId() } as Group; this.groups.set(g.id, g); return g; }
  async updateGroup(id: number, group: Partial<InsertGroup>) { const ex = this.groups.get(id); if (!ex) return undefined; const upd = { ...ex, ...group }; this.groups.set(id, upd); return upd; }
  async deleteGroup(id: number) { return this.groups.delete(id); }

  async getSubjects(schoolId: number) { return Array.from(this.subjects.values()).filter(s => s.schoolId === schoolId); }
  async getSubject(id: number) { return this.subjects.get(id); }
  async createSubject(subject: InsertSubject) { const s = { ...subject, id: this.genId() } as Subject; this.subjects.set(s.id, s); return s; }
  async updateSubject(id: number, subject: Partial<InsertSubject>) { const ex = this.subjects.get(id); if (!ex) return undefined; const upd = { ...ex, ...subject }; this.subjects.set(id, upd); return upd; }
  async deleteSubject(id: number) { return this.subjects.delete(id); }

  async getAssignments(schoolId: number, groupId?: number) {
    return Array.from(this.assignments.values()).filter(a => a.schoolId === schoolId && (groupId === undefined || a.groupId === groupId));
  }
  async getAssignment(id: number) { return this.assignments.get(id); }
  async createAssignment(assignment: InsertAssignment) { const a = { ...assignment, id: this.genId() } as Assignment; this.assignments.set(a.id, a); return a; }
  async deleteAssignment(id: number) { return this.assignments.delete(id); }

  async getEnrollments(schoolId: number, groupId?: number) {
    return Array.from(this.enrollments.values()).filter(e => e.schoolId === schoolId && (groupId === undefined || e.groupId === groupId));
  }
  async getStudentEnrollments(studentId: number) { return Array.from(this.enrollments.values()).filter(e => e.studentId === studentId); }
  async createEnrollment(enrollment: InsertEnrollment) { const e = { ...enrollment, id: this.genId(), enrolledAt: new Date() } as Enrollment; this.enrollments.set(e.id, e); return e; }
  async deleteEnrollment(id: number) { return this.enrollments.delete(id); }

  async getPeriods(schoolId: number, cycleId?: number) {
    return Array.from(this.periods.values()).filter(p => p.schoolId === schoolId && (cycleId === undefined || p.cycleId === cycleId)).sort((a, b) => a.order - b.order);
  }
  async getPeriod(id: number) { return this.periods.get(id); }
  async createPeriod(period: InsertPeriod) { const p = { ...period, id: this.genId() } as Period; this.periods.set(p.id, p); return p; }
  async updatePeriod(id: number, period: Partial<InsertPeriod>) { const ex = this.periods.get(id); if (!ex) return undefined; const upd = { ...ex, ...period }; this.periods.set(id, upd); return upd; }
  async deletePeriod(id: number) { return this.periods.delete(id); }

  async getGradeRecords(schoolId: number, groupId?: number, periodId?: number) {
    return Array.from(this.gradeRecords.values()).filter(r =>
      r.schoolId === schoolId &&
      (groupId === undefined || r.groupId === groupId) &&
      (periodId === undefined || r.periodId === periodId)
    );
  }
  async getStudentGrades(studentId: number, cycleId?: number) {
    return Array.from(this.gradeRecords.values()).filter(r => r.studentId === studentId && (cycleId === undefined || r.cycleId === cycleId));
  }
  async upsertGradeRecord(record: InsertGradeRecord) {
    const existing = Array.from(this.gradeRecords.values()).find(r =>
      r.studentId === record.studentId && r.subjectId === record.subjectId && r.periodId === record.periodId && r.groupId === record.groupId
    );
    if (existing) {
      const upd = { ...existing, ...record, updatedAt: new Date() };
      this.gradeRecords.set(existing.id, upd);
      return upd;
    }
    const gr = { ...record, id: this.genId(), updatedAt: new Date() } as GradeRecord;
    this.gradeRecords.set(gr.id, gr);
    return gr;
  }
  async deleteGradeRecord(id: number) { return this.gradeRecords.delete(id); }

  async getAttendance(schoolId: number, groupId: number, date?: string) {
    return Array.from(this.attendanceRecords.values()).filter(a => {
      if (a.schoolId !== schoolId || a.groupId !== groupId) return false;
      if (date) { const d = new Date(a.date); return d.toDateString() === new Date(date).toDateString(); }
      return true;
    });
  }
  async getStudentAttendance(studentId: number, groupId?: number) {
    return Array.from(this.attendanceRecords.values()).filter(a => a.studentId === studentId && (groupId === undefined || a.groupId === groupId));
  }
  async createAttendance(record: InsertAttendance) { const a = { ...record, id: this.genId() } as Attendance; this.attendanceRecords.set(a.id, a); return a; }
  async updateAttendance(id: number, record: Partial<InsertAttendance>) { const ex = this.attendanceRecords.get(id); if (!ex) return undefined; const upd = { ...ex, ...record }; this.attendanceRecords.set(id, upd); return upd; }

  async getAnnouncements(schoolId: number) { return Array.from(this.announcementsData.values()).filter(a => a.schoolId === schoolId).sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0)); }
  async createAnnouncement(a: InsertAnnouncement) { const ann = { ...a, id: this.genId(), publishedAt: new Date() } as Announcement; this.announcementsData.set(ann.id, ann); return ann; }
  async deleteAnnouncement(id: number) { return this.announcementsData.delete(id); }
  async updateAnnouncement(id: number, a: Partial<InsertAnnouncement>) { const ex = this.announcementsData.get(id); if (!ex) return undefined; const upd = { ...ex, ...a }; this.announcementsData.set(id, upd); return upd; }

  async getSchoolStats(schoolId: number) {
    const schoolUsers = Array.from(this.users.values()).filter(u => u.schoolId === schoolId && u.isActive);
    const totalStudents = schoolUsers.filter(u => u.role === "student").length;
    const totalTeachers = schoolUsers.filter(u => u.role === "teacher").length;
    const totalGroups = Array.from(this.groups.values()).filter(g => g.schoolId === schoolId).length;
    const totalSubjects = Array.from(this.subjects.values()).filter(s => s.schoolId === schoolId).length;
    const records = Array.from(this.gradeRecords.values()).filter(r => r.schoolId === schoolId && r.score !== null);
    const avgScore = records.length > 0 ? records.reduce((s, r) => s + (r.score ?? 0), 0) / records.length : 0;
    const attendanceAll = Array.from(this.attendanceRecords.values()).filter(a => a.schoolId === schoolId);
    const present = attendanceAll.filter(a => a.status === "present" || a.status === "late").length;
    const attendanceRate = attendanceAll.length > 0 ? (present / attendanceAll.length) * 100 : 0;
    return { totalStudents, totalTeachers, totalGroups, totalSubjects, avgScore: Math.round(avgScore * 10) / 10, attendanceRate: Math.round(attendanceRate * 10) / 10 };
  }
}

export const storage = new MemStorage();
