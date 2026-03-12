import { db } from './firebase';
import * as admin from 'firebase-admin';

// ... (interfaces)

/**
 * Log an action to the audit trail
 */
export async function logAudit(entry: AuditLogEntry): Promise<void> {
    try {
        if (typeof window === 'undefined') {
            // Server side - use Admin SDK
            const { adminDb } = await import('./firebaseAdmin');
            await adminDb.collection('auditLogs').add({
                ...entry,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
            });
        } else {
            // Client side - use standard SDK
            const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
            await addDoc(collection(db, 'auditLogs'), {
                ...entry,
                timestamp: serverTimestamp(),
            });
        }
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
