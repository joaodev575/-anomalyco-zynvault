import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// POST /api/telemetry — Registrar evento de telemetria
router.post("/", authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventType, eventData, appVersion, platform } = req.body;

    if (!eventType) {
      res.status(400).json({ success: false, message: "eventType é obrigatório" });
      return;
    }

    const event = await prisma.telemetryEvent.create({
      data: {
        userId: req.user!.userId,
        eventType,
        eventData: eventData || undefined,
        appVersion: appVersion || null,
        platform: platform || null,
      },
    });

    res.status(201).json({ success: true, data: { id: event.id } });
  } catch (error) {
    console.error("Telemetry error:", error);
    res.status(500).json({ success: false, message: "Erro ao registrar evento" });
  }
});

// POST /api/telemetry/batch — Registrar múltiplos eventos
router.post("/batch", authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { events } = req.body;

    if (!Array.isArray(events) || events.length === 0) {
      res.status(400).json({ success: false, message: "events array é obrigatório" });
      return;
    }

    const created = await prisma.telemetryEvent.createMany({
      data: events.map((e: { eventType: string; eventData?: unknown; appVersion?: string; platform?: string }) => ({
        userId: req.user!.userId,
        eventType: e.eventType,
        eventData: e.eventData || undefined,
        appVersion: e.appVersion || null,
        platform: e.platform || null,
      })),
    });

    res.status(201).json({ success: true, data: { count: created.count } });
  } catch (error) {
    console.error("Telemetry batch error:", error);
    res.status(500).json({ success: false, message: "Erro ao registrar eventos" });
  }
});

// GET /api/telemetry — Listar eventos (admin)
router.get("/", authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const skip = (page - 1) * limit;
    const eventType = req.query.eventType as string | undefined;

    const where = {
      userId: req.user!.userId,
      ...(eventType ? { eventType } : {}),
    };

    const [events, total] = await Promise.all([
      prisma.telemetryEvent.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          eventType: true,
          eventData: true,
          appVersion: true,
          platform: true,
          createdAt: true,
        },
      }),
      prisma.telemetryEvent.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        events,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    console.error("Telemetry list error:", error);
    res.status(500).json({ success: false, message: "Erro ao listar eventos" });
  }
});

// GET /api/telemetry/stats — Estatísticas de telemetria
router.get("/stats", authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const [total, byType, last24h] = await Promise.all([
      prisma.telemetryEvent.count({ where: { userId } }),
      prisma.telemetryEvent.groupBy({
        by: ["eventType"],
        where: { userId },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      }),
      prisma.telemetryEvent.count({
        where: {
          userId,
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        total,
        last24h,
        byType: byType.map((t) => ({ eventType: t.eventType, count: t._count.id })),
      },
    });
  } catch (error) {
    console.error("Telemetry stats error:", error);
    res.status(500).json({ success: false, message: "Erro ao buscar estatísticas" });
  }
});

export default router;
