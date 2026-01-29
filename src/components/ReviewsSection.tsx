"use client";

import { useState } from 'react';
import { MessageSquare, Star } from 'lucide-react';
import ReviewList from './ReviewList';
import ReviewForm from './ReviewForm';

interface ReviewsSectionProps {
    eventId: string;
    averageRating?: number; // Optional: If we track it in event doc later
    reviewCount?: number;   // Optional
}

export default function ReviewsSection({ eventId, averageRating = 0, reviewCount = 0 }: ReviewsSectionProps) {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleReviewSubmitted = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-primary rounded-full" />
                <h2 className="text-2xl font-bold text-foreground">Değerlendirmeler</h2>
                {reviewCount > 0 && (
                    <div className="flex items-center gap-2 text-muted-foreground ml-auto bg-muted/20 px-3 py-1 rounded-full">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-bold text-foreground">{averageRating.toFixed(1)}</span>
                        <span className="text-sm">({reviewCount} yorum)</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* List Section */}
                <div className="lg:col-span-2 order-2 lg:order-1">
                    <div className="glass-strong border border-border rounded-2xl p-6">
                        <ReviewList eventId={eventId} refreshTrigger={refreshTrigger} />
                    </div>
                </div>

                {/* Form Section */}
                <div className="order-1 lg:order-2">
                    <div className="sticky top-24">
                        <ReviewForm eventId={eventId} onReviewSubmitted={handleReviewSubmitted} />
                    </div>
                </div>
            </div>
        </div>
    );
}
