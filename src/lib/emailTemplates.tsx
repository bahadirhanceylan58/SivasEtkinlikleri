import * as React from 'react';

// Email template stilleri
const emailStyles = {
    container: {
        fontFamily: 'Arial, sans-serif',
        maxWidth: '600px',
        margin: '0 auto',
        padding: '20px',
        backgroundColor: '#f9fafb',
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        padding: '30px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    header: {
        color: '#1f2937',
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '20px',
        textAlign: 'center' as const,
    },
    text: {
        color: '#4b5563',
        fontSize: '16px',
        lineHeight: '1.6',
        marginBottom: '15px',
    },
    highlight: {
        backgroundColor: '#fef3c7',
        padding: '15px',
        borderRadius: '6px',
        marginBottom: '20px',
    },
    button: {
        display: 'inline-block',
        backgroundColor: '#3b82f6',
        color: '#ffffff',
        padding: '12px 24px',
        borderRadius: '6px',
        textDecoration: 'none',
        fontWeight: 'bold',
        marginTop: '20px',
    },
    footer: {
        marginTop: '30px',
        paddingTop: '20px',
        borderTop: '1px solid #e5e7eb',
        color: '#9ca3af',
        fontSize: '14px',
        textAlign: 'center' as const,
    },
    title: {
        color: '#1f2937',
        fontSize: '22px',
        fontWeight: 'bold' as const,
        marginBottom: '16px',
    },
};

interface EventRegistrationEmailProps {
    userName: string;
    eventTitle: string;
    eventDate: string;
    eventLocation: string;
    registrationId?: string;
}

export const EventRegistrationEmail: React.FC<EventRegistrationEmailProps> = ({
    userName,
    eventTitle,
    eventDate,
    eventLocation,
    registrationId,
}) => (
    <div style={emailStyles.container}>
        <div style={emailStyles.card}>
            <h1 style={emailStyles.header}>🎉 Etkinlik Kaydınız Alındı!</h1>

            <p style={emailStyles.text}>
                Merhaba <strong>{userName}</strong>,
            </p>

            <p style={emailStyles.text}>
                <strong>{eventTitle}</strong> etkinliğine kaydınız başarıyla alınmıştır.
            </p>

            <div style={emailStyles.highlight}>
                <p style={{ ...emailStyles.text, marginBottom: '10px' }}>
                    <strong>📅 Tarih:</strong> {eventDate}
                </p>
                <p style={{ ...emailStyles.text, marginBottom: '10px' }}>
                    <strong>📍 Konum:</strong> {eventLocation}
                </p>
                {registrationId && (
                    <p style={{ ...emailStyles.text, marginBottom: '0' }}>
                        <strong>🎫 Kayıt No:</strong> {registrationId}
                    </p>
                )}
            </div>

            <p style={emailStyles.text}>
                Etkinliğe katılımınızı dört gözle bekliyoruz! Etkinlik zamanı yaklaştığında size hatırlatma maili göndereceğiz.
            </p>

            <div style={emailStyles.footer}>
                <p>Sivas Etkinlikleri Platformu</p>
                <p>Bu bir otomatik mesajdır, lütfen yanıtlamayın.</p>
            </div>
        </div>
    </div>
);

interface CourseRegistrationEmailProps {
    userName: string;
    courseTitle: string;
    courseDescription: string;
    userEmail: string;
    userPhone: string;
}

export const CourseRegistrationEmail: React.FC<CourseRegistrationEmailProps> = ({
    userName,
    courseTitle,
    courseDescription,
    userEmail,
    userPhone,
}) => (
    <div style={emailStyles.container}>
        <div style={emailStyles.card}>
            <h1 style={emailStyles.header}>📚 Kurs Başvurunuz Alındı!</h1>

            <p style={emailStyles.text}>
                Merhaba <strong>{userName}</strong>,
            </p>

            <p style={emailStyles.text}>
                <strong>{courseTitle}</strong> kursuna başvurunuz başarıyla alınmıştır.
            </p>

            <div style={emailStyles.highlight}>
                <p style={{ ...emailStyles.text, marginBottom: '10px' }}>
                    <strong>Kurs Açıklaması:</strong> {courseDescription}
                </p>
                <p style={{ ...emailStyles.text, marginBottom: '10px' }}>
                    <strong>Email:</strong> {userEmail}
                </p>
                <p style={{ ...emailStyles.text, marginBottom: '0' }}>
                    <strong>Telefon:</strong> {userPhone}
                </p>
            </div>

            <p style={emailStyles.text}>
                Başvurunuz inceleniyor. Onay durumu hakkında en kısa sürede bilgilendirileceksiniz.
            </p>

            <div style={emailStyles.footer}>
                <p>Sivas Etkinlikleri Platformu</p>
                <p>Bu bir otomatik mesajdır, lütfen yanıtlamayın.</p>
            </div>
        </div>
    </div>
);

