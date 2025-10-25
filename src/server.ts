import app from './app';
import { config } from './config/env';
import { logger } from './core/logger';

const PORT = config.PORT ?? 4000;

app.listen(PORT, () => {
  logger.info({ port: PORT }, `Server running on port ${PORT}`);
});

export default app;
