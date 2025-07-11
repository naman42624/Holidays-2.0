# Environment Configuration Examples

## Backend Environment Variables (.env)
```env
# Environment
NODE_ENV=development
PORT=8000

# Amadeus API Configuration
AMADEUS_API_KEY=your_amadeus_api_key_here
AMADEUS_API_SECRET=your_amadeus_api_secret_here
AMADEUS_API_BASE_URL=https://test.api.amadeus.com

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

## Frontend Environment Variables (.env.local)
```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

## Getting Amadeus API Credentials

1. Visit [Amadeus for Developers](https://developers.amadeus.com)
2. Sign up for a free account
3. Create a new application
4. Copy your API Key and API Secret
5. Use the test environment URL: `https://test.api.amadeus.com`

## Production Environment

For production deployment, use:
- `AMADEUS_API_BASE_URL=https://api.amadeus.com` (production API)
- Set appropriate CORS origins
- Configure secure secrets management
- Enable proper logging and monitoring
