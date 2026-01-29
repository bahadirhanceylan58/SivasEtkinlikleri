'use client';
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapPicker({ position, setPosition }: any) {
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Cleanup function
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
                markerRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!containerRef.current) return;
        if (mapRef.current) return; // Already initialized

        // Fix icons
        const DefaultIcon = L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
        L.Marker.prototype.options.icon = DefaultIcon;

        const initialPos: [number, number] = position && position.lat
            ? [position.lat, position.lng]
            : [39.7505, 37.0150];

        const map = L.map(containerRef.current).setView(initialPos, 13);
        mapRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        map.on('click', (e) => {
            const { lat, lng } = e.latlng;
            setPosition({ lat, lng });

            if (markerRef.current) {
                markerRef.current.setLatLng([lat, lng]);
            } else {
                markerRef.current = L.marker([lat, lng]).addTo(map);
            }
        });

        if (position && position.lat) {
            markerRef.current = L.marker([position.lat, position.lng]).addTo(map);
        }

    }, []); // Initialize once

    // Update marker if position changes externally
    useEffect(() => {
        if (!mapRef.current || !position || !position.lat) return;

        const currentLatLng = markerRef.current?.getLatLng();
        if (currentLatLng && currentLatLng.lat === position.lat && currentLatLng.lng === position.lng) return;

        if (markerRef.current) {
            markerRef.current.setLatLng([position.lat, position.lng]);
        } else {
            markerRef.current = L.marker([position.lat, position.lng]).addTo(mapRef.current);
        }

    }, [position]);

    return <div ref={containerRef} className="h-[300px] w-full z-[1] rounded-xl overflow-hidden" />;
}
