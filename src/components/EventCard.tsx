import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Clock, ArrowRight, Calendar, ExternalLink } from 'lucide-react';
import { Event } from "@/data/mockData";
import FavoriteButton from './FavoriteButton';

const EventCard: React.FC<{ event: Event }> = ({ event }) => {
    // Format date safely
    const formattedDate = new Date(event.date).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
    });

    const formattedTime = new Date(event.date).toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <Link href={`/etkinlik/${event.id}`} className="group block h-full">
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(250,204,21,0.15)] flex flex-col h-full">

                {/* Image Section */}
                <div className="relative h-48 w-full overflow-hidden bg-neutral-800">
                    {event.imageUrl ? (
                        <Image
                            src={event.imageUrl}
                            alt={event.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            unoptimized
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                            <span className="text-4xl mb-2 opacity-50">📷</span>
                            <span className="text-xs font-medium uppercase tracking-wider opacity-70">Görsel Yok</span>
                        </div>
                    )}

                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white/90 text-xs font-medium rounded-full border border-white/10">
                            {event.subCategory || event.category}
                        </span>
                    </div>

                    {/* Date Badge (Top Right) */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2 items-end z-10">
                        <div className="bg-primary text-black font-bold px-3 py-1 rounded-lg text-sm shadow-lg w-fit">
                            {formattedDate}
                        </div>
                        <FavoriteButton eventId={event.id} />
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                        {event.title}
                    </h3>

                    <div className="space-y-2 mb-4">
                        <div className="flex items-center text-gray-400 text-sm">
                            <MapPin className="w-4 h-4 mr-2 text-primary" />
                            <span className="line-clamp-1">{event.location}</span>
                        </div>

                        <div className="flex items-center text-gray-400 text-sm">
                            <Clock className="w-4 h-4 mr-2 text-primary" />
                            <span>{formattedTime}</span>
                        </div>
                    </div>

                    {/* Badges */}
                    {event.badges && event.badges.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {event.badges.map((badge, index) => (
                                <span key={index} className="text-[10px] px-2 py-1 rounded bg-white/5 text-gray-400 border border-white/5">
                                    {badge}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Footer / Price */}
                    <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500">Biletler</span>
                            <span className="text-primary font-bold text-lg">
                                {event.ticketTypes && event.ticketTypes.length > 0 && event.ticketTypes[0].price > 0
                                    ? `₺${event.ticketTypes[0].price}`
                                    : 'Ücretsiz'}
                            </span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-colors">
                            {event.salesType === 'external' ? <ExternalLink className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default EventCard;
