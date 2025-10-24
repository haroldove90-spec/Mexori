import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AppState, ServiceType, UserRole, VerificationStatus, type Driver, type Passenger, type Offer, type TripRequest, type OngoingTrip, type User } from './types';
import MapPlaceholder from './components/MapPlaceholder';
import { CarIcon, ChevronLeftIcon, DollarSignIcon, MapPinIcon, MessageSquareIcon, PackageIcon, PhoneIcon, StarIcon, UserIcon, ShieldIcon, SteeringWheelIcon, CheckCircleIcon, XCircleIcon } from './components/Icons';

// --- MOCK DATABASE ---
const MOCK_USERS: (Passenger | Driver)[] = [
    { id: 'p1', name: 'Ana S.', role: UserRole.PASSENGER, avatarUrl: 'https://i.pravatar.cc/150?u=passenger1' },
    { id: 'd1', name: 'Javier R.', role: UserRole.DRIVER, rating: 4.9, vehicle: 'Nissan Versa', plate: 'ABC-123', avatarUrl: 'https://i.pravatar.cc/150?u=driver1', isOnline: true, verificationStatus: VerificationStatus.APPROVED },
    { id: 'd2', name: 'Sofia L.', role: UserRole.DRIVER, rating: 4.8, vehicle: 'Chevrolet Onix', plate: 'XYZ-789', avatarUrl: 'https://i.pravatar.cc/150?u=driver2', isOnline: false, verificationStatus: VerificationStatus.APPROVED },
    { id: 'd3', name: 'Miguel A.', role: UserRole.DRIVER, rating: 5.0, vehicle: 'Kia Rio', plate: 'DEF-456', avatarUrl: 'https://i.pravatar.cc/150?u=driver3', isOnline: true, verificationStatus: VerificationStatus.PENDING },
    { id: 'd4', name: 'Valentina G.', role: UserRole.DRIVER, rating: 4.7, vehicle: 'Toyota Yaris', plate: 'GHI-987', avatarUrl: 'https://i.pravatar.cc/150?u=driver4', isOnline: true, verificationStatus: VerificationStatus.REJECTED },
];

const useMockDatabase = () => {
    const [users, setUsers] = useState< (Passenger | Driver)[] >(MOCK_USERS);
    const [requests, setRequests] = useState<TripRequest[]>([]);
    const [trips, setTrips] = useState<OngoingTrip[]>([]);

    const findUser = (id: string) => users.find(u => u.id === id);
    const findDriver = (id: string) => users.find(u => u.id === id && u.role === UserRole.DRIVER) as Driver | undefined;
    
    return {
        users, setUsers,
        requests, setRequests,
        trips, setTrips,
        findUser, findDriver,
    };
};

type MockDB = ReturnType<typeof useMockDatabase>;

// --- ROLE SWITCHER COMPONENT ---
interface RoleSwitcherProps {
    currentRole: UserRole;
    onSwitch: (role: UserRole) => void;
}
const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ currentRole, onSwitch }) => {
    const roles = [
        { role: UserRole.PASSENGER, icon: <UserIcon className="w-6 h-6 mb-1"/> },
        { role: UserRole.DRIVER, icon: <SteeringWheelIcon className="w-6 h-6 mb-1"/> },
        { role: UserRole.ADMIN, icon: <ShieldIcon className="w-6 h-6 mb-1"/> },
    ];
    return (
        <div className="absolute bottom-0 left-0 right-0 bg-gray-800/80 backdrop-blur-sm border-t border-gray-700 z-20 flex justify-around">
            {roles.map(({ role, icon }) => (
                <button
                    key={role}
                    onClick={() => onSwitch(role)}
                    className={`flex-1 flex flex-col items-center justify-center py-2 transition-colors ${currentRole === role ? 'text-amber-400' : 'text-gray-400 hover:text-white'}`}
                >
                    {icon}
                    <span className="text-xs font-bold">{role}</span>
                </button>
            ))}
        </div>
    );
};


