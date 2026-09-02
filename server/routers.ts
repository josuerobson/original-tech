import { eq, desc, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { projects, projectClients, clients, diaryEntries, diaryPhotos } from "../drizzle/schema";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito ao administrador." });
  return next();
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }),
  }),
  projects: router({
    featured: publicProcedure.query(async () => { const db = await getDb(); if (!db) return []; return db.select().from(projects).where(and(eq(projects.status, "active"), eq(projects.isFeatured, 1))).orderBy(desc(projects.updatedAt)); }),
    mine: protectedProcedure.query(async ({ ctx }) => { const db = await getDb(); if (!db) return []; const rows = await db.select({ project: projects }).from(projectClients).innerJoin(projects, eq(projectClients.projectId, projects.id)).innerJoin(clients, eq(projectClients.clientId, clients.id)).where(eq(clients.userId, ctx.user.id)); return rows.map(row => row.project); }),
    all: adminProcedure.query(async () => { const db = await getDb(); if (!db) return []; return db.select().from(projects).orderBy(desc(projects.updatedAt)); }),
  }),
  diary: router({
    byProject: protectedProcedure.input((value: unknown) => { if (!value || typeof value !== "object" || !("projectId" in value)) throw new TRPCError({ code: "BAD_REQUEST" }); return value as { projectId: number }; }).query(async ({ input, ctx }) => { const db = await getDb(); if (!db) return []; if (ctx.user.role !== "admin") { const allowed = await db.select({ id: projectClients.id }).from(projectClients).innerJoin(clients, eq(projectClients.clientId, clients.id)).where(and(eq(projectClients.projectId, input.projectId), eq(clients.userId, ctx.user.id))); if (!allowed.length) throw new TRPCError({ code: "FORBIDDEN", message: "Projeto não vinculado a este cliente." }); } return db.select().from(diaryEntries).where(eq(diaryEntries.projectId, input.projectId)).orderBy(desc(diaryEntries.entryDate)); }),
    photos: protectedProcedure.input((value: unknown) => { if (!value || typeof value !== "object" || !("entryId" in value)) throw new TRPCError({ code: "BAD_REQUEST" }); return value as { entryId: number }; }).query(async ({ input }) => { const db = await getDb(); if (!db) return []; return db.select().from(diaryPhotos).where(eq(diaryPhotos.entryId, input.entryId)); }),
  }),
  admin: router({
    clients: adminProcedure.query(async () => { const db = await getDb(); if (!db) return []; return db.select().from(clients).orderBy(desc(clients.createdAt)); }),
    createDiaryEntry: adminProcedure.input(z.object({ projectId: z.number(), title: z.string(), description: z.string(), phase: z.string().optional(), progress: z.number().min(0).max(100), entryDate: z.date() })).mutation(async ({ input, ctx }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" }); await db.insert(diaryEntries).values({ ...input, createdBy: ctx.user.id }); return { success: true }; }),
  }),
});
export type AppRouter = typeof appRouter;
