'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
    targetDate: string; // ISO format date string
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate }) => {
    const calculateTimeLeft = useCallback((): TimeLeft => {
        const difference = new Date(targetDate).getTime() - new Date().getTime();

        if (difference > 0) {
            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }

        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }, [targetDate]);

    const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [calculateTimeLeft]);

    const isExpired = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

    if (isExpired) {
        return (
            <div className="glass-strong rounded-xl p-4 border border-white/10 text-center">
                <p className="text-red-400 font-bold">Etkinlik Başladı!</p>
            </div>
        );
    }

    const timeUnits = [
        { label: 'Gün', value: timeLeft.days },
        { label: 'Saat', value: timeLeft.hours },
        { label: 'Dakika', value: timeLeft.minutes },
        { label: 'Saniye', value: timeLeft.seconds },
    ];

    return (
        <div className="glass-strong rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-white">Etkinliğe Kalan Süre</h3>
            </div>

            <div className="grid grid-cols-4 gap-3">
                {timeUnits.map((unit, index) => (
                    <div
                        key={unit.label}
                        className="glass rounded-lg p-3 text-center transform transition-all hover:scale-105"
                    >
                        <div className="text-2xl md:text-3xl font-bold text-primary tabular-nums">
                            {String(unit.value).padStart(2, '0')}
                        </div>
                        <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider">
                            {unit.label}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CountdownTimer;
