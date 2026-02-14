"use client";

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

interface FavoriteButtonProps {
    eventId: string;
    type?: 'event' | 'course';
    className?: string;
    iconSize?: number;
    showText?: boolean;
}

export default function FavoriteButton({ eventId, type = 'event', className = "", iconSize = 20, showText = false }: FavoriteButtonProps) {
    const { user } = useAuth();
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(false);

    // Determine target field based on type
    const targetField = type === 'course' ? 'favoriteCourses' : 'favorites';

    useEffect(() => {
        const checkFavoriteStatus = async () => {
            if (!user) return;
            try {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const favorites = userDoc.data()[targetField] || [];
                    setIsFavorite(favorites.includes(eventId));
                }
            } catch (error) {
                console.error("Error checking favorite status:", error);
            }
        };

        checkFavoriteStatus();
    }, [user, eventId, targetField]);

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            alert(`Favorilere eklemek için giriş yapmalısınız.`);
            return;
        }

        if (loading) return;
        setLoading(true);

        try {
            const userRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                await setDoc(userRef, { [targetField]: [] }, { merge: true });
            }

            if (isFavorite) {
                await updateDoc(userRef, {
                    [targetField]: arrayRemove(eventId)
                });
                setIsFavorite(false);
            } else {
                await updateDoc(userRef, {
                    [targetField]: arrayUnion(eventId)
                });
                setIsFavorite(true);
            }
        } catch (error) {
            console.error("Error toggling favorite:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={toggleFavorite}
            disabled={loading}
            className={`group flex items-center gap-2 transition-all duration-300 ${className} ${loading ? 'opacity-70 cursor-wait' : ''}`}
            title={isFavorite ? "Favorilerden Çıkar" : "Favorilere Ekle"}
        >
            <div className={`
                p-2 rounded-full transition-all duration-300
                ${isFavorite
                    ? 'bg-red-500/10 text-red-500'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 hover:bg-red-500 hover:text-white'
                }
            `}>
                <Heart
                    size={iconSize}
                    className={`transition-transform duration-300 ${isFavorite ? 'fill-current scale-110' : 'group-hover:scale-110'}`}
                />
            </div>
            {showText && (
                <span className={`text-sm font-medium transition-colors ${isFavorite ? 'text-red-500' : 'text-neutral-500 dark:text-neutral-400 group-hover:text-red-500'
                    }`}>
                    {isFavorite ? 'Favorilerde' : 'Favorilere Ekle'}
                </span>
            )}
        </button>
    );
}
