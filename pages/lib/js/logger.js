import { getState } from './state';
import { detailedTime } from './time';
const { isProduction } = getState();
class Logger {
  print(type, ...any) {
    console.log(`[${detailedTime()}]`, `[${type}]`, ...any);
  }
  debug(...any) {
    if (isProduction) {
      return;
    }
    this.print('DEBUG', ...any);
    console.trace();
  }
  info(...any) {
    this.print('INFO', ...any);
  }
  warning(...any) {
    this.print('WARN', ...any);
  }
}

export const logger = new Logger();
