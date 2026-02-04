"use client";
import { useEffect, useRef } from "react";
import { doc, updateDoc, increment, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface ViewTrackerProps {
    collectionName: string;
    docId: string;
}

export default function ViewTracker({ collectionName, docId }: ViewTrackerProps) {
    const hasViewed = useRef(false);

    useEffect(() => {
        if (hasViewed.current) return;
        hasViewed.current = true; // React.StrictMode çift saymasın diye kontrol

        const registerView = async () => {
            try {
                // 1. İlgili içeriğin (Etkinlik/Kurs) sayacını arttır
                const itemRef = doc(db, collectionName, docId);
                await updateDoc(itemRef, {
                    views: increment(1)
                }).catch(() => { }); // Hata olursa (örn doküman yoksa) sessiz kal

                // 2. Genel İstatistik (Admin Grafiği İçin)
                const today = new Date().toISOString().split('T')[0]; // 2026-02-04
                const statsRef = doc(db, "stats", today);

                // Doküman varsa arttır, yoksa oluştur
                const statsSnap = await getDoc(statsRef);
                if (statsSnap.exists()) {
                    await updateDoc(statsRef, { totalViews: increment(1) });
                } else {
                    await setDoc(statsRef, { totalViews: 1, date: today });
                }

            } catch (error) {
                console.error("Sayaç hatası:", error);
            }
        };

        registerView();
    }, [collectionName, docId]);

    return null; // Ekranda görünmez
}
