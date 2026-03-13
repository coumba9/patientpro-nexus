/**
 * Lightweight error monitoring service for production.
 * Captures unhandled errors and promise rejections, batches them,
 * and can forward to any external service (Sentry, LogRocket, custom endpoint).
 */

interface ErrorReport {
  message: string;
  stack?: string;
  url: string;
  timestamp: string;
  userAgent: string;
  type: 'error' | 'unhandledrejection';
}

class ErrorMonitor {
  private queue: ErrorReport[] = [];
  private readonly MAX_QUEUE = 20;
  private isProduction: boolean;

  constructor() {
    this.isProduction = import.meta.env.PROD;
  }

  init() {
    if (!this.isProduction) return;

    window.addEventListener('error', (event) => {
      this.capture({
        message: event.message,
        stack: event.error?.stack,
        url: event.filename || window.location.href,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        type: 'error',
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      const reason = event.reason;
      this.capture({
        message: reason?.message || String(reason),
        stack: reason?.stack,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        type: 'unhandledrejection',
      });
    });
  }

  private capture(report: ErrorReport) {
    if (this.queue.length >= this.MAX_QUEUE) {
      this.queue.shift();
    }
    this.queue.push(report);

    // Log to console in a structured way for external log aggregation
    console.error('[ErrorMonitor]', JSON.stringify({
      msg: report.message,
      type: report.type,
      url: report.url,
      ts: report.timestamp,
    }));
  }

  getRecentErrors(): ErrorReport[] {
    return [...this.queue];
  }
}

export const errorMonitor = new ErrorMonitor();
