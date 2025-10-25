import { Router, Request, Response } from 'express';
import { registerSchema, loginSchema } from './auth.schemas';
import { validate } from '../../middlewares/validate';
import { createAuthService } from './auth.service';

const router = Router();
const service = createAuthService();

router.post('/register', validate(registerSchema as any), async (req: Request, res: Response) => {
  const { email, password, nombre_completo, pin } = req.body as { email: string; password: string; nombre_completo: string; pin: string };
  const user = await service.registerUser(email, password, nombre_completo, pin);
  return res.status(201).json({ id: user.id, email: user.email });
});

router.post('/login', validate(loginSchema as any), async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  const user = await service.validateUser(email, password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const tokens = service.signTokens(user.id);
  return res.json({ user: { id: user.id, email: user.email }, tokens });
});

export default router;
