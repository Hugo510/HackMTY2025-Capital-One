import { Router, Request, Response } from 'express';
import { authJwt } from '../../middlewares/authJwt';
import prisma from '../../db/prisma';

const router = Router();

router.get('/', authJwt, async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.userId as string;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json({ user });
});

export default router;
