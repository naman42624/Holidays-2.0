"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingService = void 0;
const Booking_1 = require("@/models/Booking");
const User_1 = __importDefault(require("@/models/User"));
const mongoose_1 = __importDefault(require("mongoose"));
class BookingService {
    async createFlightBooking(bookingRequest) {
        try {
            if (bookingRequest.userId) {
                const user = await User_1.default.findById(bookingRequest.userId);
                if (!user) {
                    throw new Error('User not found');
                }
            }
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
            const booking = new Booking_1.FlightBooking({
                userId: bookingRequest.userId ? new mongoose_1.default.Types.ObjectId(bookingRequest.userId) : undefined,
                flightData,
                passengers,
                contact: bookingRequest.contact,
                pricing: bookingRequest.pricing,
                extras: bookingRequest.extras,
                specialRequests: bookingRequest.specialRequests,
            });
            const savedBooking = await booking.save();
            if (!bookingRequest.userId) {
                await this.createGuestUser(bookingRequest.contact, savedBooking._id);
            }
            return savedBooking;
        }
        catch (error) {
            console.error('Error creating flight booking:', error);
            throw error;
        }
    }
    async createHotelBooking(bookingRequest) {
        try {
            if (bookingRequest.userId) {
                const user = await User_1.default.findById(bookingRequest.userId);
                if (!user) {
                    throw new Error('User not found');
                }
            }
            const hotelData = {
                ...bookingRequest.hotelData,
                checkIn: new Date(bookingRequest.hotelData.checkIn),
                checkOut: new Date(bookingRequest.hotelData.checkOut),
            };
            const booking = new Booking_1.HotelBooking({
                userId: bookingRequest.userId ? new mongoose_1.default.Types.ObjectId(bookingRequest.userId) : undefined,
                hotelData,
                guests: bookingRequest.guests,
                contact: bookingRequest.contact,
                pricing: bookingRequest.pricing,
                specialRequests: bookingRequest.specialRequests,
            });
            const savedBooking = await booking.save();
            if (!bookingRequest.userId) {
                await this.createGuestUser(bookingRequest.contact, savedBooking._id);
            }
            return savedBooking;
        }
        catch (error) {
            console.error('Error creating hotel booking:', error);
            throw error;
        }
    }
    async createGuestUser(contact, bookingId) {
        try {
            const existingUser = await User_1.default.findOne({ email: contact.email });
            if (existingUser) {
                await Booking_1.FlightBooking.findByIdAndUpdate(bookingId, { userId: existingUser._id });
                await Booking_1.HotelBooking.findByIdAndUpdate(bookingId, { userId: existingUser._id });
                return;
            }
            const guestUser = new User_1.default({
                email: contact.email,
                firstName: contact.firstName,
                lastName: contact.lastName,
                password: Math.random().toString(36).slice(-8),
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
            await Booking_1.FlightBooking.findByIdAndUpdate(bookingId, { userId: savedUser._id });
            await Booking_1.HotelBooking.findByIdAndUpdate(bookingId, { userId: savedUser._id });
        }
        catch (error) {
            console.error('Error creating guest user:', error);
        }
    }
    async getBookingById(bookingId) {
        try {
            const flightBooking = await Booking_1.FlightBooking.findOne({ bookingId }).populate('userId', 'firstName lastName email');
            if (flightBooking) {
                return flightBooking;
            }
            const hotelBooking = await Booking_1.HotelBooking.findOne({ bookingId }).populate('userId', 'firstName lastName email');
            return hotelBooking;
        }
        catch (error) {
            console.error('Error getting booking:', error);
            throw error;
        }
    }
    async getUserBookings(userId) {
        try {
            const [flightBookings, hotelBookings] = await Promise.all([
                Booking_1.FlightBooking.find({ userId }).sort({ createdAt: -1 }),
                Booking_1.HotelBooking.find({ userId }).sort({ createdAt: -1 }),
            ]);
            return [...flightBookings, ...hotelBookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        catch (error) {
            console.error('Error getting user bookings:', error);
            throw error;
        }
    }
    async getAllBookings(page = 1, limit = 20, status, type) {
        try {
            const skip = (page - 1) * limit;
            const filter = {};
            if (status) {
                filter.status = status;
            }
            let bookings = [];
            let total = 0;
            if (type === 'flight') {
                [bookings, total] = await Promise.all([
                    Booking_1.FlightBooking.find(filter).populate('userId', 'firstName lastName email').sort({ createdAt: -1 }).skip(skip).limit(limit),
                    Booking_1.FlightBooking.countDocuments(filter),
                ]);
            }
            else if (type === 'hotel') {
                [bookings, total] = await Promise.all([
                    Booking_1.HotelBooking.find(filter).populate('userId', 'firstName lastName email').sort({ createdAt: -1 }).skip(skip).limit(limit),
                    Booking_1.HotelBooking.countDocuments(filter),
                ]);
            }
            else {
                const [flightBookings, hotelBookings, flightCount, hotelCount] = await Promise.all([
                    Booking_1.FlightBooking.find(filter).populate('userId', 'firstName lastName email').sort({ createdAt: -1 }),
                    Booking_1.HotelBooking.find(filter).populate('userId', 'firstName lastName email').sort({ createdAt: -1 }),
                    Booking_1.FlightBooking.countDocuments(filter),
                    Booking_1.HotelBooking.countDocuments(filter),
                ]);
                const allBookings = [...flightBookings, ...hotelBookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                bookings = allBookings.slice(skip, skip + limit);
                total = flightCount + hotelCount;
            }
            return {
                bookings,
                total,
                page,
                totalPages: Math.ceil(total / limit),
            };
        }
        catch (error) {
            console.error('Error getting all bookings:', error);
            throw error;
        }
    }
    async updateBookingStatus(bookingId, status) {
        try {
            const flightBooking = await Booking_1.FlightBooking.findOneAndUpdate({ bookingId }, { status }, { new: true }).populate('userId', 'firstName lastName email');
            if (flightBooking) {
                return flightBooking;
            }
            const hotelBooking = await Booking_1.HotelBooking.findOneAndUpdate({ bookingId }, { status }, { new: true }).populate('userId', 'firstName lastName email');
            return hotelBooking;
        }
        catch (error) {
            console.error('Error updating booking status:', error);
            throw error;
        }
    }
    async updatePaymentStatus(bookingId, paymentStatus, paymentMethod) {
        try {
            const updateData = { paymentStatus };
            if (paymentMethod) {
                updateData.paymentMethod = paymentMethod;
            }
            const flightBooking = await Booking_1.FlightBooking.findOneAndUpdate({ bookingId }, updateData, { new: true }).populate('userId', 'firstName lastName email');
            if (flightBooking) {
                return flightBooking;
            }
            const hotelBooking = await Booking_1.HotelBooking.findOneAndUpdate({ bookingId }, updateData, { new: true }).populate('userId', 'firstName lastName email');
            return hotelBooking;
        }
        catch (error) {
            console.error('Error updating payment status:', error);
            throw error;
        }
    }
    async getBookingStats() {
        try {
            const [flightBookings, hotelBookings, pendingFlights, pendingHotels, confirmedFlights, confirmedHotels, recentFlights, recentHotels,] = await Promise.all([
                Booking_1.FlightBooking.countDocuments(),
                Booking_1.HotelBooking.countDocuments(),
                Booking_1.FlightBooking.countDocuments({ status: 'pending' }),
                Booking_1.HotelBooking.countDocuments({ status: 'pending' }),
                Booking_1.FlightBooking.countDocuments({ status: 'confirmed' }),
                Booking_1.HotelBooking.countDocuments({ status: 'confirmed' }),
                Booking_1.FlightBooking.find().sort({ createdAt: -1 }).limit(5).populate('userId', 'firstName lastName email'),
                Booking_1.HotelBooking.find().sort({ createdAt: -1 }).limit(5).populate('userId', 'firstName lastName email'),
            ]);
            const [flightRevenue, hotelRevenue] = await Promise.all([
                Booking_1.FlightBooking.aggregate([
                    { $match: { status: 'confirmed' } },
                    { $group: { _id: null, total: { $sum: '$pricing.finalPrice' } } }
                ]),
                Booking_1.HotelBooking.aggregate([
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
        }
        catch (error) {
            console.error('Error getting booking stats:', error);
            throw error;
        }
    }
}
exports.bookingService = new BookingService();
//# sourceMappingURL=booking.service.js.map