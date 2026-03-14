import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertGroupSchema, insertSubjectSchema, insertGradeRecordSchema, insertAttendanceSchema, insertAnnouncementSchema, insertCycleSchema, insertPeriodSchema, insertEnrollmentSchema } from "@shared/schema";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  const DEFAULT_SCHOOL_ID = 4;

  // Stats
  app.get("/api/stats", async (_req, res) => {
    try {
      const stats = await storage.getSchoolStats(DEFAULT_SCHOOL_ID);
      res.json(stats);
    } catch (e) { res.status(500).json({ error: "Error al obtener estadisticas" }); }
  });

  // Plans
  app.get("/api/plans", async (_req, res) => {
    res.json(await storage.getPlans());
  });

  // School
  app.get("/api/school", async (_req, res) => {
    const school = await storage.getSchool(DEFAULT_SCHOOL_ID);
    if (!school) return res.status(404).json({ error: "Escuela no encontrada" });
    res.json(school);
  });
  app.patch("/api/school", async (req, res) => {
    const school = await storage.updateSchool(DEFAULT_SCHOOL_ID, req.body);
    if (!school) return res.status(404).json({ error: "Escuela no encontrada" });
    res.json(school);
  });

  // Users
  app.get("/api/users", async (req, res) => {
    const users = await storage.getUsers(DEFAULT_SCHOOL_ID);
    const role = req.query.role as string | undefined;
    res.json(role ? users.filter(u => u.role === role) : users);
  });
  app.get("/api/users/:id", async (req, res) => {
    const user = await storage.getUser(Number(req.params.id));
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(user);
  });
  app.post("/api/users", async (req, res) => {
    const parsed = insertUserSchema.safeParse({ ...req.body, schoolId: DEFAULT_SCHOOL_ID });
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    res.status(201).json(await storage.createUser(parsed.data));
  });
  app.patch("/api/users/:id", async (req, res) => {
    const user = await storage.updateUser(Number(req.params.id), req.body);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(user);
  });
  app.delete("/api/users/:id", async (req, res) => {
    const ok = await storage.deleteUser(Number(req.params.id));
    res.json({ success: ok });
  });

  // Portal Padres
  app.get("/api/students/by-code/:code", async (req, res) => {
    try {
      const code = req.params.code.toUpperCase();
      const users = await storage.getUsers(DEFAULT_SCHOOL_ID);
      const student = users.find(u => u.role === "student" && u.accessCode === code);
      if (!student) return res.status(404).json({ error: "Codigo de alumno no encontrado" });
      const enrollments = await storage.getStudentEnrollments(student.id);
      const grades = await storage.getStudentGrades(student.id);
      const attendance = await storage.getStudentAttendance(student.id);
      res.json({ student, enrollments, grades, attendance });
    } catch (e) { res.status(500).json({ error: "Error en busqueda" }); }
  });

  // Cycles
  app.get("/api/cycles", async (_req, res) => {
    res.json(await storage.getCycles(DEFAULT_SCHOOL_ID));
  });
  app.post("/api/cycles", async (req, res) => {
    const parsed = insertCycleSchema.safeParse({ ...req.body, schoolId: DEFAULT_SCHOOL_ID });
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    res.status(201).json(await storage.createCycle(parsed.data));
  });
  app.patch("/api/cycles/:id", async (req, res) => {
    const cycle = await storage.updateCycle(Number(req.params.id), req.body);
    if (!cycle) return res.status(404).json({ error: "Ciclo no encontrado" });
    res.json(cycle);
  });
  app.delete("/api/cycles/:id", async (req, res) => {
    const ok = await storage.deleteCycle(Number(req.params.id));
    res.json({ success: ok });
  });

  // Grade Levels
  app.get("/api/grade-levels", async (_req, res) => {
    res.json(await storage.getGrades(DEFAULT_SCHOOL_ID));
  });

  // Groups
  app.get("/api/groups", async (req, res) => {
    const cycleId = req.query.cycleId ? Number(req.query.cycleId) : undefined;
    res.json(await storage.getGroups(DEFAULT_SCHOOL_ID, cycleId));
  });
  app.get("/api/groups/:id", async (req, res) => {
    const group = await storage.getGroup(Number(req.params.id));
    if (!group) return res.status(404).json({ error: "Grupo no encontrado" });
    res.json(group);
  });
  app.post("/api/groups", async (req, res) => {
    const parsed = insertGroupSchema.safeParse({ ...req.body, schoolId: DEFAULT_SCHOOL_ID });
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    res.status(201).json(await storage.createGroup(parsed.data));
  });
  app.patch("/api/groups/:id", async (req, res) => {
    const group = await storage.updateGroup(Number(req.params.id), req.body);
    if (!group) return res.status(404).json({ error: "Grupo no encontrado" });
    res.json(group);
  });
  app.delete("/api/groups/:id", async (req, res) => {
    const ok = await storage.deleteGroup(Number(req.params.id));
    res.json({ success: ok });
  });

  // Subjects
  app.get("/api/subjects", async (_req, res) => {
    res.json(await storage.getSubjects(DEFAULT_SCHOOL_ID));
  });
  app.post("/api/subjects", async (req, res) => {
    const parsed = insertSubjectSchema.safeParse({ ...req.body, schoolId: DEFAULT_SCHOOL_ID });
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    res.status(201).json(await storage.createSubject(parsed.data));
  });
  app.patch("/api/subjects/:id", async (req, res) => {
    const subj = await storage.updateSubject(Number(req.params.id), req.body);
    if (!subj) return res.status(404).json({ error: "Materia no encontrada" });
    res.json(subj);
  });
  app.delete("/api/subjects/:id", async (req, res) => {
    const ok = await storage.deleteSubject(Number(req.params.id));
    res.json({ success: ok });
  });

  // Assignments
  app.get("/api/assignments", async (req, res) => {
    const groupId = req.query.groupId ? Number(req.query.groupId) : undefined;
    res.json(await storage.getAssignments(DEFAULT_SCHOOL_ID, groupId));
  });

  // Enrollments
  app.get("/api/enrollments", async (req, res) => {
    const groupId = req.query.groupId ? Number(req.query.groupId) : undefined;
    res.json(await storage.getEnrollments(DEFAULT_SCHOOL_ID, groupId));
  });
  app.post("/api/enrollments", async (req, res) => {
    const parsed = insertEnrollmentSchema.safeParse({ ...req.body, schoolId: DEFAULT_SCHOOL_ID });
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    res.status(201).json(await storage.createEnrollment(parsed.data));
  });
  app.delete("/api/enrollments/:id", async (req, res) => {
    const ok = await storage.deleteEnrollment(Number(req.params.id));
    res.json({ success: ok });
  });

  // Periods
  app.get("/api/periods", async (req, res) => {
    const cycleId = req.query.cycleId ? Number(req.query.cycleId) : undefined;
    res.json(await storage.getPeriods(DEFAULT_SCHOOL_ID, cycleId));
  });
  app.post("/api/periods", async (req, res) => {
    const parsed = insertPeriodSchema.safeParse({ ...req.body, schoolId: DEFAULT_SCHOOL_ID });
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    res.status(201).json(await storage.createPeriod(parsed.data));
  });
  app.patch("/api/periods/:id", async (req, res) => {
    const p = await storage.updatePeriod(Number(req.params.id), req.body);
    if (!p) return res.status(404).json({ error: "Periodo no encontrado" });
    res.json(p);
  });
  app.delete("/api/periods/:id", async (req, res) => {
    const ok = await storage.deletePeriod(Number(req.params.id));
    res.json({ success: ok });
  });

  // Grade Records
  app.get("/api/grade-records", async (req, res) => {
    const groupId = req.query.groupId ? Number(req.query.groupId) : undefined;
    const periodId = req.query.periodId ? Number(req.query.periodId) : undefined;
    res.json(await storage.getGradeRecords(DEFAULT_SCHOOL_ID, groupId, periodId));
  });
  app.get("/api/grade-records/student/:id", async (req, res) => {
    res.json(await storage.getStudentGrades(Number(req.params.id)));
  });
  app.post("/api/grade-records", async (req, res) => {
    const parsed = insertGradeRecordSchema.safeParse({ ...req.body, schoolId: DEFAULT_SCHOOL_ID });
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    res.status(201).json(await storage.upsertGradeRecord(parsed.data));
  });

  // Attendance
  app.get("/api/attendance", async (req, res) => {
    const groupId = Number(req.query.groupId);
    const date = req.query.date as string | undefined;
    if (!groupId) return res.status(400).json({ error: "groupId requerido" });
    res.json(await storage.getAttendance(DEFAULT_SCHOOL_ID, groupId, date));
  });
  app.post("/api/attendance", async (req, res) => {
    const parsed = insertAttendanceSchema.safeParse({ ...req.body, schoolId: DEFAULT_SCHOOL_ID });
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    res.status(201).json(await storage.createAttendance(parsed.data));
  });

  // Announcements
  app.get("/api/announcements", async (_req, res) => {
    res.json(await storage.getAnnouncements(DEFAULT_SCHOOL_ID));
  });
  app.post("/api/announcements", async (req, res) => {
    const parsed = insertAnnouncementSchema.safeParse({ ...req.body, schoolId: DEFAULT_SCHOOL_ID, authorId: 1 });
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    res.status(201).json(await storage.createAnnouncement(parsed.data));
  });
  app.patch("/api/announcements/:id", async (req, res) => {
    const a = await storage.updateAnnouncement(Number(req.params.id), req.body);
    if (!a) return res.status(404).json({ error: "Aviso no encontrado" });
    res.json(a);
  });
  app.delete("/api/announcements/:id", async (req, res) => {
    const ok = await storage.deleteAnnouncement(Number(req.params.id));
    res.json({ success: ok });
  });

  return httpServer;
}
