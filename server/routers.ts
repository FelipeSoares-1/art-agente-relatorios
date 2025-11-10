import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { generateNewsReport } from "./newsAgent";
import { saveNewsReport, getUserReports } from "./db";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  news: router({
    /**
     * Gera um novo relatório de notícias
     */
    generateReport: protectedProcedure
      .input(
        z.object({
          period: z.enum(["24_horas", "7_dias"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const content = await generateNewsReport(input.period);
          
          // Salvar no banco de dados
          await saveNewsReport({
            userId: ctx.user.id,
            period: input.period,
            content,
          });

          return {
            success: true,
            content,
          };
        } catch (error) {
          console.error("Error generating report:", error);
          throw new Error("Falha ao gerar relatório");
        }
      }),

    /**
     * Recupera os relatórios anteriores do usuário
     */
    getHistory: protectedProcedure.query(async ({ ctx }) => {
      try {
        const reports = await getUserReports(ctx.user.id);
        return reports;
      } catch (error) {
        console.error("Error fetching reports:", error);
        return [];
      }
    }),
  }),
});

export type AppRouter = typeof appRouter;
