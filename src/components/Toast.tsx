'use client';

import React, { useEffect, useState } from 'react';
import { X, CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
    message: string;
    type?: ToastType;
    duration?: number;
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'info', duration = 3000, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger animation after mount
        requestAnimationFrame(() => {
            setIsVisible(true);
        });

        // Auto dismiss
        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation
    };

    const icons = {
        success: <CheckCircle className="w-5 h-5" />,
        error: <XCircle className="w-5 h-5" />,
        info: <Info className="w-5 h-5" />,
        warning: <AlertTriangle className="w-5 h-5" />,
    };

    const styles = {
        success: 'bg-green-500/20 border-green-500/50 text-green-400',
        error: 'bg-red-500/20 border-red-500/50 text-red-400',
        info: 'bg-blue-500/20 border-blue-500/50 text-blue-400',
        warning: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
    };

    return (
        <div
            className={`
                fixed top-4 right-4 z-[9999] 
                flex items-center gap-3 min-w-[300px] max-w-md
                p-4 rounded-xl border backdrop-blur-md
                transition-all duration-300 ease-out
                ${styles[type]}
                ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
            `}
        >
            <div className={`flex-shrink-0 ${styles[type]}`}>
                {icons[type]}
            </div>
            <p className="flex-1 text-sm font-medium text-white">{message}</p>
            <button
                onClick={handleClose}
                className="flex-shrink-0 hover:scale-110 transition-transform"
                aria-label="Kapat"
            >
                <X className="w-4 h-4 text-white/60 hover:text-white" />
            </button>
        </div>
    );
};

export default Toast;
