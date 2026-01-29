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
            <div className="glass rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-500 hover:shadow-glow-lg flex flex-col h-full transform hover:scale-[1.02] hover:-translate-y-1 bg-card border-border">

                {/* Image Section */}
                <div className="relative h-48 w-full overflow-hidden bg-muted">
                    {event.imageUrl ? (
                        <>
                            <Image
                                src={event.imageUrl}
                                alt={event.title}
                                fill
                                className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-75"
                                unoptimized
                            />
                            {/* Gradient Overlay on Hover */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                            <span className="text-4xl mb-2 opacity-50">📷</span>
                            <span className="text-xs font-medium uppercase tracking-wider opacity-70">Görsel Yok</span>
                        </div>
                    )}

                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 glass-strong text-foreground text-xs font-medium rounded-full border border-border backdrop-blur-md">
                            {event.subCategory || event.category}
                        </span>
                    </div>

                    {/* Date Badge (Top Right) */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2 items-end z-10">
                        <div className="bg-primary text-black font-bold px-3 py-1 rounded-lg text-sm shadow-lg w-fit transform transition-transform group-hover:scale-110">
                            {formattedDate}
                        </div>
                        <FavoriteButton eventId={event.id} />
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors duration-300">
                        {event.title}
                    </h3>

                    <div className="space-y-2 mb-4">
                        <div className="flex items-center text-muted-foreground text-sm group-hover:text-foreground transition-colors">
                            <MapPin className="w-4 h-4 mr-2 text-primary flex-shrink-0" />
                            <span className="line-clamp-1">{event.location}</span>
                        </div>

                        <div className="flex items-center text-muted-foreground text-sm group-hover:text-foreground transition-colors">
                            <Clock className="w-4 h-4 mr-2 text-primary flex-shrink-0" />
                            <span>{formattedTime}</span>
                        </div>
                    </div>

                    {/* Badges */}
                    {event.badges && event.badges.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {event.badges.map((badge, index) => (
                                <span key={index} className="text-[10px] px-2 py-1 rounded bg-muted text-muted-foreground border border-border hover:border-primary/30 transition-colors">
                                    {badge}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Footer / Price */}
                    <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">Biletler</span>
                            <span className="text-primary font-bold text-lg">
                                {event.ticketTypes && event.ticketTypes.length > 0 && event.ticketTypes[0].price > 0
                                    ? `₺${event.ticketTypes[0].price}`
                                    : 'Ücretsiz'}
                            </span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all duration-300 group-hover:scale-110">
                            {event.salesType === 'external' ? <ExternalLink className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default EventCard;
