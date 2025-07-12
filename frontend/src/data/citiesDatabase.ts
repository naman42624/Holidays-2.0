// Simple cities database for fallback when API is not available
export interface City {
  name: string
  country: string
  code: string
  latitude: number
  longitude: number
}

export const cities: City[] = [
  // Popular destinations
  { name: 'New York', country: 'United States', code: 'NYC', latitude: 40.7128, longitude: -74.0060 },
  { name: 'London', country: 'United Kingdom', code: 'LON', latitude: 51.5074, longitude: -0.1278 },
  { name: 'Paris', country: 'France', code: 'PAR', latitude: 48.8566, longitude: 2.3522 },
  { name: 'Tokyo', country: 'Japan', code: 'TYO', latitude: 35.6762, longitude: 139.6503 },
  { name: 'Sydney', country: 'Australia', code: 'SYD', latitude: -33.8688, longitude: 151.2093 },
  { name: 'Singapore', country: 'Singapore', code: 'SIN', latitude: 1.3521, longitude: 103.8198 },
  { name: 'Dubai', country: 'United Arab Emirates', code: 'DXB', latitude: 25.2048, longitude: 55.2708 },
  { name: 'Bangkok', country: 'Thailand', code: 'BKK', latitude: 13.7563, longitude: 100.5018 },
  { name: 'Hong Kong', country: 'Hong Kong', code: 'HKG', latitude: 22.3193, longitude: 114.1694 },
  { name: 'Los Angeles', country: 'United States', code: 'LAX', latitude: 34.0522, longitude: -118.2437 },
  { name: 'Rome', country: 'Italy', code: 'ROM', latitude: 41.9028, longitude: 12.4964 },
  { name: 'Barcelona', country: 'Spain', code: 'BCN', latitude: 41.3851, longitude: 2.1734 },
  { name: 'Amsterdam', country: 'Netherlands', code: 'AMS', latitude: 52.3676, longitude: 4.9041 },
  { name: 'Berlin', country: 'Germany', code: 'BER', latitude: 52.5200, longitude: 13.4050 },
  { name: 'Mumbai', country: 'India', code: 'BOM', latitude: 19.0760, longitude: 72.8777 },
  { name: 'Delhi', country: 'India', code: 'DEL', latitude: 28.7041, longitude: 77.1025 },
  { name: 'Bengaluru', country: 'India', code: 'BLR', latitude: 12.9716, longitude: 77.5946 },
  { name: 'Chennai', country: 'India', code: 'MAA', latitude: 13.0827, longitude: 80.2707 },
  { name: 'Kolkata', country: 'India', code: 'CCU', latitude: 22.5726, longitude: 88.3639 },
  { name: 'Hyderabad', country: 'India', code: 'HYD', latitude: 17.3850, longitude: 78.4867 },
  { name: 'Pune', country: 'India', code: 'PNQ', latitude: 18.5204, longitude: 73.8567 },
  { name: 'Ahmedabad', country: 'India', code: 'AMD', latitude: 23.0225, longitude: 72.5714 },
  { name: 'Jaipur', country: 'India', code: 'JAI', latitude: 26.9124, longitude: 75.7873 },
  { name: 'Kochi', country: 'India', code: 'COK', latitude: 9.9312, longitude: 76.2673 },
  { name: 'Goa', country: 'India', code: 'GOI', latitude: 15.2993, longitude: 74.1240 },
  { name: 'Bali', country: 'Indonesia', code: 'DPS', latitude: -8.3405, longitude: 115.0920 },
  { name: 'Kuala Lumpur', country: 'Malaysia', code: 'KUL', latitude: 3.1390, longitude: 101.6869 },
  { name: 'Seoul', country: 'South Korea', code: 'ICN', latitude: 37.5665, longitude: 126.9780 },
  { name: 'Beijing', country: 'China', code: 'PEK', latitude: 39.9042, longitude: 116.4074 },
  { name: 'Shanghai', country: 'China', code: 'PVG', latitude: 31.2304, longitude: 121.4737 },
  { name: 'Istanbul', country: 'Turkey', code: 'IST', latitude: 41.0082, longitude: 28.9784 },
  { name: 'Moscow', country: 'Russia', code: 'SVO', latitude: 55.7558, longitude: 37.6176 },
  { name: 'Cairo', country: 'Egypt', code: 'CAI', latitude: 30.0444, longitude: 31.2357 },
  { name: 'Cape Town', country: 'South Africa', code: 'CPT', latitude: -33.9249, longitude: 18.4241 },
  { name: 'Rio de Janeiro', country: 'Brazil', code: 'GIG', latitude: -22.9068, longitude: -43.1729 },
  { name: 'São Paulo', country: 'Brazil', code: 'GRU', latitude: -23.5505, longitude: -46.6333 },
  { name: 'Buenos Aires', country: 'Argentina', code: 'EZE', latitude: -34.6037, longitude: -58.3816 },
  { name: 'Mexico City', country: 'Mexico', code: 'MEX', latitude: 19.4326, longitude: -99.1332 },
  { name: 'Toronto', country: 'Canada', code: 'YYZ', latitude: 43.6532, longitude: -79.3832 },
  { name: 'Vancouver', country: 'Canada', code: 'YVR', latitude: 49.2827, longitude: -123.1207 },
  { name: 'Zurich', country: 'Switzerland', code: 'ZUR', latitude: 47.3769, longitude: 8.5417 },
  { name: 'Vienna', country: 'Austria', code: 'VIE', latitude: 48.2082, longitude: 16.3738 },
  { name: 'Prague', country: 'Czech Republic', code: 'PRG', latitude: 50.0755, longitude: 14.4378 },
  { name: 'Budapest', country: 'Hungary', code: 'BUD', latitude: 47.4979, longitude: 19.0402 },
  { name: 'Warsaw', country: 'Poland', code: 'WAW', latitude: 52.2297, longitude: 21.0122 },
  { name: 'Stockholm', country: 'Sweden', code: 'ARN', latitude: 59.3293, longitude: 18.0686 },
  { name: 'Copenhagen', country: 'Denmark', code: 'CPH', latitude: 55.6761, longitude: 12.5683 },
  { name: 'Oslo', country: 'Norway', code: 'OSL', latitude: 59.9139, longitude: 10.7522 },
  { name: 'Helsinki', country: 'Finland', code: 'HEL', latitude: 60.1699, longitude: 24.9384 },
  { name: 'Reykjavik', country: 'Iceland', code: 'KEF', latitude: 64.1466, longitude: -21.9426 },
  { name: 'Dublin', country: 'Ireland', code: 'DUB', latitude: 53.3498, longitude: -6.2603 },
  { name: 'Edinburgh', country: 'Scotland', code: 'EDI', latitude: 55.9533, longitude: -3.1883 },
  { name: 'Manchester', country: 'United Kingdom', code: 'MAN', latitude: 53.4808, longitude: -2.2426 },
  { name: 'Milan', country: 'Italy', code: 'MXP', latitude: 45.4642, longitude: 9.1900 },
  { name: 'Florence', country: 'Italy', code: 'FLR', latitude: 43.7696, longitude: 11.2558 },
  { name: 'Venice', country: 'Italy', code: 'VCE', latitude: 45.4408, longitude: 12.3155 },
  { name: 'Madrid', country: 'Spain', code: 'MAD', latitude: 40.4168, longitude: -3.7038 },
  { name: 'Lisbon', country: 'Portugal', code: 'LIS', latitude: 38.7223, longitude: -9.1393 },
  { name: 'Athens', country: 'Greece', code: 'ATH', latitude: 37.9838, longitude: 23.7275 },
  { name: 'Santorini', country: 'Greece', code: 'JTR', latitude: 36.3932, longitude: 25.4615 },
  { name: 'Mykonos', country: 'Greece', code: 'JMK', latitude: 37.4467, longitude: 25.3289 },
  { name: 'Nice', country: 'France', code: 'NCE', latitude: 43.7102, longitude: 7.2620 },
  { name: 'Marseille', country: 'France', code: 'MRS', latitude: 43.2965, longitude: 5.3698 },
  { name: 'Lyon', country: 'France', code: 'LYS', latitude: 45.7640, longitude: 4.8357 },
  { name: 'Brussels', country: 'Belgium', code: 'BRU', latitude: 50.8503, longitude: 4.3517 },
  { name: 'Luxembourg', country: 'Luxembourg', code: 'LUX', latitude: 49.6116, longitude: 6.1319 },
  { name: 'Geneva', country: 'Switzerland', code: 'GVA', latitude: 46.2044, longitude: 6.1432 },
  { name: 'Basel', country: 'Switzerland', code: 'BSL', latitude: 47.5596, longitude: 7.5886 },
  { name: 'Munich', country: 'Germany', code: 'MUC', latitude: 48.1351, longitude: 11.5820 },
  { name: 'Frankfurt', country: 'Germany', code: 'FRA', latitude: 50.1109, longitude: 8.6821 },
  { name: 'Hamburg', country: 'Germany', code: 'HAM', latitude: 53.5511, longitude: 9.9937 },
  { name: 'Cologne', country: 'Germany', code: 'CGN', latitude: 50.9375, longitude: 6.9603 },
  { name: 'Düsseldorf', country: 'Germany', code: 'DUS', latitude: 51.2277, longitude: 6.7735 },
  { name: 'Stuttgart', country: 'Germany', code: 'STR', latitude: 48.7758, longitude: 9.1829 },
]

export function searchCities(query: string): City[] {
  const searchTerm = query.toLowerCase()
  return cities.filter(city => 
    city.name.toLowerCase().includes(searchTerm) || 
    city.country.toLowerCase().includes(searchTerm)
  ).slice(0, 10)
}
