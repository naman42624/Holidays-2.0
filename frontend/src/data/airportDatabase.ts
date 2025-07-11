// Comprehensive IATA Airport Codes Database
// This database contains airport codes with their full city names and countries

export interface AirportData {
  code: string
  city: string
  country: string
  name: string
  region?: string
}

export const airportDatabase: AirportData[] = [
  // Major US Cities
  { code: 'LAX', city: 'Los Angeles', country: 'United States', name: 'Los Angeles International Airport', region: 'California' },
  { code: 'JFK', city: 'New York', country: 'United States', name: 'John F. Kennedy International Airport', region: 'New York' },
  { code: 'LGA', city: 'New York', country: 'United States', name: 'LaGuardia Airport', region: 'New York' },
  { code: 'EWR', city: 'Newark', country: 'United States', name: 'Newark Liberty International Airport', region: 'New Jersey' },
  { code: 'SFO', city: 'San Francisco', country: 'United States', name: 'San Francisco International Airport', region: 'California' },
  { code: 'ORD', city: 'Chicago', country: 'United States', name: 'O\'Hare International Airport', region: 'Illinois' },
  { code: 'MDW', city: 'Chicago', country: 'United States', name: 'Midway International Airport', region: 'Illinois' },
  { code: 'MIA', city: 'Miami', country: 'United States', name: 'Miami International Airport', region: 'Florida' },
  { code: 'DFW', city: 'Dallas', country: 'United States', name: 'Dallas/Fort Worth International Airport', region: 'Texas' },
  { code: 'ATL', city: 'Atlanta', country: 'United States', name: 'Hartsfield-Jackson Atlanta International Airport', region: 'Georgia' },
  { code: 'LAS', city: 'Las Vegas', country: 'United States', name: 'McCarran International Airport', region: 'Nevada' },
  { code: 'SEA', city: 'Seattle', country: 'United States', name: 'Seattle-Tacoma International Airport', region: 'Washington' },
  { code: 'DEN', city: 'Denver', country: 'United States', name: 'Denver International Airport', region: 'Colorado' },
  { code: 'PHX', city: 'Phoenix', country: 'United States', name: 'Phoenix Sky Harbor International Airport', region: 'Arizona' },
  { code: 'BOS', city: 'Boston', country: 'United States', name: 'Logan International Airport', region: 'Massachusetts' },
  { code: 'IAD', city: 'Washington D.C.', country: 'United States', name: 'Washington Dulles International Airport', region: 'Virginia' },
  { code: 'DCA', city: 'Washington D.C.', country: 'United States', name: 'Ronald Reagan Washington National Airport', region: 'District of Columbia' },

  // Major European Cities
  { code: 'LHR', city: 'London', country: 'United Kingdom', name: 'Heathrow Airport' },
  { code: 'LGW', city: 'London', country: 'United Kingdom', name: 'Gatwick Airport' },
  { code: 'STN', city: 'London', country: 'United Kingdom', name: 'Stansted Airport' },
  { code: 'CDG', city: 'Paris', country: 'France', name: 'Charles de Gaulle Airport' },
  { code: 'ORY', city: 'Paris', country: 'France', name: 'Orly Airport' },
  { code: 'FRA', city: 'Frankfurt', country: 'Germany', name: 'Frankfurt Airport' },
  { code: 'MUC', city: 'Munich', country: 'Germany', name: 'Munich Airport' },
  { code: 'AMS', city: 'Amsterdam', country: 'Netherlands', name: 'Amsterdam Airport Schiphol' },
  { code: 'MAD', city: 'Madrid', country: 'Spain', name: 'Madrid-Barajas Airport' },
  { code: 'BCN', city: 'Barcelona', country: 'Spain', name: 'Barcelona-El Prat Airport' },
  { code: 'FCO', city: 'Rome', country: 'Italy', name: 'Leonardo da Vinci International Airport' },
  { code: 'MXP', city: 'Milan', country: 'Italy', name: 'Milano Malpensa Airport' },
  { code: 'ZUR', city: 'Zurich', country: 'Switzerland', name: 'Zurich Airport' },
  { code: 'VIE', city: 'Vienna', country: 'Austria', name: 'Vienna International Airport' },
  { code: 'CPH', city: 'Copenhagen', country: 'Denmark', name: 'Copenhagen Airport' },
  { code: 'ARN', city: 'Stockholm', country: 'Sweden', name: 'Stockholm Arlanda Airport' },
  { code: 'OSL', city: 'Oslo', country: 'Norway', name: 'Oslo Airport' },
  { code: 'HEL', city: 'Helsinki', country: 'Finland', name: 'Helsinki Airport' },

  // Major Asian Cities
  { code: 'NRT', city: 'Tokyo', country: 'Japan', name: 'Narita International Airport' },
  { code: 'HND', city: 'Tokyo', country: 'Japan', name: 'Haneda Airport' },
  { code: 'KIX', city: 'Osaka', country: 'Japan', name: 'Kansai International Airport' },
  { code: 'ICN', city: 'Seoul', country: 'South Korea', name: 'Incheon International Airport' },
  { code: 'PEK', city: 'Beijing', country: 'China', name: 'Beijing Capital International Airport' },
  { code: 'PVG', city: 'Shanghai', country: 'China', name: 'Shanghai Pudong International Airport' },
  { code: 'SHA', city: 'Shanghai', country: 'China', name: 'Shanghai Hongqiao International Airport' },
  { code: 'CAN', city: 'Guangzhou', country: 'China', name: 'Guangzhou Baiyun International Airport' },
  { code: 'HKG', city: 'Hong Kong', country: 'Hong Kong', name: 'Hong Kong International Airport' },
  { code: 'SIN', city: 'Singapore', country: 'Singapore', name: 'Singapore Changi Airport' },
  { code: 'BKK', city: 'Bangkok', country: 'Thailand', name: 'Suvarnabhumi Airport' },
  { code: 'KUL', city: 'Kuala Lumpur', country: 'Malaysia', name: 'Kuala Lumpur International Airport' },
  { code: 'CGK', city: 'Jakarta', country: 'Indonesia', name: 'Soekarno-Hatta International Airport' },
  { code: 'MNL', city: 'Manila', country: 'Philippines', name: 'Ninoy Aquino International Airport' },

  // Middle East & Africa
  { code: 'DXB', city: 'Dubai', country: 'United Arab Emirates', name: 'Dubai International Airport' },
  { code: 'DWC', city: 'Dubai', country: 'United Arab Emirates', name: 'Al Maktoum International Airport' },
  { code: 'AUH', city: 'Abu Dhabi', country: 'United Arab Emirates', name: 'Abu Dhabi International Airport' },
  { code: 'DOH', city: 'Doha', country: 'Qatar', name: 'Hamad International Airport' },
  { code: 'KWI', city: 'Kuwait City', country: 'Kuwait', name: 'Kuwait International Airport' },
  { code: 'RUH', city: 'Riyadh', country: 'Saudi Arabia', name: 'King Khalid International Airport' },
  { code: 'JED', city: 'Jeddah', country: 'Saudi Arabia', name: 'King Abdulaziz International Airport' },
  { code: 'CAI', city: 'Cairo', country: 'Egypt', name: 'Cairo International Airport' },
  { code: 'JNB', city: 'Johannesburg', country: 'South Africa', name: 'O.R. Tambo International Airport' },
  { code: 'CPT', city: 'Cape Town', country: 'South Africa', name: 'Cape Town International Airport' },
  { code: 'IST', city: 'Istanbul', country: 'Turkey', name: 'Istanbul Airport' },
  { code: 'SAW', city: 'Istanbul', country: 'Turkey', name: 'Sabiha Gökçen International Airport' },

  // Major Indian Cities
  { code: 'DEL', city: 'New Delhi', country: 'India', name: 'Indira Gandhi International Airport' },
  { code: 'BOM', city: 'Mumbai', country: 'India', name: 'Chhatrapati Shivaji Maharaj International Airport' },
  { code: 'MAA', city: 'Chennai', country: 'India', name: 'Chennai International Airport' },
  { code: 'CCU', city: 'Kolkata', country: 'India', name: 'Netaji Subhas Chandra Bose International Airport' },
  { code: 'BLR', city: 'Bangalore', country: 'India', name: 'Kempegowda International Airport' },
  { code: 'HYD', city: 'Hyderabad', country: 'India', name: 'Rajiv Gandhi International Airport' },
  { code: 'PNQ', city: 'Pune', country: 'India', name: 'Pune Airport' },
  { code: 'AMD', city: 'Ahmedabad', country: 'India', name: 'Sardar Vallabhbhai Patel International Airport' },
  { code: 'COK', city: 'Kochi', country: 'India', name: 'Cochin International Airport' },
  { code: 'TRV', city: 'Thiruvananthapuram', country: 'India', name: 'Thiruvananthapuram International Airport' },
  { code: 'JAI', city: 'Jaipur', country: 'India', name: 'Jaipur International Airport' },
  { code: 'GOI', city: 'Goa', country: 'India', name: 'Goa International Airport' },
  { code: 'IXC', city: 'Chandigarh', country: 'India', name: 'Chandigarh Airport' },
  { code: 'LKO', city: 'Lucknow', country: 'India', name: 'Chaudhary Charan Singh International Airport' },
  { code: 'NAG', city: 'Nagpur', country: 'India', name: 'Dr. Babasaheb Ambedkar International Airport' },
  { code: 'VNS', city: 'Varanasi', country: 'India', name: 'Lal Bahadur Shastri Airport' },

  // Australian & New Zealand Cities
  { code: 'SYD', city: 'Sydney', country: 'Australia', name: 'Sydney Kingsford Smith Airport' },
  { code: 'MEL', city: 'Melbourne', country: 'Australia', name: 'Melbourne Airport' },
  { code: 'BNE', city: 'Brisbane', country: 'Australia', name: 'Brisbane Airport' },
  { code: 'PER', city: 'Perth', country: 'Australia', name: 'Perth Airport' },
  { code: 'ADL', city: 'Adelaide', country: 'Australia', name: 'Adelaide Airport' },
  { code: 'AKL', city: 'Auckland', country: 'New Zealand', name: 'Auckland Airport' },
  { code: 'CHC', city: 'Christchurch', country: 'New Zealand', name: 'Christchurch Airport' },

  // Canadian Cities
  { code: 'YYZ', city: 'Toronto', country: 'Canada', name: 'Toronto Pearson International Airport' },
  { code: 'YVR', city: 'Vancouver', country: 'Canada', name: 'Vancouver International Airport' },
  { code: 'YUL', city: 'Montreal', country: 'Canada', name: 'Montreal-Pierre Elliott Trudeau International Airport' },
  { code: 'YYC', city: 'Calgary', country: 'Canada', name: 'Calgary International Airport' },
  { code: 'YEG', city: 'Edmonton', country: 'Canada', name: 'Edmonton International Airport' },

  // South American Cities
  { code: 'GRU', city: 'São Paulo', country: 'Brazil', name: 'São Paulo/Guarulhos International Airport' },
  { code: 'GIG', city: 'Rio de Janeiro', country: 'Brazil', name: 'Rio de Janeiro/Galeão International Airport' },
  { code: 'EZE', city: 'Buenos Aires', country: 'Argentina', name: 'Ezeiza International Airport' },
  { code: 'SCL', city: 'Santiago', country: 'Chile', name: 'Santiago International Airport' },
  { code: 'LIM', city: 'Lima', country: 'Peru', name: 'Jorge Chávez International Airport' },
  { code: 'BOG', city: 'Bogotá', country: 'Colombia', name: 'El Dorado International Airport' },

  // Additional Popular Destinations
  { code: 'MEX', city: 'Mexico City', country: 'Mexico', name: 'Mexico City International Airport' },
  { code: 'CUN', city: 'Cancún', country: 'Mexico', name: 'Cancún International Airport' },
  { code: 'YQB', city: 'Quebec City', country: 'Canada', name: 'Quebec City Jean Lesage International Airport' },
  { code: 'KEF', city: 'Reykjavik', country: 'Iceland', name: 'Keflavik International Airport' },
  { code: 'DUB', city: 'Dublin', country: 'Ireland', name: 'Dublin Airport' },
  { code: 'EDI', city: 'Edinburgh', country: 'United Kingdom', name: 'Edinburgh Airport' },
  { code: 'MAN', city: 'Manchester', country: 'United Kingdom', name: 'Manchester Airport' },
  { code: 'PRG', city: 'Prague', country: 'Czech Republic', name: 'Václav Havel Airport Prague' },
  { code: 'BUD', city: 'Budapest', country: 'Hungary', name: 'Budapest Ferenc Liszt International Airport' },
  { code: 'WAW', city: 'Warsaw', country: 'Poland', name: 'Warsaw Chopin Airport' },
  { code: 'SVO', city: 'Moscow', country: 'Russia', name: 'Sheremetyevo International Airport' },
  { code: 'LED', city: 'St. Petersburg', country: 'Russia', name: 'Pulkovo Airport' },
]