// ====== PASSENGER FLOW COMPONENTS ======
const PassengerFlow = ({ db }: { db: MockDB }) => {
    // [The entire passenger flow logic from the original App.tsx is placed here, adapted to use the shared db]
    // For brevity, this is a simplified version of the original flow.
    const [appState, setAppState] = useState<AppState>(AppState.REQUESTING_RIDE);
    const [activeRequest, setActiveRequest] = useState<TripRequest | null>(null);
    const [acceptedTrip, setAcceptedTrip] = useState<OngoingTrip | null>(null);
    const currentPassenger = db.users.find(u => u.role === UserRole.PASSENGER) as Passenger;

    const handleRideRequest = (details: Omit<TripRequest, 'id' | 'passenger'|'createdAt'|'offers'>) => {
        const newRequest: TripRequest = {
            ...details,
            id: `req-${Date.now()}`,
            passenger: currentPassenger,
            createdAt: Date.now(),
            offers: []
        };
        db.setRequests(prev => [...prev, newRequest]);
        setActiveRequest(newRequest);
        setAppState(AppState.WAITING_FOR_OFFERS);
    };
    
    useEffect(() => {
        if(appState === AppState.WAITING_FOR_OFFERS){
            const timeout = setTimeout(() => setAppState(AppState.VIEWING_OFFERS), 2000);
            return () => clearTimeout(timeout);
        }
    }, [appState]);

    const handleAcceptOffer = (driver: Driver, price: number) => {
        if (!activeRequest) return;
        const newTrip: OngoingTrip = {
            id: `trip-${Date.now()}`,
            request: activeRequest,
            driver,
            finalPrice: price,
            startTime: Date.now()
        };
        db.setTrips(prev => [...prev, newTrip]);
        db.setRequests(prev => prev.filter(r => r.id !== activeRequest.id));
        setAcceptedTrip(newTrip);
        setAppState(AppState.TRIP_IN_PROGRESS);
    };
    
    const resetState = useCallback(() => {
        setAppState(AppState.REQUESTING_RIDE);
        setActiveRequest(null);
        setAcceptedTrip(null);
    }, []);

    useEffect(() => {
        if (appState === AppState.TRIP_IN_PROGRESS && acceptedTrip) {
            const tripTimeout = setTimeout(() => {
                setAppState(AppState.TRIP_COMPLETED);
            }, 8000); // Mock trip duration
            return () => clearTimeout(tripTimeout);
        }
    }, [appState, acceptedTrip]);
    
    const offersForRequest = useMemo(() => {
        const req = db.requests.find(r => r.id === activeRequest?.id);
        if(!req) return [];
        return req.offers.map(offer => ({
            driver: db.findDriver(offer.driverId)!,
            price: offer.price
        })).filter(o => o.driver);
    }, [db.requests, activeRequest]);

    switch (appState) {
        case AppState.REQUESTING_RIDE:
             return <RideRequestView onSubmit={handleRideRequest} />;
        case AppState.WAITING_FOR_OFFERS:
            return <SearchingView />;
        case AppState.VIEWING_OFFERS:
            return <OffersView offers={offersForRequest} onAccept={handleAcceptOffer} onCancel={resetState} tripDetails={activeRequest} />;
        case AppState.TRIP_IN_PROGRESS:
        case AppState.TRIP_COMPLETED:
            if(acceptedTrip) return <TripView trip={acceptedTrip} onComplete={resetState} isCompleted={appState === AppState.TRIP_COMPLETED}/>;
            return null;
        default: return null;
    }
}
// [Helper components for Passenger Flow: RideRequestView, SearchingView, OffersView, TripView - adapted slightly]
const RideRequestView: React.FC<{onSubmit: (d: any) => void}> = ({ onSubmit }) => {
    const [destination, setDestination] = useState('');
    const [offeredPrice, setOfferedPrice] = useState(50);
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ pickup: 'Av. de la Reforma 222, CDMX', destination, offeredPrice, serviceType: ServiceType.MOBILITY });
    };
    return (
        <div className="bg-gray-800 rounded-t-3xl p-6 shadow-lg animate-slide-up">
            <h2 className="text-xl font-bold mb-4 text-center">¿A dónde vamos?</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="relative">
                    <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
                    <input type="text" placeholder="Ingresa tu destino" value={destination} onChange={e => setDestination(e.target.value)} required className="w-full bg-gray-700 border-2 border-gray-600 rounded-lg pl-12 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500" />
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
    <div className="bg-gray-800 rounded-t-3xl p-6 shadow-lg text-center h-48 flex flex-col justify-center items-center animate-slide-up">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500 mb-4"></div>
        <h2 className="text-xl font-bold text-white">Buscando conductores...</h2>
    </div>
);
const OffersView: React.FC<{offers: {driver: Driver, price: number}[], onAccept: (d: Driver, p: number) => void, onCancel: () => void, tripDetails: TripRequest | null}> = ({ offers, onAccept, onCancel, tripDetails }) => (
    <div className="bg-gray-800 rounded-t-3xl shadow-lg flex flex-col h-[70vh] animate-slide-up">
        <div className="p-4 border-b border-gray-700 flex items-center">
            <button onClick={onCancel} className="p-2 rounded-full hover:bg-gray-700"><ChevronLeftIcon className="w-6 h-6"/></button>
            <div className="text-center flex-1">
                 <h2 className="text-xl font-bold">Ofertas de Conductores</h2>
                 <p className="text-sm text-amber-400">Tu oferta: ${tripDetails?.offeredPrice} MXN</p>
            </div>
        </div>
        <div className="overflow-y-auto p-4 space-y-3 flex-1">
            {offers.length === 0 ? <p className="text-center text-gray-400 py-10">Esperando ofertas...</p> : offers.map(({driver: offer, price}) => (
                <div key={offer.id} className="bg-gray-700 rounded-lg p-4 flex items-center gap-4">
                    <img src={offer.avatarUrl} alt={offer.name} className="w-16 h-16 rounded-full border-2 border-amber-500"/>
                    <div className="flex-1">
                        <h3 className="font-bold text-lg">{offer.name}</h3>
                        <p className="text-gray-300 text-sm">{offer.vehicle}</p>
                    </div>
                    <div>
                       <p className="font-bold text-xl text-white">${price.toFixed(2)}</p>
                       <button onClick={() => onAccept(offer, price)} className="mt-1 bg-green-500 text-white font-bold py-2 px-4 rounded-lg text-sm">Aceptar</button>
                    </div>
                </div>
            ))}
        </div>
    </div>
);
const TripView: React.FC<{trip: OngoingTrip, onComplete: () => void, isCompleted: boolean}> = ({ trip, onComplete, isCompleted }) => {
    const [rating, setRating] = useState(0);
    return (
        <div className="bg-gray-800 rounded-t-3xl p-6 shadow-lg animate-slide-up">
            {!isCompleted ? (
                 <>
                    <p className="text-center text-gray-400">Conductor en camino</p>
                    <div className="bg-gray-700 rounded-lg p-4 flex items-center gap-4 mt-4">
                        <img src={trip.driver.avatarUrl} alt={trip.driver.name} className="w-16 h-16 rounded-full"/>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg">{trip.driver.name}</h3>
                            <p className="text-gray-300">{trip.driver.vehicle} - <span className="font-mono">{trip.driver.plate}</span></p>
                        </div>
                    </div>
                 </>
            ) : (
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Viaje Completado</h2>
                    <p className="text-lg mb-4">Total: <span className="font-bold text-amber-400">${trip.finalPrice.toFixed(2)} MXN</span></p>
                    <div className="flex justify-center gap-2 mb-4">
                        {[1, 2, 3, 4, 5].map(star => <button key={star} onClick={() => setRating(star)}><StarIcon className={`w-8 h-8 ${rating >= star ? 'text-amber-400' : 'text-gray-500'}`}/></button>)}
                    </div>
                    <button onClick={onComplete} className="w-full bg-amber-500 text-gray-900 font-bold py-4 rounded-lg">Pedir otro viaje</button>
                </div>
            )}
        </div>
    );
};


