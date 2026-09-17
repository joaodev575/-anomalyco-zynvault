import { Request, Response, NextFunction } from "express";
import { verifyToken, TokenPayload } from "../lib/jwt.js";
import { prisma } from "../lib/prisma.js";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Get token from header or cookie
    const authHeader = req.headers.authorization;
    const token =
      authHeader?.startsWith("Bearer ")
        ? authHeader.substring(7)
        : req.cookies?.token;

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Token de autenticação não fornecido",
      });
      return;
    }

    // Verify token
    const payload = verifyToken(token);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Usuário não encontrado",
      });
      return;
    }

    // Attach user to request
    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error instanceof Error && error.name === "JsonWebTokenError") {
      res.status(401).json({
        success: false,
        message: "Token inválido",
      });
      return;
    }

    if (error instanceof Error && error.name === "TokenExpiredError") {
      res.status(401).json({
        success: false,
        message: "Token expirado",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Erro ao verificar autenticação",
    });
  }
}

export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Não autenticado",
      });
      return;
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "Sem permissão para acessar este recurso",
      });
      return;
    }

    next();
  };
}