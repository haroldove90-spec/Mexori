
import React from 'react';
import { MapPinIcon } from './Icons';

interface MapViewProps {
    latitude?: number;
    longitude?: number;
}

const MapView: React.FC<MapViewProps> = ({ latitude, longitude }) => {
    const renderContent = () => {
        if (latitude && longitude) {
            // A smaller BBOX_SIZE means a more zoomed-in map
            const BBOX_SIZE = 0.008;
            const bbox = [
                longitude - BBOX_SIZE,
                latitude - BBOX_SIZE,
                longitude + BBOX_SIZE,
                latitude + BBOX_SIZE,
            ].join(',');
            
            const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude},${longitude}`;

            return (
                <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    src={mapUrl}
                    className="w-full h-full opacity-60 filter grayscale-[50%]"
                    title="Live Map"
                ></iframe>
            );
        }
        
        // Fallback placeholder
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-gray-400">
                    <MapPinIcon className="w-12 h-12 mx-auto animate-pulse" />
                    <p className="mt-2 text-lg">Obteniendo ubicación...</p>
                </div>
            </div>
        );
    };

    return (
        <div className="absolute inset-0 bg-gray-800">
            {renderContent()}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
        </div>
    );
};

export default MapView;
