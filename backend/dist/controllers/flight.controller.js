"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flightController = exports.FlightController = void 0;
const flight_service_1 = require("@/services/flight.service");
class FlightController {
    async searchFlights(req, res) {
        try {
            const { originLocationCode, destinationLocationCode, departureDate, returnDate, adults, children, infants, max, currencyCode, nonStop, travelClass, oneWay, } = req.query;
            console.log('Flight search request received:', {
                originLocationCode,
                destinationLocationCode,
                departureDate,
                adults,
                returnDate,
                children,
                infants,
                max,
                currencyCode,
                travelClass,
                oneWay
            });
            if (!originLocationCode || !destinationLocationCode || !departureDate || !adults) {
                const response = {
                    success: false,
                    error: 'Missing required parameters: originLocationCode, destinationLocationCode, departureDate, adults',
                };
                res.status(400).json(response);
                return;
            }
            const searchParams = {
                originLocationCode: originLocationCode,
                destinationLocationCode: destinationLocationCode,
                departureDate: departureDate,
                adults: parseInt(adults),
                ...(returnDate && { returnDate: returnDate }),
                ...(children && { children: parseInt(children) }),
                ...(infants && { infants: parseInt(infants) }),
                ...(max && { max: parseInt(max) }),
                currencyCode: 'INR',
                ...(nonStop && { nonStop: nonStop === 'true' }),
                ...(travelClass && { travelClass: travelClass }),
                ...(oneWay && { oneWay: oneWay === 'true' }),
            };
            try {
                const result = await flight_service_1.flightService.searchFlightOffers(searchParams);
                console.log('Flight search result:', JSON.stringify(result, null, 2));
                const transformedFlights = flight_service_1.flightService.transformFlightOffers(result.data);
                console.log('Transformed flight offers:', transformedFlights.length, 'offers ready for frontend');
                console.log('Sample transformed flight offer:', JSON.stringify(transformedFlights[0], null, 2));
                console.log('Flight search successful:', {
                    originalCount: result.data.length,
                    transformedCount: transformedFlights.length,
                    sampleFlight: transformedFlights[0]
                });
                const response = {
                    success: true,
                    data: transformedFlights,
                    meta: {
                        total: result.meta?.count,
                        hasMore: transformedFlights.length === (searchParams.max || 10),
                        dictionaries: result.dictionaries,
                    },
                };
                res.json(response);
            }
            catch (amadeusError) {
                console.error('Amadeus API error:', amadeusError);
                const response = {
                    success: false,
                    error: amadeusError instanceof Error ? amadeusError.message : 'Flight search failed',
                };
                res.status(400).json(response);
            }
        }
        catch (error) {
            console.error('Flight search error:', error);
            const response = {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to search flights',
            };
            res.status(500).json(response);
        }
    }
    async priceFlights(req, res) {
        try {
            const { flightOffers } = req.body;
            if (!flightOffers || !Array.isArray(flightOffers) || flightOffers.length === 0) {
                const response = {
                    success: false,
                    error: 'Flight offers are required',
                };
                res.status(400).json(response);
                return;
            }
            const result = await flight_service_1.flightService.priceFlightOffers(flightOffers);
            const response = {
                success: true,
                data: result.data,
            };
            res.json(response);
        }
        catch (error) {
            console.error('Flight pricing error:', error);
            const response = {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to price flights',
            };
            res.status(500).json(response);
        }
    }
    async getDestinations(req, res) {
        try {
            const { origin, departureDate, oneWay, duration, nonStop, maxPrice, viewBy, } = req.query;
            if (!origin) {
                const response = {
                    success: false,
                    error: 'Origin is required',
                };
                res.status(400).json(response);
                return;
            }
            const params = {
                origin: origin,
                ...(departureDate && { departureDate: departureDate }),
                ...(oneWay && { oneWay: oneWay === 'true' }),
                ...(duration && { duration: duration }),
                ...(nonStop && { nonStop: nonStop === 'true' }),
                ...(maxPrice && { maxPrice: parseInt(maxPrice) }),
                ...(viewBy && { viewBy: viewBy }),
            };
            const result = await flight_service_1.flightService.getFlightDestinations(params);
            const response = {
                success: true,
                data: result.data,
                meta: result.meta,
            };
            res.json(response);
        }
        catch (error) {
            console.error('Flight destinations error:', error);
            const response = {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get destinations',
            };
            res.status(500).json(response);
        }
    }
    async getFlightDates(req, res) {
        try {
            const { origin, destination, departureDate, oneWay, duration, nonStop, maxPrice, } = req.query;
            if (!origin || !destination) {
                const response = {
                    success: false,
                    error: 'Origin and destination are required',
                };
                res.status(400).json(response);
                return;
            }
            const params = {
                origin: origin,
                destination: destination,
                ...(departureDate && { departureDate: departureDate }),
                ...(oneWay && { oneWay: oneWay === 'true' }),
                ...(duration && { duration: duration }),
                ...(nonStop && { nonStop: nonStop === 'true' }),
                ...(maxPrice && { maxPrice: parseInt(maxPrice) }),
            };
            const result = await flight_service_1.flightService.getFlightDates(params);
            const response = {
                success: true,
                data: result.data,
                meta: result.meta,
            };
            res.json(response);
        }
        catch (error) {
            console.error('Flight dates error:', error);
            const response = {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get flight dates',
            };
            res.status(500).json(response);
        }
    }
    async bookFlight(req, res) {
        try {
            const bookingData = req.body;
            if (!bookingData.flightOffers || !bookingData.travelers) {
                const response = {
                    success: false,
                    error: 'Flight offers and travelers are required',
                };
                res.status(400).json(response);
                return;
            }
            const result = await flight_service_1.flightService.createFlightOrder(bookingData);
            const response = {
                success: true,
                data: result.data,
                message: 'Flight booked successfully',
            };
            res.json(response);
        }
        catch (error) {
            console.error('Flight booking error:', error);
            const response = {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to book flight',
            };
            res.status(500).json(response);
        }
    }
    async getAirlines(req, res) {
        try {
            const { codes } = req.query;
            if (!codes) {
                const response = {
                    success: false,
                    error: 'Airline codes are required',
                };
                res.status(400).json(response);
                return;
            }
            const airlineCodes = codes.split(',');
            const result = await flight_service_1.flightService.getAirlineInfo(airlineCodes);
            const response = {
                success: true,
                data: result.data,
            };
            res.json(response);
        }
        catch (error) {
            console.error('Airlines info error:', error);
            const response = {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get airline information',
            };
            res.status(500).json(response);
        }
    }
}
exports.FlightController = FlightController;
exports.flightController = new FlightController();
//# sourceMappingURL=flight.controller.js.map