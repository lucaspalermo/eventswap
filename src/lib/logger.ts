// ---------------------------------------------------------------------------
// Structured Logger Utility
// - JSON output in production, pretty-printed in development
// - Log levels: debug, info, warn, error
// - Child logger support for module prefixing
// - Respects LOG_LEVEL env var
// ---------------------------------------------------------------------------

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  module?: string;
  [key: string]: unknown;
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const LEVEL_COLORS: Record<LogLevel, string> = {
  debug: '\x1b[36m', // cyan
  info: '\x1b[32m',  // green
  warn: '\x1b[33m',  // yellow
  error: '\x1b[31m', // red
};

const RESET = '\x1b[0m';
const DIM = '\x1b[2m';
const BOLD = '\x1b[1m';

function getMinLevel(): LogLevel {
  const envLevel = (process.env.LOG_LEVEL || '').toLowerCase();
  if (envLevel in LOG_LEVEL_PRIORITY) {
    return envLevel as LogLevel;
  }
  // Default: debug in dev, info in production
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug';
}

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

function formatPretty(entry: LogEntry): string {
  const { timestamp, level, message, module, ...meta } = entry;
  const color = LEVEL_COLORS[level];
  const levelTag = `${color}${BOLD}${level.toUpperCase().padEnd(5)}${RESET}`;
  const time = `${DIM}${timestamp}${RESET}`;
  const mod = module ? ` ${DIM}[${module}]${RESET}` : '';

  let line = `${time} ${levelTag}${mod} ${message}`;

  // Append metadata if present
  const metaKeys = Object.keys(meta);
  if (metaKeys.length > 0) {
    const metaStr = metaKeys
      .map((k) => `${DIM}${k}=${RESET}${formatValue(meta[k])}`)
      .join(' ');
    line += ` ${metaStr}`;
  }

  return line;
}

function formatValue(value: unknown): string {
  if (value instanceof Error) {
    return `${value.message}${value.stack ? `\n${value.stack}` : ''}`;
  }
  if (typeof value === 'object' && value !== null) {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

function formatJson(entry: LogEntry): string {
  // In production, serialize errors properly
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(entry)) {
    if (value instanceof Error) {
      sanitized[key] = {
        message: value.message,
        name: value.name,
        stack: value.stack,
      };
    } else {
      sanitized[key] = value;
    }
  }
  return JSON.stringify(sanitized);
}

export class Logger {
  private module?: string;

  constructor(module?: string) {
    this.module = module;
  }

  /**
   * Create a child logger with a module name prefix.
   * Useful for scoping logs to a specific area of the codebase.
   */
  child(module: string): Logger {
    // If this logger already has a module, create a nested path
    const fullModule = this.module ? `${this.module}:${module}` : module;
    return new Logger(fullModule);
  }

  /**
   * Log at DEBUG level. Filtered out in production by default.
   */
  debug(message: string, meta?: Record<string, unknown>): void {
    this.log('debug', message, meta);
  }

  /**
   * Log at INFO level. General operational messages.
   */
  info(message: string, meta?: Record<string, unknown>): void {
    this.log('info', message, meta);
  }

  /**
   * Log at WARN level. Potential issues that don't block execution.
   */
  warn(message: string, meta?: Record<string, unknown>): void {
    this.log('warn', message, meta);
  }

  /**
   * Log at ERROR level. Failures that need attention.
   */
  error(message: string, meta?: Record<string, unknown>): void {
    this.log('error', message, meta);
  }

  private log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
    const minLevel = getMinLevel();
    if (LOG_LEVEL_PRIORITY[level] < LOG_LEVEL_PRIORITY[minLevel]) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(this.module ? { module: this.module } : {}),
      ...(meta || {}),
    };

    const output = isProduction() ? formatJson(entry) : formatPretty(entry);

    // Route to appropriate console method
    switch (level) {
      case 'debug':
        console.debug(output);
        break;
      case 'info':
        console.info(output);
        break;
      case 'warn':
        console.warn(output);
        break;
      case 'error':
        console.error(output);
        break;
    }
  }
}

/** Root logger instance */
export const logger = new Logger();

/** Create a child logger scoped to a module name */
export function createLogger(module: string): Logger {
  return new Logger(module);
}
