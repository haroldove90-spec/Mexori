
import React, { useState, useEffect } from 'react';
import { AppState, UserRole, ServiceType, VerificationStatus, User, Driver, Passenger, TripRequest, Offer, OngoingTrip } from './types';
import { MapPinIcon, DollarSignIcon, CarIcon, PackageIcon, StarIcon, PhoneIcon, MessageSquareIcon, UserIcon, SteeringWheelIcon, ShieldIcon } from './components/Icons';
import MapView from './components/MapPlaceholder';

// --- MOCK DATA ---
const mockPassenger: Passenger = {
    id: 'pass1',
    name: 'Ana',
    role: UserRole.PASSENGER,
    avatarUrl: 'https://i.pravatar.cc/150?u=pass1',
};

const mockDrivers: Driver[] = [
    {
        id: 'driver1',
        name: 'Carlos',
        role: UserRole.DRIVER,
        avatarUrl: 'https://i.pravatar.cc/150?u=driver1',
        rating: 4.9,
        vehicle: 'Toyota Prius',
        plate: 'ABC-123',
        isOnline: true,
        verificationStatus: VerificationStatus.APPROVED,
    },
    {
        id: 'driver2',
        name: 'Maria',
        role: UserRole.DRIVER,
        avatarUrl: 'https://i.pravatar.cc/150?u=driver2',
        rating: 4.7,
        vehicle: 'Honda Civic',
        plate: 'XYZ-789',
        isOnline: true,
        verificationStatus: VerificationStatus.APPROVED,
    }
];

const mockAdmin: User = {
    id: 'admin1',
    name: 'Admin',
    role: UserRole.ADMIN,
    avatarUrl: 'https://i.pravatar.cc/150?u=admin1',
};

// --- SUB-COMPONENTS ---

const RideRequestForm = ({ onRideRequest }: { onRideRequest: (details: Omit<TripRequest, 'id' | 'passenger' | 'createdAt' | 'offers'>) => void }) => {
    const [pickup, setPickup] = useState('123 Main St');
    const [destination, setDestination] = useState('456 Oak Ave');
    const [price, setPrice] = useState('15');
    const [serviceType, setServiceType] = useState<ServiceType>(ServiceType.MOBILITY);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onRideRequest({
            pickup,
            destination,
            offeredPrice: parseFloat(price),
            serviceType,
        });
    };

    return (
        <div className="bg-gray-900/80 backdrop-blur-md rounded-t-3xl p-6">
            <h2 className="text-xl font-bold mb-4">Solicitar Viaje</h2>
            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div className="relative">
                        <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" value={pickup} onChange={e => setPickup(e.target.value)} placeholder="Origen" className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                    <div className="relative">
                        <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" value={destination} onChange={e => setDestination(e.target.value)} placeholder="Destino" className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                    <div className="relative">
                        <DollarSignIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="Oferta" className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                    <div className="flex gap-4">
                        <button type="button" onClick={() => setServiceType(ServiceType.MOBILITY)} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg ${serviceType === ServiceType.MOBILITY ? 'bg-green-600' : 'bg-gray-800'}`}>
                            <CarIcon /> {ServiceType.MOBILITY}
                        </button>
                         <button type="button" onClick={() => setServiceType(ServiceType.DELIVERY)} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg ${serviceType === ServiceType.DELIVERY ? 'bg-green-600' : 'bg-gray-800'}`}>
                            <PackageIcon /> {ServiceType.DELIVERY}
                        </button>
                    </div>
                </div>
                <button type="submit" className="w-full bg-green-600 hover:bg-green-700 rounded-lg py-3 mt-6 font-bold text-lg">Buscar Conductor</button>
            </form>
        </div>
    );
};

const WaitingScreen = ({ text }: { text: string }) => (
    <div className="bg-gray-900/80 backdrop-blur-md rounded-t-3xl p-6 text-center">
        <div className="animate-pulse text-gray-400 mb-4">
            <CarIcon className="w-12 h-12 mx-auto" />
        </div>
        <h2 className="text-xl font-bold">{text}</h2>
        <p className="text-gray-400">Estamos conectando con los conductores cercanos.</p>
    </div>
);

