import React, { useEffect, useRef } from 'react';

// Lightweight Leaflet wrapper (Leaflet loaded via CDN in public/index.html)
export default function MapPicker({
  latitude,
  longitude,
  onChange,
  height = 300,
}) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    if (!window.L) return;

    const L = window.L;
    const center = [latitude || 29.3759, longitude || 47.9774];
    const map = L.map(mapRef.current).setView(center, 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const marker = L.marker(center, { draggable: true }).addTo(map);
    marker.on('dragend', async () => {
      const { lat, lng } = marker.getLatLng();
      await handleReverseGeocode(lat, lng);
    });

    map.on('click', async (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      await handleReverseGeocode(lat, lng);
    });

    markerRef.current = marker;
    initializedRef.current = true;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (markerRef.current && latitude && longitude) {
      markerRef.current.setLatLng([latitude, longitude]);
    }
  }, [latitude, longitude]);

  const handleReverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      const address = data?.address || {};
      const governorate = address.state || address.region || '';
      const area = address.suburb || address.town || address.city_district || address.neighbourhood || address.village || address.city || '';
      onChange?.({ latitude: lat, longitude: lng, governorate, area, raw: data });
    } catch (e) {
      onChange?.({ latitude: lat, longitude: lng });
    }
  };

  return (
    <div style={{ height }} ref={mapRef} />
  );
}


