"use client";

export default function Offline() {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-center">
            <div className="w-24 h-24 bg-neutral-900 rounded-full flex items-center justify-center mb-6">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-12 h-12 text-gray-500"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 3l18 18M4.5 9a9.004 9.004 0 00-1.8 1.983m14.28 2.016A9.004 9.004 0 009.03 4.5m-3.042 1.503a9.004 9.004 0 00-3.328 3.325M8.25 21C8.25 21 15.75 21 15.75 21M9.75 21A9.75 9.75 0 0113.84 5.25"
                    />
                </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">İnternet Bağlantısı Yok</h1>
            <p className="text-gray-400 max-w-md">
                Şu anda çevrimdışısınız. İnternet bağlantınızı kontrol edip tekrar deneyin.
            </p>
            <button
                onClick={() => window.location.reload()}
                className="mt-8 bg-primary text-black font-bold px-6 py-3 rounded-xl hover:bg-yellow-400 transition-colors"
            >
                Tekrar Dene
            </button>
        </div>
    );
}
