import type { Request, Response, NextFunction } from 'express';
import type { Role } from '@prisma/client';
import { verifyToken, type JwtPayload } from '../lib/jwt';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: JwtPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Jeton manquant' });
  }
  try {
    req.auth = verifyToken(header.slice(7));
    next();
  } catch {
    res.status(401).json({ error: 'Jeton invalide ou expiré' });
  }
}

export function authorize(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) return res.status(401).json({ error: 'Non authentifié' });
    if (roles.length && !roles.includes(req.auth.role)) {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    next();
  };
}
