import cron from 'node-cron';
import { processarEmailsDePedidos } from '../services/emailReaderService.js';

export const startEmailReader = () => {
    // Configurado para rodar a cada 5 minutos
    cron.schedule('*/5 * * * *', async () => {
        console.log('[Cron] Verificando novos e-mails de pedidos no Gmail...');
        await processarEmailsDePedidos();
    });
};