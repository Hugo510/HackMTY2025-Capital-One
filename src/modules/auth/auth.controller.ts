import { Router, Request, Response } from 'express';
import { registerSchema, loginSchema } from './auth.schemas';
import { validate } from '../../middlewares/validate';
import * as service from './auth.service';

const router = Router();

router.post('/register', validate(registerSchema), async (req: Request, res: Response) => {
  // @ts-ignore
  const { email, password } = req.body;
  const user = await service.registerUser(email, password);
  return res.status(201).json({ id: user.id, email: user.email });
});

router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  // @ts-ignore
  const { email, password } = req.body;
  const user = await service.validateUser(email, password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const tokens = service.signTokens(user.id);
  return res.json({ user: { id: user.id, email: user.email }, tokens });
});

export default router;
