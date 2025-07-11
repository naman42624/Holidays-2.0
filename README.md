# Amadeus Travel Platform

A comprehensive full-stack travel booking platform built with Node.js backend and Next.js frontend, integrating with Amadeus API for flights, hotels, activities, and location services.

## 🏗️ Architecture

This project follows a clean architecture with separated concerns:

- **Backend**: Node.js/Express API server with TypeScript
- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based user authentication
- **Caching**: Multi-layer caching (in-memory + MongoDB)
- **API Integration**: Amadeus Self-Service APIs

## ✨ Features

### 🔐 Authentication & User Management
- JWT-based authentication with refresh tokens
- User registration and login
- Profile management and password changes
- Role-based access control (user/admin)

### 🚀 API Playground
- Interactive API testing endpoint
- Sample data for all API categories
- Live API testing with customizable parameters
- Comprehensive documentation of all endpoints

### ⚡ Smart Caching System
- Multi-layer caching strategy
- In-memory cache for frequently accessed data
- MongoDB persistent cache for location data
- Daily refresh of popular destinations
- Configurable TTL and cache policies

### 🌍 Travel Services
- **Flights**: Search, pricing, and booking capabilities
- **Hotels**: Accommodation search and booking
- **Activities**: Tours and attractions discovery
- **Locations**: Airport and city search with caching

### 🛡️ Security & Performance
- Rate limiting and security headers
- CORS configuration
- Input validation and sanitization
- Error handling and logging
- Compression and optimization

## 📁 Project Structure

```
amadeus-travel-platform/
├── backend/                 # Node.js API Server
│   ├── src/
│   │   ├── controllers/     # API route handlers
│   │   ├── services/        # Business logic & Amadeus API integration
│   │   ├── routes/          # Express route definitions
│   │   ├── middleware/      # Custom middleware
│   │   ├── types/           # TypeScript type definitions
│   │   └── server.ts        # Express server setup
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                 # Environment variables
├── frontend/                # Next.js React App
│   ├── src/
│   │   ├── app/            # Next.js App Router
│   │   ├── components/     # Reusable React components
│   │   ├── lib/            # Utility functions & API client
│   │   └── types/          # TypeScript type definitions
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.local          # Environment variables
└── README.md
```

## 🚀 Features

### Flight Services
- **Flight Search**: Search for flights with flexible parameters
- **Flight Pricing**: Get confirmed pricing for selected flights
- **Flight Booking**: Complete flight reservation process
- **Flight Destinations**: Discover flight destinations from origin
- **Flight Dates**: Find cheapest dates for travel
- **Airline Information**: Get airline and aircraft details

### Location Services
- **Location Search**: Search airports, cities, and locations
- **Airport Information**: Detailed airport data and services
- **Nearby Airports**: Find airports near coordinates
- **Popular Destinations**: Trending travel destinations

### Hotel Services
- **Hotel Search**: Find hotels by city or coordinates
- **Hotel Offers**: Get detailed pricing and availability
- **Hotel Booking**: Complete hotel reservation process
- **Hotel Ratings**: Access reviews and sentiment analysis

### Activity Services
- **Activity Search**: Discover tours and activities
- **Points of Interest**: Find attractions and landmarks
- **Activity Details**: Comprehensive activity information
- **Activity Filtering**: Custom filtering capabilities

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting
- **HTTP Client**: Axios for Amadeus API calls
- **Utilities**: date-fns, lodash

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **Icons**: Lucide React

## 📝 API Endpoints

### 🔐 Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout user

### 🎮 API Playground
- `GET /api/playground` - Get playground documentation
- `GET /api/playground/test` - Get sample test data
- `POST /api/playground/live-test` - Test live APIs with sample data

### ✈️ Flights
- `GET /api/flights/search` - Search flight offers
- `POST /api/flights/price` - Get confirmed pricing
- `GET /api/flights/destinations` - Get destination inspiration
- `GET /api/flights/dates` - Find cheapest dates
- `POST /api/flights/book` - Book flights
- `GET /api/flights/airlines` - Get airline information

