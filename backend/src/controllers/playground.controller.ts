import { Request, Response } from 'express';
import { flightService } from '@/services/flight.service';
import { locationService } from '@/services/location.service';
import { hotelService } from '@/services/hotel.service';
import { activityService } from '@/services/activity.service';
import { ApiResponse } from '@/types/amadeus';

export class PlaygroundController {
  /**
   * API Testing Playground - provides sample data and testing capabilities
   * GET /api/playground
   */
  async getPlaygroundData(req: Request, res: Response): Promise<void> {
    try {
      const response: ApiResponse = {
        success: true,
        data: {
          welcome: 'Welcome to the Amadeus Travel Platform API Playground!',
          description: 'This endpoint provides sample data and testing capabilities for all available APIs.',
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          availableEndpoints: {
            flights: {
              searchFlights: {
                endpoint: '/api/flights/search',
                method: 'GET',
                description: 'Search for flights between origin and destination',
                sampleParams: {
                  origin: 'LAX',
                  destination: 'JFK',
                  departureDate: '2024-06-15',
                  returnDate: '2024-06-22',
                  adults: 1,
                  children: 0,
                  infants: 0,
                  travelClass: 'ECONOMY',
                  nonStop: false,
                  maxPrice: 1000,
                  currencyCode: 'USD'
                }
              },
              getFlightOffers: {
                endpoint: '/api/flights/offers',
                method: 'GET',
                description: 'Get flight offers with detailed pricing',
                sampleParams: {
                  origin: 'NYC',
                  destination: 'LAX',
                  departureDate: '2024-06-15',
                  adults: 1
                }
              },
              getFlightPrices: {
                endpoint: '/api/flights/prices',
                method: 'GET',
                description: 'Get flight price analysis and predictions',
                sampleParams: {
                  origin: 'MAD',
                  destination: 'LHR',
                  departureDate: '2024-06-15'
                }
              }
            },
            locations: {
              searchLocations: {
                endpoint: '/api/locations/search',
                method: 'GET',
                description: 'Search for airports, cities, and locations',
                sampleParams: {
                  keyword: 'New York',
                  subType: 'AIRPORT,CITY',
                  limit: 10
                }
              },
              getLocationDetails: {
                endpoint: '/api/locations/:locationId',
                method: 'GET',
                description: 'Get detailed information about a specific location',
                sampleParams: {
                  locationId: 'CLAX'
                }
              },
              getNearbyAirports: {
                endpoint: '/api/locations/nearby-airports',
                method: 'GET',
                description: 'Find airports near a geographic location',
                sampleParams: {
                  latitude: 40.7128,
                  longitude: -74.0060,
                  radius: 100
                }
              },
              getPopularDestinations: {
                endpoint: '/api/locations/popular-destinations',
                method: 'GET',
                description: 'Get popular travel destinations',
                sampleParams: {
                  origin: 'NYC',
                  period: '2024-06',
                  max: 10
                }
              }
            },
            hotels: {
              searchHotels: {
                endpoint: '/api/hotels/search',
                method: 'GET',
                description: 'Search for hotels in a location',
                sampleParams: {
                  cityCode: 'NYC',
                  checkInDate: '2024-06-15',
                  checkOutDate: '2024-06-17',
                  adults: 2,
                  rooms: 1,
                  priceRange: '100-500',
                  currency: 'USD'
                }
              },
              getHotelOffers: {
                endpoint: '/api/hotels/offers',
                method: 'GET',
                description: 'Get hotel offers with detailed pricing',
                sampleParams: {
                  hotelIds: 'ADPAR001,ADPAR002',
                  checkInDate: '2024-06-15',
                  checkOutDate: '2024-06-17',
                  adults: 2
                }
              }
            },
            activities: {
              searchActivities: {
                endpoint: '/api/activities/search',
                method: 'GET',
                description: 'Search for activities and tours',
                sampleParams: {
                  latitude: 40.7128,
                  longitude: -74.0060,
                  radius: 20
                }
              },
              getActivityDetails: {
                endpoint: '/api/activities/:activityId',
                method: 'GET',
                description: 'Get detailed information about a specific activity',
                sampleParams: {
                  activityId: '23642'
                }
              }
            }
          },
          sampleData: {
            note: 'Use the /test endpoint to get sample responses for testing',
            testEndpoint: '/api/playground/test'
          }
        }
      };
      
      res.json(response);
    } catch (error) {
      console.error('Playground error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to load playground data',
      };
      res.status(500).json(response);
    }
  }

  /**
   * Test endpoint with sample responses
   * GET /api/playground/test
   */
  async getTestData(req: Request, res: Response): Promise<void> {
    try {
      const { type } = req.query;
      
      let sampleData: any;
      
      switch (type) {
        case 'flight':
          sampleData = this.getSampleFlightData();
          break;
        case 'location':
          sampleData = this.getSampleLocationData();
          break;
        case 'hotel':
          sampleData = this.getSampleHotelData();
          break;
        case 'activity':
          sampleData = this.getSampleActivityData();
          break;
        default:
          sampleData = {
            flights: this.getSampleFlightData(),
            locations: this.getSampleLocationData(),
            hotels: this.getSampleHotelData(),
            activities: this.getSampleActivityData()
          };
      }

      const response: ApiResponse = {
        success: true,
        data: sampleData,
        meta: {
          ...(type && { type: type }),
          timestamp: new Date().toISOString(),
          note: 'This is sample data for testing purposes'
        } as any
      };
      
      res.json(response);
    } catch (error) {
      console.error('Test data error:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Failed to generate test data',
      };
      res.status(500).json(response);
    }
  }