// FIX: Explicitly type component as React.FC to allow for `key` prop and other React features.
const DriverOfferCard: React.FC<{ driver: Driver, offer: Offer, onAccept: () => void }> = ({ driver, offer, onAccept }) => (
    <div className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-4">
            <img src={driver.avatarUrl} alt={driver.name} className="w-12 h-12 rounded-full" />
            <div>
                <p className="font-bold">{driver.name}</p>
                <div className="flex items-center gap-1 text-yellow-400">
                    <StarIcon className="w-4 h-4" /> {driver.rating}
                </div>
                <p className="text-sm text-gray-400">{driver.vehicle} - {driver.plate}</p>
            </div>
        </div>
        <div className="text-right">
            <p className="text-lg font-bold">${offer.price.toFixed(2)}</p>
            <button onClick={onAccept} className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-4 rounded-lg mt-1">Aceptar</button>
        </div>
    </div>
);

const OffersScreen = ({ tripRequest, onAcceptOffer }: { tripRequest: TripRequest, onAcceptOffer: (driver: Driver, offer: Offer) => void }) => (
    <div className="bg-gray-900/80 backdrop-blur-md rounded-t-3xl p-6">
        <h2 className="text-xl font-bold mb-4">Ofertas de Conductores</h2>
        <div className="space-y-3 max-h-[50vh] overflow-y-auto">
            {tripRequest.offers.map(offer => {
                const driver = mockDrivers.find(d => d.id === offer.driverId);
                if (!driver) return null;
                return <DriverOfferCard key={driver.id} driver={driver} offer={offer} onAccept={() => onAcceptOffer(driver, offer)} />;
            })}
        </div>
    </div>
);

