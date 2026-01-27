"use client";

import { useState } from 'react';
import { Tag, Check, X, Loader2 } from 'lucide-react';
import { validateDiscountCode } from '@/lib/discountValidator';
import { DiscountValidationResult } from '@/types/ticketing';

interface DiscountCodeInputProps {
    userId: string;
    eventId: string;
    eventCategory: string;
    purchaseAmount: number;
    onDiscountApplied: (result: DiscountValidationResult, code: string) => void;
    onDiscountRemoved: () => void;
    disabled?: boolean;
}

export default function DiscountCodeInput({
    userId,
    eventId,
    eventCategory,
    purchaseAmount,
    onDiscountApplied,
    onDiscountRemoved,
    disabled = false
}: DiscountCodeInputProps) {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [appliedCode, setAppliedCode] = useState<string | null>(null);
    const [validationResult, setValidationResult] = useState<DiscountValidationResult | null>(null);

    const handleApplyCode = async () => {
        if (!code.trim() || loading) return;

        setLoading(true);
        setValidationResult(null);

        const result = await validateDiscountCode(
            code.trim(),
            userId,
            eventId,
            eventCategory,
            purchaseAmount
        );

        setValidationResult(result);
        setLoading(false);

        if (result.valid) {
            setAppliedCode(code.trim().toUpperCase());
            onDiscountApplied(result, code.trim().toUpperCase());
            setCode('');
        }
    };

    const handleRemoveCode = () => {
        setAppliedCode(null);
        setValidationResult(null);
        setCode('');
        onDiscountRemoved();
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleApplyCode();
        }
    };

    return (
        <div className="space-y-3">
            {/* Input Area */}
            {!appliedCode && (
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Tag className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            onKeyPress={handleKeyPress}
                            placeholder="İndirim kodu giriniz"
                            disabled={disabled || loading}
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 pl-11 text-white uppercase placeholder-gray-500 focus:border-yellow-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        />
                    </div>
                    <button
                        onClick={handleApplyCode}
                        disabled={!code.trim() || loading || disabled}
                        className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Kontrol
                            </>
                        ) : (
                            'Uygula'
                        )}
                    </button>
                </div>
            )}

            {/* Success Message */}
            {appliedCode && validationResult?.valid && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-start justify-between animate-fadeIn">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                            <p className="font-bold text-white mb-1">
                                İndirim Kodu Uygulandı: <span className="text-green-500">{appliedCode}</span>
                            </p>
                            <p className="text-sm text-gray-400">
                                {validationResult.discountAmount}₺ indirim kazandınız
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleRemoveCode}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                        title="İndirimi kaldır"
                    >
                        <X className="w-5 h-5 text-gray-400 hover:text-white" />
                    </button>
                </div>
            )}

            {/* Error Message */}
            {validationResult && !validationResult.valid && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3 animate-fadeIn">
                    <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <X className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                        <p className="font-bold text-white mb-1">Geçersiz Kod</p>
                        <p className="text-sm text-gray-400">{validationResult.error}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
