import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import ReviewCard, { Review } from './ReviewCard';
import RatingStars from './RatingStars';
import { MessageSquare, Star, BarChart3, Image as ImageIcon, X, ArrowUpDown } from 'lucide-react';
import Image from 'next/image';

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
    const [images, setImages] = useState<File[]>([]);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [editingReview, setEditingReview] = useState<Review | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

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

            setReviews(sortReviews(reviewsData, sortBy));
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const sortReviews = (data: Review[], sortType: string) => {
        const sorted = [...data];
        switch (sortType) {
            case 'newest':
                return sorted.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
            case 'oldest':
                return sorted.sort((a, b) => a.createdAt?.seconds - b.createdAt?.seconds);
            case 'highest':
                return sorted.sort((a, b) => b.rating - a.rating);
            case 'lowest':
                return sorted.sort((a, b) => a.rating - b.rating);
            default:
                return sorted;
        }
    };

    useEffect(() => {
        setReviews(prev => sortReviews(prev, sortBy));
    }, [sortBy]);

    const MAX_COMMENT_LENGTH = 1000;

    // HTML etiketlerini temizle
    const sanitizeInput = (input: string): string => {
        return input.replace(/<[^>]*>/g, '').trim();
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newImages = Array.from(e.target.files);
            if (images.length + newImages.length > 3) {
                alert('En fazla 3 fotoğraf yükleyebilirsiniz.');
                return;
            }
            setImages(prev => [...prev, ...newImages]);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (urlToRemove: string) => {
        setImageUrls(prev => prev.filter(url => url !== urlToRemove));
    }

    const uploadImages = async (): Promise<string[]> => {
        if (images.length === 0) return [];
        setIsUploading(true);
        const uploadedUrls: string[] = [];

        try {
            for (const image of images) {
                const storageRef = ref(storage, `reviews/${Date.now()}_${image.name}`);
                await uploadBytes(storageRef, image);
                const url = await getDownloadURL(storageRef);
                uploadedUrls.push(url);
            }
        } catch (error) {
            console.error("Error uploading images:", error);
            alert("Fotoğraflar yüklenirken bir hata oluştu.");
        } finally {
            setIsUploading(false);
        }
        return uploadedUrls;
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || rating === 0 || !comment.trim()) return;

        const sanitizedComment = sanitizeInput(comment);
        if (sanitizedComment.length > MAX_COMMENT_LENGTH) {
            alert(`Yorum en fazla ${MAX_COMMENT_LENGTH} karakter olabilir.`);
            return;
        }
        if (sanitizedComment.length === 0) {
            alert("Geçerli bir yorum giriniz.");
            return;
        }

        setSubmitting(true);
        try {
            const uploadedImageUrls = await uploadImages();
            const finalImageUrls = [...imageUrls, ...uploadedImageUrls];

            if (editingReview) {
                // Update existing review
                await updateDoc(doc(db, 'reviews', editingReview.id), {
                    rating,
                    comment: sanitizedComment,
                    images: finalImageUrls,
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
                    comment: sanitizedComment,
                    images: finalImageUrls,
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
            setImages([]);
            setImageUrls([]);
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

            // Optimistic update
            setReviews(prev => prev.map(r =>
                r.id === reviewId
                    ? { ...r, likes: newLikedBy.length, likedBy: newLikedBy }
                    : r
            ));
        } catch (error) {
            console.error('Error liking review:', error);
            // Revert details from server if needed, or fetchReviews
            fetchReviews();
        }
    };

    const handleEditReview = (reviewId: string) => {
        const review = reviews.find(r => r.id === reviewId);
        if (review) {
            setEditingReview(review);
            setRating(review.rating);
            setComment(review.comment);
            setImageUrls(review.images || []);
            setImages([]);
            setShowForm(true);
        }
    };

    const handleDeleteReview = async (reviewId: string) => {
        if (!confirm('Bu yorumu silmek istediğinizden emin misiniz?')) return;

        try {
            await deleteDoc(doc(db, 'reviews', reviewId));
            setReviews(prev => prev.filter(r => r.id !== reviewId));
        } catch (error) {
            console.error('Error deleting review:', error);
            alert('Yorum silinirken bir hata oluştu.');
        }
    };

    const handleReply = async (reviewId: string, replyText: string) => {
        if (!user) return;

        try {
            const reviewRef = doc(db, 'reviews', reviewId);
            await updateDoc(reviewRef, {
                reply: {
                    text: replyText,
                    createdAt: Timestamp.now(),
                    authorName: user.displayName || 'Admin',
                    authorId: user.uid
                }
            });

            // Find the review to get the author ID
            const review = reviews.find(r => r.id === reviewId);
            if (review && review.userId !== user.uid) {
                await addDoc(collection(db, 'notifications'), {
                    userId: review.userId,
                    type: 'reply',
                    title: 'Yorumunuza Yanıt Geldi',
                    message: `${user.displayName || 'Yönetici'} yorumunuza yanıt verdi.`,
                    link: `/kurslar/${courseId}?tab=reviews`,
                    read: false,
                    createdAt: Timestamp.now()
                });
            }

            // Refresh reviews
            fetchReviews();
        } catch (error) {
            console.error("Error replying to review:", error);
            alert("Yanıt gönderilirken bir hata oluştu.");
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
                <div className="flex flex-col md:flex-row md:items-start justify-between mb-6 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2 mb-2">
                            <MessageSquare className="w-6 h-6 text-primary" />
                            Değerlendirmeler
                        </h2>
                        <div className="flex items-center gap-4">
                            <p className="text-muted-foreground text-sm">
                                {reviews.length} değerlendirme
                            </p>

                            {/* Sorting Dropdown */}
                            {reviews.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as any)}
                                        className="bg-transparent text-sm text-foreground border-none focus:ring-0 cursor-pointer"
                                    >
                                        <option value="newest" className="text-black">En Yeniler</option>
                                        <option value="oldest" className="text-black">En Eskiler</option>
                                        <option value="highest" className="text-black">En Yüksek Puan</option>
                                        <option value="lowest" className="text-black">En Düşük Puan</option>
                                    </select>
                                </div>
                            )}
                        </div>
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

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Fotoğraflar (İsteğe bağlı, maks 3)
                            </label>
                            <div className="flex flex-wrap gap-4">
                                {imageUrls.map((url, index) => (
                                    <div key={`url-${index}`} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border group">
                                        <Image src={url} alt="Review" fill className="object-cover" />
                                        <button type="button" onClick={() => removeExistingImage(url)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {images.map((file, index) => (
                                    <div key={`file-${index}`} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border group">
                                        <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {(images.length + imageUrls.length) < 3 && (
                                    <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors">
                                        <ImageIcon className="w-6 h-6 text-muted-foreground" />
                                        <span className="text-[10px] text-muted-foreground mt-1">Ekle</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                type="submit"
                                disabled={submitting || rating === 0 || isUploading}
                                className="px-6 py-2 bg-primary text-black rounded-full font-medium text-sm hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting || isUploading ? 'Gönderiliyor...' : editingReview ? 'Güncelle' : 'Gönder'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingReview(null);
                                    setRating(0);
                                    setComment('');
                                    setImages([]);
                                    setImageUrls([]);
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
                            onReply={handleReply}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default ReviewSection;
