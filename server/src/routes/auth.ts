import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../lib/prisma.js";
import {
  generateToken,
  setTokenCookie,
  clearTokenCookie,
} from "../lib/jwt.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../lib/validations.js";

const router = Router();

// POST /api/auth/register
router.post(
  "/register",
  validate(registerSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, password } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        res.status(409).json({
          success: false,
          message: "Email já está em uso",
        });
        return;
      }

      // Hash password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      // Generate token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Create session
      await prisma.session.create({
        data: {
          userId: user.id,
          token,
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      // Set cookie
      setTokenCookie(res, token);

      res.status(201).json({
        success: true,
        message: "Conta criada com sucesso",
        data: {
          user,
          token,
        },
      });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({
        success: false,
        message: "Erro ao criar conta",
      });
    }
  }
);

// POST /api/auth/login
router.post(
  "/login",
  validate(loginSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          password: true,
          role: true,
          avatar: true,
        },
      });

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Email ou senha inválidos",
        });
        return;
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: "Email ou senha inválidos",
        });
        return;
      }

      // Generate token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Create session
      await prisma.session.create({
        data: {
          userId: user.id,
          token,
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      // Set cookie
      setTokenCookie(res, token);

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;

      res.status(200).json({
        success: true,
        message: "Login realizado com sucesso",
        data: {
          user: userWithoutPassword,
          token,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Erro ao realizar login",
      });
    }
  }
);

// POST /api/auth/logout
router.post("/logout", authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const token =
      req.headers.authorization?.substring(7) || req.cookies?.token;

    if (token) {
      // Delete session
      await prisma.session.deleteMany({
        where: { token },
      });
    }

    // Clear cookie
    clearTokenCookie(res);

    res.status(200).json({
      success: true,
      message: "Logout realizado com sucesso",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao realizar logout",
    });
  }
});

// POST /api/auth/forgot-password
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      // Always return success to prevent email enumeration
      if (!user) {
        res.status(200).json({
          success: true,
          message: "Se o email estiver cadastrado, você receberá um código de recuperação",
        });
        return;
      }

      // Generate 6-digit code
      const code = crypto.randomInt(100000, 999999).toString();

      // Hash code before storing
      const hashedCode = await bcrypt.hash(code, 10);

      // Delete any existing unused resets for this user
      await prisma.passwordReset.deleteMany({
        where: {
          userId: user.id,
          used: false,
        },
      });

      // Create password reset record
      await prisma.passwordReset.create({
        data: {
          userId: user.id,
          code: hashedCode,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        },
      });

      // TODO: Send email with code
      // For development, log the code
      if (process.env.NODE_ENV === "development") {
        console.log(`\n📧 Password Reset Code for ${email}: ${code}\n`);
      }

      res.status(200).json({
        success: true,
        message: "Se o email estiver cadastrado, você receberá um código de recuperação",
        // Only in development - remove in production
        ...(process.env.NODE_ENV === "development" && { code }),
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({
        success: false,
        message: "Erro ao processar solicitação",
      });
    }
  }
);

// POST /api/auth/reset-password
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { code, password } = req.body;

      // Find all unused reset codes
      const resets = await prisma.passwordReset.findMany({
        where: {
          used: false,
          expiresAt: {
            gt: new Date(),
          },
        },
        include: {
          user: true,
        },
      });

      // Check each reset code
      let validReset = null;
      for (const reset of resets) {
        const isValid = await bcrypt.compare(code, reset.code);
        if (isValid) {
          validReset = reset;
          break;
        }
      }

      if (!validReset) {
        res.status(400).json({
          success: false,
          message: "Código inválido ou expirado",
        });
        return;
      }

      // Hash new password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Update password
      await prisma.user.update({
        where: { id: validReset.userId },
        data: { password: hashedPassword },
      });

      // Mark reset code as used
      await prisma.passwordReset.update({
        where: { id: validReset.id },
        data: { used: true },
      });

      // Delete all sessions for this user
      await prisma.session.deleteMany({
        where: { userId: validReset.userId },
      });

      res.status(200).json({
        success: true,
        message: "Senha redefinida com sucesso",
      });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({
        success: false,
        message: "Erro ao redefinir senha",
      });
    }
  }
);

// GET /api/auth/me
router.get("/me", authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "Usuário não encontrado",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar usuário",
    });
  }
});

export default router;