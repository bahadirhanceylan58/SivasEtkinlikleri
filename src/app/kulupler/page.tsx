"use client";

import React, { useState, useEffect } from 'react';
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Users, Info } from "lucide-react";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Yükleniyor...</div>;

    return (
        <main className="min-h-screen flex flex-col">
            <Navbar />

            <section className="bg-muted py-16">
                <div className="container text-center max-w-2xl">
                    <h1 className="text-4xl font-bold mb-4">Topluluklar & Kulüpler</h1>
                    <p className="text-muted-foreground">
                        Sivas'taki aktif öğrenci kulüpleri ve sosyal topluluklar. İlgi alanınıza uygun bir gruba katılın!
                    </p>
                </div>
            </section>

            <section className="py-16">
                <div className="container">
                    {clubs.length === 0 ? (
                        <div className="text-center text-gray-500">Henüz aktif topluluk bulunmamaktadır.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {clubs.map((club) => (
                                <Link key={club.id} href={'/kulupler/' + club.id} className="block h-full">
                                    <div className="group h-full p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors flex flex-col">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                                <Users className="w-6 h-6" />
                                            </div>
                                            <span className="text-xs font-semibold bg-muted px-2 py-1 rounded capitalize">
                                                {club.category}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold mb-2">{club.name}</h3>
                                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-6 flex-grow">
                                            <span className="font-medium text-foreground">{club.memberCount || 0}</span>
                                            <span>aktif üye</span>
                                        </div>

                                        <div className="flex gap-2">
                                            <button className="flex-1 btn btn-primary py-2 text-sm z-10 relative">
                                                Katıl
                                            </button>
                                            <button className="btn btn-outline px-3 py-2" aria-label="Bilgi">
                                                <Info className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </main>
    );
}
