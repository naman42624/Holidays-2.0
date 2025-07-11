import { FlightBooking, HotelBooking, IFlightBooking, IHotelBooking } from '@/models/Booking';
import User from '@/models/User';
import mongoose from 'mongoose';
import { flightService } from './flight.service';
import { hotelService } from './hotel.service';

export interface CreateFlightBookingRequest {
  // Flight details
  flightData: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    flightOffers: any[];
    airline: string;
    flightNumber: string;
    duration: string;
    stops: number;
  };
  
  // Passenger information
  passengers: Array<{
    title: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: 'male' | 'female' | 'other';
    nationality: string;
    passportNumber?: string;
    passportExpiry?: string;
    email?: string;
    phone?: string;
  }>;
  
  // Contact information
  contact: {
    title: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    alternatePhone?: string;
    address: {
      street: string;
      city: string;
      country: string;
      postalCode: string;
    };
  };
  
  // Pricing
  pricing: {
    basePrice: number;
    taxes: number;
    totalPrice: number;
    currency: string;
    extrasPrice?: number;
    finalPrice: number;
  };
  
  // Extras
  extras?: {
    seats?: Array<{
      passengerId: string;
      seatNumber: string;
      price: number;
    }>;
    meals?: Array<{
      passengerId: string;
      mealType: string;
      price: number;
    }>;
    baggage?: Array<{
      passengerId: string;
      weight: number;
      price: number;
    }>;
  };
  
  // Special requests
  specialRequests?: string;
  
  // User ID (optional for guest bookings)
  userId?: string;
}

export interface CreateHotelBookingRequest {
  // Hotel details
  hotelData: {
    hotelId: string;
    name: string;
    address: {
      street: string;
      city: string;
      country: string;
      postalCode: string;
    };
    checkIn: string;
    checkOut: string;
    nights: number;
    rooms: Array<{
      roomType: string;
      roomName: string;
      guests: number;
      price: number;
    }>;
  };
  
  // Guest information
  guests: Array<{
    title: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    isMainGuest: boolean;
  }>;
  
  // Contact information
  contact: {
    title: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    alternatePhone?: string;
    address: {
      street: string;
      city: string;
      country: string;
      postalCode: string;
    };
  };
  
  // Pricing
  pricing: {
    basePrice: number;
    taxes: number;
    totalPrice: number;
    currency: string;
    finalPrice: number;
  };
  
  // Special requests
  specialRequests?: string;
  
  // User ID (optional for guest bookings)
  userId?: string;
}

class BookingService {
  /**
   * Create a new flight booking
   */
  async createFlightBooking(bookingRequest: CreateFlightBookingRequest): Promise<IFlightBooking> {
    try {
      // Validate user if userId is provided
      if (bookingRequest.userId) {
        const user = await User.findById(bookingRequest.userId);
        if (!user) {
          throw new Error('User not found');
        }
      }

      // Convert string dates to Date objects
      const flightData = {
        ...bookingRequest.flightData,
        departureDate: new Date(bookingRequest.flightData.departureDate),
        returnDate: bookingRequest.flightData.returnDate ? new Date(bookingRequest.flightData.returnDate) : undefined,
      };

      const passengers = bookingRequest.passengers.map(passenger => ({
        ...passenger,
        dateOfBirth: new Date(passenger.dateOfBirth),
        passportExpiry: passenger.passportExpiry ? new Date(passenger.passportExpiry) : undefined,
      }));

      // Create the booking
      const booking = new FlightBooking({
        userId: bookingRequest.userId ? new mongoose.Types.ObjectId(bookingRequest.userId) : undefined,
        flightData,
        passengers,
        contact: bookingRequest.contact,
        pricing: bookingRequest.pricing,
        extras: bookingRequest.extras,
        specialRequests: bookingRequest.specialRequests,
      });

      const savedBooking = await booking.save();
      
      // If this is a guest booking, auto-create a user account
      if (!bookingRequest.userId) {
        await this.createGuestUser(bookingRequest.contact, savedBooking._id);
      }

      return savedBooking;
    } catch (error) {
      console.error('Error creating flight booking:', error);
      throw error;
    }
  }

