"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hotelController = exports.HotelController = void 0;
const hotel_service_1 = require("@/services/hotel.service");
class HotelController {
    handleError(error, operation, res) {
        console.error(`Error in ${operation}:`, error);
        let statusCode = 500;
        let errorMessage = 'An unexpected error occurred';
        if (error instanceof Error) {
            errorMessage = error.message;
            if (errorMessage.includes('timeout') || errorMessage.includes('Request timed out')) {
                statusCode = 504;
                errorMessage = `The request timed out while ${operation}. Please try again later.`;
            }
            else if (errorMessage.includes('Network error')) {
                statusCode = 503;
                errorMessage = `Service unavailable while ${operation}. Please try again later.`;
            }
            else if (errorMessage.includes('Not found') || errorMessage.includes('Could not find')) {
                statusCode = 404;
            }
            else if (errorMessage.includes('Invalid request') || errorMessage.includes('Missing required')) {
                statusCode = 400;
            }
            else if (errorMessage.includes('Authentication') || errorMessage.includes('Unauthorized')) {
                statusCode = 401;
            }
            else if (errorMessage.includes('Rate limit')) {
                statusCode = 429;
            }
        }
        const response = {
            success: false,
            error: errorMessage,
            message: `Failed to ${operation}`,
        };
        res.status(statusCode).json(response);
    }
    async searchHotels(req, res) {
        try {
            const { cityCode, checkInDate, checkOutDate, adults, children, radius, radiusUnit, hotelSource, ratings, priceRange, currency, paymentPolicy, boardType, } = req.query;
            if (!cityCode || !checkInDate || !checkOutDate || !adults) {
                const response = {
                    success: false,
                    error: 'Missing required parameters: cityCode, checkInDate, checkOutDate, adults',
                };
                res.status(400).json(response);
                return;
            }
            console.log('Hotel search request received:', {
                cityCode,
                checkInDate,
                checkOutDate,
                adults,
                children
            });
            const params = {
                cityCode: cityCode,
                checkInDate: checkInDate,
                checkOutDate: checkOutDate,
                adults: parseInt(adults),
                ...(children && { children: parseInt(children) }),
                ...(radius && { radius: parseInt(radius) }),
                ...(radiusUnit && { radiusUnit: radiusUnit }),
                ...(hotelSource && { hotelSource: hotelSource }),
                ...(ratings && { ratings: ratings.split(',').map(r => parseInt(r)) }),
                ...(priceRange && { priceRange: priceRange }),
                ...(paymentPolicy && { paymentPolicy: paymentPolicy }),
                ...(boardType && { boardType: boardType }),
            };
            try {
                const result = await hotel_service_1.hotelService.searchHotelsByCity(params);
                const transformedHotels = hotel_service_1.hotelService.transformHotels(result.data);
                console.log('Hotel search successful:', {
                    originalCount: result.data.length,
                    transformedCount: transformedHotels.length
                });
                const response = {
                    success: true,
                    data: transformedHotels,
                    meta: result.meta,
                };
                res.json(response);
            }
            catch (hotelError) {
                this.handleError(hotelError, 'search for hotels', res);
            }
        }
        catch (error) {
            this.handleError(error, 'search for hotels', res);
        }
    }
    async searchHotelsByLocation(req, res) {
        try {
            const { latitude, longitude, checkInDate, checkOutDate, adults, radius, radiusUnit, } = req.query;
            if (!latitude || !longitude || !checkInDate || !checkOutDate || !adults) {
                const response = {
                    success: false,
                    error: 'Missing required parameters: latitude, longitude, checkInDate, checkOutDate, adults',
                };
                res.status(400).json(response);
                return;
            }
            const params = {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                checkInDate: checkInDate,
                checkOutDate: checkOutDate,
                adults: parseInt(adults),
                ...(radius && { radius: parseInt(radius) }),
                ...(radiusUnit && { radiusUnit: radiusUnit }),
            };
            try {
                const result = await hotel_service_1.hotelService.searchHotelsByGeocode(params);
                const transformedHotels = hotel_service_1.hotelService.transformHotels(result.data);
                const response = {
                    success: true,
                    data: transformedHotels,
                    meta: result.meta,
                };
                res.json(response);
            }
            catch (hotelError) {
                if (process.env.NODE_ENV !== 'production' && process.env.USE_MOCK_DATA === 'true') {
                    console.log('Using mock hotel data for development');
                    const mockHotels = [
                        {
                            id: 'mock-hotel-loc-1',
                            name: 'Sample Location Hotel',
                            rating: 4,
                            address: {
                                lines: ['Near coordinates'],
                                cityName: 'Nearby City',
                                countryCode: 'IN'
                            },
                            location: {
                                latitude: parseFloat(latitude),
                                longitude: parseFloat(longitude)
                            },
                            offers: [
                                {
                                    id: 'mock-offer-1',
                                    checkInDate: checkInDate,
                                    checkOutDate: checkOutDate,
                                    roomQuantity: 1,
                                    price: {
                                        currency: 'INR',
                                        total: '6000'
                                    }
                                }
                            ]
                        }
                    ];
                    const response = {
                        success: true,
                        data: mockHotels,
                        meta: {
                            total: 1,
                            mock: true,
                        },
                    };
                    res.json(response);
                }
                else {
                    this.handleError(hotelError, 'search for hotels by location', res);
                }
            }
        }
        catch (error) {
            this.handleError(error, 'search for hotels by location', res);
        }
    }
    async getHotelOffers(req, res) {
        try {
            const { hotelIds, adults, checkInDate, checkOutDate, countryOfResidence, roomQuantity, priceRange, currency, paymentPolicy, boardType, } = req.query;
            if (!hotelIds || !adults || !checkInDate || !checkOutDate) {
                const response = {
                    success: false,
                    error: 'Missing required parameters: hotelIds, adults, checkInDate, checkOutDate',
                };
                res.status(400).json(response);
                return;
            }
            const params = {
                hotelIds: hotelIds.split(','),
                adults: parseInt(adults),
                checkInDate: checkInDate,
                checkOutDate: checkOutDate,
                ...(countryOfResidence && { countryOfResidence: countryOfResidence }),
                ...(roomQuantity && { roomQuantity: parseInt(roomQuantity) }),
                ...(priceRange && { priceRange: priceRange }),
                ...(currency && { currency: currency }),
                ...(paymentPolicy && { paymentPolicy: paymentPolicy }),
                ...(boardType && { boardType: boardType }),
            };
            const result = await hotel_service_1.hotelService.getHotelOffers(params);
            const transformedOffers = hotel_service_1.hotelService.transformHotelOffers(result.data);
            const response = {
                success: true,
                data: transformedOffers,
            };
            res.json(response);
        }
        catch (error) {
            console.error('Hotel offers error:', error);
            const response = {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get hotel offers',
            };
            res.status(500).json(response);
        }
    }
    async getHotelOffer(req, res) {
        try {
            const { offerId } = req.params;
            const { lang } = req.query;
            if (!offerId) {
                const response = {
                    success: false,
                    error: 'Offer ID is required',
                };
                res.status(400).json(response);
                return;
            }
            const result = await hotel_service_1.hotelService.getHotelOffer(offerId, lang);
            const response = {
                success: true,
                data: result.data,
            };
            res.json(response);
        }
        catch (error) {
            console.error('Hotel offer details error:', error);
            const response = {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get hotel offer details',
            };
            res.status(500).json(response);
        }
    }
    async bookHotel(req, res) {
        try {
            const bookingData = req.body;
            if (!bookingData.data || !bookingData.data.hotelOffers || !bookingData.data.guests) {
                const response = {
                    success: false,
                    error: 'Hotel offers and guests are required',
                };
                res.status(400).json(response);
                return;
            }
            const result = await hotel_service_1.hotelService.bookHotel(bookingData);
            const response = {
                success: true,
                data: result.data,
                message: 'Hotel booked successfully',
            };
            res.json(response);
        }
        catch (error) {
            console.error('Hotel booking error:', error);
            const response = {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to book hotel',
            };
            res.status(500).json(response);
        }
    }
    async getHotelRatings(req, res) {
        try {
            const { hotelIds } = req.query;
            if (!hotelIds) {
                const response = {
                    success: false,
                    error: 'Hotel IDs are required',
                };
                res.status(400).json(response);
                return;
            }
            const params = {
                hotelIds: hotelIds.split(','),
            };
            const result = await hotel_service_1.hotelService.getHotelRatings(params);
            const response = {
                success: true,
                data: result.data,
            };
            res.json(response);
        }
        catch (error) {
            console.error('Hotel ratings error:', error);
            const response = {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get hotel ratings',
            };
            res.status(500).json(response);
        }
    }
}
exports.HotelController = HotelController;
exports.hotelController = new HotelController();
//# sourceMappingURL=hotel.controller.js.map