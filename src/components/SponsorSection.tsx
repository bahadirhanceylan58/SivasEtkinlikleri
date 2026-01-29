"use client";

import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Sponsor } from '@/types/ticketing';
import { groupSponsorsByTier, getLogoSizeClass, getTierById, DEFAULT_SPONSORSHIP_TIERS } from '@/lib/sponsorship';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

interface SponsorSectionProps {
    eventId: string;
}

export default function SponsorSection({ eventId }: SponsorSectionProps) {
    const [sponsors, setSponsors] = useState<Sponsor[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSponsors = async () => {
            try {
                const q = query(
                    collection(db, 'sponsors'),
                    where('eventId', '==', eventId),
                    where('status', '==', 'approved')
                );

                const snapshot = await getDocs(q);
                const fetchedSponsors = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Sponsor[];

                setSponsors(fetchedSponsors);
            } catch (error) {
                console.error("Error fetching sponsors:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSponsors();
    }, [eventId]);

    if (loading) return null;
    if (sponsors.length === 0) return null;

    const groupedSponsors = groupSponsorsByTier(sponsors);

    // Sort tiers by importance (Platinum -> Bronze)
    const sortedTiers = DEFAULT_SPONSORSHIP_TIERS.map(t => t.id).filter(tierId => groupedSponsors[tierId]?.length > 0);

    return (
        <div className="py-12 border-t border-border">
            <h2 className="text-2xl font-bold text-center mb-8">Etkinlik Sponsorları</h2>

            <div className="space-y-12">
                {sortedTiers.map(tierId => {
                    const tierSponsors = groupedSponsors[tierId];
                    const tierInfo = getTierById(tierId);

                    return (
                        <div key={tierId} className="text-center animate-fadeIn">
                            <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-6 font-semibold flex items-center justify-center gap-2">
                                {tierInfo?.icon} {tierInfo?.name} Sponsorlar
                            </h3>

                            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 px-4">
                                {tierSponsors.map(sponsor => (
                                    <div key={sponsor.id} className="group relative">
                                        <div className={`relative ${getLogoSizeClass(tierId)} transition-all duration-300 transform group-hover:scale-110 grayscale group-hover:grayscale-0`}>
                                            <Image
                                                src={sponsor.logoUrl}
                                                alt={sponsor.companyName}
                                                fill
                                                className="object-contain"
                                                unoptimized
                                            />
                                        </div>

                                        {sponsor.website && (
                                            <Link
                                                href={sponsor.website}
                                                target="_blank"
                                                className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-primary flex items-center gap-1 whitespace-nowrap"
                                            >
                                                Websitesi <ExternalLink size={10} />
                                            </Link>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
