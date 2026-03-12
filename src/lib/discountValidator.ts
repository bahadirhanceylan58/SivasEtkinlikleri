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
        let discount: DiscountCode | null = null;
        let discountId: string = '';

        if (typeof window === 'undefined') {
            // Server side - use Admin SDK
            const { adminDb } = await import('./firebaseAdmin');
            const querySnapshot = await adminDb.collection('discountCodes')
                .where('code', '==', code.toUpperCase())
                .get();

            if (querySnapshot.empty) {
                return { valid: false, error: 'Geçersiz indirim kodu.' };
            }

            const doc = querySnapshot.docs[0];
            discountId = doc.id;
            discount = { id: doc.id, ...doc.data() } as DiscountCode;
        } else {
            // Client side - standard SDK
            const { collection, query, where, getDocs } = await import('firebase/firestore');
            const codesRef = collection(db, 'discountCodes');
            const q = query(codesRef, where('code', '==', code.toUpperCase()));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                return { valid: false, error: 'Geçersiz indirim kodu.' };
            }

            const doc = querySnapshot.docs[0];
            discountId = doc.id;
            discount = { id: doc.id, ...doc.data() } as DiscountCode;
        }

        if (!discount) return { valid: false, error: 'Kod bulunamadı.' };

        // 2. Aktif mi kontrol et
        if (!discount.isActive) {
            return { valid: false, error: 'Bu kod artık geçerli değil.' };
        }

        // 3. Tarih kontrolü
        const now = new Date();
        const parseDate = (val: any) => {
            if (!val) return new Date(0);
            if (typeof val.toDate === 'function') return val.toDate();
            if (val._seconds !== undefined) return new Date(val._seconds * 1000);
            return new Date(val);
        };

        const validFrom = parseDate(discount.validFrom);
        const validUntil = parseDate(discount.validUntil);

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
            if (typeof window === 'undefined') {
                const { adminDb } = await import('./firebaseAdmin');
                const usageSnapshot = await adminDb.collection('discountCodeUsage')
                    .where('userId', '==', userId)
                    .where('codeId', '==', discountId)
                    .get();

                if (usageSnapshot.size >= discount.maxUsagePerUser) {
                    return { valid: false, error: 'Bu kodu zaten kullandınız.' };
                }
            } else {
                const { collection, query, where, getDocs } = await import('firebase/firestore');
                const usageRef = collection(db, 'discountCodeUsage');
                const usageQuery = query(
                    usageRef,
                    where('userId', '==', userId),
                    where('codeId', '==', discountId)
                );
                const usageSnapshot = await getDocs(usageQuery);

                if (usageSnapshot.size >= discount.maxUsagePerUser) {
                    return { valid: false, error: 'Bu kodu zaten kullandınız.' };
                }
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
            discountId: discountId,
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
        if (typeof window === 'undefined') {
            const admin = await import('firebase-admin');
            const { adminDb } = await import('./firebaseAdmin');
            const batch = adminDb.batch();

            const usageRef = adminDb.collection('discountCodeUsage').doc();
            batch.set(usageRef, {
                codeId,
                code,
                userId,
                eventId,
                discountAmount,
                usedAt: new Date().toISOString()
            });

            const codeRef = adminDb.collection('discountCodes').doc(codeId);
            batch.update(codeRef, {
                usedCount: admin.firestore.FieldValue.increment(1)
            });

            await batch.commit();
        } else {
            const { collection, doc, addDoc, updateDoc, increment } = await import('firebase/firestore');
            const usageData: UserCodeUsage = {
                codeId,
                code,
                userId,
                eventId,
                discountAmount,
                usedAt: new Date().toISOString()
            };
            await addDoc(collection(db, 'discountCodeUsage'), usageData);
            await updateDoc(doc(db, 'discountCodes', codeId), {
                usedCount: increment(1)
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
        if (typeof window === 'undefined') {
            const { adminDb } = await import('./firebaseAdmin');
            const snapshot = await adminDb.collection('discountCodes').get();
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as DiscountCode[];
        } else {
            const { collection, getDocs } = await import('firebase/firestore');
            const codesRef = collection(db, 'discountCodes');
            const snapshot = await getDocs(codesRef);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as DiscountCode[];
        }
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
        if (typeof window === 'undefined') {
            const { adminDb } = await import('./firebaseAdmin');
            const snapshot = await adminDb.collection('discountCodeUsage')
                .where('codeId', '==', codeId)
                .get();

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
        } else {
            const { collection, query, where, getDocs } = await import('firebase/firestore');
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
        }
    } catch (error) {
        console.error('Error fetching usage stats:', error);
        return { totalUsage: 0, uniqueUsers: 0, totalDiscountGiven: 0 };
    }
}
