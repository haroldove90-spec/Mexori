
import React from 'react';

const MapPlaceholder = () => {
    return (
        <div className="absolute inset-0 bg-gray-800">
            <img 
                src="https://picsum.photos/seed/map/1080/1920" 
                alt="Map of a city"
                className="w-full h-full object-cover opacity-30"
            />
             <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
        </div>
    );
};

export default MapPlaceholder;
