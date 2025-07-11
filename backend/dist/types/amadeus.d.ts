export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    meta?: {
        total?: number;
        page?: number;
        limit?: number;
        hasMore?: boolean;
        [key: string]: any;
    };
}
export interface AmadeusToken {
    access_token: string;
    token_type: string;
    expires_in: number;
    state?: string;
    scope?: string;
}
export interface FlightSearchParams {
    originLocationCode: string;
    destinationLocationCode: string;
    departureDate: string;
    returnDate?: string;
    adults: number;
    children?: number;
    infants?: number;
    max?: number;
    currencyCode?: string;
    nonStop?: boolean;
    travelClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
    oneWay?: boolean;
}
export interface FlightOffer {
    id: string;
    type: string;
    source: string;
    instantTicketingRequired: boolean;
    nonHomogeneous: boolean;
    oneWay: boolean;
    lastTicketingDate: string;
    numberOfBookableSeats: number;
    itineraries: Itinerary[];
    price: Price;
    pricingOptions: PricingOptions;
    validatingAirlineCodes: string[];
    travelerPricings: TravelerPricing[];
}
export interface Itinerary {
    duration: string;
    segments: Segment[];
}
export interface Segment {
    departure: LocationTime;
    arrival: LocationTime;
    carrierCode: string;
    number: string;
    aircraft: Aircraft;
    operating?: Operating;
    duration: string;
    id: string;
    numberOfStops: number;
    blacklistedInEU: boolean;
}
export interface LocationTime {
    iataCode: string;
    terminal?: string;
    at: string;
}
export interface Aircraft {
    code: string;
}
export interface Operating {
    carrierCode: string;
}
export interface Price {
    currency: string;
    total: string;
    base: string;
    fees: Fee[];
    grandTotal: string;
}
export interface Fee {
    amount: string;
    type: string;
}
export interface PricingOptions {
    fareType: string[];
    includedCheckedBagsOnly: boolean;
}
export interface TravelerPricing {
    travelerId: string;
    fareOption: string;
    travelerType: string;
    price: Price;
    fareDetailsBySegment: FareDetailsBySegment[];
}
export interface FareDetailsBySegment {
    segmentId: string;
    cabin: string;
    fareBasis: string;
    class: string;
    includedCheckedBags: IncludedCheckedBags;
}
export interface IncludedCheckedBags {
    weight?: number;
    weightUnit?: string;
    quantity?: number;
}
export interface LocationSearchParams {
    keyword: string;
    subType?: string;
    countryCode?: string;
    view?: string;
    sort?: string;
    page?: {
        limit?: number;
        offset?: number;
    };
}
export interface Location {
    type: string;
    subType: string;
    name: string;
    detailedName: string;
    id: string;
    self: Self;
    timeZoneOffset: string;
    iataCode: string;
    geoCode: GeoCode;
    address: Address;
    analytics: Analytics;
}
export interface Self {
    href: string;
    methods: string[];
}
export interface GeoCode {
    latitude: number;
    longitude: number;
}
export interface Address {
    cityName: string;
    cityCode: string;
    countryName: string;
    countryCode: string;
    regionCode: string;
}
export interface Analytics {
    travelers: Travelers;
}
export interface Travelers {
    score: number;
}
export interface HotelSearchParams {
    cityCode: string;
    checkInDate: string;
    checkOutDate: string;
    adults: number;
    children?: number;
    radius?: number;
    radiusUnit?: 'KM' | 'MILE';
    hotelSource?: string;
    ratings?: number[];
    priceRange?: string;
    currency?: string;
    paymentPolicy?: string;
    boardType?: string;
}
export interface Hotel {
    type: string;
    hotelId: string;
    chainCode: string;
    dupeId: string;
    name: string;
    rating: string;
    cityCode: string;
    latitude: number;
    longitude: number;
    hotelDistance: HotelDistance;
    address: HotelAddress;
    contact: HotelContact;
    description: HotelDescription;
    amenities: string[];
    media: HotelMedia[];
}
export interface HotelDistance {
    value: number;
    unit: string;
}
export interface HotelAddress {
    lines: string[];
    postalCode: string;
    cityName: string;
    countryCode: string;
}
export interface HotelContact {
    phone: string;
    fax: string;
    email: string;
}
export interface HotelDescription {
    lang: string;
    text: string;
}
export interface HotelMedia {
    uri: string;
    category: string;
}
export interface ActivitySearchParams {
    latitude: number;
    longitude: number;
    radius?: number;
    north?: number;
    west?: number;
    south?: number;
    east?: number;
}
export interface Activity {
    type: string;
    id: string;
    self: Self;
    name: string;
    shortDescription: string;
    description: string;
    geoCode: GeoCode;
    rating: string;
    pictures: string[];
    bookingLink: string;
    price: ActivityPrice;
    minimumDuration: string;
    maximumDuration: string;
}
export interface ActivityPrice {
    currencyCode: string;
    amount: string;
}
export interface DestinationSearchParams {
    origin: string;
    departureDate?: string;
    oneWay?: boolean;
    duration?: string;
    nonStop?: boolean;
    maxPrice?: number;
    viewBy?: string;
}
export interface Destination {
    type: string;
    origin: string;
    destination: string;
    departureDate: string;
    returnDate: string;
    price: Price;
    links: DestinationLinks;
}
export interface DestinationLinks {
    flightDates: string;
    flightOffers: string;
}
export interface Traveler {
    id: string;
    dateOfBirth: string;
    name: {
        firstName: string;
        lastName: string;
    };
    gender: 'MALE' | 'FEMALE';
    contact: {
        emailAddress: string;
        phones: Phone[];
    };
    documents?: Document[];
}
export interface Phone {
    deviceType: 'MOBILE' | 'LANDLINE';
    countryCallingCode: string;
    number: string;
}
export interface Document {
    documentType: 'PASSPORT' | 'ID_CARD';
    birthPlace?: string;
    issuanceLocation?: string;
    issuanceDate?: string;
    number: string;
    expiryDate?: string;
    issuanceCountry?: string;
    validityCountry?: string;
    nationality?: string;
    holder?: boolean;
}
export interface BookingRequest {
    flightOffers: FlightOffer[];
    travelers: Traveler[];
    remarks?: {
        general?: Remark[];
    };
    ticketingAgreement?: {
        option: string;
        delay?: string;
    };
    contacts?: Contact[];
}
export interface Remark {
    subType: string;
    text: string;
}
export interface Contact {
    addresseeName: {
        firstName: string;
        lastName: string;
    };
    companyName?: string;
    purpose: string;
    phones: Phone[];
    emailAddress: string;
    address: {
        lines: string[];
        postalCode: string;
        cityName: string;
        countryCode: string;
    };
}
export interface AmadeusError {
    status: number;
    code: number;
    title: string;
    detail: string;
    source?: {
        pointer?: string;
        parameter?: string;
    };
}
export interface AmadeusErrorResponse {
    errors: AmadeusError[];
}
//# sourceMappingURL=amadeus.d.ts.map