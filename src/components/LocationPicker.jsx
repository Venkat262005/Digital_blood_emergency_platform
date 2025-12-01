import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

function MapCenterHandler({ position }) {
    const map = useMap();

    useEffect(() => {
        if (position) {
            map.flyTo([position.lat, position.lng], 13);
        }
    }, [position, map]);

    return null;
}

function LocationMarker({ position, setPosition }) {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
}

function LocationPicker({ onLocationSelect, initialLat, initialLng, address }) {
    const [position, setPosition] = useState(null);

    useEffect(() => {
        if (initialLat && initialLng) {
            setPosition({ lat: initialLat, lng: initialLng });
        } else {
            // Default to Hyderabad
            setPosition({ lat: 17.3850, lng: 78.4867 });
        }
    }, [initialLat, initialLng]);

    // Geocoding Effect
    useEffect(() => {
        if (!address) return;

        const timer = setTimeout(async () => {
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
                );
                const data = await response.json();
                if (data && data.length > 0) {
                    const { lat, lon } = data[0];
                    const newPos = { lat: parseFloat(lat), lng: parseFloat(lon) };
                    setPosition(newPos);
                    onLocationSelect(newPos.lat, newPos.lng);
                }
            } catch (error) {
                console.error("Geocoding error:", error);
            }
        }, 1000); // 1s debounce

        return () => clearTimeout(timer);
    }, [address]);

    useEffect(() => {
        if (position) {
            onLocationSelect(position.lat, position.lng);
        }
    }, [position]);


    return (
        <div className="h-[300px] w-full rounded-lg overflow-hidden border border-slate-300 z-0">
            <MapContainer
                center={position ? [position.lat, position.lng] : [17.3850, 78.4867]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <MapCenterHandler position={position} />
                <LocationMarker position={position} setPosition={setPosition} />
            </MapContainer>
        </div>
    );
}

export default LocationPicker;
