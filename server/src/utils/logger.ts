/** Tiny structured logger. Swap for pino/winston when you need log shipping. */
type Level = 'info' | 'warn' | 'error' | 'debug';

function write(level: Level, message: string, meta?: unknown) {
  const line = `[${new Date().toISOString()}] ${level.toUpperCase()} ${message}`;
  const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  if (meta !== undefined) fn(line, meta);
  else fn(line);
}

export const logger = {
  info: (m: string, meta?: unknown) => write('info', m, meta),
  warn: (m: string, meta?: unknown) => write('warn', m, meta),
  error: (m: string, meta?: unknown) => write('error', m, meta),
  debug: (m: string, meta?: unknown) => {
    if (process.env.NODE_ENV !== 'production') write('debug', m, meta);
  },
};
