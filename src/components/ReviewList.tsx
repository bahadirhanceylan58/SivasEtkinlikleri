"use client";

import { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import StarRating from './StarRating';
import { User } from 'lucide-react';

interface Review {
    id: string;
    uid: string;
    userName: string;
    userImage?: string;
    rating: number;
    comment: string;
    createdAt?: Timestamp;
}

interface ReviewListProps {
    eventId: string;
    refreshTrigger?: number; // Prop to trigger refetch
}

export default function ReviewList({ eventId, refreshTrigger = 0 }: ReviewListProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            setLoading(true);
            try {
                const q = query(
                    collection(db, "events", eventId, "reviews"),
                    orderBy("createdAt", "desc")
                );

                const querySnapshot = await getDocs(q);
                const fetchedReviews = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Review[];

                setReviews(fetchedReviews);
            } catch (error) {
                console.error("Yorumlar çekilirken hata:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [eventId, refreshTrigger]);

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex gap-4">
                        <div className="w-10 h-10 bg-muted rounded-full" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-1/4" />
                            <div className="h-4 bg-muted rounded w-3/4" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <p>Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {reviews.map((review) => (
                <div key={review.id} className="flex gap-4 border-b border-border pb-6 last:border-0 last:pb-0">
                    <div className="flex-shrink-0">
                        {review.userImage ? (
                            <img
                                src={review.userImage}
                                alt={review.userName}
                                className="w-10 h-10 rounded-full object-cover border border-border"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                <span className="font-bold text-primary text-sm">
                                    {review.userName.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-foreground">{review.userName}</h4>
                            <span className="text-xs text-muted-foreground">
                                {review.createdAt?.toDate().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                        <div className="mb-2">
                            <StarRating rating={review.rating} readOnly size={14} />
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            {review.comment}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
