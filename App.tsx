
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AppState, ServiceType, type Driver, type Offer, type TripDetails, type AcceptedTrip } from './types';
import MapPlaceholder from './components/MapPlaceholder';
import { CarIcon, ChevronLeftIcon, DollarSignIcon, MapPinIcon, MessageSquareIcon, PackageIcon, PhoneIcon, StarIcon } from './components/Icons';

// --- MOCK DATA ---
const MOCK_DRIVERS: Driver[] = [
    { id: '1', name: 'Javier R.', rating: 4.9, vehicle: 'Nissan Versa', plate: 'ABC-123', avatarUrl: 'https://i.pravatar.cc/150?u=driver1', eta: 3 },
    { id: '2', name: 'Sofia L.', rating: 4.8, vehicle: 'Chevrolet Onix', plate: 'XYZ-789', avatarUrl: 'https://i.pravatar.cc/150?u=driver2', eta: 5 },
    { id: '3', name: 'Miguel A.', rating: 5.0, vehicle: 'Kia Rio', plate: 'DEF-456', avatarUrl: 'https://i.pravatar.cc/150?u=driver3', eta: 2 },
    { id: '4', name: 'Valentina G.', rating: 4.7, vehicle: 'Toyota Yaris', plate: 'GHI-987', avatarUrl: 'https://i.pravatar.cc/150?u=driver4', eta: 6 },
];

// --- VIEW COMPONENTS (Defined outside App to prevent re-creation on re-render) ---

interface RideRequestViewProps {
    onSubmit: (details: TripDetails) => void;
}

