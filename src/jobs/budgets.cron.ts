import cron from 'node-cron';
import { logger } from '../core/logger';

// ejemplo: se puede programar una tarea diaria
cron.schedule('0 0 * * *', () => {
  logger.info('Running daily budgets cron job');
  // TODO: implementar reconciliación de presupuestos
});
