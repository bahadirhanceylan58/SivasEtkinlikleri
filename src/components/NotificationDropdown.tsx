"use client";

import React, { useRef, useEffect } from 'react';
import { useNotifications } from '@/context/NotificationContext';
import { Bell, Check, Info, AlertTriangle, CheckCircle, XCircle, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface NotificationDropdownProps {
    onClose: () => void;
}

export default function NotificationDropdown({ onClose }: NotificationDropdownProps) {
    const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotifications();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    const handleNotificationClick = async (id: string, link?: string) => {
        await markAsRead(id);
        if (link) {
            router.push(link);
        }
        onClose();
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
            case 'reply': return <MessageCircle className="w-5 h-5 text-primary" />;
            case 'approval': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'info':
            default: return <Info className="w-5 h-5 text-primary" />;
        }
    };

    return (
        <div ref={dropdownRef} className="absolute right-0 mt-2 w-80 sm:w-96 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-slideInDown z-50">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                <h3 className="font-semibold text-white">Bildirimler</h3>
                {unreadCount > 0 && (
                    <button
                        onClick={() => markAllAsRead()}
                        className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                    >
                        <Check className="w-3 h-3" />
                        Tümünü Okundu İşaretle
                    </button>
                )}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                        <Bell className="w-12 h-12 mb-3 opacity-20" />
                        <p>Henüz bildiriminiz yok.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification.id, notification.link)}
                                className={`p-4 hover:bg-white/5 transition-colors cursor-pointer flex gap-3 ${!notification.read ? 'bg-primary/5' : ''}`}
                            >
                                <div className="mt-1 flex-shrink-0">
                                    {getIcon(notification.type)}
                                </div>
                                <div className="flex-1">
                                    <h4 className={`text-sm font-medium ${!notification.read ? 'text-white' : 'text-gray-300'}`}>
                                        {notification.title}
                                    </h4>
                                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                        {notification.message}
                                    </p>
                                    <p className="text-[10px] text-gray-500 mt-2">
                                        {new Date(notification.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString('tr-TR', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                {!notification.read && (
                                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
