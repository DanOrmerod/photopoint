export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4
}

export interface LoggerConfig {
  level: LogLevel;
  enableTimestamp: boolean;
  enableColors: boolean;
}

class Logger {
  private config: LoggerConfig;

  constructor(config?: Partial<LoggerConfig>) {
    this.config = {
      level: this.getLogLevelFromEnv(),
      enableTimestamp: true,
      enableColors: true,
      ...config
    };
  }

  private getLogLevelFromEnv(): LogLevel {
    // const envLevel = process.env.LOG_LEVEL?.toUpperCase();    
    const envLevel: string = 'DEBUG';
    console.log('LOG_LEVEL:', envLevel);
    switch (envLevel) {
      case 'ERROR': return LogLevel.ERROR;
      case 'WARN': return LogLevel.WARN;
      case 'INFO': return LogLevel.INFO;
      case 'DEBUG': return LogLevel.DEBUG;
      case 'TRACE': return LogLevel.TRACE;
      default: return LogLevel.INFO; // Default to INFO level
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.config.level;
  }

  private formatMessage(level: string, message: string, ...args: any[]): string {
    const timestamp = this.config.enableTimestamp ? new Date().toISOString() : '';
    const prefix = timestamp ? `[${timestamp}] [${level}]` : `[${level}]`;
    
    if (args.length > 0) {
      return `${prefix} ${message} ${args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ')}`;
    }
    
    return `${prefix} ${message}`;
  }

  private getColorCode(level: LogLevel): string {
    if (!this.config.enableColors) return '';
    
    switch (level) {
      case LogLevel.ERROR: return '\x1b[31m'; // Red
      case LogLevel.WARN: return '\x1b[33m';  // Yellow
      case LogLevel.INFO: return '\x1b[36m';  // Cyan
      case LogLevel.DEBUG: return '\x1b[35m'; // Magenta
      case LogLevel.TRACE: return '\x1b[37m'; // White
      default: return '';
    }
  }

  private resetColor(): string {
    return this.config.enableColors ? '\x1b[0m' : '';
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const colorCode = this.getColorCode(LogLevel.ERROR);
      const formattedMessage = this.formatMessage('ERROR', message, ...args);
      console.error(`${colorCode}${formattedMessage}${this.resetColor()}`);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const colorCode = this.getColorCode(LogLevel.WARN);
      const formattedMessage = this.formatMessage('WARN', message, ...args);
      console.warn(`${colorCode}${formattedMessage}${this.resetColor()}`);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const colorCode = this.getColorCode(LogLevel.INFO);
      const formattedMessage = this.formatMessage('INFO', message, ...args);
      console.log(`${colorCode}${formattedMessage}${this.resetColor()}`);
    }
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const colorCode = this.getColorCode(LogLevel.DEBUG);
      const formattedMessage = this.formatMessage('DEBUG', message, ...args);
      console.log(`${colorCode}${formattedMessage}${this.resetColor()}`);
    }
  }

  trace(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.TRACE)) {
      const colorCode = this.getColorCode(LogLevel.TRACE);
      const formattedMessage = this.formatMessage('TRACE', message, ...args);
      console.log(`${colorCode}${formattedMessage}${this.resetColor()}`);
    }
  }

  // Utility methods for changing log level at runtime
  setLogLevel(level: LogLevel): void {
    this.config.level = level;
  }

  getLogLevel(): LogLevel {
    return this.config.level;
  }

  setConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Create and export a default logger instance
export const logger = new Logger();

// Export the Logger class for creating custom loggers
export { Logger };
