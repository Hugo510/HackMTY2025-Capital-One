import { Router, Request, Response } from 'express';
import { authJwt } from '../../middlewares/authJwt';
import prisma from '../../db/prisma';

const router = Router();

router.get('/', authJwt, async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.userId as string;
  const usuario = await prisma.usuario.findUnique({ where: { id_usuario: Number(userId) }, select: { id_usuario: true, email: true } });
  if (!usuario) return res.status(404).json({ error: 'User not found' });
  return res.json({ user: { id: String(usuario.id_usuario), email: usuario.email } });
});

export default router;
