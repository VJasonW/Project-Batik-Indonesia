import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'batik-indonesia-secret-key-2026';

export interface AuthRequest extends Request {
  adminId?: number;
  adminEmail?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token tidak ditemukan. Silakan login terlebih dahulu.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string };
    req.adminId = decoded.id;
    req.adminEmail = decoded.email;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token tidak valid atau sudah kadaluarsa.' });
    return;
  }
}
