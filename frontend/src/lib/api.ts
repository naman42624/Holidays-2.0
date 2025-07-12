import axios from 'axios'
import { FlightBookingRequest, BookingConfirmation, FlightOffer } from '@/types'

const API_BASE_URL = 'https://plankton-app-exkyh.ondigitalocean.app/api'

console.log('API Base URL:', API_BASE_URL)

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.url, response.status, response.data)
    return response
  },
  (error) => {
    console.error('API Error:', error.config?.url, error.response?.status, error.response?.data)
    
    // Network error
    if (!error.response) {
      console.error('Network Error: Server might be down or unreachable')
      return Promise.reject({
        ...error,
        message: 'Network error. Please check your connection and try again.'
      })
    }
    
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Token expired or invalid
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      
      // Only redirect if we're not already on the login page
      if (!window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api

// API endpoints
export const endpoints = {
  // Auth
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    profile: '/auth/profile',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    changePassword: '/auth/change-password',
  },
  
  // Flights
  flights: {
    search: '/flights/search',
    offers: '/flights/offers',
    prices: '/flights/prices',
    destinations: '/flights/destinations',
    airlines: '/flights/airlines',
  },
  
  // Locations
  locations: {
    search: '/locations/search',
    details: (id: string) => `/locations/${id}`,
    nearbyAirports: '/locations/nearby-airports',
    popularDestinations: '/locations/popular-destinations',
    airportsByCity: (cityCode: string) => `/locations/airports-by-city/${cityCode}`,
  },
  
  // Hotels
  hotels: {
    search: '/hotels/search',
    offers: '/hotels/offers',
    details: (offerId: string) => `/hotels/offers/${offerId}`,
  },
  
  // Activities
  activities: {
    search: '/activities/search',
    details: (id: string) => `/activities/${id}`,
    pointsOfInterest: '/activities/points-of-interest',
    categories: '/activities/categories',
  },
  
  // Playground
  playground: {
    info: '/playground',
    test: '/playground/test',
    liveTest: '/playground/live-test',
  },
  
  // Tour Packages
  tourPackages: {
    all: '/tour-packages',
    details: (id: string) => `/tour-packages/${id}`,
    search: '/tour-packages/search',
    admin: {
      all: '/tour-packages/admin/all',
      details: (id: string) => `/tour-packages/admin/${id}`,
      create: '/tour-packages',
      update: (id: string) => `/tour-packages/${id}`,
      delete: (id: string) => `/tour-packages/${id}`,
      togglePublish: (id: string) => `/tour-packages/${id}/toggle-publish`,
      search: '/tour-packages/admin/search',
    },
  },
  
  // Bookings
  bookings: {
    flight: '/bookings/flight',
    hotel: '/bookings/hotel',
    get: (bookingId: string) => `/bookings/${bookingId}`,
    user: (userId: string) => `/bookings/user/${userId}`,
    admin: {
      all: '/bookings/admin/all',
      stats: '/bookings/admin/stats',
      updateStatus: (bookingId: string) => `/bookings/${bookingId}/status`,
      updatePayment: (bookingId: string) => `/bookings/${bookingId}/payment`,
    },
  },
  
  // Health
  health: '/health',
}

// Booking API functions
export const bookingApi = {
  // Create flight booking
  createFlightBooking: async (bookingData: FlightBookingRequest): Promise<BookingConfirmation> => {
    const response = await api.post(endpoints.bookings.flight, bookingData);
    const booking = response.data.data;
    
    // Map backend response to frontend BookingConfirmation interface
    return {
      bookingId: booking._id || booking.id,
      pnr: booking.bookingReference || `BK${Date.now()}`,
      status: booking.status || 'PENDING',
      totalAmount: booking.pricing?.finalPrice || 0,
      currency: booking.pricing?.currency || 'USD',
      bookingDate: booking.createdAt || new Date().toISOString(),
      flightDetails: bookingData.flightData.flightOffers[0],
      passengers: bookingData.passengers,
      contact: bookingData.contact,
      extras: undefined // FlightBookingRequest doesn't have extras field
    };
  },

  // Create hotel booking
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createHotelBooking: async (bookingData: any): Promise<BookingConfirmation> => {
    const response = await api.post(endpoints.bookings.hotel, bookingData);
    const booking = response.data.data;
    
    // Map backend response to frontend BookingConfirmation interface
    return {
      bookingId: booking._id || booking.id,
      pnr: booking.bookingReference || `HB${Date.now()}`,
      status: booking.status || 'PENDING',
      totalAmount: booking.pricing?.finalPrice || 0,
      currency: booking.pricing?.currency || 'USD',
      bookingDate: booking.createdAt || new Date().toISOString(),
      flightDetails: null as unknown as FlightOffer, // Hotel booking doesn't have flight details
      passengers: bookingData.guests.map((guest: { title: string; firstName: string; lastName: string; email?: string; phone?: string; dateOfBirth?: string; nationality?: string; passportNumber?: string }) => ({
        ...guest,
        dateOfBirth: guest.dateOfBirth || '',
        nationality: guest.nationality || '',
        passportNumber: guest.passportNumber || '',
        email: guest.email || bookingData.contact.email,
        phone: guest.phone || bookingData.contact.phone
      })),
      contact: bookingData.contact,
      extras: undefined
    };
  },

  // Get booking by ID
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getBooking: async (bookingId: string): Promise<{ id: string; status: string; type: string; [key: string]: any }> => {
    const response = await api.get(endpoints.bookings.get(bookingId));
    return response.data.data;
  },

  // Get user bookings
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getUserBookings: async (userId: string): Promise<Array<{ id: string; status: string; type: string; [key: string]: any }>> => {
    const response = await api.get(endpoints.bookings.user(userId));
    return response.data.data;
  },

  // Admin functions
  admin: {
    // Get all bookings
    getAllBookings: async (params: {
      page?: number;
      limit?: number;
      status?: string;
      type?: 'flight' | 'hotel';
    } = {}): Promise<{
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      bookings: Array<{ id: string; status: string; type: string; [key: string]: any }>;
      total: number;
      page: number;
      totalPages: number;
    }> => {
      const response = await api.get(endpoints.bookings.admin.all, { params });
      return {
        bookings: response.data.data,
        total: response.data.meta.total,
        page: response.data.meta.page,
        totalPages: response.data.meta.totalPages,
      };
    },

    // Get booking statistics
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getStats: async (): Promise<{ totalBookings: number; revenue: number; [key: string]: any }> => {
      const response = await api.get(endpoints.bookings.admin.stats);
      return response.data.data;
    },

    // Update booking status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateStatus: async (bookingId: string, status: string): Promise<{ id: string; status: string; [key: string]: any }> => {
      const response = await api.put(endpoints.bookings.admin.updateStatus(bookingId), { status });
      return response.data.data;
    },

    // Update payment status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updatePayment: async (bookingId: string, paymentStatus: string, paymentMethod?: string): Promise<{ id: string; paymentStatus: string; [key: string]: any }> => {
      const response = await api.put(endpoints.bookings.admin.updatePayment(bookingId), {
        paymentStatus,
        paymentMethod,
      });
      return response.data.data;
    },
  },
};
