#!/bin/bash

echo "Testing Amadeus Travel Platform Backend..."

# Start MongoDB if not running
# brew services start mongodb/brew/mongodb-community

# Check if backend is running
echo "Checking if backend is running..."
curl -s http://localhost:8000/api/health > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Backend is running"
else
    echo "❌ Backend is not running. Please start it with: cd backend && npm run dev"
    exit 1
fi

echo ""
echo "1. Testing health endpoint..."
curl -s http://localhost:8000/api/health | jq '.'

echo ""
echo "2. Testing user registration (if user doesn't exist)..."
curl -s -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123",
    "firstName": "Test",
    "lastName": "User"
  }' | jq '.'

echo ""
echo "3. Testing login..."
RESPONSE=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')

echo "$RESPONSE" | jq '.'

# Extract token if login successful
TOKEN=$(echo "$RESPONSE" | jq -r '.data.token // empty')

if [ -z "$TOKEN" ]; then
    echo "❌ Login failed, cannot continue with profile test"
    exit 1
fi

echo ""
echo "4. Testing profile endpoint with token..."
curl -s -X GET http://localhost:8000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo ""
echo "✅ All tests completed!"
