import * as Sentry from "@sentry/nextjs";

type LogLevel = "info" | "warn" | "error" | "debug";

class Logger {
    private log(level: LogLevel, message: string, meta?: any) {
        // In development, always log to console
        if (process.env.NODE_ENV === "development") {
            const colorMap = {
                info: "\x1b[36m%s\x1b[0m", // Cyan
                warn: "\x1b[33m%s\x1b[0m", // Yellow
                error: "\x1b[31m%s\x1b[0m", // Red
                debug: "\x1b[90m%s\x1b[0m", // Gray
            };

            console.log(colorMap[level], `[${level.toUpperCase()}] ${message}`);
            if (meta) console.log(meta);
        }

        // In production, send to Sentry
        if (process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_VERCEL_ENV === "production") {
            if (level === "error") {
                Sentry.captureException(meta instanceof Error ? meta : new Error(message), {
                    extra: { message, ...meta },
                });
            } else if (level === "warn") {
                Sentry.captureMessage(message, {
                    level: "warning",
                    extra: meta,
                });
            } else {
                // Info/Debug logs - usually breadcrumbs in Sentry
                Sentry.addBreadcrumb({
                    category: "log",
                    message,
                    level,
                    data: meta,
                });
            }
        }
    }

    info(message: string, meta?: any) {
        this.log("info", message, meta);
    }

    warn(message: string, meta?: any) {
        this.log("warn", message, meta);
    }

    error(message: string, meta?: any) {
        this.log("error", message, meta);
        // Also log to console in production for immediate visibility in server logs
        if (process.env.NODE_ENV === "production") {
            console.error(message, meta);
        }
    }

    debug(message: string, meta?: any) {
        this.log("debug", message, meta);
    }
}

export const logger = new Logger();
