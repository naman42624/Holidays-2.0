"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotelBooking = exports.FlightBooking = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const BookingPassengerSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    nationality: { type: String, required: true },
    passportNumber: { type: String },
    passportExpiry: { type: Date },
    email: { type: String },
    phone: { type: String },
});
const BookingContactSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    alternatePhone: { type: String },
    address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        country: { type: String, required: true },
        postalCode: { type: String, required: true },
    },
});
const FlightBookingSchema = new mongoose_1.Schema({
    bookingId: {
        type: String,
        required: true,
        unique: true,
        default: () => `FLT${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
    },
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
    type: {
        type: String,
        default: 'flight',
        immutable: true,
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending',
    },
    flightData: {
        origin: { type: String, required: true },
        destination: { type: String, required: true },
        departureDate: { type: Date, required: true },
        returnDate: { type: Date },
        flightOffers: [{ type: mongoose_1.Schema.Types.Mixed }],
        airline: { type: String, required: true },
        flightNumber: { type: String, required: true },
        duration: { type: String, required: true },
        stops: { type: Number, required: true },
    },
    passengers: [BookingPassengerSchema],
    contact: BookingContactSchema,
    pricing: {
        basePrice: { type: Number, required: true },
        taxes: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
        currency: { type: String, required: true, default: 'USD' },
        extrasPrice: { type: Number, default: 0 },
        finalPrice: { type: Number, required: true },
    },
    extras: {
        seats: [{
                passengerId: { type: String, required: true },
                seatNumber: { type: String, required: true },
                price: { type: Number, required: true },
            }],
        meals: [{
                passengerId: { type: String, required: true },
                mealType: { type: String, required: true },
                price: { type: Number, required: true },
            }],
        baggage: [{
                passengerId: { type: String, required: true },
                weight: { type: Number, required: true },
                price: { type: Number, required: true },
            }],
    },
    bookingDate: { type: Date, default: Date.now },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending',
    },
    paymentMethod: { type: String },
    confirmationNumber: { type: String },
    specialRequests: { type: String },
}, {
    timestamps: true,
});
const HotelBookingSchema = new mongoose_1.Schema({
    bookingId: {
        type: String,
        required: true,
        unique: true,
        default: () => `HTL${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
    },
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
    type: {
        type: String,
        default: 'hotel',
        immutable: true,
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending',
    },
    hotelData: {
        hotelId: { type: String, required: true },
        name: { type: String, required: true },
        address: {
            street: { type: String, required: true },
            city: { type: String, required: true },
            country: { type: String, required: true },
            postalCode: { type: String, required: true },
        },
        checkIn: { type: Date, required: true },
        checkOut: { type: Date, required: true },
        nights: { type: Number, required: true },
        rooms: [{
                roomType: { type: String, required: true },
                roomName: { type: String, required: true },
                guests: { type: Number, required: true },
                price: { type: Number, required: true },
            }],
    },
    guests: [{
            title: { type: String, required: true },
            firstName: { type: String, required: true },
            lastName: { type: String, required: true },
            email: { type: String },
            phone: { type: String },
            isMainGuest: { type: Boolean, default: false },
        }],
    contact: BookingContactSchema,
    pricing: {
        basePrice: { type: Number, required: true },
        taxes: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
        currency: { type: String, required: true, default: 'USD' },
        finalPrice: { type: Number, required: true },
    },
    bookingDate: { type: Date, default: Date.now },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending',
    },
    paymentMethod: { type: String },
    confirmationNumber: { type: String },
    specialRequests: { type: String },
}, {
    timestamps: true,
});
FlightBookingSchema.index({ bookingId: 1 });
FlightBookingSchema.index({ userId: 1 });
FlightBookingSchema.index({ status: 1 });
FlightBookingSchema.index({ bookingDate: -1 });
FlightBookingSchema.index({ 'contact.email': 1 });
HotelBookingSchema.index({ bookingId: 1 });
HotelBookingSchema.index({ userId: 1 });
HotelBookingSchema.index({ status: 1 });
HotelBookingSchema.index({ bookingDate: -1 });
HotelBookingSchema.index({ 'contact.email': 1 });
exports.FlightBooking = mongoose_1.default.model('FlightBooking', FlightBookingSchema);
exports.HotelBooking = mongoose_1.default.model('HotelBooking', HotelBookingSchema);
//# sourceMappingURL=Booking.js.map