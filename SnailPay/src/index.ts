import { createSnailPayApp } from './app';
import { SimulationMode } from './domain/payment';

const port = Number(process.env.SNAILPAY_PORT ?? process.env.PORT ?? 4001);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('SNAILPAY_PORT inválido');
const app = createSnailPayApp({
  mode: (process.env.SNAILPAY_MODE ?? 'normal') as SimulationMode,
  timeoutDelayMs: Number(process.env.SNAILPAY_TIMEOUT_DELAY_MS ?? 6500),
});
const server = app.listen(port, () => console.log(`SnailPay simulado en http://localhost:${port}`));
server.on('error', error => { console.error('No se pudo iniciar SnailPay:', error.message); process.exitCode = 1; });
