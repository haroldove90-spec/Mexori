import React from 'react';

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
            <img 
                src="https://picsum.photos/seed/map/1080/1920" 
                alt="Map of a city"
                className="w-full h-full object-cover opacity-30"
            />
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
