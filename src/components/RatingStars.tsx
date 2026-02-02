import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
    rating: number;
    maxRating?: number;
    size?: 'sm' | 'md' | 'lg';
    interactive?: boolean;
    onRatingChange?: (rating: number) => void;
    showValue?: boolean;
}

const RatingStars: React.FC<RatingStarsProps> = ({
    rating,
    maxRating = 5,
    size = 'md',
    interactive = false,
    onRatingChange,
    showValue = false
}) => {
    const [hoverRating, setHoverRating] = useState(0);
    const [currentRating, setCurrentRating] = useState(rating);

    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    };

    const handleClick = (value: number) => {
        if (interactive) {
            setCurrentRating(value);
            onRatingChange?.(value);
        }
    };

    const handleMouseEnter = (value: number) => {
        if (interactive) {
            setHoverRating(value);
        }
    };

    const handleMouseLeave = () => {
        if (interactive) {
            setHoverRating(0);
        }
    };

    const displayRating = interactive ? (hoverRating || currentRating) : rating;

    return (
        <div className="flex items-center gap-1">
            {[...Array(maxRating)].map((_, index) => {
                const starValue = index + 1;
                const isFilled = starValue <= displayRating;
                const isPartial = !isFilled && starValue - 0.5 <= displayRating;

                return (
                    <div
                        key={index}
                        className={`relative ${interactive ? 'cursor-pointer' : ''}`}
                        onClick={() => handleClick(starValue)}
                        onMouseEnter={() => handleMouseEnter(starValue)}
                        onMouseLeave={handleMouseLeave}
                    >
                        <Star
                            className={`${sizeClasses[size]} transition-all duration-200 ${isFilled
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : isPartial
                                        ? 'fill-yellow-400/50 text-yellow-400'
                                        : 'fill-none text-muted-foreground'
                                } ${interactive ? 'hover:scale-110' : ''}`}
                        />
                    </div>
                );
            })}
            {showValue && (
                <span className="text-sm font-semibold text-foreground ml-2">
                    {displayRating.toFixed(1)}
                </span>
            )}
        </div>
    );
};

export default RatingStars;
