"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAdmin: boolean;
    role: 'user' | 'organizer' | 'admin';
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    isAdmin: false,
    role: 'user',
    logout: async () => { }
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [role, setRole] = useState<'user' | 'organizer' | 'admin'>('user');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (!currentUser) {
                setIsAdmin(false);
                setRole('user');
                setLoading(false);
                return;
            }

            // Sync: Check Admin Email
            const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);
            const isEmailAdmin = adminEmails.includes(currentUser.email || '');
            setIsAdmin(isEmailAdmin);

            // Set loading false as soon as we have the basic user object
            // This prevents the whole app from hanging if Firestore is slow
            setLoading(false);

            // Async: Fetch/Create Role in Firestore
            try {
                const userDocRef = doc(db, 'users', currentUser.uid);
                const userSnap = await getDoc(userDocRef);

                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    const userRole = userData.role || (isEmailAdmin ? 'admin' : 'user');
                    setRole(userRole);
                    if (userRole === 'admin') setIsAdmin(true);
                } else {
                    const initialRole = isEmailAdmin ? 'admin' : 'user';
                    await setDoc(userDocRef, {
                        email: currentUser.email,
                        displayName: currentUser.displayName,
                        role: initialRole,
                        createdAt: new Date().toISOString()
                    }, { merge: true });
                    setRole(initialRole);
                }
            } catch (error) {
                console.error("AuthContext: Error fetching user role:", error);
                setRole(isEmailAdmin ? 'admin' : 'user');
            }
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        await signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, loading, isAdmin, role, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
