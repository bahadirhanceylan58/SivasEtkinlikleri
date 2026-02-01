/**
 * Simple in-memory rate limiter
 * Tracks requests by IP address and enforces limits
 */

interface RateLimitRecord {
    count: number;
    resetTime: number;
}

class RateLimiter {
    private records: Map<string, RateLimitRecord> = new Map();
    private cleanupInterval: NodeJS.Timeout;

    constructor() {
        // Clean up expired records every minute
        this.cleanupInterval = setInterval(() => {
            const now = Date.now();
            for (const [key, record] of this.records.entries()) {
                if (now > record.resetTime) {
                    this.records.delete(key);
                }
            }
        }, 60000);
    }

    /**
     * Check if a request should be allowed
     * @param identifier - Usually IP address
     * @param limit - Maximum requests allowed
     * @param windowMs - Time window in milliseconds
     * @returns true if request is allowed, false if rate limited
     */
    check(identifier: string, limit: number, windowMs: number): boolean {
        const now = Date.now();
        const record = this.records.get(identifier);

        if (!record || now > record.resetTime) {
            // New window or expired
            this.records.set(identifier, {
                count: 1,
                resetTime: now + windowMs,
            });
            return true;
        }

        if (record.count >= limit) {
            // Rate limit exceeded
            return false;
        }

        // Increment count
        record.count++;
        return true;
    }

    /**
     * Get remaining requests for an identifier
     */
    getRemaining(identifier: string, limit: number): number {
        const record = this.records.get(identifier);
        if (!record) return limit;
        return Math.max(0, limit - record.count);
    }

    cleanup() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
    }
}

// Global instance
export const rateLimiter = new RateLimiter();

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
    payment: { limit: 5, windowMs: 10 * 60 * 1000 }, // 5 requests per 10 minutes
    auth: { limit: 10, windowMs: 5 * 60 * 1000 }, // 10 requests per 5 minutes
    contact: { limit: 3, windowMs: 30 * 60 * 1000 }, // 3 requests per 30 minutes
    api: { limit: 100, windowMs: 60 * 1000 }, // 100 requests per minute
} as const;

/**
 * Helper to get client identifier from request
 */
export function getClientIdentifier(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] :
        request.headers.get('x-real-ip') ||
        'unknown';
    return ip;
}
