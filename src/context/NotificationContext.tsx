"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

export interface Notification {
    id: string;
    userId: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'reply' | 'approval';
    title: string;
    message: string;
    link?: string;
    read: boolean;
    createdAt: any;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    loading: boolean;
}

const NotificationContext = createContext<NotificationContextType>({
    notifications: [],
    unreadCount: 0,
    markAsRead: async () => { },
    markAllAsRead: async () => { },
    loading: true,
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setNotifications([]);
            setLoading(false);
            return;
        }

        let unsubscribe: (() => void) | undefined;

        try {
            const q = query(
                collection(db, 'notifications'),
                where('userId', '==', user.uid),
                orderBy('createdAt', 'desc')
            );

            unsubscribe = onSnapshot(q, (snapshot) => {
                const notifs = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Notification));

                setNotifications(notifs);
                setLoading(false);
            }, (error) => {
                console.error("Error listening to notifications:", error);
                setLoading(false);
            });
        } catch (error) {
            console.error("Error setting up notification listener:", error);
            setLoading(false);
        }

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [user]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = async (id: string) => {
        try {
            const notifRef = doc(db, 'notifications', id);
            await updateDoc(notifRef, { read: true });
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const markAllAsRead = async () => {
        const batch = writeBatch(db);
        const unreadNotifications = notifications.filter(n => !n.read);

        if (unreadNotifications.length === 0) return;

        unreadNotifications.forEach(n => {
            const notifRef = doc(db, 'notifications', n.id);
            batch.update(notifRef, { read: true });
        });

        try {
            await batch.commit();
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, loading }}>
            {children}
        </NotificationContext.Provider>
    );
};
