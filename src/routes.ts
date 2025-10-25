import { Router } from 'express';
import healthRouter from './routes/health';
import authController from './modules/auth/auth.controller';
import meController from './modules/me/me.controller';

const router = Router();

router.use('/health', healthRouter);

// auth endpoints
router.use('/auth', authController);

// protected user endpoints (me)
router.use('/me', meController);

export default router;
