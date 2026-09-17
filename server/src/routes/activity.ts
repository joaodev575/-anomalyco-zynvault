import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// POST /api/activity — Registrar ação do usuário
router.post("/", authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const { action, category, detail, metadata } = req.body;

    if (!action || !category) {
      res.status(400).json({ success: false, message: "action e category são obrigatórios" });
      return;
    }

    const log = await prisma.activityLog.create({
      data: {
        userId: req.user!.userId,
        action,
        category,
        detail: detail || null,
        metadata: metadata || undefined,
      },
    });

    res.status(201).json({ success: true, data: { id: log.id } });
  } catch (error) {
    console.error("Activity log error:", error);
    res.status(500).json({ success: false, message: "Erro ao registrar atividade" });
  }
});

// GET /api/activity — Listar ações do usuário (paginado)
router.get("/", authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const skip = (page - 1) * limit;
    const category = req.query.category as string | undefined;

    const where = {
      userId: req.user!.userId,
      ...(category ? { category } : {}),
    };

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          action: true,
          category: true,
          detail: true,
          metadata: true,
          createdAt: true,
        },
      }),
      prisma.activityLog.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        logs,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    console.error("Activity list error:", error);
    res.status(500).json({ success: false, message: "Erro ao listar atividades" });
  }
});

// GET /api/activity/stats — Estatísticas do usuário
router.get("/stats", authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const [total, byCategory, recent] = await Promise.all([
      prisma.activityLog.count({ where: { userId } }),
      prisma.activityLog.groupBy({
        by: ["category"],
        where: { userId },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      }),
      prisma.activityLog.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { action: true, category: true, createdAt: true },
      }),
    ]);

    res.json({
      success: true,
      data: {
        total,
        byCategory: byCategory.map((c) => ({ category: c.category, count: c._count.id })),
        recent,
      },
    });
  } catch (error) {
    console.error("Activity stats error:", error);
    res.status(500).json({ success: false, message: "Erro ao buscar estatísticas" });
  }
});

export default router;
