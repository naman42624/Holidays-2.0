// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
  meta?: {
    total?: number
    page?: number
    limit?: number
    hasMore?: boolean
    [key: string]: unknown
  }
}

// User Types
export interface User {
  _id: string
  email: string
  firstName: string
  lastName: string
  isActive: boolean
  role: 'user' | 'admin' | 'super-admin' | 'website-editor'
  lastLogin?: Date
  preferences: {
    currency: string
    language: string
    timezone: string
  }
  profile: {
    dateOfBirth?: Date
    phone?: string
    address?: {
      street: string
      city: string
      country: string
      postalCode: string
    }
  }
  createdAt: Date
  updatedAt: Date
}

export interface AuthData {
  user: User
  token: string
}

// Location Types
export interface Location {
  id: string
  name: string
  detailedName: string
  type: string
  iataCode: string
  city: string
  cityCode: string
  country: string
  countryCode: string
  coordinates: {
    latitude: number
    longitude: number
  }
  timeZone: string
  relevanceScore: number
}

// Flight Types
export interface FlightSearchParams {
  originLocationCode: string
  destinationLocationCode: string
  departureDate: string
  returnDate?: string
  adults: number
  children?: number
  infants?: number
  max?: number
  currencyCode?: string
  nonStop?: boolean
  travelClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST'
}

export interface FlightOffer {
  id: string
  oneWay: boolean
  numberOfBookableSeats: number
  price: {
    total: string
    currency: string
  }
  itineraries: FlightItinerary[]
  travelerPricings: TravelerPricing[]
}

export interface FlightItinerary {
  duration: string
  segments: FlightSegment[]
}

export interface FlightSegment {
  departure: {
    iataCode: string
    at: string
    terminal?: string
  }
  arrival: {
    iataCode: string
    at: string
    terminal?: string
  }
  carrierCode: string
  flightNumber: string
  aircraft: {
    code: string
  }
  duration: string
}

export interface TravelerPricing {
  travelerId: string
  fareOption: string
  travelerType: 'ADULT' | 'CHILD' | 'INFANT'
  price: {
    currency: string
    total: string
  }
  fareDetailsBySegment: FareDetailsBySegment[]
}

export interface FareDetailsBySegment {
  segmentId: string
  cabin: string
  fareBasis: string
  class: string
  includedCheckedBags: {
    weight: number
    weightUnit: string
  }
  includedCabinBags: {
    weight: number
    weightUnit: string
  }
  amenities: Amenity[]
}

export interface Amenity {
  description: string
  isChargeable: boolean
  amenityType: string
  amenityProvider: {
    name: string
  }
}

// Hotel Types
export interface HotelSearchParams {
  cityCode: string
  checkInDate: string
  checkOutDate: string
  adults: number
  children?: number
  radius?: number
  radiusUnit?: 'KM' | 'MILE'
  hotelSource?: string
  ratings?: number[]
  priceRange?: string
  currency?: string
  paymentPolicy?: string
  boardType?: string
}

export interface Hotel {
  hotelId: string
  name: string
  description?: string
  rating?: number
  amenities?: string[]
  contact?: {
    phone?: string
    email?: string
  }
  address: {
    lines: string[]
    cityName: string
    countryCode: string
  }
  geoCode?: {
    latitude: number
    longitude: number
  }
  offers?: HotelOffer[]
}

export interface HotelOffer {
  id: string
  checkInDate: string
  checkOutDate: string
  roomQuantity: number
  price: {
    currency: string
    total: string
  }
  room: {
    type: string
    typeEstimated: {
      category: string
      beds: number
      bedType: string
    }
  }
  policies?: {
    cancellation?: Record<string, unknown>
    guarantee?: Record<string, unknown>
  }
}

// Activity Types
export interface ActivitySearchParams {
  latitude: number
  longitude: number
  radius?: number
}

export interface Activity {
  id: string
  name: string
  description: string
  shortDescription?: string
  rating?: number
  images?: string[]
  pictures?: string[]
  bookingLink?: string
  price?: {
    amount: string
    currency: string
  }
  duration?: {
    minimum: string
  }
  location: {
    latitude: number
    longitude: number
  }
  tags?: string[]
}

// Search Form Types
export interface FlightSearchForm {
  from: string
  to: string
  departureDate: string
  returnDate?: string
  passengers: {
    adults: number
    children: number
    infants: number
  }
  travelClass: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST'
  tripType: 'round-trip' | 'one-way'
}

export interface HotelSearchForm {
  destination: string
  checkIn: string
  checkOut: string
  adults: number
  children: number
  rooms: number
}

export interface ActivitySearchForm {
  destination: string
  date?: string
  travelers?: number
}

// Booking Types
export interface BookingPassenger {
  id: string
  title: 'Mr' | 'Mrs' | 'Ms' | 'Miss' | 'Dr'
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  email: string
  phone: string
  passportNumber?: string
  passportExpiry?: string
  nationality: string
  type: 'ADULT' | 'CHILD' | 'INFANT'
}

export interface BookingContact {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: {
    street: string
    city: string
    country: string
    postalCode: string
  }
}

export interface FlightBookingRequest {
  flightData: {
    origin: string
    destination: string
    departureDate: string
    returnDate?: string
    flightOffers: FlightOffer[]
    airline: string
    flightNumber: string
    duration: string
    stops: number
  }
  passengers: BookingPassenger[]
  contact: BookingContact
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  specialRequests?: string
}

export interface SeatSelection {
  passengerId: string
  seatNumber: string
  seatPrice?: number
  seatType: 'WINDOW' | 'AISLE' | 'MIDDLE'
}

export interface MealSelection {
  passengerId: string
  mealType: 'REGULAR' | 'VEGETARIAN' | 'VEGAN' | 'KOSHER' | 'HALAL' | 'GLUTEN_FREE'
  mealPrice?: number
}

export interface BookingExtras {
  seats: SeatSelection[]
  meals: MealSelection[]
  extraBaggage?: {
    passengerId: string
    weight: number
    price: number
  }[]
}

export interface BookingConfirmation {
  bookingId: string
  pnr: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
  totalAmount: number
  currency: string
  bookingDate: string
  flightDetails: FlightOffer
  passengers: BookingPassenger[]
  contact: BookingContact
  extras?: BookingExtras
}