// Create lookup maps for quick access
export const airportCodeToData = new Map<string, AirportData>()
export const cityToAirports = new Map<string, AirportData[]>()

// Populate lookup maps
airportDatabase.forEach(airport => {
  airportCodeToData.set(airport.code, airport)
  
  const cityKey = `${airport.city}, ${airport.country}`
  if (!cityToAirports.has(cityKey)) {
    cityToAirports.set(cityKey, [])
  }
  cityToAirports.get(cityKey)?.push(airport)
})

// Helper functions
export const getAirportByCode = (code: string): AirportData | undefined => {
  return airportCodeToData.get(code.toUpperCase())
}

export const getCityDisplayName = (code: string): string => {
  const airport = getAirportByCode(code)
  if (airport) {
    return `${airport.city}, ${airport.country}`
  }
  return code // fallback to code if not found
}

export const getFullAirportName = (code: string): string => {
  const airport = getAirportByCode(code)
  if (airport) {
    return `${airport.city} (${airport.code})`
  }
  return code
}

export const searchAirports = (query: string): AirportData[] => {
  const searchTerm = query.toLowerCase()
  return airportDatabase.filter(airport => 
    airport.code.toLowerCase().includes(searchTerm) ||
    airport.city.toLowerCase().includes(searchTerm) ||
    airport.country.toLowerCase().includes(searchTerm) ||
    airport.name.toLowerCase().includes(searchTerm)
  ).slice(0, 10) // Limit to 10 results
}

export default airportDatabase
