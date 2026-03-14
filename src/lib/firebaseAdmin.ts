// This utility ensures the Admin SDK is only initialized once and safely on the server.
// We use lazy loading/dynamic imports to prevent build-time MODULE_NOT_FOUND errors 
// when Next.js tries to pre-render or collect data for pages/routes.

let adminApp: any = null;

const getAdminApp = async () => {
    if (typeof window !== 'undefined') {
        throw new Error('Firebase Admin SDK cannot be used on the client side.');
    }

    const admin = await import('firebase-admin');

    if (!admin.apps.length) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                }),
            });
        } catch (error) {
            console.error('Firebase admin initialization error', error);
            throw error;
        }
    }
    return admin;
};

// Exporting functions to get instances instead of top-level constants
// This allows for safer usage across the application.

export const getAdminDb = async () => {
    const admin = await getAdminApp();
    return admin.firestore();
};

export const getAdminAuth = async () => {
    const admin = await getAdminApp();
    return admin.auth();
};

export const getAdminStorage = async () => {
    const admin = await getAdminApp();
    return admin.storage();
};

// Also export a getter for the firestore collection for convenience if needed
// but staying with the async getters is safer for now to ensure initialization.