const TripScreen = ({ trip, userRole }: { trip: OngoingTrip, userRole: UserRole }) => {
    const otherUser = userRole === UserRole.PASSENGER ? trip.driver : trip.request.passenger;
    
    return (
        <div className="bg-gray-900/80 backdrop-blur-md rounded-t-3xl p-6">
            <h2 className="text-xl font-bold mb-4">Viaje en Progreso</h2>
            <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <img src={otherUser.avatarUrl} alt={otherUser.name} className="w-12 h-12 rounded-full" />
                        <div>
                            <p className="font-bold">{otherUser.name}</p>
                            {otherUser.role === UserRole.DRIVER && (
                                <>
                                    <div className="flex items-center gap-1 text-yellow-400">
                                        <StarIcon className="w-4 h-4" /> {(otherUser as Driver).rating}
                                    </div>
                                    <p className="text-sm text-gray-400">{(otherUser as Driver).vehicle} - {(otherUser as Driver).plate}</p>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button className="bg-gray-600 p-3 rounded-full"><PhoneIcon /></button>
                        <button className="bg-gray-600 p-3 rounded-full"><MessageSquareIcon /></button>
                    </div>
                </div>
                <div className="mt-4 border-t border-gray-600 pt-4">
                    <p className="text-gray-400">Destino</p>
                    <p>{trip.request.destination}</p>
                </div>
            </div>
             <button className="w-full bg-red-600 hover:bg-red-700 rounded-lg py-3 mt-6 font-bold text-lg">Cancelar Viaje</button>
        </div>
    );
};

const TripCompleteScreen = ({ trip, onNewRide }: { trip: OngoingTrip, onNewRide: () => void }) => (
    <div className="bg-gray-900/80 backdrop-blur-md rounded-t-3xl p-6 text-center">
        <h2 className="text-2xl font-bold">Viaje Completado!</h2>
        <p className="text-gray-400 mt-2">Pagaste un total de</p>
        <p className="text-4xl font-bold my-4">${trip.finalPrice.toFixed(2)}</p>
        <div className="flex justify-center gap-2 my-6">
            {[1, 2, 3, 4, 5].map(i => <StarIcon key={i} className="w-8 h-8 text-gray-600 hover:text-yellow-400 cursor-pointer" filled={false}/>)}
        </div>
        <button onClick={onNewRide} className="w-full bg-green-600 hover:bg-green-700 rounded-lg py-3 mt-4 font-bold text-lg">Solicitar Nuevo Viaje</button>
    </div>
);

const DriverDashboard = ({ driver }: { driver: Driver }) => (
     <div className="bg-gray-900/80 backdrop-blur-md rounded-t-3xl p-6">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Panel de Conductor</h2>
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${driver.isOnline ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {driver.isOnline ? 'En Linea' : 'Desconectado'}
            </div>
        </div>
        <div className="text-center mt-8">
            <SteeringWheelIcon className="w-24 h-24 text-gray-500 mx-auto" />
            <p className="mt-4 text-gray-400">Esperando solicitudes de viaje...</p>
        </div>
    </div>
);

const AdminDashboard = () => (
    <div className="bg-gray-900/80 backdrop-blur-md rounded-t-3xl p-6">
        <h2 className="text-xl font-bold mb-4">Panel de Administrador</h2>
        <p className="text-gray-400">Bienvenido al panel de control. Aquí puedes gestionar conductores, pasajeros y ver estadísticas.</p>
        {/* Admin features would go here */}
        <div className="mt-6 space-y-4">
            {mockDrivers.map(driver => (
                 <div key={driver.id} className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <img src={driver.avatarUrl} alt={driver.name} className="w-12 h-12 rounded-full" />
                        <div>
                            <p className="font-bold">{driver.name}</p>
                            <p className="text-sm text-gray-400">{driver.plate}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <ShieldIcon className="w-5 h-5 text-cyan-400" />
                        <span>{driver.verificationStatus}</span>
                    </div>
                </div>
            ))}
        </div>
    </div>
);


const RoleSwitcher = ({ onSwitch }: { onSwitch: (role: UserRole) => void }) => (
    <header className="flex justify-center mb-4">
        <div className="bg-gray-900/80 backdrop-blur-md p-1 rounded-full flex gap-1">
            <button onClick={() => onSwitch(UserRole.PASSENGER)} className="px-4 py-1.5 rounded-full flex items-center gap-2 hover:bg-gray-800"><UserIcon className="w-5 h-5" /> Pasajero</button>
            <button onClick={() => onSwitch(UserRole.DRIVER)} className="px-4 py-1.5 rounded-full flex items-center gap-2 hover:bg-gray-800"><SteeringWheelIcon className="w-5 h-5" /> Conductor</button>
            <button onClick={() => onSwitch(UserRole.ADMIN)} className="px-4 py-1.5 rounded-full flex items-center gap-2 hover:bg-gray-800"><ShieldIcon className="w-5 h-5" /> Admin</button>
        </div>
    </header>
);

// --- MAIN APP COMPONENT ---
const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | Driver | Passenger>(mockPassenger);
    const [appState, setAppState] = useState<AppState>(AppState.REQUESTING_RIDE);
    const [tripRequest, setTripRequest] = useState<TripRequest | null>(null);
    const [ongoingTrip, setOngoingTrip] = useState<OngoingTrip | null>(null);

    const handleRideRequest = (details: Omit<TripRequest, 'id' | 'passenger' | 'createdAt' | 'offers'>) => {
        if (currentUser.role !== UserRole.PASSENGER) return;
        const newRequest: TripRequest = {
            id: `trip_${Date.now()}`,
            passenger: currentUser as Passenger,
            createdAt: Date.now(),
            offers: [],
            ...details,
        };
        setTripRequest(newRequest);
        setAppState(AppState.WAITING_FOR_OFFERS);
    };

    const handleAcceptOffer = (driver: Driver, offer: Offer) => {
        if (!tripRequest) return;
        const newTrip: OngoingTrip = {
            id: tripRequest.id,
            request: tripRequest,
            driver,
            finalPrice: offer.price,
            startTime: Date.now(),
        };
        setOngoingTrip(newTrip);
        setAppState(AppState.TRIP_IN_PROGRESS);
    };
    
    const resetPassengerFlow = () => {
        setTripRequest(null);
        setOngoingTrip(null);
        setAppState(AppState.REQUESTING_RIDE);
    };

    const handleSwitchRole = (role: UserRole) => {
        setTripRequest(null);
        setOngoingTrip(null);
        if (role === UserRole.PASSENGER) {
            setCurrentUser(mockPassenger);
            setAppState(AppState.REQUESTING_RIDE);
        } else if (role === UserRole.DRIVER) {
            setCurrentUser(mockDrivers[0]);
            setAppState(AppState.DRIVER_IDLE);
        } else if (role === UserRole.ADMIN) {
            setCurrentUser(mockAdmin);
            setAppState(AppState.ADMIN_DASHBOARD);
        }
    }

    // Effect for simulating offers arriving
    useEffect(() => {
        if (appState === AppState.WAITING_FOR_OFFERS && tripRequest) {
            const timer = setTimeout(() => {
                const offers: Offer[] = mockDrivers.map(driver => ({
                    driverId: driver.id,
                    price: tripRequest.offeredPrice * (1 + (Math.random() * 0.2 - 0.1)), // +/- 10%
                }));
                setTripRequest(prev => prev ? { ...prev, offers } : null);
                setAppState(AppState.VIEWING_OFFERS);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [appState, tripRequest]);

    // Effect for simulating trip completion
    useEffect(() => {
        if (appState === AppState.TRIP_IN_PROGRESS && ongoingTrip) {
            const timer = setTimeout(() => {
                setAppState(AppState.TRIP_COMPLETED);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [appState, ongoingTrip]);


    const renderContent = () => {
        switch (currentUser.role) {
            case UserRole.PASSENGER:
                switch (appState) {
                    case AppState.REQUESTING_RIDE:
                        return <RideRequestForm onRideRequest={handleRideRequest} />;
                    case AppState.WAITING_FOR_OFFERS:
                        return <WaitingScreen text="Buscando conductores..." />;
                    case AppState.VIEWING_OFFERS:
                        return tripRequest && <OffersScreen tripRequest={tripRequest} onAcceptOffer={handleAcceptOffer} />;
                    case AppState.TRIP_IN_PROGRESS:
                        return ongoingTrip && <TripScreen trip={ongoingTrip} userRole={UserRole.PASSENGER} />;
                    case AppState.TRIP_COMPLETED:
                        return ongoingTrip && <TripCompleteScreen trip={ongoingTrip} onNewRide={resetPassengerFlow} />;
                    default:
                        return null;
                }
            case UserRole.DRIVER:
                 switch (appState) {
                    case AppState.DRIVER_IDLE:
                        return <DriverDashboard driver={currentUser as Driver} />;
                    case AppState.TRIP_ACCEPTED: // This state is from enum but not used in this simplified flow
                    case AppState.TRIP_IN_PROGRESS: // Re-use trip screen from driver's perspective
                        // To make this work properly, we'd need to simulate a trip for the driver
                        // For now, let's show the idle screen.
                        return <DriverDashboard driver={currentUser as Driver} />;
                    default:
                         return <DriverDashboard driver={currentUser as Driver} />;
                }
            case UserRole.ADMIN:
                return <AdminDashboard />;
            default:
                return <div>Error: Rol de usuario desconocido</div>;
        }
    }

    return (
        <div className="bg-black text-white min-h-screen font-sans antialiased">
            <MapView latitude={34.0522} longitude={-118.2437} />
            <div className="relative z-10 p-4 flex flex-col h-screen">
                <RoleSwitcher onSwitch={handleSwitchRole} />
                <main className="flex-grow flex flex-col justify-end">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default App;
