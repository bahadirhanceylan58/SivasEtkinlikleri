"use client";

import { SponsorshipTier } from '@/types/ticketing';
import { Check } from 'lucide-react';

interface SponsorTierCardProps {
    tier: SponsorshipTier;
    selected?: boolean;
    onSelect: () => void;
}

export default function SponsorTierCard({ tier, selected = false, onSelect }: SponsorTierCardProps) {
    return (
        <div
            onClick={onSelect}
            className={`
        relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-105
        ${selected
                    ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                    : 'border-border bg-card hover:border-primary/50'
                }
      `}
        >
            {/* Selected Badge */}
            {selected && (
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
                    <Check className="w-5 h-5 text-black" />
                </div>
            )}

            {/* Icon & Name */}
            <div className="text-center mb-4">
                <div className="text-5xl mb-2">{tier.icon}</div>
                <h3 className="text-2xl font-bold text-foreground mb-1">{tier.name}</h3>
                <div className="text-3xl font-bold" style={{ color: tier.color }}>
                    {tier.amount.toLocaleString('tr-TR')}₺
                </div>
            </div>

            {/* Benefits */}
            <div className="space-y-2 mb-6">
                {tier.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                    </div>
                ))}
            </div>

            {/* Select Button */}
            <button
                type="button"
                className={`
          w-full py-3 rounded-xl font-bold transition-all
          ${selected
                        ? 'bg-primary text-black'
                        : 'bg-muted text-foreground hover:bg-muted/80'
                    }
        `}
            >
                {selected ? 'Seçildi' : 'Bu Tier\'ı Seç'}
            </button>
        </div>
    );
}