  /**
   * Live API test - makes actual calls to Amadeus APIs with sample data
   * POST /api/playground/live-test
   */
  async liveTest(req: Request, res: Response): Promise<void> {
    try {
      const { endpoint, useDefaults } = req.body;
      
      let result: any;
      
      if (useDefaults) {
        // Use predefined sample parameters for testing
        switch (endpoint) {
          case 'searchLocations':
            result = await locationService.searchLocations({
              keyword: 'New York',
              subType: 'AIRPORT,CITY',
              page: { limit: 5 }
            });
            break;
          case 'searchFlights':
            result = await flightService.searchFlightOffers({
              originLocationCode: 'LAX',
              destinationLocationCode: 'JFK',
              departureDate: '2024-06-15',
              adults: 1,
              currencyCode: 'USD'
            });
            break;
          case 'searchHotels':
            result = await hotelService.searchHotelsByCity({
              cityCode: 'NYC',
              checkInDate: '2024-06-15',
              checkOutDate: '2024-06-17',
              adults: 2
            });
            break;
          case 'searchActivities':
            result = await activityService.searchActivities({
              latitude: 40.7128,
              longitude: -74.0060,
              radius: 20
            });
            break;
          default:
            throw new Error('Invalid endpoint specified');
        }
      } else {
        // Use custom parameters from request body
        const { params } = req.body;
        
        switch (endpoint) {
          case 'searchLocations':
            result = await locationService.searchLocations(params);
            break;
          case 'searchFlights':
            result = await flightService.searchFlightOffers(params);
            break;
          case 'searchHotels':
            result = await hotelService.searchHotelsByCity(params);
            break;
          case 'searchActivities':
            result = await activityService.searchActivities(params);
            break;
          default:
            throw new Error('Invalid endpoint specified');
        }
      }

      const response: ApiResponse = {
        success: true,
        data: result,
        meta: {
          ...(endpoint && { endpoint }),
          timestamp: new Date().toISOString(),
          note: 'Live API response from Amadeus'
        } as any
      };
      
      res.json(response);
    } catch (error) {
      console.error('Live test error:', error);
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to execute live test',
      };
      res.status(500).json(response);
    }
  }

  private getSampleFlightData() {
    return {
      flights: [
        {
          id: "1",
          price: {
            total: "542.30",
            currency: "USD"
          },
          itineraries: [
            {
              duration: "PT5H35M",
              segments: [
                {
                  departure: {
                    iataCode: "LAX",
                    at: "2024-06-15T08:00:00"
                  },
                  arrival: {
                    iataCode: "JFK",
                    at: "2024-06-15T16:35:00"
                  },
                  carrierCode: "DL",
                  flightNumber: "1234",
                  aircraft: {
                    code: "321"
                  }
                }
              ]
            }
          ],
          travelerPricings: [
            {
              travelerId: "1",
              fareOption: "STANDARD",
              travelerType: "ADULT",
              price: {
                currency: "USD",
                total: "542.30"
              }
            }
          ]
        }
      ]
    };
  }

  private getSampleLocationData() {
    return {
      locations: [
        {
          id: "CLAX",
          name: "Los Angeles International Airport",
          detailedName: "Los Angeles/CA/US:Los Angeles International Airport",
          type: "AIRPORT",
          iataCode: "LAX",
          city: "Los Angeles",
          cityCode: "LAX",
          country: "United States",
          countryCode: "US",
          coordinates: {
            latitude: 33.94253,
            longitude: -118.40853
          },
          timeZone: "-08:00",
          relevanceScore: 9.5
        }
      ]
    };
  }

  private getSampleHotelData() {
    return {
      hotels: [
        {
          hotelId: "ADNYC001",
          name: "Grand Central Hotel",
          description: "Luxury hotel in the heart of Manhattan",
          rating: 4.5,
          amenities: ["WiFi", "Gym", "Restaurant", "Bar"],
          contact: {
            phone: "+1-212-555-0123"
          },
          address: {
            lines: ["109 E 42nd St"],
            cityName: "New York",
            countryCode: "US"
          },
          offers: [
            {
              id: "OFFER1",
              checkInDate: "2024-06-15",
              checkOutDate: "2024-06-17",
              roomQuantity: 1,
              price: {
                currency: "USD",
                total: "320.00"
              },
              room: {
                type: "DELUXE_KING",
                typeEstimated: {
                  category: "DELUXE_ROOM",
                  beds: 1,
                  bedType: "KING"
                }
              }
            }
          ]
        }
      ]
    };
  }

  private getSampleActivityData() {
    return {
      activities: [
        {
          id: "23642",
          name: "Statue of Liberty & Ellis Island Tour",
          description: "Visit America's most iconic landmarks with skip-the-line access",
          rating: 4.8,
          pictures: [
            "https://example.com/statue-liberty.jpg"
          ],
          bookingLink: "https://example.com/book/23642",
          price: {
            amount: "29.00",
            currencyCode: "USD"
          },
          location: {
            latitude: 40.6892,
            longitude: -74.0445
          },
          tags: ["sightseeing", "monument", "history"]
        }
      ]
    };
  }
}

export const playgroundController = new PlaygroundController();
