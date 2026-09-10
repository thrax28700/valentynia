import type { Request, Response, NextFunction, RequestHandler } from 'express';

/** Enrobe un handler asynchrone pour propager les erreurs vers errorHandler. */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next);
  };