### 🗺️ Locations (with Caching)
- `GET /api/locations/search` - Search locations (cached)
- `GET /api/locations/:id` - Get location details
- `GET /api/locations/airports-by-city/:cityCode` - Get airports by city
- `GET /api/locations/nearby-airports` - Find nearby airports
- `GET /api/locations/popular-destinations` - Get popular destinations
- `GET /api/locations/airport/:code` - Get airport information

### 🏨 Hotels
- `GET /api/hotels/search` - Search hotels by city
- `GET /api/hotels/search-by-location` - Search hotels by coordinates
- `GET /api/hotels/offers` - Get hotel offers with pricing
- `GET /api/hotels/offers/:offerId` - Get detailed hotel offer
- `POST /api/hotels/book` - Book hotels
- `GET /api/hotels/ratings` - Get hotel ratings

### 🎭 Activities
- `GET /api/activities/search` - Search activities
- `GET /api/activities/:id` - Get activity details
- `GET /api/activities/points-of-interest` - Search points of interest
- `GET /api/activities/points-of-interest/:id` - Get POI details
- `GET /api/activities/categories` - Get activity categories
- `POST /api/activities/filter` - Filter activities

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Amadeus API credentials (sign up at [developers.amadeus.com](https://developers.amadeus.com))

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your Amadeus API credentials:
   ```env
   AMADEUS_API_KEY=your_api_key_here
   AMADEUS_API_SECRET=your_api_secret_here
   AMADEUS_API_BASE_URL=https://test.api.amadeus.com
   PORT=8000
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

   The API server will be running at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local`:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

   The frontend will be running at `http://localhost:3000`

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev      # Start development server with hot reload
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Frontend Development
```bash
cd frontend
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 📚 API Documentation

The API provides comprehensive endpoints for travel-related services. Each endpoint includes:

- **Request validation** with detailed error messages
- **Response transformation** for frontend consumption
- **Error handling** with meaningful error responses
- **Rate limiting** for API protection
- **CORS support** for cross-origin requests

### Example API Usage

#### Search Flights
```bash
GET /api/flights/search?originLocationCode=LAX&destinationLocationCode=JFK&departureDate=2024-12-25&adults=2
```

#### Search Hotels
```bash
GET /api/hotels/search?cityCode=NYC&checkInDate=2024-12-25&checkOutDate=2024-12-27&adults=2
```

#### Search Activities
```bash
GET /api/activities/search?latitude=40.7128&longitude=-74.0060&radius=50
```

## 🔒 Security Features

- **Rate limiting** to prevent API abuse
- **CORS configuration** for secure cross-origin requests
- **Input validation** on all endpoints
- **Error handling** without exposing sensitive information
- **Security headers** with Helmet.js

## 🌍 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=8000
AMADEUS_API_KEY=your_amadeus_api_key
AMADEUS_API_SECRET=your_amadeus_api_secret
AMADEUS_API_BASE_URL=https://test.api.amadeus.com
FRONTEND_URL=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

## 📈 Performance Optimizations

- **Response caching** for frequently requested data
- **Request deduplication** for similar API calls
- **Compression** for reduced payload sizes
- **Rate limiting** for API protection
- **Error boundaries** for graceful error handling

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test              # Run unit tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

### Frontend Testing
```bash
cd frontend
npm test              # Run unit tests
npm run test:e2e      # Run end-to-end tests
```

## 🚢 Deployment

### Backend Deployment
1. Build the application: `npm run build`
2. Set production environment variables
3. Deploy to your preferred platform (Vercel, Railway, Render, etc.)

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy to Vercel, Netlify, or your preferred platform

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue in this repository
- Check the [Amadeus for Developers documentation](https://developers.amadeus.com/self-service)
- Visit the [Amadeus Discord community](https://discord.gg/cVrFBqx)

## 🙏 Acknowledgments

- [Amadeus for Developers](https://developers.amadeus.com) for providing the travel APIs
- [Next.js](https://nextjs.org) for the React framework
- [Express.js](https://expressjs.com) for the Node.js framework
- [Tailwind CSS](https://tailwindcss.com) for the utility-first CSS framework