// ====== DRIVER FLOW COMPONENTS ======
const DriverFlow = ({ db }: { db: MockDB }) => {
    const driver = db.users.find(u => u.id === 'd1') as Driver; // Simulate as driver 'd1'
    
    const toggleOnlineStatus = () => {
        db.setUsers(users => users.map(u => u.id === driver.id ? {...u, isOnline: !(u as Driver).isOnline} : u));
    };
    
    const handleOffer = (request: TripRequest, price: number) => {
        const newOffer: Offer = { driverId: driver.id, price };
        db.setRequests(reqs => reqs.map(r => r.id === request.id ? {...r, offers: [...r.offers, newOffer]} : r));
    };

    const myTrip = db.trips.find(t => t.driver.id === driver.id);

    if (myTrip) {
        return (
            <div className="bg-gray-800 rounded-t-3xl p-6 shadow-lg animate-slide-up">
                 <h2 className="text-xl font-bold mb-4 text-center">Viaje en curso</h2>
                 <div className="bg-gray-700 p-4 rounded-lg space-y-2">
                    <p><strong>Pasajero:</strong> {myTrip.request.passenger.name}</p>
                    <p><strong>Desde:</strong> {myTrip.request.pickup}</p>
                    <p><strong>Hasta:</strong> {myTrip.request.destination}</p>
                    <p className="text-lg"><strong>Ganancia:</strong> <span className="text-green-400 font-bold">${myTrip.finalPrice.toFixed(2)}</span></p>
                 </div>
                 <button onClick={() => db.setTrips(ts => ts.filter(t => t.id !== myTrip.id))} className="w-full mt-4 bg-amber-500 text-gray-900 font-bold py-3 rounded-lg">Completar Viaje</button>
            </div>
        );
    }
    
    return (
        <div className="bg-gray-800 rounded-t-3xl shadow-lg flex flex-col h-[70vh] animate-slide-up">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-bold">Modo Conductor</h2>
                <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${driver.isOnline ? 'text-green-400' : 'text-red-400'}`}>{driver.isOnline ? 'En Línea' : 'Desconectado'}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={driver.isOnline} onChange={toggleOnlineStatus} className="sr-only peer"/>
                        <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                </div>
            </div>
            <div className="overflow-y-auto p-4 space-y-3 flex-1">
                {!driver.isOnline ? <p className="text-center text-gray-400 pt-10">Ponte en línea para recibir viajes.</p> :
                 db.requests.length === 0 ? <p className="text-center text-gray-400 pt-10">Esperando solicitudes...</p> :
                 db.requests.map(req => <DriverRequestCard key={req.id} request={req} onOffer={handleOffer} />)
                }
            </div>
        </div>
    );
};

const DriverRequestCard: React.FC<{request: TripRequest, onOffer: (r: TripRequest, p: number) => void}> = ({ request, onOffer }) => {
    const [counterPrice, setCounterPrice] = useState(request.offeredPrice + 10);
    return (
        <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
                <img src={request.passenger.avatarUrl} alt={request.passenger.name} className="w-12 h-12 rounded-full"/>
                <div>
                    <p><strong>{request.passenger.name}</strong></p>
                    <p className="text-sm text-gray-400">{request.destination}</p>
                </div>
                <p className="ml-auto text-lg font-bold">${request.offeredPrice.toFixed(2)}</p>
            </div>
            <div className="mt-3 flex gap-2">
                <button onClick={() => onOffer(request, request.offeredPrice)} className="flex-1 bg-green-500 text-white font-bold py-2 px-3 rounded-lg text-sm">Aceptar</button>
                <input type="number" value={counterPrice} onChange={e => setCounterPrice(Number(e.target.value))} className="w-20 bg-gray-600 text-center rounded-lg focus:ring-amber-500 focus:border-amber-500" />
                <button onClick={() => onOffer(request, counterPrice)} className="flex-1 bg-amber-500 text-gray-900 font-bold py-2 px-3 rounded-lg text-sm">Contraoferta</button>
            </div>
        </div>
    );
};

// ====== ADMIN FLOW COMPONENTS ======
const AdminFlow = ({ db }: { db: MockDB }) => {
    const handleVerification = (driverId: string, status: VerificationStatus) => {
        db.setUsers(users => users.map(u => u.id === driverId ? {...u, verificationStatus: status} : u));
    };

    const getStatusColor = (status: VerificationStatus) => {
        switch(status) {
            case VerificationStatus.APPROVED: return 'text-green-400';
            case VerificationStatus.PENDING: return 'text-yellow-400';
            case VerificationStatus.REJECTED: return 'text-red-400';
        }
    }
    
    return (
        <div className="bg-gray-800 rounded-t-3xl shadow-lg flex flex-col h-[80vh] animate-slide-up">
            <div className="p-4 border-b border-gray-700"><h2 className="text-xl font-bold text-center">Panel de Administrador</h2></div>
            <div className="overflow-y-auto p-4 space-y-6 flex-1">
                <div>
                    <h3 className="font-bold mb-2 text-amber-400">Verificación de Conductores</h3>
                    <div className="space-y-2">
                    {db.users.filter(u => u.role === UserRole.DRIVER).map(user => {
                        const driver = user as Driver;
                        return (
                        <div key={driver.id} className="bg-gray-700 rounded-lg p-3">
                            <div className="flex items-center gap-3">
                                <img src={driver.avatarUrl} alt={driver.name} className="w-10 h-10 rounded-full" />
                                <div className="flex-1">
                                    <p>{driver.name}</p>
                                    <p className={`text-sm font-bold ${getStatusColor(driver.verificationStatus)}`}>{driver.verificationStatus}</p>
                                </div>
                                {driver.verificationStatus === VerificationStatus.PENDING && (
                                    <div className="flex gap-2">
                                        <button onClick={() => handleVerification(driver.id, VerificationStatus.APPROVED)} className="p-2 bg-green-500/20 text-green-400 rounded-full"><CheckCircleIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleVerification(driver.id, VerificationStatus.REJECTED)} className="p-2 bg-red-500/20 text-red-400 rounded-full"><XCircleIcon className="w-5 h-5"/></button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )})}
                    </div>
                </div>
                 <div>
                    <h3 className="font-bold mb-2 text-amber-400">Viajes Activos ({db.trips.length})</h3>
                     {db.trips.map(trip => (
                        <div key={trip.id} className="bg-gray-700 rounded-lg p-3 text-sm">
                             <p><strong>ID:</strong> {trip.id.slice(-6)}</p>
                             <p><strong>Pasajero:</strong> {trip.request.passenger.name} | <strong>Conductor:</strong> {trip.driver.name}</p>
                        </div>
                    ))}
                 </div>
                 <div>
                    <h3 className="font-bold mb-2 text-amber-400">Solicitudes Abiertas ({db.requests.length})</h3>
                     {db.requests.map(req => (
                        <div key={req.id} className="bg-gray-700 rounded-lg p-3 text-sm">
                             <p><strong>Pasajero:</strong> {req.passenger.name} (${req.offeredPrice})</p>
                             <p><strong>Destino:</strong> {req.destination}</p>
                        </div>
                    ))}
                 </div>
            </div>
        </div>
    );
};


// --- MAIN APP COMPONENT ---
function App() {
    const [userRole, setUserRole] = useState<UserRole>(UserRole.PASSENGER);
    const db = useMockDatabase();

    const renderCurrentView = () => {
        switch (userRole) {
            case UserRole.PASSENGER:
                return <PassengerFlow db={db} />;
            case UserRole.DRIVER:
                return <DriverFlow db={db} />;
            case UserRole.ADMIN:
                return <AdminFlow db={db} />;
            default:
                return null;
        }
    };
    
    return (
        <div className="h-screen w-screen flex items-center justify-center bg-gray-900 p-4 font-sans">
            <div className="w-full max-w-sm h-[85vh] max-h-[900px] bg-gray-900 rounded-3xl shadow-2xl overflow-hidden relative flex flex-col justify-end">
                <MapPlaceholder />
                <div className="absolute top-0 bottom-0 left-0 right-0 z-10 flex flex-col justify-end">
                   {renderCurrentView()}
                </div>
                
                {/* Keep RoleSwitcher outside the main content area to avoid re-renders */}
                <div className="h-[65px]"></div>
                <RoleSwitcher currentRole={userRole} onSwitch={setUserRole} />

                <style>{`
                    @keyframes slide-up {
                        from { transform: translateY(100%); opacity: 0; }
                        to { transform: translateY(0); opacity: 1; }
                    }
                    .animate-slide-up {
                        animation: slide-up 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
                    }
                    input[type="number"]::-webkit-inner-spin-button,
                    input[type="number"]::-webkit-outer-spin-button {
                        -webkit-appearance: none;
                        margin: 0;
                    }
                    input[type="number"] {
                        -moz-appearance: textfield;
                    }
                `}</style>
            </div>
        </div>
    );
}

export default App;