interface EventReminderEmailProps {
    userName: string;
    eventTitle: string;
    eventDate: string;
    eventLocation: string;
    eventUrl: string;
}

export const EventReminderEmail: React.FC<EventReminderEmailProps> = ({
    userName,
    eventTitle,
    eventDate,
    eventLocation,
    eventUrl,
}) => (
    <div style={emailStyles.container}>
        <div style={emailStyles.card}>
            <h1 style={emailStyles.header}>⏰ Etkinlik Hatırlatması!</h1>

            <p style={emailStyles.text}>
                Merhaba <strong>{userName}</strong>,
            </p>

            <p style={emailStyles.text}>
                Kayıt olduğunuz <strong>{eventTitle}</strong> etkinliği yaklaşıyor!
            </p>

            <div style={emailStyles.highlight}>
                <p style={{ ...emailStyles.text, marginBottom: '10px' }}>
                    <strong>📅 Tarih:</strong> {eventDate}
                </p>
                <p style={{ ...emailStyles.text, marginBottom: '0' }}>
                    <strong>📍 Konum:</strong> {eventLocation}
                </p>
            </div>

            <p style={emailStyles.text}>
                Unutmayın! Etkinliğe katılımınızı dört gözle bekliyoruz.
            </p>

            <a href={eventUrl} style={emailStyles.button}>
                Etkinlik Detaylarını Görüntüle
            </a>

            <div style={emailStyles.footer}>
                <p>Sivas Etkinlikleri Platformu</p>
                <p>Bu bir otomatik mesajdır, lütfen yanıtlamayın.</p>
            </div>
        </div>
    </div>
);

interface CourseApprovalEmailProps {
    userName: string;
    courseTitle: string;
    approved: boolean;
    message?: string;
}

export const CourseApprovalEmail: React.FC<CourseApprovalEmailProps> = ({
    userName,
    courseTitle,
    approved,
    message,
}) => (
    <div style={emailStyles.container}>
        <div style={emailStyles.card}>
            <h1 style={emailStyles.header}>
                {approved ? '✅ Kurs Başvurunuz Onaylandı!' : '❌ Kurs Başvurunuz Hakkında'}
            </h1>

            <p style={emailStyles.text}>
                Merhaba <strong>{userName}</strong>,
            </p>

            <p style={emailStyles.text}>
                <strong>{courseTitle}</strong> kursuna yaptığınız başvuru{' '}
                {approved ? 'onaylanmıştır' : 'değerlendirilmiştir'}.
            </p>

            {message && (
                <div style={emailStyles.highlight}>
                    <p style={{ ...emailStyles.text, marginBottom: '0' }}>
                        <strong>Mesaj:</strong> {message}
                    </p>
                </div>
            )}

            {approved ? (
                <p style={emailStyles.text}>
                    Kursa katılımınız için gerekli detaylar en kısa sürede iletilecektir.
                </p>
            ) : (
                <p style={emailStyles.text}>
                    İlginiz için teşekkür ederiz. Diğer kurslarımıza göz atmayı unutmayın.
                </p>
            )}

            <div style={emailStyles.footer}>
                <p>Sivas Etkinlikleri Platformu</p>
                <p>Bu bir otomatik mesajdır, lütfen yanıtlamayın.</p>
            </div>
        </div>
    </div>
);

interface AdminNotificationEmailProps {
    adminName: string;
    notificationType: 'new_registration' | 'new_course_application';
    details: {
        userName: string;
        itemTitle: string;
        itemId: string;
    };
}

