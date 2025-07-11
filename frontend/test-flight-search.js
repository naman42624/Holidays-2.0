const axios = require('axios');

const API_BASE_URL = 'http://localhost:8000/api';

async function testFlightSearch() {
  try {
    console.log('Testing flight search...');
    
    // Test the exact same request the frontend would make
    const searchParams = {
      originLocationCode: 'DEL',
      destinationLocationCode: 'BOM',
      departureDate: '2024-12-20',
      adults: 1,
      currencyCode: 'INR',
      max: 10
    };
    
    console.log('Request params:', searchParams);
    
    const response = await axios.get(`${API_BASE_URL}/flights/search`, {
      params: searchParams
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    // Test the filtering logic
    const flightOffers = response.data.data;
    console.log('\nTesting filtering logic:');
    console.log('Original flight offers:', flightOffers.length);
    
    // Default filter settings from frontend
    const filters = {
      maxPrice: 50000,
      maxDuration: 24,
      airlines: [],
      stops: 'any',
      departureTime: 'any'
    };
    
    const filteredFlights = flightOffers.filter(flight => {
      const price = parseFloat(flight.price.total);
      
      // Parse duration correctly from ISO 8601 format (PT3H30M)
      const durationStr = flight.itineraries[0].duration;
      const hours = durationStr.match(/(\d+)H/)?.[1] || '0';
      const minutes = durationStr.match(/(\d+)M/)?.[1] || '0';
      const durationMinutes = parseInt(hours) * 60 + parseInt(minutes);
      
      const segments = flight.itineraries[0].segments;
      const stopCount = segments.length - 1;
      
      console.log(`Flight ${flight.id}: price=${price}, duration=${durationMinutes}min, stops=${stopCount}`);
      
      // Price filter
      if (price > filters.maxPrice) {
        console.log(`  Filtered out by price: ${price} > ${filters.maxPrice}`);
        return false;
      }
      
      // Duration filter (convert to hours)
      const durationHours = durationMinutes / 60;
      if (durationHours > filters.maxDuration) {
        console.log(`  Filtered out by duration: ${durationHours} > ${filters.maxDuration}`);
        return false;
      }
      
      console.log(`  Passed all filters`);
      return true;
    });
    
    console.log('Filtered flights:', filteredFlights.length);
    
    if (filteredFlights.length === 0) {
      console.log('❌ No flights passed the filters!');
    } else {
      console.log('✅ Flights should be displayed');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testFlightSearch();
