import { pgTable, text, integer, timestamp, boolean, real, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Planes de suscripcion
export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  maxStudents: integer("max_students").notNull(),
  maxTeachers: integer("max_teachers").notNull(),
  priceMonthly: real("price_monthly").notNull(),
  priceYearly: real("price_yearly").notNull(),
  features: text("features").array().notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

// Escuelas (tenants)
export const schools = pgTable("schools", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  cct: text("cct"),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  logoUrl: text("logo_url"),
  planId: integer("plan_id").references(() => plans.id),
  planExpiresAt: timestamp("plan_expires_at"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Usuarios
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").references(() => schools.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  role: text("role").notNull(),
  accessCode: text("access_code"),
  avatarUrl: text("avatar_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Ciclos escolares
export const cycles = pgTable("cycles", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").references(() => schools.id).notNull(),
  name: text("name").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isCurrent: boolean("is_current").notNull().default(false),
});

// Grados / Niveles
export const grades = pgTable("grades", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").references(() => schools.id).notNull(),
  name: text("name").notNull(),
  level: text("level").notNull(),
  order: integer("order").notNull(),
});

// Grupos
export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").references(() => schools.id).notNull(),
  cycleId: integer("cycle_id").references(() => cycles.id).notNull(),
  gradeId: integer("grade_id").references(() => grades.id).notNull(),
  name: text("name").notNull(),
  tutorId: integer("tutor_id").references(() => users.id),
  capacity: integer("capacity").notNull().default(30),
});

// Materias
export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").references(() => schools.id).notNull(),
  name: text("name").notNull(),
  code: text("code"),
  color: text("color").notNull().default("#4f98a3"),
  description: text("description"),
});

// Asignaciones maestro->grupo->materia
export const assignments = pgTable("assignments", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").references(() => schools.id).notNull(),
  teacherId: integer("teacher_id").references(() => users.id).notNull(),
  groupId: integer("group_id").references(() => groups.id).notNull(),
  subjectId: integer("subject_id").references(() => subjects.id).notNull(),
  cycleId: integer("cycle_id").references(() => cycles.id).notNull(),
});

// Inscripciones estudiante->grupo
export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").references(() => schools.id).notNull(),
  studentId: integer("student_id").references(() => users.id).notNull(),
  groupId: integer("group_id").references(() => groups.id).notNull(),
  cycleId: integer("cycle_id").references(() => cycles.id).notNull(),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
});

// Periodos de evaluacion
export const periods = pgTable("periods", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").references(() => schools.id).notNull(),
  cycleId: integer("cycle_id").references(() => cycles.id).notNull(),
  name: text("name").notNull(),
  order: integer("order").notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  isOpen: boolean("is_open").notNull().default(false),
});

// Calificaciones
export const grades_table = pgTable("grade_records", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").references(() => schools.id).notNull(),
  studentId: integer("student_id").references(() => users.id).notNull(),
  subjectId: integer("subject_id").references(() => subjects.id).notNull(),
  groupId: integer("group_id").references(() => groups.id).notNull(),
  periodId: integer("period_id").references(() => periods.id).notNull(),
  cycleId: integer("cycle_id").references(() => cycles.id).notNull(),
  score: real("score"),
  comment: text("comment"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Asistencias
export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").references(() => schools.id).notNull(),
  studentId: integer("student_id").references(() => users.id).notNull(),
  groupId: integer("group_id").references(() => groups.id).notNull(),
  subjectId: integer("subject_id").references(() => subjects.id),
  date: timestamp("date").notNull(),
  status: text("status").notNull(),
  note: text("note"),
});

// Comunicados / Avisos
export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").references(() => schools.id).notNull(),
  authorId: integer("author_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  targetRole: text("target_role"),
  targetGroupId: integer("target_group_id").references(() => groups.id),
  publishedAt: timestamp("published_at").defaultNow(),
  isPinned: boolean("is_pinned").notNull().default(false),
});

// Insert Schemas
export const insertPlanSchema = createInsertSchema(plans).omit({ id: true });
export const insertSchoolSchema = createInsertSchema(schools).omit({ id: true, createdAt: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertCycleSchema = createInsertSchema(cycles).omit({ id: true });
export const insertGradeSchema = createInsertSchema(grades).omit({ id: true });
export const insertGroupSchema = createInsertSchema(groups).omit({ id: true });
export const insertSubjectSchema = createInsertSchema(subjects).omit({ id: true });
export const insertAssignmentSchema = createInsertSchema(assignments).omit({ id: true });
export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({ id: true, enrolledAt: true });
export const insertPeriodSchema = createInsertSchema(periods).omit({ id: true });
export const insertGradeRecordSchema = createInsertSchema(grades_table).omit({ id: true, updatedAt: true });
export const insertAttendanceSchema = createInsertSchema(attendance).omit({ id: true });
export const insertAnnouncementSchema = createInsertSchema(announcements).omit({ id: true, publishedAt: true });

// Types
export type Plan = typeof plans.$inferSelect;
export type InsertPlan = z.infer<typeof insertPlanSchema>;

export type School = typeof schools.$inferSelect;
export type InsertSchool = z.infer<typeof insertSchoolSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Cycle = typeof cycles.$inferSelect;
export type InsertCycle = z.infer<typeof insertCycleSchema>;

export type Grade = typeof grades.$inferSelect;
export type InsertGrade = z.infer<typeof insertGradeSchema>;

export type Group = typeof groups.$inferSelect;
export type InsertGroup = z.infer<typeof insertGroupSchema>;

export type Subject = typeof subjects.$inferSelect;
export type InsertSubject = z.infer<typeof insertSubjectSchema>;

export type Assignment = typeof assignments.$inferSelect;
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;

export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;

export type Period = typeof periods.$inferSelect;
export type InsertPeriod = z.infer<typeof insertPeriodSchema>;

export type GradeRecord = typeof grades_table.$inferSelect;
export type InsertGradeRecord = z.infer<typeof insertGradeRecordSchema>;

export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;

export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
