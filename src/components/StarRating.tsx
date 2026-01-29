"use client";

import { Star } from 'lucide-react';
import { useState } from 'react';

interface StarRatingProps {
    rating: number; // Current rating (0-5)
    setRating?: (rating: number) => void; // Optional setter for interactive mode
    readOnly?: boolean; // If true, non-interactive
    size?: number; // Size of stars
    showCount?: boolean; // Show textual count (e.g. 4.5)
}

export default function StarRating({
    rating,
    setRating,
    readOnly = false,
    size = 20,
    showCount = false
}: StarRatingProps) {
    const [hoverRating, setHoverRating] = useState(0);

    const handleMouseEnter = (index: number) => {
        if (!readOnly) {
            setHoverRating(index);
        }
    };

    const handleMouseLeave = () => {
        if (!readOnly) {
            setHoverRating(0);
        }
    };

    const handleClick = (index: number) => {
        if (!readOnly && setRating) {
            setRating(index);
        }
    };

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((index) => {
                // Determined if filled based on hover or actual rating
                const isFilled = (hoverRating || rating) >= index;

                return (
                    <button
                        key={index}
                        type="button"
                        onClick={() => handleClick(index)}
                        onMouseEnter={() => handleMouseEnter(index)}
                        onMouseLeave={handleMouseLeave}
                        disabled={readOnly}
                        className={`transition-all duration-200 ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
                    >
                        <Star
                            size={size}
                            className={`${isFilled
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'fill-transparent text-neutral-300 dark:text-neutral-700'
                                }`}
                        />
                    </button>
                );
            })}
            {showCount && (
                <span className="ml-2 text-sm font-medium text-muted-foreground">
                    {rating > 0 ? rating.toFixed(1) : ''}
                </span>
            )}
        </div>
    );
}
