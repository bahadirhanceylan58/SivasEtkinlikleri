import Link from 'next/link';

export default function Hero() {
    return (
        <section className="relative h-[600px] flex items-center justify-center bg-black text-white overflow-hidden">
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-black/60 z-10" />
                <img
                    src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80"
                    alt="Concert Stage and Lights"
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="container relative z-20 text-center">
                <h1 className="text-5xl lg:text-7xl font-bold mb-6 tracking-tight">
                    Şehrin Tadını <br />
                    <span className="text-primary">Çıkar!</span>
                </h1>
                <p className="text-xl text-gray-200 max-w-2xl mx-auto">
                    Sivas'ın en iyi etkinlikleri, konserleri ve tiyatroları bir arada.
                </p>
            </div>
        </section>
    );
}
