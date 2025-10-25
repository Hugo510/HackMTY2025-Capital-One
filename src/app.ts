import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';

import routes from './routes';
import swaggerSpec from './config/swagger';
import { pinoMiddleware } from './core/logger';
import { createRateLimiter } from './core/rateLimit';
import { errorHandler } from './middlewares/errorHandler';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(pinoMiddleware);
app.use(createRateLimiter());

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/', routes);

// Error handler (should be last)
app.use(errorHandler);

export default app;