  /**
   * Create a new hotel booking
   */
  async createHotelBooking(bookingRequest: CreateHotelBookingRequest): Promise<IHotelBooking> {
    try {
      // Validate user if userId is provided
      if (bookingRequest.userId) {
        const user = await User.findById(bookingRequest.userId);
        if (!user) {
          throw new Error('User not found');
        }
      }

      // Convert string dates to Date objects
      const hotelData = {
        ...bookingRequest.hotelData,
        checkIn: new Date(bookingRequest.hotelData.checkIn),
        checkOut: new Date(bookingRequest.hotelData.checkOut),
      };

      // Create the booking
      const booking = new HotelBooking({
        userId: bookingRequest.userId ? new mongoose.Types.ObjectId(bookingRequest.userId) : undefined,
        hotelData,
        guests: bookingRequest.guests,
        contact: bookingRequest.contact,
        pricing: bookingRequest.pricing,
        specialRequests: bookingRequest.specialRequests,
      });

      const savedBooking = await booking.save();
      
      // If this is a guest booking, auto-create a user account
      if (!bookingRequest.userId) {
        await this.createGuestUser(bookingRequest.contact, savedBooking._id);
      }

      return savedBooking;
    } catch (error) {
      console.error('Error creating hotel booking:', error);
      throw error;
    }
  }

