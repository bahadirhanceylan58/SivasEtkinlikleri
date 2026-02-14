import React, { useState } from 'react';
import Image from 'next/image';
import { ThumbsUp, Edit2, Trash2, User, Reply } from 'lucide-react';
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
    images?: string[];
    createdAt: any;
    updatedAt: any;
    likes: number;
    likedBy: string[];
    isEdited: boolean;
    reply?: {
        text: string;
        createdAt: any;
        authorName: string;
        authorId: string;
    };
}

interface ReviewCardProps {
    review: Review;
    currentUserId?: string;
    onLike?: (reviewId: string) => void;
    onEdit?: (reviewId: string) => void;
    onDelete?: (reviewId: string) => void;
    onReply?: (reviewId: string, text: string) => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
    review,
    currentUserId,
    onLike,
    onEdit,
    onDelete,
    onReply
}) => {
    const isOwner = currentUserId === review.userId;
    const hasLiked = currentUserId ? review.likedBy.includes(currentUserId) : false;
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyText, setReplyText] = useState("");

    const formatDate = (timestamp: any) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000 || timestamp);
        return date.toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const handleReplySubmit = () => {
        if (replyText.trim() && onReply) {
            onReply(review.id, replyText);
            setShowReplyForm(false);
            setReplyText("");
        }
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

            {/* Images */}
            {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                    {review.images.map((img, idx) => (
                        <div key={idx} className="relative w-20 h-20 flex-shrink-0 cursor-pointer hover:opacity-90 rounded-lg overflow-hidden border border-border">
                            <Image src={img} alt={`Review image ${idx}`} fill className="object-cover" />
                        </div>
                    ))}
                </div>
            )}

            {/* Footer Actions (Like & Reply) */}
            <div className="flex items-center gap-4 mt-2">
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

                {/* Show reply button only if instructor/admin (logic passed via onReply presence) and no reply exists */}
                {onReply && !review.reply && (
                    <button
                        onClick={() => setShowReplyForm(!showReplyForm)}
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                        <Reply className="w-3.5 h-3.5" />
                        Yanıtla
                    </button>
                )}
            </div>

            {/* Reply Input */}
            {showReplyForm && (
                <div className="mt-3 pl-4 border-l-2 border-primary/20">
                    <textarea
                        className="w-full bg-muted/50 rounded-lg p-2 text-sm border-border focus:ring-1 focus:ring-primary outline-none"
                        placeholder="Yanıtınızı yazın..."
                        rows={2}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                    />
                    <div className="flex justify-end gap-2 mt-2">
                        <button onClick={() => setShowReplyForm(false)} className="text-xs text-muted-foreground hover:text-foreground">İptal</button>
                        <button onClick={handleReplySubmit} className="text-xs bg-primary text-black px-3 py-1 rounded-full font-medium">Gönder</button>
                    </div>
                </div>
            )}

            {/* Existing Reply */}
            {review.reply && (
                <div className="mt-4 bg-muted/30 p-3 rounded-lg border-l-2 border-primary">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-primary">{review.reply.authorName}</span>
                        <span className="text-[10px] text-muted-foreground">{formatDate(review.reply.createdAt)}</span>
                    </div>
                    <p className="text-sm text-foreground/90">{review.reply.text}</p>
                </div>
            )}
        </div>
    );
};

export default ReviewCard;
