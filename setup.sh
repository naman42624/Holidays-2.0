#!/bin/bash

# Amadeus Travel Platform Deployment Setup Script
# This script helps set up the deployment environment

set -e

echo "🚀 Amadeus Travel Platform Deployment Setup"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d 'v' -f2 | cut -d '.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node -v)"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm"
        exit 1
    fi
    
    # Check Git
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git"
        exit 1
    fi
    
    print_status "All prerequisites are met!"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install frontend dependencies
    print_status "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    
    # Install backend dependencies
    print_status "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    
    print_status "Dependencies installed successfully!"
}

# Build applications
build_applications() {
    print_status "Building applications..."
    
    # Build backend
    print_status "Building backend..."
    cd backend
    npm run build
    cd ..
    
    # Build frontend
    print_status "Building frontend..."
    cd frontend
    npm run build
    cd ..
    
    print_status "Applications built successfully!"
}

# Run tests
run_tests() {
    print_status "Running tests..."
    
    # Test backend
    print_status "Running backend tests..."
    cd backend
    npm test
    cd ..
    
    # Test frontend
    print_status "Running frontend tests..."
    cd frontend
    npm run test:ci
    cd ..
    
    print_status "All tests passed!"
}

# Setup environment files
setup_environment() {
    print_status "Setting up environment files..."
    
    # Frontend environment
    if [ ! -f "frontend/.env.local" ]; then
        cat > frontend/.env.local << EOL
# Frontend Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
EOL
        print_status "Created frontend/.env.local"
    else
        print_warning "frontend/.env.local already exists"
    fi
    
    # Backend environment
    if [ ! -f "backend/.env" ]; then
        cat > backend/.env << EOL
# Backend Environment Variables
PORT=8000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/amadeus-travel
JWT_SECRET=your-development-jwt-secret-key
EOL
        print_status "Created backend/.env"
    else
        print_warning "backend/.env already exists"
    fi
}

# Setup GitHub repository
setup_github() {
    print_status "Setting up GitHub repository..."
    
    if [ ! -d ".git" ]; then
        git init
        git add .
        git commit -m "Initial commit: Amadeus Travel Platform"
        print_status "Git repository initialized"
        
        echo ""
        print_warning "Next steps for GitHub setup:"
        echo "1. Create a new repository on GitHub"
        echo "2. Run: git remote add origin https://github.com/yourusername/amadeus-travel-platform.git"
        echo "3. Run: git push -u origin main"
    else
        print_warning "Git repository already exists"
    fi
}

# Setup Docker
setup_docker() {
    print_status "Setting up Docker configuration..."
    
    if command -v docker &> /dev/null; then
        print_status "Docker is available. You can use docker-compose up to run the full stack"
    else
        print_warning "Docker is not installed. Install Docker to use containerized deployment"
    fi
}

# Main setup function
main() {
    echo ""
    print_status "Starting setup process..."
    
    # Check prerequisites
    check_prerequisites
    
    # Setup environment files
    setup_environment
    
    # Install dependencies
    install_dependencies
    
    # Build applications
    build_applications
    
    # Run tests
    if [ "$1" != "--skip-tests" ]; then
        run_tests
    else
        print_warning "Skipping tests as requested"
    fi
    
    # Setup GitHub
    setup_github
    
    # Setup Docker
    setup_docker
    
    echo ""
    print_status "Setup completed successfully! 🎉"
    echo ""
    echo "Next steps:"
    echo "1. Configure your environment variables in .env files"
    echo "2. Set up your MongoDB database"
    echo "3. Configure your GitHub repository"
    echo "4. Set up deployment platforms (Vercel, Railway, etc.)"
    echo "5. Configure GitHub secrets for CI/CD"
    echo ""
    echo "For detailed instructions, see DEPLOYMENT_GUIDE.md"
}

# Run main function
main "$@"
