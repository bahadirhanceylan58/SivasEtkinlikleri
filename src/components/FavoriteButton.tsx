"use client";

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

interface FavoriteButtonProps {
    eventId: string;
    className?: string;
    iconSize?: number;
}

export default function FavoriteButton({ eventId, className = "", iconSize = 20 }: FavoriteButtonProps) {
    const { user } = useAuth();
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const checkFavoriteStatus = async () => {
            if (!user) return;
            try {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const favorites = userDoc.data().favorites || [];
                    setIsFavorite(favorites.includes(eventId));
                }
            } catch (error) {
                console.error("Error checking favorite status:", error);
            }
        };

        checkFavoriteStatus();
    }, [user, eventId]);

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent Link navigation if inside a card
        e.stopPropagation();

        if (!user) {
            alert("Favorilere eklemek için giriş yapmalısınız.");
            return;
        }

        if (loading) return;
        setLoading(true);

        try {
            const userRef = doc(db, "users", user.uid);

            // Ensure user document exists (sometimes users created via specialized auth flows might lack a doc initially)
            const userDoc = await getDoc(userRef);
            if (!userDoc.exists()) {
                await setDoc(userRef, { favorites: [] }, { merge: true });
            }

            if (isFavorite) {
                await updateDoc(userRef, {
                    favorites: arrayRemove(eventId)
                });
                setIsFavorite(false);
            } else {
                await updateDoc(userRef, {
                    favorites: arrayUnion(eventId)
                });
                setIsFavorite(true);
            }
        } catch (error) {
            console.error("Error toggling favorite:", error);
            alert("İşlem sırasında bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={toggleFavorite}
            disabled={loading}
            className={`p-2 rounded-full transition-all duration-300 group active:scale-95 ${isFavorite
                    ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                    : 'bg-black/40 text-gray-400 hover:bg-white hover:text-red-500 backdrop-blur-sm'
                } ${className}`}
            title={isFavorite ? "Favorilerden Çıkar" : "Favorilere Ekle"}
        >
            <Heart
                size={iconSize}
                className={`transition-transform duration-300 ${isFavorite ? 'fill-current scale-110' : 'group-hover:scale-110'}`}
            />
        </button>
    );
}
