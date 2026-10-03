import type { SimulationMode } from '../domain/payment';

export interface AppOptions {
  mode?: SimulationMode;
  timeoutDelayMs?: number;
}

export interface AppConfig {
  mode: SimulationMode;
  timeoutDelayMs: number;
}

export function resolveAppConfig(options: AppOptions = {}): AppConfig {
  const mode = options.mode ?? 'normal';
  const timeoutDelayMs = options.timeoutDelayMs ?? 6500;

  if (!['normal', 'system_error', 'timeout'].includes(mode)) {
    throw new Error('SNAILPAY_MODE inválido');
  }
  if (!Number.isInteger(timeoutDelayMs) || timeoutDelayMs < 1 || timeoutDelayMs > 60_000) {
    throw new Error('SNAILPAY_TIMEOUT_DELAY_MS inválido');
  }

  return { mode, timeoutDelayMs };
}
