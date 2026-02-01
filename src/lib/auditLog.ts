import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface AuditLogEntry {
    userId: string;
    userEmail?: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    status: 'success' | 'failure';
    errorMessage?: string;
}

/**
 * Log an action to the audit trail
 */
export async function logAudit(entry: AuditLogEntry): Promise<void> {
    try {
        await addDoc(collection(db, 'auditLogs'), {
            ...entry,
            timestamp: serverTimestamp(),
        });
    } catch (error) {
        console.error('Failed to write audit log:', error);
        // Don't throw - audit logging should never break the main flow
    }
}

/**
 * Helper to get client IP and user agent from request headers
 */
export function getClientInfo(headers: Headers) {
    return {
        ipAddress: headers.get('x-forwarded-for') || headers.get('x-real-ip') || 'unknown',
        userAgent: headers.get('user-agent') || 'unknown',
    };
}
