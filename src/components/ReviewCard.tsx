import React from 'react';
import Image from 'next/image';
import { ThumbsUp, Edit2, Trash2, User } from 'lucide-react';
import RatingStars from './RatingStars';

export interface Review {
    id: string;
    eventId?: string;
    courseId?: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    rating: number;
    comment: string;
    createdAt: any;
    updatedAt: any;
    likes: number;
    likedBy: string[];
    isEdited: boolean;
}

interface ReviewCardProps {
    review: Review;
    currentUserId?: string;
    onLike?: (reviewId: string) => void;
    onEdit?: (reviewId: string) => void;
    onDelete?: (reviewId: string) => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
    review,
    currentUserId,
    onLike,
    onEdit,
    onDelete
}) => {
    const isOwner = currentUserId === review.userId;
    const hasLiked = currentUserId ? review.likedBy.includes(currentUserId) : false;

    const formatDate = (timestamp: any) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <div className="glass p-4 rounded-xl border border-border">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    {review.userAvatar ? (
                        <Image
                            src={review.userAvatar}
                            alt={review.userName}
                            width={40}
                            height={40}
                            className="rounded-full"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                        </div>
                    )}
                    <div>
                        <h4 className="font-semibold text-foreground">{review.userName}</h4>
                        <div className="flex items-center gap-2">
                            <RatingStars rating={review.rating} size="sm" />
                            <span className="text-xs text-muted-foreground">
                                {formatDate(review.createdAt)}
                                {review.isEdited && ' (düzenlendi)'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Actions for owner */}
                {isOwner && (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => onEdit?.(review.id)}
                            className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                            aria-label="Düzenle"
                        >
                            <Edit2 className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button
                            onClick={() => onDelete?.(review.id)}
                            className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors"
                            aria-label="Sil"
                        >
                            <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                    </div>
                )}
            </div>

            {/* Comment */}
            <p className="text-foreground mb-3 text-sm leading-relaxed">{review.comment}</p>

            {/* Like Button */}
            <button
                onClick={() => onLike?.(review.id)}
                disabled={!currentUserId}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${hasLiked
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    } ${!currentUserId ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <ThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? 'fill-current' : ''}`} />
                <span>{review.likes > 0 ? review.likes : 'Beğen'}</span>
            </button>
        </div>
    );
};

export default ReviewCard;
