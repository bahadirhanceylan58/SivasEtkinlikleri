import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { MessageCircle, Send, User, Reply, Trash2, Clock } from 'lucide-react';

interface Question {
    id: string;
    courseId: string;
    userId: string;
    userName: string;
    text: string;
    createdAt: any;
    reply?: {
        text: string;
        createdAt: any;
        authorName: string;
        authorId: string;
    }
}

interface QuestionSectionProps {
    courseId: string;
    instructorId?: string; // To check if current user is instructor
}

const QuestionSection: React.FC<QuestionSectionProps> = ({ courseId, instructorId }) => {
    const { user } = useAuth();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [text, setText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');

    useEffect(() => {
        fetchQuestions();
    }, [courseId]);

    const fetchQuestions = async () => {
        try {
            const q = query(
                collection(db, 'questions'),
                where('courseId', '==', courseId),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);
            setQuestions(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Question)));
        } catch (error) {
            console.error("Error fetching questions:", error);
        }
    };

    const handleAskQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !text.trim()) return;

        setSubmitting(true);
        try {
            await addDoc(collection(db, 'questions'), {
                courseId,
                userId: user.uid,
                userName: user.displayName || 'Kullanıcı',
                text: text.trim(),
                createdAt: Timestamp.now()
            });
            setText('');
            fetchQuestions();
        } catch (error) {
            console.error("Error asking question:", error);
            alert("Soru sorulurken bir hata oluştu.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleReply = async (questionId: string) => {
        if (!user || !replyText.trim()) return;

        try {
            // Get the question details first to know who to notify
            const questionDoc = questions.find(q => q.id === questionId);

            await updateDoc(doc(db, 'questions', questionId), {
                reply: {
                    text: replyText,
                    authorName: user.displayName || 'Eğitmen',
                    authorId: user.uid,
                    createdAt: Timestamp.now()
                }
            });

            // Send Notification to Student
            if (questionDoc && questionDoc.userId !== user.uid) {
                await addDoc(collection(db, 'notifications'), {
                    userId: questionDoc.userId,
                    type: 'reply',
                    title: 'Sorunuz Yanıtlandı',
                    message: `${user.displayName || 'Eğitmen'} sorunuza yanıt verdi: "${replyText.substring(0, 50)}${replyText.length > 50 ? '...' : ''}"`,
                    link: `/kurslar/${courseId}?tab=qa`,
                    read: false,
                    createdAt: Timestamp.now()
                });
            }

            setReplyingTo(null);
            setReplyText('');
            fetchQuestions();
        } catch (error) {
            console.error("Error replying:", error);
            alert("Yanıtlanırken bir hata oluştu.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Silmek istediğinize emin misiniz?')) return;
        try {
            await deleteDoc(doc(db, 'questions', id));
            fetchQuestions();
        } catch (error) {
            console.error("Error deleting:", error);
        }
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
        return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-primary" />
                Eğitmene Soru Sor
            </h2>

            {/* Questions List */}
            <div className="space-y-6">
                {questions.length === 0 ? (
                    <div className="text-center py-8 bg-muted/20 rounded-xl border border-dashed border-border text-muted-foreground">
                        Henüz soru sorulmamış. İlk soruyu siz sorun!
                    </div>
                ) : (
                    questions.map(q => (
                        <div key={q.id} className="bg-card border border-border rounded-xl p-5">
                            {/* Question Header */}
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                                        {q.userName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-foreground">{q.userName}</div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {formatDate(q.createdAt)}
                                        </div>
                                    </div>
                                </div>
                                {(user?.uid === q.userId || user?.uid === instructorId) && (
                                    <button onClick={() => handleDelete(q.id)} className="text-muted-foreground hover:text-red-500 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <p className="text-foreground pl-13 mb-4">{q.text}</p>

                            {/* Reply Section */}
                            {q.reply ? (
                                <div className="ml-8 bg-muted/30 p-4 rounded-lg border-l-2 border-primary">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-bold text-primary text-sm">{q.reply.authorName}</span>
                                        <span className="text-xs text-muted-foreground">• {formatDate(q.reply.createdAt)}</span>
                                    </div>
                                    <p className="text-sm text-foreground/90">{q.reply.text}</p>
                                </div>
                            ) : (
                                // Show reply button only to instructor
                                user?.uid === instructorId && (
                                    <div className="ml-8">
                                        {replyingTo === q.id ? (
                                            <div className="space-y-2">
                                                <textarea
                                                    className="w-full bg-muted border border-border rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                                                    placeholder="Yanıtınız..."
                                                    rows={3}
                                                    value={replyText}
                                                    onChange={e => setReplyText(e.target.value)}
                                                />
                                                <div className="flex gap-2 justify-end">
                                                    <button onClick={() => setReplyingTo(null)} className="text-xs text-muted-foreground hover:text-foreground">İptal</button>
                                                    <button onClick={() => handleReply(q.id)} className="px-3 py-1 bg-primary text-black text-xs font-bold rounded-lg hover:bg-primary/90">Yanıtla</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => { setReplyingTo(q.id); setReplyText(''); }}
                                                className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                                            >
                                                <Reply className="w-3 h-3" /> Yanıtla
                                            </button>
                                        )}
                                    </div>
                                )
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Ask Form */}
            {user ? (
                <form onSubmit={handleAskQuestion} className="bg-muted/10 p-6 rounded-2xl border border-border">
                    <h3 className="font-semibold text-lg mb-4">Yeni Soru Sor</h3>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <textarea
                                value={text}
                                onChange={e => setText(e.target.value)}
                                placeholder="Aklınıza takılanları eğitmene sorun..."
                                className="w-full bg-card border border-border rounded-xl p-4 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary/50"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting || !text.trim()}
                            className="bg-primary text-black font-bold rounded-xl px-6 hover:bg-primary/90 transition-colors disabled:opacity-50 h-fit py-3 flex items-center gap-2"
                        >
                            <Send className="w-4 h-4" />
                            Gönder
                        </button>
                    </div>
                </form>
            ) : (
                <div className="text-center p-6 bg-muted/20 rounded-xl">
                    Soru sormak için giriş yapmalısınız.
                </div>
            )}
        </div>
    );
};

export default QuestionSection;
