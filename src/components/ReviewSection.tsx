import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import ReviewCard, { Review } from './ReviewCard';
import RatingStars from './RatingStars';
import { MessageSquare, Star, BarChart3 } from 'lucide-react';

interface ReviewSectionProps {
    eventId?: string;
    courseId?: string;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ eventId, courseId }) => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [editingReview, setEditingReview] = useState<Review | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Fetch reviews
    useEffect(() => {
        fetchReviews();
    }, [eventId, courseId]);

    const fetchReviews = async () => {
        try {
            const reviewsRef = collection(db, 'reviews');
            const q = query(
                reviewsRef,
                eventId ? where('eventId', '==', eventId) : where('courseId', '==', courseId),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);
            const reviewsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Review[];
            setReviews(reviewsData);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || rating === 0 || !comment.trim()) return;

        setSubmitting(true);
        try {
            if (editingReview) {
                // Update existing review
                await updateDoc(doc(db, 'reviews', editingReview.id), {
                    rating,
                    comment: comment.trim(),
                    updatedAt: Timestamp.now(),
                    isEdited: true
                });
            } else {
                // Create new review
                await addDoc(collection(db, 'reviews'), {
                    eventId: eventId || null,
                    courseId: courseId || null,
                    userId: user.uid,
                    userName: user.displayName || 'Anonim',
                    userAvatar: user.photoURL || null,
                    rating,
                    comment: comment.trim(),
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now(),
                    likes: 0,
                    likedBy: [],
                    isEdited: false
                });
            }

            // Reset form
            setRating(0);
            setComment('');
            setShowForm(false);
            setEditingReview(null);
            fetchReviews();
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Yorum gönderilirken bir hata oluştu.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleLikeReview = async (reviewId: string) => {
        if (!user) return;

        try {
            const review = reviews.find(r => r.id === reviewId);
            if (!review) return;

            const hasLiked = review.likedBy.includes(user.uid);
            const newLikedBy = hasLiked
                ? review.likedBy.filter(id => id !== user.uid)
                : [...review.likedBy, user.uid];

            await updateDoc(doc(db, 'reviews', reviewId), {
                likes: newLikedBy.length,
                likedBy: newLikedBy
            });

            fetchReviews();
        } catch (error) {
            console.error('Error liking review:', error);
        }
    };

    const handleEditReview = (reviewId: string) => {
        const review = reviews.find(r => r.id === reviewId);
        if (review) {
            setEditingReview(review);
            setRating(review.rating);
            setComment(review.comment);
            setShowForm(true);
        }
    };

    const handleDeleteReview = async (reviewId: string) => {
        if (!confirm('Bu yorumu silmek istediğinizden emin misiniz?')) return;

        try {
            await deleteDoc(doc(db, 'reviews', reviewId));
            fetchReviews();
        } catch (error) {
            console.error('Error deleting review:', error);
            alert('Yorum silinirken bir hata oluştu.');
        }
    };

    // Calculate average rating
    const averageRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    // Rating distribution
    const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter(r => r.rating === star).length,
        percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 : 0
    }));

    return (
        <div className="space-y-6">
            {/* Header & Stats */}
            <div className="glass p-6 rounded-2xl border border-border">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2 mb-2">
                            <MessageSquare className="w-6 h-6 text-primary" />
                            Değerlendirmeler
                        </h2>
                        <p className="text-muted-foreground text-sm">
                            {reviews.length} değerlendirme
                        </p>
                    </div>

                    {user && !showForm && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="px-4 py-2 bg-primary text-black rounded-full font-medium text-sm hover:bg-primary/90 transition-all"
                        >
                            Değerlendirme Yaz
                        </button>
                    )}
                </div>

                {/* Average Rating */}
                {reviews.length > 0 && (
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-xl">
                            <div className="text-5xl font-bold text-foreground mb-2">
                                {averageRating.toFixed(1)}
                            </div>
                            <RatingStars rating={averageRating} size="lg" showValue={false} />
                            <p className="text-sm text-muted-foreground mt-2">
                                {reviews.length} değerlendirme
                            </p>
                        </div>

                        {/* Rating Distribution */}
                        <div className="space-y-2">
                            {ratingDistribution.map(({ star, count, percentage }) => (
                                <div key={star} className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 w-16">
                                        <span className="text-sm font-medium text-foreground">{star}</span>
                                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    </div>
                                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary transition-all duration-300"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <span className="text-sm text-muted-foreground w-12 text-right">
                                        {count}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Review Form */}
            {showForm && user && (
                <div className="glass p-6 rounded-2xl border border-border">
                    <h3 className="text-lg font-bold text-foreground mb-4">
                        {editingReview ? 'Değerlendirmeyi Düzenle' : 'Değerlendirme Yaz'}
                    </h3>
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Puanınız
                            </label>
                            <RatingStars
                                rating={rating}
                                interactive
                                size="lg"
                                onRatingChange={setRating}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Yorumunuz
                            </label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground resize-none"
                                rows={4}
                                placeholder="Deneyiminizi paylaşın..."
                                required
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                type="submit"
                                disabled={submitting || rating === 0}
                                className="px-6 py-2 bg-primary text-black rounded-full font-medium text-sm hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Gönderiliyor...' : editingReview ? 'Güncelle' : 'Gönder'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingReview(null);
                                    setRating(0);
                                    setComment('');
                                }}
                                className="px-6 py-2 bg-muted text-foreground rounded-full font-medium text-sm hover:bg-muted/80 transition-all"
                            >
                                İptal
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-8 text-muted-foreground">
                        Yükleniyor...
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-12 glass rounded-2xl border border-border">
                        <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                        <p className="text-muted-foreground">Henüz değerlendirme yapılmamış.</p>
                        {user && (
                            <button
                                onClick={() => setShowForm(true)}
                                className="mt-4 px-6 py-2 bg-primary text-black rounded-full font-medium text-sm hover:bg-primary/90 transition-all"
                            >
                                İlk Değerlendirmeyi Siz Yapın
                            </button>
                        )}
                    </div>
                ) : (
                    reviews.map(review => (
                        <ReviewCard
                            key={review.id}
                            review={review}
                            currentUserId={user?.uid}
                            onLike={handleLikeReview}
                            onEdit={handleEditReview}
                            onDelete={handleDeleteReview}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default ReviewSection;
