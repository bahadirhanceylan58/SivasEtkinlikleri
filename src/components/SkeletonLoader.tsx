import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string;
    height?: string;
    count?: number;
}

const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    variant = 'rectangular',
    width,
    height,
    count = 1,
}) => {
    const baseStyles = 'skeleton rounded';

    const variantStyles = {
        text: 'h-4 w-full rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-lg',
    };

    const style = {
        width: width || (variant === 'circular' ? height : undefined),
        height: height || (variant === 'text' ? '1rem' : undefined),
    };

    if (count > 1) {
        return (
            <div className="space-y-2">
                {Array.from({ length: count }).map((_, index) => (
                    <div
                        key={index}
                        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
                        style={style}
                    />
                ))}
            </div>
        );
    }

    return (
        <div
            className={`${baseStyles} ${variantStyles[variant]} ${className}`}
            style={style}
        />
    );
};

// Preset skeleton components
export const SkeletonCard: React.FC = () => {
    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden p-5 space-y-4">
            <Skeleton variant="rectangular" height="12rem" className="mb-4" />
            <Skeleton variant="text" height="1.5rem" className="w-3/4" />
            <Skeleton variant="text" count={2} />
            <div className="flex justify-between items-center pt-4">
                <Skeleton variant="text" width="4rem" />
                <Skeleton variant="circular" width="2.5rem" height="2.5rem" />
            </div>
        </div>
    );
};

export const SkeletonText: React.FC<{ lines?: number }> = ({ lines = 3 }) => {
    return <Skeleton variant="text" count={lines} />;
};

export const SkeletonAvatar: React.FC<{ size?: string }> = ({ size = '2.5rem' }) => {
    return <Skeleton variant="circular" width={size} height={size} />;
};

export default Skeleton;
