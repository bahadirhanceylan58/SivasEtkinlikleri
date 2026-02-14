"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Trash2, Edit, Save, X, GraduationCap, Image as ImageIcon, FileText, Calendar, DollarSign, Users } from "lucide-react";

export default function AdminCourses() {
    const [courses, setCourses] = useState<any[]>([]);
    const [editingCourse, setEditingCourse] = useState<any>(null);

    const fetchCourses = async () => {
        const querySnapshot = await getDocs(collection(db, "courses"));
        setCourses(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleDelete = async (id: string) => {
        if (confirm("Bu kursu silmek istediğinize emin misiniz?")) {
            await deleteDoc(doc(db, "courses", id));
            fetchCourses();
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCourse) return;

        try {
            await updateDoc(doc(db, "courses", editingCourse.id), editingCourse);
            setEditingCourse(null);
            alert("Kurs tüm detaylarıyla güncellendi! ✅");
            fetchCourses();
        } catch (error) {
            console.error(error);
            alert("Güncelleme hatası oluştu.");
        }
    };

    const handleStatusUpdate = async (courseId: string, newStatus: 'approved' | 'rejected') => {
        if (!confirm(`Bu kursu ${newStatus === 'approved' ? 'onaylamak' : 'reddetmek'} istediğinize emin misiniz?`)) return;

        try {
            await updateDoc(doc(db, 'courses', courseId), {
                status: newStatus
            });

            // Send notification to instructor
            const course = courses.find(c => c.id === courseId);
            if (course && course.instructorId) {
                await addDoc(collection(db, 'notifications'), {
                    userId: course.instructorId,
                    type: newStatus === 'approved' ? 'approval' : 'error', // 'error' used for rejection red icon
                    title: newStatus === 'approved' ? 'Kursunuz Onaylandı! 🎉' : 'Kursunuz Reddedildi',
                    message: newStatus === 'approved'
                        ? `"${course.title}" başlıklı kursunuz yayına alındı. Bol öğrencili dileriz!`
                        : `"${course.title}" başlıklı kursunuz kriterlere uymadığı için reddedildi.`,
                    link: `/kurslar/${courseId}`,
                    read: false,
                    createdAt: new Date()
                });
            }

            setCourses(courses.filter(c => c.id !== courseId)); // Remove from list since list shows pending
            alert(`Kurs başarıyla ${newStatus === 'approved' ? 'onaylandı' : 'reddedildi'}.`);
        } catch (error) {
            console.error("Error updating status:", error);
            alert("İşlem sırasında bir hata oluştu.");
        }
    };

    return (
        <div className="p-6 text-white min-h-screen">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
                <GraduationCap className="text-blue-500" /> Kurs Yönetimi
            </h1>

            {/* LİSTE */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-zinc-800 text-gray-400">
                        <tr>
                            <th className="p-4">Kurs Adı</th>
                            <th className="p-4">Eğitmen</th>
                            <th className="p-4">Fiyat</th>
                            <th className="p-4">Durum</th>
                            <th className="p-4 text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.map((course) => (
                            <tr key={course.id} className="border-t border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                                <td className="p-4 font-medium">{course.title}</td>
                                <td className="p-4 text-gray-400">{course.instructor}</td>
                                <td className="p-4 text-gray-400">{course.price} ₺</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${course.status === 'published' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                                        {course.status === 'published' ? 'Yayında' : 'Taslak'}
                                    </span>
                                </td>
                                <td className="p-4 flex justify-end gap-2">
                                    <button
                                        onClick={() => setEditingCourse(course)}
                                        className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors"
                                        title="Detaylı Düzenle"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(course.id)}
                                        className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                                        title="Sil"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* DETAYLI DÜZENLEME MODALI */}
            {editingCourse && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative shadow-2xl">

                        {/* Modal Header */}
                        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-6 flex justify-between items-center z-10">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Edit className="w-5 h-5 text-primary" /> Kursu Düzenle
                            </h2>
                            <button onClick={() => setEditingCourse(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="p-6 space-y-6">

                            {/* 1. Satır: Başlık & Eğitmen */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">Kurs Adı</label>
                                    <input
                                        required
                                        value={editingCourse.title}
                                        onChange={e => setEditingCourse({ ...editingCourse, title: e.target.value })}
                                        className="w-full bg-black border border-zinc-700 p-3 rounded-xl text-white focus:border-primary focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">Eğitmen</label>
                                    <input
                                        required
                                        value={editingCourse.instructor}
                                        onChange={e => setEditingCourse({ ...editingCourse, instructor: e.target.value })}
                                        className="w-full bg-black border border-zinc-700 p-3 rounded-xl text-white focus:border-primary focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* 2. Satır: Tarih & Durum */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5 flex items-center gap-2"><Calendar className="w-4 h-4" /> Tarih</label>
                                    <input
                                        type="date"
                                        required
                                        value={editingCourse.date}
                                        onChange={e => setEditingCourse({ ...editingCourse, date: e.target.value })}
                                        className="w-full bg-black border border-zinc-700 p-3 rounded-xl text-white [color-scheme:dark]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">Yayın Durumu</label>
                                    <select
                                        value={editingCourse.status}
                                        onChange={e => setEditingCourse({ ...editingCourse, status: e.target.value })}
                                        className="w-full bg-black border border-zinc-700 p-3 rounded-xl text-white focus:border-primary focus:outline-none"
                                    >
                                        <option value="pending">🟡 Onay Bekliyor</option>
                                        <option value="published">🟢 Yayında</option>
                                    </select>
                                </div>
                            </div>

                            {/* 3. Satır: Fiyat & Kontenjan */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5 flex items-center gap-2"><DollarSign className="w-4 h-4" /> Fiyat (₺)</label>
                                    <input
                                        type="number"
                                        value={editingCourse.price}
                                        onChange={e => setEditingCourse({ ...editingCourse, price: e.target.value })}
                                        className="w-full bg-black border border-zinc-700 p-3 rounded-xl text-white focus:border-primary focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5 flex items-center gap-2"><Users className="w-4 h-4" /> Kontenjan</label>
                                    <input
                                        type="number"
                                        value={editingCourse.quota}
                                        onChange={e => setEditingCourse({ ...editingCourse, quota: e.target.value })}
                                        className="w-full bg-black border border-zinc-700 p-3 rounded-xl text-white focus:border-primary focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* 4. Resim Linki */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5 flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Afiş Görseli URL</label>
                                <input
                                    type="url"
                                    value={editingCourse.imageUrl}
                                    onChange={e => setEditingCourse({ ...editingCourse, imageUrl: e.target.value })}
                                    className="w-full bg-black border border-zinc-700 p-3 rounded-xl text-white focus:border-primary focus:outline-none text-sm font-mono"
                                    placeholder="https://..."
                                />
                            </div>

                            {/* 5. Açıklama */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5 flex items-center gap-2"><FileText className="w-4 h-4" /> Detaylı Açıklama</label>
                                <textarea
                                    rows={5}
                                    value={editingCourse.description}
                                    onChange={e => setEditingCourse({ ...editingCourse, description: e.target.value })}
                                    className="w-full bg-black border border-zinc-700 p-3 rounded-xl text-white focus:border-primary focus:outline-none resize-none"
                                />
                            </div>

                            <div className="pt-4 sticky bottom-0 bg-transparent">
                                <button type="submit" className="w-full bg-primary text-black font-bold py-4 rounded-xl hover:bg-primary/90 shadow-glow hover:scale-[1.01] transition-all flex items-center justify-center gap-2">
                                    <Save size={20} /> Değişiklikleri Kaydet
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
