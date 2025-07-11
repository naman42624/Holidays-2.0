# Amadeus Travel Platform - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Get Amadeus API Credentials
1. Go to [developers.amadeus.com](https://developers.amadeus.com)
2. Sign up for free
3. Create a new app
4. Copy your API Key and Secret

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your Amadeus credentials
npm run dev
```

### 3. Setup Frontend  
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with API URL
npm run dev
```

### 4. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Health: http://localhost:8000/api/health

## 🎯 Test the APIs

### Flight Search
```bash
curl "http://localhost:8000/api/flights/search?originLocationCode=LAX&destinationLocationCode=JFK&departureDate=2024-12-25&adults=2"
```

### Location Search
```bash
curl "http://localhost:8000/api/locations/search?keyword=Los%20Angeles"
```

### Hotel Search
```bash
curl "http://localhost:8000/api/hotels/search?cityCode=NYC&checkInDate=2024-12-25&checkOutDate=2024-12-27&adults=2"
```

### Activity Search
```bash
curl "http://localhost:8000/api/activities/search?latitude=40.7128&longitude=-74.0060&radius=50"
```

## 📱 Frontend Features (Coming Soon)
- Flight search and booking interface
- Hotel search and reservations
- Activity discovery and booking
- Location search with maps
- Responsive design with Tailwind CSS

## 🔧 Development Commands

### Run Everything
```bash
npm run dev  # Runs both backend and frontend
```

### Individual Services
```bash
npm run dev:backend   # Backend only
npm run dev:frontend  # Frontend only
```

### Build for Production
```bash
npm run build
```

## 📚 API Documentation

Visit `http://localhost:8000/api/health` for API status and endpoint information.

All APIs include:
- ✅ Input validation
- ✅ Error handling  
- ✅ Rate limiting
- ✅ CORS support
- ✅ TypeScript types
- ✅ Response transformation

## 🐛 Troubleshooting

### Common Issues:

1. **"Authentication failed"** - Check your Amadeus API credentials
2. **"CORS error"** - Ensure frontend URL is configured in backend .env
3. **"Port already in use"** - Change PORT in backend .env
4. **"Module not found"** - Run `npm install` in respective directories

### Debug Mode:
```bash
# Backend with detailed logs
cd backend && npm run dev

# Check API health
curl http://localhost:8000/api/health
```

## 🎉 You're Ready!

Your Amadeus Travel Platform is now running. Start building amazing travel experiences! 🌍✈️🏨
