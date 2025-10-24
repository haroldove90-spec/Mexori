
export enum AppState {
  REQUESTING_RIDE,
  WAITING_FOR_OFFERS,
  VIEWING_OFFERS,
  TRIP_IN_PROGRESS,
  TRIP_COMPLETED
}

export enum ServiceType {
  MOBILITY = 'Movilidad',
  DELIVERY = 'Paquetería'
}

export interface Driver {
  id: string;
  name: string;
  rating: number;
  vehicle: string;
  plate: string;
  avatarUrl: string;
  eta: number; // in minutes
}

export interface Offer extends Driver {
  price: number;
}

export interface TripDetails {
    pickup: string;
    destination: string;
    offeredPrice: number;
    serviceType: ServiceType;
}

export interface AcceptedTrip {
    driver: Driver;
    finalPrice: number;
    details: TripDetails;
}
