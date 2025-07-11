// Test script to verify hotel booking data structure
const testHotelBookingData = {
  hotel: {
    chainCode: "RT",
    iataCode: "MIA",
    dupeId: "700061498",
    name: "Test Hotel",
    rating: 4,
    address: {
      lines: ["123 Test Street"],
      postalCode: "12345",
      cityName: "Test City",
      countryCode: "US"
    },
    amenities: ["WIFI", "PARKING", "RESTAURANT"],
    offers: [{
      price: {
        currency: "USD",
        total: "150.00"
      },
      room: {
        type: "DELUXE",
        typeEstimated: {
          category: "DELUXE_ROOM",
          beds: 2
        }
      }
    }]
  },
  searchForm: {
    destination: "Test City",
    checkIn: "2025-08-01",
    checkOut: "2025-08-05", 
    adults: 2,
    children: 0,
    rooms: 1
  }
}

console.log('Testing hotel booking data structure...')
console.log('Hotel:', testHotelBookingData.hotel.name)
console.log('Adults:', testHotelBookingData.searchForm.adults)
console.log('Children:', testHotelBookingData.searchForm.children)
console.log('Rooms:', testHotelBookingData.searchForm.rooms)

// Test the data structure matches the new format
if (testHotelBookingData.searchForm.adults !== undefined && 
    testHotelBookingData.searchForm.children !== undefined &&
    testHotelBookingData.searchForm.guests === undefined) {
  console.log('✅ Data structure is correct - using adults/children directly')
} else {
  console.log('❌ Data structure is incorrect - still using nested guests object')
}

// Store test data in sessionStorage format
const testData = JSON.stringify(testHotelBookingData)
console.log('Session storage data:', testData)
