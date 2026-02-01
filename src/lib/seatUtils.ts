import { collection, doc, writeBatch, query, where, getDocs, updateDoc, Timestamp, runTransaction } from 'firebase/firestore';
import { db } from './firebase';
import { SeatingConfig, Seat, SeatCategory } from '@/types/seating';

/**
 * Get category for a specific row
 */
export function getCategoryForRow(row: number, categories: SeatCategory[]): SeatCategory | null {
    return categories.find(cat => cat.rows.includes(row)) || null;
}

/**
 * Generate seat ID
 */
export function generateSeatId(row: number, seat: number): string {
    return `R${row.toString().padStart(2, '0')}-S${seat.toString().padStart(2, '0')}`;
}

/**
 * Generate all seats for an event based on seating configuration
 */
export async function generateSeatsForEvent(eventId: string, config: SeatingConfig): Promise<void> {
    const batch = writeBatch(db);
    const seatsCollection = collection(db, `events/${eventId}/seats`);

    for (let row = 1; row <= config.rows; row++) {
        for (let seat = 1; seat <= config.seatsPerRow; seat++) {
            // Check if seat is blocked
            const isBlocked = config.blockedSeats.some(
                blocked => blocked.row === row && blocked.seat === seat
            );

            if (isBlocked) {
                continue; // Skip blocked seats
            }

            // Find category for this row
            const category = getCategoryForRow(row, config.categories);

            if (!category) {
                console.warn(`No category found for row ${row}`);
                continue;
            }

            const seatId = generateSeatId(row, seat);
            const seatData: Seat = {
                id: seatId,
                row,
                seat,
                status: 'available',
                category: category.id,
                price: category.price
            };

            const seatDocRef = doc(seatsCollection, seatId);
            batch.set(seatDocRef, seatData);
        }
    }

    await batch.commit();
}

/**
 * Reserve seats temporarily (15 minutes)
 */
export async function reserveSeats(
    eventId: string,
    seatIds: string[],
    userId: string
): Promise<boolean> {
    try {
        const expiryTime = Date.now() + 15 * 60 * 1000; // 15 minutes from now

        await runTransaction(db, async (transaction) => {
            // 1. Read all seats first
            const seatDocs = await Promise.all(
                seatIds.map(id => transaction.get(doc(db, `events/${eventId}/seats/${id}`)))
            );

            // 2. Check availability
            const unavailableSeats = seatDocs.filter(doc => {
                if (!doc.exists()) throw new Error(`Seat ${doc.id} does not exist`);
                const data = doc.data() as Seat;
                // Check if sold or reserved by someone else (and not expired)
                return data.status === 'sold' ||
                    (data.status === 'reserved' &&
                        data.reservedBy !== userId &&
                        data.reservedAt &&
                        data.reservedAt > Date.now());
            });

            if (unavailableSeats.length > 0) {
                throw new Error('Some seats are no longer available');
            }

            // 3. Update all seats
            seatIds.forEach(id => {
                const seatRef = doc(db, `events/${eventId}/seats/${id}`);
                transaction.update(seatRef, {
                    status: 'reserved',
                    reservedBy: userId,
                    reservedAt: expiryTime
                });
            });
        });

        return true;
    } catch (error) {
        console.error('Error reserving seats:', error);
        return false;
    }
}

/**
 * Release seats (make them available again)
 */
export async function releaseSeats(
    eventId: string,
    seatIds: string[]
): Promise<void> {
    const batch = writeBatch(db);

    seatIds.forEach(seatId => {
        const seatRef = doc(db, `events/${eventId}/seats/${seatId}`);
        batch.update(seatRef, {
            status: 'available',
            reservedBy: null,
            reservedAt: null
        });
    });

    await batch.commit();
}

/**
 * Mark seats as sold (after successful payment)
 */
export async function markSeatsAsSold(
    eventId: string,
    seatIds: string[],
    userId: string
): Promise<void> {
    try {
        await runTransaction(db, async (transaction) => {
            // 1. Check all seats
            const seatDocs = await Promise.all(
                seatIds.map(id => transaction.get(doc(db, `events/${eventId}/seats/${id}`)))
            );

            // 2. Verify ownership and status
            const invalidSeats = seatDocs.filter(doc => {
                if (!doc.exists()) return true;
                const data = doc.data() as Seat;
                // Must be reserved by this user
                return data.status !== 'reserved' || data.reservedBy !== userId;
            });

            if (invalidSeats.length > 0) {
                throw new Error('Some seats are not reserved by you or have expired.');
            }

            // 3. Update status to sold
            const soldAt = Date.now();
            seatIds.forEach(id => {
                const seatRef = doc(db, `events/${eventId}/seats/${id}`);
                transaction.update(seatRef, {
                    status: 'sold',
                    soldTo: userId,
                    soldAt,
                    reservedBy: null,
                    reservedAt: null
                });
            });
        });
    } catch (error) {
        console.error('Error marking seats as sold:', error);
        throw error; // Re-throw to handle in UI
    }
}

/**
 * Release expired reservations
 * Should be called periodically or on page load
 */
export async function releaseExpiredReservations(eventId: string): Promise<number> {
    const now = Date.now();
    const seatsRef = collection(db, `events/${eventId}/seats`);
    const q = query(
        seatsRef,
        where('status', '==', 'reserved'),
        where('reservedAt', '<', now)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return 0;
    }

    const batch = writeBatch(db);

    snapshot.docs.forEach(docSnap => {
        batch.update(docSnap.ref, {
            status: 'available',
            reservedBy: null,
            reservedAt: null
        });
    });

    await batch.commit();
    return snapshot.size;
}

/**
 * Get seat counts by status
 */
export async function getSeatCounts(eventId: string): Promise<{
    total: number;
    available: number;
    reserved: number;
    sold: number;
    blocked: number;
}> {
    const seatsRef = collection(db, `events/${eventId}/seats`);
    const snapshot = await getDocs(seatsRef);

    const counts = {
        total: 0,
        available: 0,
        reserved: 0,
        sold: 0,
        blocked: 0
    };

    snapshot.docs.forEach(doc => {
        const seat = doc.data() as Seat;
        counts.total++;
        counts[seat.status]++;
    });

    return counts;
}

/**
 * Format seat display name
 */
export function formatSeatName(seat: Seat): string {
    return `Sıra ${seat.row}, Koltuk ${seat.seat}`;
}

/**
 * Calculate total price for selected seats
 */
export function calculateTotalPrice(seats: Seat[]): number {
    return seats.reduce((total, seat) => total + seat.price, 0);
}
