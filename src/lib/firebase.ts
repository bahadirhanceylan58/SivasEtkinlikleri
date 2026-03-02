import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyASOKa2_c9rq1VEqrCJBR3GeX9yZqmaZK0",
    authDomain: "sivas-etkinlikleri.firebaseapp.com",
    projectId: "sivas-etkinlikleri",
    storageBucket: "sivas-etkinlikleri.firebasestorage.app",
    messagingSenderId: "118517089979",
    appId: "1:118517089979:web:2e3156e739c7fa1f8bcb9e",
    measurementId: "G-361XNHC9E9"
};

// Uygulama daha önce başlatıldıysa onu kullan, yoksa yeni başlat
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
