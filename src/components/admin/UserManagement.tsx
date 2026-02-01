"use client";

import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Users, Search, Trash2, Shield, UserX, UserCheck, Mail } from 'lucide-react';

export default function UserManagement() {
    interface User {
        id: string;
        displayName?: string;
        email?: string;
        role?: 'admin' | 'user' | string;
        createdAt?: any; // Firestore Timestamp
        [key: string]: any;
    }

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "users"));
            const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[];
            setUsers(usersList);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleAdmin = async (userId: string, currentStatus: boolean) => {
        if (confirm(`Bu kullanıcıyı ${currentStatus ? 'Adminlikten çıkarmak' : 'Admin yapmak'} istediğinize emin misiniz?`)) {
            try {
                // In a real app this would call a Cloud Function to set custom claims
                // Here we just update a role field in Firestore for demo purposes
                await updateDoc(doc(db, "users", userId), {
                    role: currentStatus ? 'user' : 'admin'
                });
                fetchUsers();
            } catch (error) {
                console.error("Error updating user role:", error);
                alert("Yetki güncellenemedi.");
            }
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (confirm("Bu kullanıcıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) {
            try {
                await deleteDoc(doc(db, "users", userId));
                setUsers((prev) => prev.filter(u => u.id !== userId));
                alert("Kullanıcı silindi.");
            } catch (error) {
                console.error("Error deleting user:", error);
                alert("Silme işlemi başarısız.");
            }
        }
    };

    const filteredUsers = users.filter(user =>
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Kullanıcılar yükleniyor...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Users className="text-primary" />
                    Kullanıcı Yönetimi
                </h2>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="İsim veya e-posta ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                    />
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-black/20 text-gray-400 font-medium">
                            <tr>
                                <th className="px-6 py-4">Kullanıcı</th>
                                <th className="px-6 py-4">Rol</th>
                                <th className="px-6 py-4">Kayıt Tarihi</th>
                                <th className="px-6 py-4 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-neutral-800 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-primary font-bold text-xs uppercase">
                                                {user.displayName ? user.displayName.substring(0, 2) : 'U'}
                                            </div>
                                            <div>
                                                <div className="font-medium text-white">{user.displayName || 'İsimsiz Kullanıcı'}</div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Mail className="w-3 h-3" /> {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.role === 'admin' ? (
                                            <span className="px-2 py-1 rounded bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-bold flex items-center w-fit gap-1">
                                                <Shield className="w-3 h-3" /> ADMIN
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 text-xs font-bold">
                                                USER
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-gray-400">
                                        {user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleToggleAdmin(user.id, user.role === 'admin')}
                                                className={`p-2 rounded-lg transition-all ${user.role === 'admin' ? 'bg-neutral-800 text-gray-400 hover:text-white' : 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white'}`}
                                                title={user.role === 'admin' ? "Adminliği Al" : "Admin Yap"}
                                            >
                                                {user.role === 'admin' ? <UserX className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="p-2 bg-neutral-800 text-gray-400 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                                                title="Sil"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredUsers.length === 0 && (
                    <div className="p-8 text-center text-gray-500">Kullanıcı bulunamadı.</div>
                )}
            </div>
        </div>
    );
}
