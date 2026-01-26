'use client';
import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';
import { Users, Calendar, MapPin, Check } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ClubDetailPage() {
    const { id } = useParams();
    const [clubInfo, setClubInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isJoined, setIsJoined] = useState(false);
    const [memberCount, setMemberCount] = useState(0);

    // Fetch from Firestore
    React.useEffect(() => {
        const fetchClub = async () => {
            if (!id) return;
            try {
                const docRef = doc(db, 'clubs', id as string);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setClubInfo({ id: docSnap.id, ...docSnap.data() });
                    setMemberCount(docSnap.data().memberCount || 0);
                } else {
                    console.log("No such club!");
                }
            } catch (error) {
                console.error("Error fetching club:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchClub();
    }, [id]);

    const handleJoin = async () => {
        // Here we would ideally update Firestore 'clubs' and 'users' collections
        // For now, local state update
        setIsJoined(!isJoined);
        setMemberCount(isJoined ? memberCount - 1 : memberCount + 1);
    };

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Yükleniyor...</div>;
    if (!clubInfo) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Kulüp bulunamadı.</div>;

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <Navbar />
            <div className="container mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                {/* Sol: Hakkında */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="relative h-64 w-full rounded-2xl overflow-hidden border border-neutral-800">
                        {clubInfo.imageUrl ? (
                            <Image src={clubInfo.imageUrl} alt={clubInfo.name} fill className="object-cover" unoptimized />
                        ) : (
                            <div className="w-full h-full bg-neutral-800 flex items-center justify-center">Görsel Yok</div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-end p-6">
                            <h1 className="text-3xl font-bold">{clubInfo.name}</h1>
                        </div>
                    </div>

                    <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
                        <h2 className="text-xl font-bold text-yellow-500 mb-4">Hakkımızda</h2>
                        <p className="text-gray-300 leading-relaxed">{clubInfo.description}</p>
                        <div className="mt-4 flex gap-4 text-sm text-gray-400">
                            <div className="flex items-center capitalize"><MapPin className="w-4 h-4 mr-1 text-yellow-500" /> {clubInfo.category}</div>
                            {clubInfo.createdAt && (
                                <div className="flex items-center"><Calendar className="w-4 h-4 mr-1 text-yellow-500" /> {new Date(clubInfo.createdAt.seconds * 1000).getFullYear()}</div>
                            )}
                            <div className="flex items-center"><Users className="w-4 h-4 mr-1 text-yellow-500" /> {memberCount} Üye</div>
                        </div>
                    </div>
                    {/* Kulübün Etkinlikleri (Örnek Liste) */}
                    <div>
                        <h2 className="text-xl font-bold text-white mb-4">Düzenlenen Etkinlikler</h2>
                        <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl text-center text-gray-500">
                            <Calendar className="w-12 h-12 mx-auto mb-3 text-neutral-700" />
                            <p>Bu kulübün yaklaşan etkinliği bulunmuyor.</p>
                            <p className="text-xs mt-2">Ama takipte kal, yakında eklenecek!</p>
                        </div>
                    </div>
                </div>
                {/* Sağ: Aksiyon */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 bg-neutral-900 border border-neutral-800 p-6 rounded-2xl text-center">
                        <p className="text-gray-400 mb-6">Bu topluluğun bir parçası ol ve etkinliklerden haberdar ol!</p>
                        <button
                            onClick={handleJoin}
                            className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${isJoined ? 'bg-green-600 text-white' : 'bg-yellow-500 hover:bg-yellow-400 text-black'}`}
                        >
                            {isJoined ? <><Check size={20} /> Katıldın</> : 'Aramıza Katıl'}
                        </button>
                        <p className="text-xs text-gray-600 mt-4">Üyelik ücretsizdir ve istediğin zaman ayrılabilirsin.</p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
