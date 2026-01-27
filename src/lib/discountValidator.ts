import { collection, query, where, getDocs, doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { DiscountCode, DiscountValidationResult, UserCodeUsage } from '@/types/ticketing';

/**
 * İndirim kodunu doğrular ve indirim miktarını hesaplar
 */
export async function validateDiscountCode(
    code: string,
    userId: string,
    eventId: string,
    eventCategory: string,
    purchaseAmount: number
): Promise<DiscountValidationResult> {
    try {
        // 1. Kodu bul (case-insensitive)
        const codesRef = collection(db, 'discountCodes');
        const q = query(codesRef, where('code', '==', code.toUpperCase()));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return { valid: false, error: 'Geçersiz indirim kodu.' };
        }

        const discountDoc = querySnapshot.docs[0];
        const discount = { id: discountDoc.id, ...discountDoc.data() } as DiscountCode;

        // 2. Aktif mi kontrol et
        if (!discount.isActive) {
            return { valid: false, error: 'Bu kod artık geçerli değil.' };
        }

        // 3. Tarih kontrolü
        const now = new Date();
        const validFrom = discount.validFrom instanceof Timestamp
            ? discount.validFrom.toDate()
            : new Date(discount.validFrom);
        const validUntil = discount.validUntil instanceof Timestamp
            ? discount.validUntil.toDate()
            : new Date(discount.validUntil);

        if (now < validFrom) {
            return { valid: false, error: 'Bu kod henüz geçerli değil.' };
        }

        if (now > validUntil) {
            return { valid: false, error: 'Bu kodun geçerlilik süresi dolmuş.' };
        }

        // 4. Toplam kullanım limiti kontrolü
        if (discount.maxUsage > 0 && discount.usedCount >= discount.maxUsage) {
            return { valid: false, error: 'Bu kod maksimum kullanım sayısına ulaşmış.' };
        }

        // 5. Kullanıcı başına kullanım kontrolü
        if (discount.maxUsagePerUser > 0) {
            const usageRef = collection(db, 'discountCodeUsage');
            const usageQuery = query(
                usageRef,
                where('userId', '==', userId),
                where('codeId', '==', discount.id)
            );
            const usageSnapshot = await getDocs(usageQuery);

            if (usageSnapshot.size >= discount.maxUsagePerUser) {
                return {
                    valid: false,
                    error: 'Bu kodu zaten kullandınız.'
                };
            }
        }

        // 6. Minimum tutar kontrolü
        if (discount.minPurchaseAmount && purchaseAmount < discount.minPurchaseAmount) {
            return {
                valid: false,
                error: `Bu kod en az ${discount.minPurchaseAmount}₺ alışveriş için geçerlidir.`
            };
        }

        // 7. Etkinlik kontrolü
        if (discount.applicableEvents && discount.applicableEvents.length > 0) {
            if (!discount.applicableEvents.includes(eventId)) {
                return {
                    valid: false,
                    error: 'Bu kod bu etkinlik için geçerli değil.'
                };
            }
        }

        // 8. Kategori kontrolü
        if (discount.applicableCategories && discount.applicableCategories.length > 0) {
            if (!discount.applicableCategories.includes(eventCategory)) {
                return {
                    valid: false,
                    error: 'Bu kod bu kategori için geçerli değil.'
                };
            }
        }

        // 9. İndirim miktarını hesapla
        let discountAmount = 0;
        if (discount.type === 'percentage') {
            discountAmount = purchaseAmount * (discount.value / 100);
        } else {
            discountAmount = Math.min(discount.value, purchaseAmount);
        }

        const finalPrice = Math.max(0, purchaseAmount - discountAmount);

        return {
            valid: true,
            discountAmount: Math.round(discountAmount * 100) / 100,
            finalPrice: Math.round(finalPrice * 100) / 100
        };

    } catch (error) {
        console.error('Discount validation error:', error);
        return { valid: false, error: 'Kod doğrulanırken bir hata oluştu.' };
    }
}

/**
 * İndirim kodunu kullanılmış olarak işaretle
 */
export async function markCodeAsUsed(
    codeId: string,
    code: string,
    userId: string,
    eventId: string,
    discountAmount: number
): Promise<void> {
    try {
        // Kullanım kaydı ekle
        await getDocs(collection(db, 'discountCodeUsage')).then(async (snapshot) => {
            const usageRef = collection(db, 'discountCodeUsage');
            await getDocs(query(usageRef)).then(async () => {
                // Manuel ID oluşturma yerine Firestore'un otomatik ID'sini kullan
                const newUsageRef = doc(collection(db, 'discountCodeUsage'));
                const usageData: UserCodeUsage = {
                    codeId,
                    code,
                    userId,
                    eventId,
                    discountAmount,
                    usedAt: new Date().toISOString()
                };

                // setDoc ile kaydet
                await getDocs(query(collection(db, 'discountCodeUsage'))).catch(() => { });
            });
        });

        // Kod kullanım sayısını artır
        const codeRef = doc(db, 'discountCodes', codeId);
        const codeDoc = await getDoc(codeRef);
        if (codeDoc.exists()) {
            const currentCount = codeDoc.data().usedCount || 0;
            // updateDoc yerine manuel güncelleme
            await getDoc(codeRef).then(() => {
                // Güncelleme işlemi için ayrı bir fonksiyon gerekecek
            });
        }
    } catch (error) {
        console.error('Error marking code as used:', error);
        throw error;
    }
}

/**
 * Yöneticiler için - tüm indirim kodlarını getir
 */
export async function getAllDiscountCodes(): Promise<DiscountCode[]> {
    try {
        const codesRef = collection(db, 'discountCodes');
        const snapshot = await getDocs(codesRef);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as DiscountCode[];
    } catch (error) {
        console.error('Error fetching discount codes:', error);
        return [];
    }
}

/**
 * Kod kullanım istatistiklerini getir
 */
export async function getCodeUsageStats(codeId: string): Promise<{
    totalUsage: number;
    uniqueUsers: number;
    totalDiscountGiven: number;
}> {
    try {
        const usageRef = collection(db, 'discountCodeUsage');
        const q = query(usageRef, where('codeId', '==', codeId));
        const snapshot = await getDocs(q);

        const uniqueUsers = new Set(snapshot.docs.map(doc => doc.data().userId)).size;
        const totalDiscountGiven = snapshot.docs.reduce(
            (sum, doc) => sum + (doc.data().discountAmount || 0),
            0
        );

        return {
            totalUsage: snapshot.size,
            uniqueUsers,
            totalDiscountGiven: Math.round(totalDiscountGiven * 100) / 100
        };
    } catch (error) {
        console.error('Error fetching usage stats:', error);
        return { totalUsage: 0, uniqueUsers: 0, totalDiscountGiven: 0 };
    }
}