  /**
   * Create a guest user account automatically
   */
  private async createGuestUser(contact: any, bookingId: mongoose.Types.ObjectId): Promise<void> {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: contact.email });
      if (existingUser) {
        // Link booking to existing user
        await FlightBooking.findByIdAndUpdate(bookingId, { userId: existingUser._id });
        await HotelBooking.findByIdAndUpdate(bookingId, { userId: existingUser._id });
        return;
      }

      // Create new guest user
      const guestUser = new User({
        email: contact.email,
        firstName: contact.firstName,
        lastName: contact.lastName,
        password: Math.random().toString(36).slice(-8), // Temporary password
        role: 'user',
        isActive: true,
        profile: {
          phone: contact.phone,
          address: contact.address,
        },
        preferences: {
          currency: 'USD',
          language: 'en',
          timezone: 'UTC',
        },
      });

      const savedUser = await guestUser.save();
      
      // Link booking to new user
      await FlightBooking.findByIdAndUpdate(bookingId, { userId: savedUser._id });
      await HotelBooking.findByIdAndUpdate(bookingId, { userId: savedUser._id });
    } catch (error) {
      console.error('Error creating guest user:', error);
      // Don't throw error as the booking should still be saved
    }
  }

  /**
   * Get booking by ID
   */
  async getBookingById(bookingId: string): Promise<IFlightBooking | IHotelBooking | null> {
    try {
      // Try flight booking first
      const flightBooking = await FlightBooking.findOne({ bookingId }).populate('userId', 'firstName lastName email');
      if (flightBooking) {
        return flightBooking;
      }

      // Try hotel booking
      const hotelBooking = await HotelBooking.findOne({ bookingId }).populate('userId', 'firstName lastName email');
      return hotelBooking;
    } catch (error) {
      console.error('Error getting booking:', error);
      throw error;
    }
  }

  /**
   * Get all bookings for a user
   */
  async getUserBookings(userId: string): Promise<Array<IFlightBooking | IHotelBooking>> {
    try {
      const [flightBookings, hotelBookings] = await Promise.all([
        FlightBooking.find({ userId }).sort({ createdAt: -1 }),
        HotelBooking.find({ userId }).sort({ createdAt: -1 }),
      ]);

      return [...flightBookings, ...hotelBookings].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Error getting user bookings:', error);
      throw error;
    }
  }

  /**
   * Get all bookings for admin panel
   */
  async getAllBookings(
    page: number = 1,
    limit: number = 20,
    status?: string,
    type?: 'flight' | 'hotel'
  ): Promise<{
    bookings: Array<IFlightBooking | IHotelBooking>;
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      const filter: any = {};
      
      if (status) {
        filter.status = status;
      }

      let bookings: Array<IFlightBooking | IHotelBooking> = [];
      let total = 0;

      if (type === 'flight') {
        [bookings, total] = await Promise.all([
          FlightBooking.find(filter).populate('userId', 'firstName lastName email').sort({ createdAt: -1 }).skip(skip).limit(limit),
          FlightBooking.countDocuments(filter),
        ]);
      } else if (type === 'hotel') {
        [bookings, total] = await Promise.all([
          HotelBooking.find(filter).populate('userId', 'firstName lastName email').sort({ createdAt: -1 }).skip(skip).limit(limit),
          HotelBooking.countDocuments(filter),
        ]);
      } else {
        // Get both types
        const [flightBookings, hotelBookings, flightCount, hotelCount] = await Promise.all([
          FlightBooking.find(filter).populate('userId', 'firstName lastName email').sort({ createdAt: -1 }),
          HotelBooking.find(filter).populate('userId', 'firstName lastName email').sort({ createdAt: -1 }),
          FlightBooking.countDocuments(filter),
          HotelBooking.countDocuments(filter),
        ]);

        const allBookings = [...flightBookings, ...hotelBookings].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        bookings = allBookings.slice(skip, skip + limit);
        total = flightCount + hotelCount;
      }

      return {
        bookings,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Error getting all bookings:', error);
      throw error;
    }
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(bookingId: string, status: string): Promise<IFlightBooking | IHotelBooking | null> {
    try {
      // Try flight booking first
      const flightBooking = await FlightBooking.findOneAndUpdate(
        { bookingId },
        { status },
        { new: true }
      ).populate('userId', 'firstName lastName email');
      
      if (flightBooking) {
        return flightBooking;
      }

      // Try hotel booking
      const hotelBooking = await HotelBooking.findOneAndUpdate(
        { bookingId },
        { status },
        { new: true }
      ).populate('userId', 'firstName lastName email');
      
      return hotelBooking;
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(bookingId: string, paymentStatus: string, paymentMethod?: string): Promise<IFlightBooking | IHotelBooking | null> {
    try {
      const updateData: any = { paymentStatus };
      if (paymentMethod) {
        updateData.paymentMethod = paymentMethod;
      }

      // Try flight booking first
      const flightBooking = await FlightBooking.findOneAndUpdate(
        { bookingId },
        updateData,
        { new: true }
      ).populate('userId', 'firstName lastName email');
      
      if (flightBooking) {
        return flightBooking;
      }

      // Try hotel booking
      const hotelBooking = await HotelBooking.findOneAndUpdate(
        { bookingId },
        updateData,
        { new: true }
      ).populate('userId', 'firstName lastName email');
      
      return hotelBooking;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  /**
   * Get booking statistics for admin dashboard
   */
  async getBookingStats(): Promise<{
    totalBookings: number;
    flightBookings: number;
    hotelBookings: number;
    pendingBookings: number;
    confirmedBookings: number;
    totalRevenue: number;
    recentBookings: Array<IFlightBooking | IHotelBooking>;
  }> {
    try {
      const [
        flightBookings,
        hotelBookings,
        pendingFlights,
        pendingHotels,
        confirmedFlights,
        confirmedHotels,
        recentFlights,
        recentHotels,
      ] = await Promise.all([
        FlightBooking.countDocuments(),
        HotelBooking.countDocuments(),
        FlightBooking.countDocuments({ status: 'pending' }),
        HotelBooking.countDocuments({ status: 'pending' }),
        FlightBooking.countDocuments({ status: 'confirmed' }),
        HotelBooking.countDocuments({ status: 'confirmed' }),
        FlightBooking.find().sort({ createdAt: -1 }).limit(5).populate('userId', 'firstName lastName email'),
        HotelBooking.find().sort({ createdAt: -1 }).limit(5).populate('userId', 'firstName lastName email'),
      ]);

      // Calculate total revenue from confirmed bookings
      const [flightRevenue, hotelRevenue] = await Promise.all([
        FlightBooking.aggregate([
          { $match: { status: 'confirmed' } },
          { $group: { _id: null, total: { $sum: '$pricing.finalPrice' } } }
        ]),
        HotelBooking.aggregate([
          { $match: { status: 'confirmed' } },
          { $group: { _id: null, total: { $sum: '$pricing.finalPrice' } } }
        ])
      ]);

      const totalRevenue = (flightRevenue[0]?.total || 0) + (hotelRevenue[0]?.total || 0);

      const recentBookings = [...recentFlights, ...recentHotels]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      return {
        totalBookings: flightBookings + hotelBookings,
        flightBookings,
        hotelBookings,
        pendingBookings: pendingFlights + pendingHotels,
        confirmedBookings: confirmedFlights + confirmedHotels,
        totalRevenue,
        recentBookings,
      };
    } catch (error) {
      console.error('Error getting booking stats:', error);
      throw error;
    }
  }
}

export const bookingService = new BookingService();
