"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import StarRating from './StarRating';
import Link from 'next/link';

interface ReviewFormProps {
    eventId: string;
    onReviewSubmitted?: () => void;
}

export default function ReviewForm({ eventId, onReviewSubmitted }: ReviewFormProps) {
    const { user } = useAuth();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!user) return;

        if (rating === 0) {
            setError('Lütfen bir puan seçin.');
            return;
        }

        if (comment.trim().length < 10) {
            setError('Yorumunuz en az 10 karakter olmalıdır.');
            return;
        }

        if (/<[^>]*>/g.test(comment)) {
            setError('Yorumunuzda HTML etiketleri kullanamazsınız.');
            return;
        }

        setLoading(true);

        try {
            // 1. Add review to subcollection
            await addDoc(collection(db, "events", eventId, "reviews"), {
                uid: user.uid,
                userName: user.displayName || user.email?.split('@')[0] || 'Anonim',
                userImage: user.photoURL || null,
                rating,
                comment: comment.trim(),
                createdAt: serverTimestamp(),
            });

            // 2. Update event stats (Optional: can be done via Cloud Functions, but doing client-side for MVP)
            // Note: This simple increment approach doesn't handle existing average recalculation perfectly without reading all, 
            // but is fine for a start or we just calculate average on read.
            // Let's just track count for now or skip aggregation update to avoid complexity/consistency issues.
            // We'll rely on reading all reviews to compute average in the UI.

            setRating(0);
            setComment('');
            if (onReviewSubmitted) onReviewSubmitted();

        } catch (err) {
            console.error("Yorum gönderme hatası:", err);
            setError("Yorum gönderilirken bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="bg-muted/30 border border-border rounded-xl p-6 text-center">
                <p className="text-muted-foreground mb-4">Yorum yapabilmek için giriş yapmalısınız.</p>
                <Link
                    href={`/login?redirect=/etkinlik/${eventId}`}
                    className="inline-block px-6 py-2 bg-primary text-black font-semibold rounded-lg hover:bg-primary-hover transition-colors"
                >
                    Giriş Yap
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4">Değerlendirme Yap</h3>

            {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="mb-4">
                <label className="block text-sm font-medium text-muted-foreground mb-2">Puanınız</label>
                <StarRating rating={rating} setRating={setRating} size={28} />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-muted-foreground mb-2">Yorumunuz</label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Etkinlik hakkında düşüncelerinizi paylaşın..."
                    className="w-full min-h-[120px] bg-background border border-border rounded-lg p-3 text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all resize-none"
                    disabled={loading}
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 bg-primary text-black font-bold rounded-xl transition-all hover:scale-[1.01] ${loading ? 'opacity-70 cursor-wait' : 'hover:bg-primary-hover'}`}
            >
                {loading ? 'Gönderiliyor...' : 'Yorumu Gönder'}
            </button>
        </form>
    );
}