export const AdminNotificationEmail: React.FC<AdminNotificationEmailProps> = ({
    adminName,
    notificationType,
    details,
}) => (
    <div style={emailStyles.container}>
        <div style={emailStyles.card}>
            <h1 style={emailStyles.header}>
                🔔 Yeni {notificationType === 'new_registration' ? 'Kayıt' : 'Kurs Başvurusu'}
            </h1>

            <p style={emailStyles.text}>
                Merhaba <strong>{adminName}</strong>,
            </p>

            <p style={emailStyles.text}>
                Yeni bir {notificationType === 'new_registration' ? 'etkinlik kaydı' : 'kurs başvurusu'} alındı.
            </p>

            <div style={emailStyles.highlight}>
                <p style={{ ...emailStyles.text, marginBottom: '10px' }}>
                    <strong>Kullanıcı:</strong> {details.userName}
                </p>
                <p style={{ ...emailStyles.text, marginBottom: '10px' }}>
                    <strong>{notificationType === 'new_registration' ? 'Etkinlik' : 'Kurs'}:</strong> {details.itemTitle}
                </p>
                <p style={{ ...emailStyles.text, marginBottom: '0' }}>
                    <strong>ID:</strong> {details.itemId}
                </p>
            </div>

            <a href={`${process.env.NEXT_PUBLIC_BASE_URL}/admin`} style={emailStyles.button}>
                Admin Panelini Aç
            </a>

            <div style={emailStyles.footer}>
                <p>Sivas Etkinlikleri Platformu</p>
                <p>Bu bir otomatik mesajdır, lütfen yanıtlamayın.</p>
            </div>
        </div>
    </div>
);

interface NewsletterEmailProps {
    subscriberName?: string;
    subject: string;
    content: string;
    unsubscribeUrl?: string;
}

export const NewsletterEmail: React.FC<NewsletterEmailProps> = ({
    subscriberName,
    subject,
    content,
    unsubscribeUrl,
}) => (
    <div style={emailStyles.container}>
        <div style={emailStyles.card}>
            <h1 style={emailStyles.header}>{subject}</h1>

            {subscriberName && (
                <p style={emailStyles.text}>
                    Merhaba <strong>{subscriberName}</strong>,
                </p>
            )}

            <div style={emailStyles.text} dangerouslySetInnerHTML={{ __html: content }} />

            <div style={emailStyles.footer}>
                <p>Sivas Etkinlikleri Platformu</p>
                {unsubscribeUrl && (
                    <p>
                        <a href={unsubscribeUrl} style={{ color: '#9ca3af' }}>
                            Abonelikten çık
                        </a>
                    </p>
                )}
            </div>
        </div>
    </div>
);

export interface NewsletterWelcomeEmailProps {
    userEmail: string;
}

export const NewsletterWelcomeEmail: React.FC<NewsletterWelcomeEmailProps> = ({
    userEmail,
}) => (
    <div style={emailStyles.container}>
        <div style={emailStyles.header}>
            % Sivas Etkinlikleri
        </div>
        <div style={emailStyles.card}>
            <h1 style={emailStyles.title}>Aramıza Hoş Geldiniz! 🎉</h1>
            <p style={emailStyles.text}>
                Merhaba,
            </p>
            <p style={emailStyles.text}>
                Sivas Etkinlikleri bültenine abone olduğunuz için teşekkür ederiz. Artık şehrimizdeki en güncel etkinliklerden, konserlerden ve özel fırsatlardan ilk sizin haberiniz olacak.
            </p>
            <p style={emailStyles.text}>
                Size neler göndereceğiz?
            </p>
            <ul>
                <li style={emailStyles.text}>📅 Haftalık etkinlik takvimi</li>
                <li style={emailStyles.text}>🎟️ Kampanyalı bilet fırsatları</li>
                <li style={emailStyles.text}>🎓 Yeni açılan kurs bildirimleri</li>
            </ul>
            <div style={{ textAlign: 'center', marginTop: '30px' }}>
                <a href="https://sivasetkinlikleri.com/etkinlikler" style={emailStyles.button}>
                    Etkinlikleri Keşfet
                </a>
            </div>
        </div>
        <div style={emailStyles.footer}>
            <p>© {new Date().getFullYear()} Sivas Etkinlikleri. Tüm hakları saklıdır.</p>
            <p>Bu e-posta {userEmail} adresine gönderilmiştir.</p>
        </div>
    </div>
);
