/**
 * Logging Utilities
 * Structured logging for MCP server operations
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export class Logger {
  constructor(private context: string) {}

  private log(level: LogLevel, message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${this.context}]`;

    const logMessage = data
      ? `${prefix} ${message} ${JSON.stringify(data)}`
      : `${prefix} ${message}`;

    switch (level) {
      case 'error':
        console.error(logMessage);
        break;
      case 'warn':
        console.warn(logMessage);
        break;
      case 'info':
      case 'debug':
      default:
        console.log(logMessage);
    }
  }

  debug(message: string, data?: any): void {
    if (process.env.DEBUG) {
      this.log('debug', message, data);
    }
  }

  info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  error(message: string, error?: Error | any): void {
    const errorData = error instanceof Error
      ? { message: error.message, stack: error.stack }
      : error;
    this.log('error', message, errorData);
  }
}

export function createLogger(context: string): Logger {
  return new Logger(context);
}
