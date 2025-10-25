import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export interface JwtPayload {
  sub: string;
  iat?: number;
  exp?: number;
}

export const authJwt = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No token provided' });

  const parts = header.split(' ');
  if (parts.length !== 2) return res.status(401).json({ error: 'Token error' });

  const [scheme, token] = parts;
  if (!/^Bearer$/i.test(scheme)) return res.status(401).json({ error: 'Token malformatted' });

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
    // attach user id to request
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    req.userId = decoded.sub;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalid' });
  }
};

export default authJwt;
