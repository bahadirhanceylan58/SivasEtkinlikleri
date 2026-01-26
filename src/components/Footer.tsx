import { Instagram } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-muted mt-20 py-12 border-t border-border">
            <div className="container">
                <div className="flex flex-col items-center justify-center text-center gap-6">
                    <h2 className="text-2xl font-bold">Sivas Etkinlikleri</h2>
                    <p className="text-muted-foreground max-w-md">
                        Sivas'ın en güncel etkinlik platformu. Konserler, tiyatrolar, topluluklar ve daha fazlası.
                    </p>

                    <div className="flex gap-4 mb-4">
                        <a href="tel:05301120336" className="text-lg font-bold hover:text-primary transition-colors">
                            0530 112 0336
                        </a>
                    </div>

                    <a
                        href="https://www.instagram.com/sivasetkinlikleri/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary gap-2"
                    >
                        <Instagram className="w-5 h-5" />
                        Instagram'da Bizi Takip Edin
                    </a>

                    <div className="text-sm text-muted-foreground mt-8">
                        © {new Date().getFullYear()} Sivas Etkinlikleri. Tüm hakları saklıdır.
                    </div>
                </div>
            </div>
        </footer>
    );
}
