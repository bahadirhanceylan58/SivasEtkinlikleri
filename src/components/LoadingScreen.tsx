'use client';

import React, { useEffect, useState } from 'react';

interface LoadingScreenProps {
    isLoading: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isLoading }) => {
    const [fadeOut, setFadeOut] = useState(false);
    const [shouldRender, setShouldRender] = useState(true);

    useEffect(() => {
        if (!isLoading) {
            // Start fade out animation
            setFadeOut(true);
            // Give time for fade out animation before unmounting
            const timer = setTimeout(() => {
                setShouldRender(false);
            }, 500);
            return () => clearTimeout(timer);
        } else {
            setFadeOut(false);
            setShouldRender(true);
        }
    }, [isLoading]);

    if (!shouldRender) return null;

    return (
        <div
            className={`
                fixed inset-0 z-[10000] 
                bg-black flex items-center justify-center
                transition-opacity duration-500
                ${fadeOut ? 'opacity-0' : 'opacity-100'}
            `}
        >
            <div className="text-center">
                {/* Animated Logo/Brand */}
                <div className="relative mb-8">
                    <div className="w-32 h-32 mx-auto relative">
                        {/* Pulsing circle */}
                        <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                        <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse" />

                        {/* Center icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-6xl font-bold text-primary animate-pulse">
                                SE
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loading text */}
                <h2 className="text-xl font-bold text-white mb-4 animate-pulse">
                    Sivas Etkinlikleri
                </h2>

                {/* Loading bar */}
                <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden mx-auto">
                    <div className="h-full bg-primary w-1/2 animate-shimmer" />
                </div>

                <p className="text-gray-400 text-sm mt-4 animate-pulse">
                    Yükleniyor...
                </p>
            </div>
        </div>
    );
};

export default LoadingScreen;
