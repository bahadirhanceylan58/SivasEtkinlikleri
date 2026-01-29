"use client";

import React, { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Users, Trophy, Palette, Code, Heart, BookOpen, Music, Cpu, Dumbbell, GraduationCap, Plus, TrendingUp } from "lucide-react";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Category configuration with colors and icons
const categoryConfig: Record<string, {
    gradient: string;
    border: string;
    icon: string;
    badge: string;
    IconComponent: React.ComponentType<{ className?: string }>;
}> = {
    'spor': {
        gradient: 'from-blue-500/10 to-cyan-500/10',
        border: 'border-blue-500/30 hover:border-blue-500/60',
        icon: 'text-blue-500',
        badge: 'bg-blue-500/20 text-blue-400',
        IconComponent: Trophy
    },
    'sanat': {
        gradient: 'from-purple-500/10 to-pink-500/10',
        border: 'border-purple-500/30 hover:border-purple-500/60',
        icon: 'text-purple-500',
        badge: 'bg-purple-500/20 text-purple-400',
        IconComponent: Palette
    },
    'teknoloji': {
        gradient: 'from-green-500/10 to-emerald-500/10',
        border: 'border-green-500/30 hover:border-green-500/60',
        icon: 'text-green-500',
        badge: 'bg-green-500/20 text-green-400',
        IconComponent: Code
    },
    'sosyal': {
        gradient: 'from-pink-500/10 to-rose-500/10',
        border: 'border-pink-500/30 hover:border-pink-500/60',
        icon: 'text-pink-500',
        badge: 'bg-pink-500/20 text-pink-400',
        IconComponent: Heart
    },
    'akademik': {
        gradient: 'from-orange-500/10 to-yellow-500/10',
        border: 'border-orange-500/30 hover:border-orange-500/60',
        icon: 'text-orange-500',
        badge: 'bg-orange-500/20 text-orange-400',
        IconComponent: BookOpen
    },
    'müzik': {
        gradient: 'from-indigo-500/10 to-violet-500/10',
        border: 'border-indigo-500/30 hover:border-indigo-500/60',
        icon: 'text-indigo-500',
        badge: 'bg-indigo-500/20 text-indigo-400',
        IconComponent: Music
    }
};

const getDefaultConfig = () => ({
    gradient: 'from-primary/10 to-primary/5',
    border: 'border-primary/30 hover:border-primary/60',
    icon: 'text-primary',
    badge: 'bg-primary/20 text-primary',
    IconComponent: Users
});

