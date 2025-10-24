export enum AppState {
  // Passenger states
  REQUESTING_RIDE,
  WAITING_FOR_OFFERS,
  VIEWING_OFFERS,
  TRIP_IN_PROGRESS,
  TRIP_COMPLETED,
  
  // Driver states
  DRIVER_OFFLINE,
  DRIVER_IDLE,
  TRIP_ACCEPTED,

  // Admin states
  ADMIN_DASHBOARD,
}

export enum UserRole {
    PASSENGER = 'Pasajero',
    DRIVER = 'Conductor',
    ADMIN = 'Admin'
}

export enum VerificationStatus {
    PENDING = 'Pendiente',
    APPROVED = 'Aprobado',
    REJECTED = 'Rechazado'
}

export enum ServiceType {
  MOBILITY = 'Movilidad',
  DELIVERY = 'Paquetería'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatarUrl: string;
  isBlocked?: boolean;
}

export interface Driver extends User {
  role: UserRole.DRIVER;
  rating: number;
  vehicle: string;
  plate: string;
  isOnline: boolean;
  verificationStatus: VerificationStatus;
}

export interface Passenger extends User {
    role: UserRole.PASSENGER;
}

export interface TripRequest {
    id: string;
    passenger: Passenger;
    pickup: string;
    destination: string;
    offeredPrice: number;
    serviceType: ServiceType;
    createdAt: number;
    offers: Offer[];
}

export interface Offer {
  driverId: string;
  price: number;
  // We can get driver details from their ID
}

export interface OngoingTrip {
    id: string;
    request: TripRequest;
    driver: Driver;
    finalPrice: number;
    startTime: number;
}
