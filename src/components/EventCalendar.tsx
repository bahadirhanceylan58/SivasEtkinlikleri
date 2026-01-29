'use client';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';

interface Event {
    id: string;
    title: string;
    date: string;
    location: string;
    category?: string;
    imageUrl?: string;
}

interface EventCalendarProps {
    events: Event[];
}

export default function EventCalendar({ events }: EventCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

    // Helper functions for date manipulation
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        return days;
    };

    const getFirstDayOfMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        // 0 = Sunday, 1 = Monday... but we want Monday start (0=Mon, 6=Sun)
        let day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1;
    };

    const addMonths = (date: Date, amount: number) => {
        const newDate = new Date(date);
        newDate.setMonth(newDate.getMonth() + amount);
        return newDate;
    };

    const isSameDay = (d1: Date, d2: Date) => {
        return d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return isSameDay(date, today);
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' });
    };

    const formatMonthYear = (date: Date) => {
        return date.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
    };

    // Calendar Grid Generation
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayIndex = getFirstDayOfMonth(currentDate); // 0-6 (Mon-Sun)

    // Create array for days
    const calendarDays = [];

    // Add empty slots for previous month
    for (let i = 0; i < firstDayIndex; i++) {
        calendarDays.push(null);
    }

    // Add days of current month
    for (let i = 1; i <= daysInMonth; i++) {
        calendarDays.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
    }

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(addMonths(currentDate, -1));

    const getEventsForDay = (day: Date) => {
        return events.filter(event => {
            try {
                const eventDate = new Date(event.date);
                return isSameDay(eventDate, day);
            } catch (e) {
                return false;
            }
        });
    };

    const selectedDayEvents = selectedDate ? getEventsForDay(selectedDate) : [];

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Takvim */}
            <div className="flex-1">
                <div className="glass-strong p-6 rounded-2xl border border-border">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-foreground capitalize flex items-center gap-3">
                            <CalendarIcon className="w-6 h-6 text-primary" />
                            {formatMonthYear(currentDate)}
                        </h2>
                        <div className="flex gap-2">
                            <button onClick={prevMonth} className="p-2 glass rounded-lg hover:bg-muted transition-colors" aria-label="Önceki Ay" title="Önceki Ay">
                                <ChevronLeft className="w-5 h-5 text-foreground" />
                            </button>
                            <button onClick={nextMonth} className="p-2 glass rounded-lg hover:bg-muted transition-colors" aria-label="Sonraki Ay" title="Sonraki Ay">
                                <ChevronRight className="w-5 h-5 text-foreground" />
                            </button>
                        </div>
                    </div>

                    {/* Günler Başlık */}
                    <div className="grid grid-cols-7 mb-4">
                        {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
                            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Günler Grid */}
                    <div className="grid grid-cols-7 gap-2">
                        {calendarDays.map((day, idx) => {
                            if (!day) return <div key={`empty-${idx}`} />;

                            const dayEvents = getEventsForDay(day);
                            const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                            const isCurrentDay = isToday(day);
                            const hasEvent = dayEvents.length > 0;
                            const firstEventImage = hasEvent ? dayEvents[0].imageUrl : null;
                            const dateLabel = day.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

                            return (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedDate(day)}
                                    aria-label={`${dateLabel} - ${dayEvents.length} Etkinlik`}
                                    title={`${dateLabel} - ${dayEvents.length} Etkinlik`}
                                    className={`
                                        aspect-square rounded-xl relative group transition-all duration-300 overflow-hidden
                                        flex flex-col items-center justify-start pt-2
                                        text-foreground
                                        ${isSelected ? 'ring-2 ring-primary scale-105 z-10' : 'hover:scale-105'}
                                        ${!hasEvent ? 'bg-muted/30 hover:bg-muted/60' : ''}
                                        ${isCurrentDay && !isSelected && !hasEvent ? 'ring-1 ring-primary' : ''}
                                    `}
                                >
                                    {/* Event Image Background */}
                                    {hasEvent && firstEventImage && (
                                        <>
                                            <div
                                                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                                style={{ backgroundImage: `url(${firstEventImage})` }}
                                            />
                                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                                        </>
                                    )}

                                    {/* Arkaplan yoksa ve etkinlik vars ama resim yoksa */}
                                    {hasEvent && !firstEventImage && (
                                        <div className="absolute inset-0 bg-primary/20" />
                                    )}

                                    {/* Date Number */}
                                    <span className={`
                                        relative z-10 text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full
                                        ${isCurrentDay ? 'bg-primary text-black' : ''}
                                        ${hasEvent && firstEventImage ? 'text-white drop-shadow-md' : ''}
                                        ${hasEvent && !firstEventImage && !isCurrentDay ? 'text-foreground' : ''}
                                    `}>
                                        {day.getDate()}
                                    </span>

                                    {/* Etkinlik Sayısı Badge (Birden fazla ise) */}
                                    {dayEvents.length > 1 && (
                                        <div className="absolute bottom-1 right-1 z-10 bg-primary text-[10px] text-black font-bold px-1.5 py-0.5 rounded-full shadow-lg">
                                            +{dayEvents.length - 1}
                                        </div>
                                    )}

                                    {/* Tek etkinlik varsa ve resim yoksa nokta göster */}
                                    {hasEvent && !firstEventImage && dayEvents.length === 1 && (
                                        <div className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_5px_rgba(250,204,21,0.8)] relative z-10" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Seçili Gün Detayları */}
            <div className="w-full lg:w-96">
                <div className="glass-strong p-6 rounded-2xl border border-border h-full">
                    <h3 className="text-xl font-bold text-foreground mb-6 flex items-center justify-between">
                        <span className="capitalize">{selectedDate ? formatDate(selectedDate) : 'Tarih Seçin'}</span>
                        <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-1 rounded-lg">
                            {selectedDayEvents.length} Etkinlik
                        </span>
                    </h3>

                    <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                        {selectedDayEvents.length > 0 ? (
                            selectedDayEvents.map(event => (
                                <Link
                                    href={`/etkinlik/${event.id}`}
                                    key={event.id}
                                    className="block group"
                                >
                                    <div className="glass p-4 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-muted transition-all hover:scale-[1.02]">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                                                {event.title}
                                            </h4>
                                            {event.category && (
                                                <span className="text-[10px] uppercase tracking-wider px-2 py-1 bg-muted rounded text-muted-foreground whitespace-nowrap">
                                                    {event.category}
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Clock className="w-3 h-3 text-primary" />
                                                {new Date(event.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <MapPin className="w-3 h-3 text-primary" />
                                                <span className="line-clamp-1">{event.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                <p className="text-muted-foreground">Bu tarihte planlanmış etkinlik bulunmuyor.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