export default function ClubsPage() {
    const [clubs, setClubs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClubs = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "clubs"));
                const clubsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setClubs(clubsList);
            } catch (error) {
                console.error("Error fetching clubs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchClubs();
    }, []);

    // Calculate total members
    const totalMembers = clubs.reduce((sum, club) => sum + (club.memberCount || 0), 0);

    return (
        <main className="min-h-screen flex flex-col bg-background transition-colors duration-300 text-foreground">
            <Navbar />

            {/* Hero Section with Gradient */}
            <section className="relative py-20 overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float delay-[2000ms]" />
                </div>

                {/* Top Gradient */}
                <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

                <div className="container mx-auto px-4 text-center relative z-10">
                    <div className="inline-block mb-4 px-4 py-2 glass-strong rounded-full text-sm text-primary font-medium animate-slideInDown">
                        🎓 Kampüs Topluluğu
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 animate-slideInUp">
                        Topluluklar & Kulüpler
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8 animate-slideInUp opacity-0 delay-100 fill-forwards">
                        Sivas'taki aktif öğrenci kulüpleri ve sosyal topluluklar. İlgi alanınıza uygun bir gruba katılın!
                    </p>

                    {/* Statistics */}
                    {!loading && clubs.length > 0 && (
                        <div className="flex items-center justify-center gap-8 md:gap-12 mt-8 animate-fadeIn opacity-0 delay-200 fill-forwards">
                            <div className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{clubs.length}</div>
                                <div className="text-sm text-muted-foreground">Aktif Kulüp</div>
                            </div>
                            <div className="w-px h-12 bg-border" />
                            <div className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{totalMembers.toLocaleString()}</div>
                                <div className="text-sm text-muted-foreground">Toplam Üye</div>
                            </div>
                        </div>
                    )}

                    {/* CTA Button */}
                    <Link href="/kulup-basvuru">
                        <button className="mt-8 px-6 py-3 bg-primary hover:bg-primary-hover text-black font-bold rounded-xl transition-all shadow-glow hover:shadow-glow-lg transform hover:scale-105 flex items-center gap-2 mx-auto animate-bounceIn opacity-0 delay-300 fill-forwards">
                            <Plus className="w-5 h-5" />
                            Yeni Kulüp Oluştur
                        </button>
                    </Link>
                </div>
            </section>

            {/* Clubs Grid */}
            <section className="py-12 flex-grow">
                <div className="container mx-auto px-4">
                    {loading ? (
                        // Skeleton Loading
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="glass-strong p-6 rounded-2xl border border-border animate-pulse">
                                    <div className="flex justify-between mb-4">
                                        <div className="w-16 h-16 bg-muted rounded-2xl" />
                                        <div className="w-20 h-6 bg-muted rounded-full" />
                                    </div>
                                    <div className="h-6 bg-muted rounded w-3/4 mb-3" />
                                    <div className="h-4 bg-muted rounded w-1/2 mb-6" />
                                    <div className="h-10 bg-muted rounded-xl" />
                                </div>
                            ))}
                        </div>
                    ) : clubs.length === 0 ? (
                        // Empty State
                        <div className="text-center py-20">
                            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                                <Users className="w-10 h-10 text-muted-foreground" />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground mb-2">Henüz Kulüp Yok</h3>
                            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                                İlk kulübü oluşturan siz olun! Kampüste bir değişim başlatın.
                            </p>
                            <Link href="/kulup-basvuru">
                                <button className="px-6 py-3 bg-primary hover:bg-primary-hover text-black font-bold rounded-xl transition-all shadow-glow hover:shadow-glow-lg transform hover:scale-105 flex items-center gap-2 mx-auto">
                                    <Plus className="w-5 h-5" />
                                    Kulüp Oluştur
                                </button>
                            </Link>
                        </div>
                    ) : (
                        // Clubs Grid
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                            {clubs.map((club, index) => {
                                const category = club.category?.toLowerCase() || 'default';
                                const config = categoryConfig[category] || getDefaultConfig();
                                const Icon = config.IconComponent;

                                return (
                                    <Link
                                        key={club.id}
                                        href={`/kulupler/${club.id}`}
                                        className="block h-full animate-slideInUp opacity-0 fill-forwards"
                                        style={{
                                            animationDelay: `${index * 0.1}s`
                                        }}
                                    >
                                        <div className={`group relative h-full p-6 rounded-2xl border ${config.border} bg-card hover:bg-muted/30 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 overflow-hidden shadow-sm hover:shadow-md`}>
                                            {/* Gradient Overlay on Hover */}
                                            <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

                                            <div className="relative z-10 flex flex-col h-full">
                                                {/* Header */}
                                                <div className="flex items-start justify-between mb-4">
                                                    {/* Club Logo/Icon */}
                                                    <div className={`w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center ${config.icon} group-hover:scale-110 transition-transform duration-300 overflow-hidden relative`}>
                                                        {club.logo || club.imageUrl ? (
                                                            <Image
                                                                src={club.logo || club.imageUrl}
                                                                alt={club.name}
                                                                fill
                                                                className="object-cover"
                                                                unoptimized
                                                            />
                                                        ) : (
                                                            <Icon className="w-8 h-8" />
                                                        )}
                                                    </div>

                                                    {/* Category Badge */}
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.badge} capitalize`}>
                                                        {club.category || 'Genel'}
                                                    </span>
                                                </div>

                                                {/* Club Info */}
                                                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                                                    {club.name}
                                                </h3>

                                                <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-grow">
                                                    {club.description || 'Kulüp hakkında henüz açıklama eklenmemiş.'}
                                                </p>

                                                {/* Member Count */}
                                                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
                                                    <Users className="w-4 h-4" />
                                                    <span className="font-medium text-foreground">{club.memberCount || 0}</span>
                                                    <span>aktif üye</span>
                                                    {(club.memberCount || 0) > 50 && (
                                                        <span className="ml-auto flex items-center gap-1 text-primary text-xs font-semibold">
                                                            <TrendingUp className="w-3 h-3" />
                                                            Popüler
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Action Button */}
                                                <button
                                                    className="w-full bg-muted hover:bg-primary hover:text-black text-foreground font-semibold py-3 rounded-xl transition-all border border-border hover:border-primary group-hover:shadow-glow pointer-events-none"
                                                >
                                                    Detayları Gör
                                                </button>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </main>
    );
}