const RideRequestView: React.FC<RideRequestViewProps> = ({ onSubmit }) => {
    const [pickup, setPickup] = useState('Mi ubicación actual');
    const [destination, setDestination] = useState('');
    const [offeredPrice, setOfferedPrice] = useState(50);
    const [serviceType, setServiceType] = useState<ServiceType>(ServiceType.MOBILITY);

    useEffect(() => {
        // Mock geolocation fetching
        setTimeout(() => {
            setPickup('Av. de la Reforma 222, CDMX');
        }, 1000);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (destination.trim() && offeredPrice > 0) {
            onSubmit({ pickup, destination, offeredPrice, serviceType });
        }
    };

    return (
        <div className="bg-gray-800 rounded-t-3xl p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-center">¿A dónde vamos?</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                    <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={pickup} readOnly className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg pl-12 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500" />
                </div>
                <div className="relative">
                    <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
                    <input type="text" placeholder="Ingresa tu destino" value={destination} onChange={e => setDestination(e.target.value)} required className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg pl-12 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500" />
                </div>

                <div className="flex justify-around bg-gray-700 rounded-lg p-1">
                    <button type="button" onClick={() => setServiceType(ServiceType.MOBILITY)} className={`w-full flex items-center justify-center gap-2 py-2 rounded-md transition-colors ${serviceType === ServiceType.MOBILITY ? 'bg-amber-500 text-gray-900 font-bold' : 'text-gray-300'}`}>
                        <CarIcon className="w-5 h-5" /> {ServiceType.MOBILITY}
                    </button>
                    <button type="button" onClick={() => setServiceType(ServiceType.DELIVERY)} className={`w-full flex items-center justify-center gap-2 py-2 rounded-md transition-colors ${serviceType === ServiceType.DELIVERY ? 'bg-amber-500 text-gray-900 font-bold' : 'text-gray-300'}`}>
                        <PackageIcon className="w-5 h-5" /> {ServiceType.DELIVERY}
                    </button>
                </div>

                <div className="relative">
                    <DollarSignIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="number" value={offeredPrice} onChange={e => setOfferedPrice(Number(e.target.value))} required min="10" className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg pl-12 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">MXN</span>
                </div>
                <button type="submit" className="w-full bg-amber-500 text-gray-900 font-bold py-4 rounded-lg text-lg hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20">
                    Solicitar Viaje
                </button>
            </form>
        </div>
    );
};


const SearchingView: React.FC = () => (
    <div className="bg-gray-800 rounded-t-3xl p-6 shadow-lg text-center h-48 flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500 mb-4"></div>
        <h2 className="text-xl font-bold text-white">Buscando conductores...</h2>
        <p className="text-gray-400">Enviando tu oferta a conductores cercanos.</p>
    </div>
);


interface OffersViewProps {
    offers: Offer[];
    onAccept: (offer: Offer) => void;
    onCancel: () => void;
    tripDetails: TripDetails | null;
}
const OffersView: React.FC<OffersViewProps> = ({ offers, onAccept, onCancel, tripDetails }) => (
    <div className="bg-gray-800 rounded-t-3xl shadow-lg flex flex-col h-[70vh]">
        <div className="p-4 border-b border-gray-700 flex items-center">
            <button onClick={onCancel} className="p-2 rounded-full hover:bg-gray-700">
                <ChevronLeftIcon className="w-6 h-6"/>
            </button>
            <div className="text-center flex-1">
                 <h2 className="text-xl font-bold">Ofertas de Conductores</h2>
                 <p className="text-sm text-amber-400">Tu oferta: ${tripDetails?.offeredPrice} MXN</p>
            </div>
        </div>
        <div className="overflow-y-auto p-4 space-y-3 flex-1">
            {offers.length === 0 ? (
                <div className="text-center text-gray-400 py-10">
                    <p>Esperando ofertas...</p>
                </div>
            ) : (
                offers.map(offer => (
                    <div key={offer.id} className="bg-gray-700 rounded-lg p-4 flex items-center gap-4 transition-transform hover:scale-105">
                        <img src={offer.avatarUrl} alt={offer.name} className="w-16 h-16 rounded-full border-2 border-amber-500"/>
                        <div className="flex-1">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-lg">{offer.name}</h3>
                                <div className="flex items-center gap-1 text-amber-400">
                                    <StarIcon className="w-4 h-4 fill-amber-400"/>
                                    <span className="font-bold">{offer.rating.toFixed(1)}</span>
                                </div>
                            </div>
                            <p className="text-gray-300 text-sm">{offer.vehicle} &bull; {offer.eta} min</p>
                            <p className="text-gray-400 text-xs">{offer.plate}</p>
                        </div>
                        <div className="text-right">
                           <p className="font-bold text-xl text-white">${offer.price.toFixed(2)}</p>
                           <button onClick={() => onAccept(offer)} className="mt-1 bg-green-500 text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-green-400 transition-colors">
                               Aceptar
                           </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
);

interface TripViewProps {
    trip: AcceptedTrip;
    onComplete: () => void;
    isCompleted: boolean;
}
const TripView: React.FC<TripViewProps> = ({ trip, onComplete, isCompleted }) => {
    const [rating, setRating] = useState(0);

    return (
        <div className="bg-gray-800 rounded-t-3xl p-6 shadow-lg">
            {!isCompleted ? (
                 <>
                    <div className="text-center mb-4">
                        <p className="text-gray-400">Tu conductor está en camino</p>
                        <p className="text-3xl font-bold text-amber-500">{trip.driver.eta} min</p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4 flex items-center gap-4">
                        <img src={trip.driver.avatarUrl} alt={trip.driver.name} className="w-16 h-16 rounded-full border-2 border-amber-500"/>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg">{trip.driver.name}</h3>
                            <p className="text-gray-300">{trip.driver.vehicle} - <span className="font-mono">{trip.driver.plate}</span></p>
                        </div>
                        <div className="flex gap-2">
                           <button className="p-3 bg-gray-600 rounded-full hover:bg-gray-500 transition-colors"><MessageSquareIcon className="w-5 h-5"/></button>
                           <button className="p-3 bg-gray-600 rounded-full hover:bg-gray-500 transition-colors"><PhoneIcon className="w-5 h-5"/></button>
                        </div>
                    </div>
                 </>
            ) : (
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Viaje Completado</h2>
                    <p className="text-gray-400 mb-4">Gracias por viajar con Mexori.</p>
                    <p className="text-lg mb-4">Total: <span className="font-bold text-amber-400">${trip.finalPrice.toFixed(2)} MXN</span></p>
                    <h3 className="font-bold mb-2">Califica a {trip.driver.name}</h3>
                    <div className="flex justify-center gap-2 mb-4">
                        {[1, 2, 3, 4, 5].map(star => (
                            <button key={star} onClick={() => setRating(star)}>
                                <StarIcon className={`w-8 h-8 transition-colors ${rating >= star ? 'text-amber-400 fill-amber-400' : 'text-gray-500'}`}/>
                            </button>
                        ))}
                    </div>
                    <button onClick={onComplete} className="w-full bg-amber-500 text-gray-900 font-bold py-4 rounded-lg text-lg hover:bg-amber-400 transition-colors">
                        Pedir otro viaje
                    </button>
                </div>
            )}
        </div>
    )
};


// --- MAIN APP COMPONENT ---

function App() {
    const [appState, setAppState] = useState<AppState>(AppState.REQUESTING_RIDE);
    const [tripDetails, setTripDetails] = useState<TripDetails | null>(null);
    const [offers, setOffers] = useState<Offer[]>([]);
    const [acceptedTrip, setAcceptedTrip] = useState<AcceptedTrip | null>(null);

    const handleRideRequest = (details: TripDetails) => {
        setTripDetails(details);
        setAppState(AppState.WAITING_FOR_OFFERS);
    };

    const handleAcceptOffer = (offer: Offer) => {
        if (!tripDetails) return;
        setAcceptedTrip({
            driver: {
                id: offer.id,
                name: offer.name,
                rating: offer.rating,
                vehicle: offer.vehicle,
                plate: offer.plate,
                avatarUrl: offer.avatarUrl,
                eta: offer.eta,
            },
            finalPrice: offer.price,
            details: tripDetails,
        });
        setAppState(AppState.TRIP_IN_PROGRESS);
    };

    const resetState = useCallback(() => {
        setAppState(AppState.REQUESTING_RIDE);
        setTripDetails(null);
        setOffers([]);
        setAcceptedTrip(null);
    }, []);

    const handleCancelSearch = useCallback(() => {
        resetState();
    }, [resetState]);


    useEffect(() => {
        if (appState === AppState.WAITING_FOR_OFFERS && tripDetails) {
            setOffers([]); // Clear old offers
            const price = tripDetails.offeredPrice;
            const offerTimeouts = MOCK_DRIVERS.map((driver, index) => 
                setTimeout(() => {
                    const priceVariation = (Math.random() - 0.2) * 20; // -4 to +16
                    const newOffer: Offer = {
                        ...driver,
                        price: Math.max(20, price + priceVariation),
                    };
                    setOffers(prevOffers => [...prevOffers, newOffer].sort((a,b) => a.price - b.price));
                }, (index + 1) * 1500 + Math.random() * 1000)
            );

            // Transition to viewing offers after the first one arrives
            const viewTimeout = setTimeout(() => {
                setAppState(AppState.VIEWING_OFFERS);
            }, 1600);
            
            return () => {
                offerTimeouts.forEach(clearTimeout);
                clearTimeout(viewTimeout);
            };
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appState, tripDetails]);

    useEffect(() => {
        if (appState === AppState.TRIP_IN_PROGRESS && acceptedTrip) {
            const tripDuration = (acceptedTrip.driver.eta * 60 * 1000) + 3000; // ETA in minutes + 3 seconds buffer
            const tripTimeout = setTimeout(() => {
                setAppState(AppState.TRIP_COMPLETED);
            }, tripDuration);

            return () => clearTimeout(tripTimeout);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appState, acceptedTrip]);


    const renderCurrentView = () => {
        switch (appState) {
            case AppState.REQUESTING_RIDE:
                return <RideRequestView onSubmit={handleRideRequest} />;
            case AppState.WAITING_FOR_OFFERS:
                return <SearchingView />;
            case AppState.VIEWING_OFFERS:
                return <OffersView offers={offers} onAccept={handleAcceptOffer} onCancel={handleCancelSearch} tripDetails={tripDetails} />;
            case AppState.TRIP_IN_PROGRESS:
            case AppState.TRIP_COMPLETED:
                if (acceptedTrip) {
                    return <TripView trip={acceptedTrip} onComplete={resetState} isCompleted={appState === AppState.TRIP_COMPLETED}/>;
                }
                return null;
            default:
                return null;
        }
    };
    
    const viewKey = useMemo(() => {
        if (appState === AppState.VIEWING_OFFERS) return `${appState}-${offers.length}`;
        return appState;
    }, [appState, offers]);

    return (
        <div className="h-screen w-screen flex items-center justify-center bg-gray-900 p-4">
            <div className="w-full max-w-sm h-[85vh] max-h-[900px] bg-gray-900 rounded-3xl shadow-2xl overflow-hidden relative flex flex-col justify-end">
                <MapPlaceholder />
                <div className="absolute bottom-0 left-0 right-0 z-10">
                   <div key={viewKey} className="animate-slide-up">
                       {renderCurrentView()}
                   </div>
                </div>

                <style>{`
                    @keyframes slide-up {
                        from { transform: translateY(100%); }
                        to { transform: translateY(0); }
                    }
                    .animate-slide-up {
                        animation: slide-up 0.5s ease-out forwards;
                    }
                `}</style>
            </div>
        </div>
    );
}

export default App;
