# Amadeus Travel Platform - Deployment Guide

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Project Structure](#project-structure)
4. [Environment Setup](#environment-setup)
5. [GitHub Repository Setup](#github-repository-setup)
6. [CI/CD Pipeline Configuration](#cicd-pipeline-configuration)
7. [Deployment Platforms](#deployment-platforms)
8. [Database Setup](#database-setup)
9. [Environment Variables](#environment-variables)
10. [Monitoring and Logging](#monitoring-and-logging)
11. [Security Considerations](#security-considerations)
12. [Troubleshooting](#troubleshooting)

## Overview

This guide provides step-by-step instructions for deploying the Amadeus Travel Platform with a complete CI/CD pipeline using GitHub Actions. The platform consists of:

- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Backend**: Node.js with Express and TypeScript
- **Database**: MongoDB
- **Deployment**: Vercel (Frontend) + Railway/Render (Backend)

## Prerequisites

### Required Accounts
- [GitHub](https://github.com) account
- [Vercel](https://vercel.com) account
- [Railway](https://railway.app) or [Render](https://render.com) account
- [MongoDB Atlas](https://www.mongodb.com/atlas) account

### Local Development Tools
- Node.js 18+ and npm
- Git
- VS Code (recommended)

## Project Structure

```
amadeus-travel-platform/
├── frontend/              # Next.js application
│   ├── src/
│   ├── package.json
│   ├── next.config.ts
│   └── ...
├── backend/              # Node.js API server
│   ├── src/
│   ├── package.json
│   ├── tsconfig.json
│   └── ...
├── .github/
│   └── workflows/        # GitHub Actions workflows
├── docker-compose.yml    # Local development
├── README.md
└── DEPLOYMENT_GUIDE.md
```

## Environment Setup

### 1. Frontend Environment Variables

Create `.env.local` in the frontend directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Amadeus API (Optional - for real flight data)
AMADEUS_CLIENT_ID=your_amadeus_client_id
AMADEUS_CLIENT_SECRET=your_amadeus_client_secret

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=your_google_analytics_id

# Environment
NODE_ENV=production
```

### 2. Backend Environment Variables

Create `.env` in the backend directory:

```env
# Server Configuration
PORT=8000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/amadeus-travel

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRES_IN=7d

# Amadeus API
AMADEUS_CLIENT_ID=your_amadeus_client_id
AMADEUS_CLIENT_SECRET=your_amadeus_client_secret

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Upload (Optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## GitHub Repository Setup

### 1. Create GitHub Repository

```bash
# Initialize git repository
git init
git add .
git commit -m "Initial commit"

# Create repository on GitHub and push
git remote add origin https://github.com/yourusername/amadeus-travel-platform.git
git branch -M main
git push -u origin main
```

### 2. Repository Settings

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Add the following secrets:

**Frontend Secrets:**
- `NEXT_PUBLIC_API_URL`
- `AMADEUS_CLIENT_ID`
- `AMADEUS_CLIENT_SECRET`

**Backend Secrets:**
- `MONGODB_URI`
- `JWT_SECRET`
- `AMADEUS_CLIENT_ID`
- `AMADEUS_CLIENT_SECRET`

**Deployment Secrets:**
- `VERCEL_TOKEN` (from Vercel dashboard)
- `RAILWAY_TOKEN` (from Railway dashboard)

## CI/CD Pipeline Configuration

The GitHub Actions workflows will automatically:
- Run tests on pull requests
- Deploy frontend to Vercel
- Deploy backend to Railway
- Run security scans
- Send notifications

### Workflow Features:
- **Automated Testing**: Runs on every PR
- **Multi-environment**: Staging and Production
- **Security Scanning**: Code vulnerability checks
- **Performance Monitoring**: Lighthouse CI
- **Automated Deployments**: On merge to main

## Deployment Platforms

### Frontend Deployment (Vercel)

1. **Connect Vercel to GitHub:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Import Project"
   - Select your GitHub repository
   - Choose the `frontend` folder as root directory

2. **Configure Build Settings:**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Environment Variables:**
   - Add all frontend environment variables in Vercel dashboard

### Backend Deployment (Railway)

1. **Connect Railway to GitHub:**
   - Go to [Railway Dashboard](https://railway.app/dashboard)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

2. **Configure Service:**
   - Root Directory: `backend`
   - Build Command: `npm run build`
   - Start Command: `npm start`

3. **Environment Variables:**
   - Add all backend environment variables in Railway dashboard

## Database Setup

### MongoDB Atlas Configuration

1. **Create Cluster:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a new cluster
   - Choose your preferred region

2. **Database Setup:**
   - Create database: `amadeus-travel`
   - Collections will be created automatically

3. **Security:**
   - Create database user
   - Configure IP whitelist (0.0.0.0/0 for cloud deployments)
   - Get connection string

4. **Indexes (Optional):**
   ```javascript
   // Users collection
   db.users.createIndex({ email: 1 }, { unique: true })
   
   // Bookings collection
   db.bookings.createIndex({ userId: 1 })
   db.bookings.createIndex({ bookingId: 1 }, { unique: true })
   
   // Tour packages collection
   db.tourpackages.createIndex({ title: "text", description: "text" })
   ```

## Environment Variables

### Production Environment Variables

**Frontend (.env.production):**
```env
NEXT_PUBLIC_API_URL=https://your-production-backend.railway.app/api
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NODE_ENV=production
```

**Backend (.env.production):**
```env
NODE_ENV=production
PORT=8000
MONGODB_URI=mongodb+srv://prod-user:password@cluster.mongodb.net/amadeus-travel-prod
JWT_SECRET=your-production-jwt-secret
CORS_ORIGIN=https://your-domain.vercel.app
```

## Monitoring and Logging

### 1. Application Monitoring

**Vercel Analytics:**
- Automatically enabled for frontend
- Real-time performance metrics
- Core Web Vitals tracking

**Railway Monitoring:**
- CPU and memory usage
- Request metrics
- Error tracking

### 2. Error Tracking (Optional)

Add Sentry for error tracking:

```bash
# Frontend
npm install @sentry/nextjs

# Backend
npm install @sentry/node @sentry/tracing
```

### 3. Logging

The application includes structured logging:
- Request/response logging
- Error logging
- Performance metrics
- User activity tracking

## Security Considerations

### 1. API Security
- JWT token authentication
- Rate limiting
- CORS configuration
- Input validation
- SQL injection prevention

### 2. Environment Security
- Secrets management
- Environment separation
- Database security
- HTTPS enforcement

### 3. Frontend Security
- CSP headers
- XSS protection
- Secure authentication
- Environment variable protection

## Troubleshooting

### Common Issues

1. **Build Failures:**
   - Check environment variables
   - Verify Node.js version
   - Check for TypeScript errors

2. **Database Connection:**
   - Verify MongoDB URI
   - Check IP whitelist
   - Validate credentials

3. **API Connectivity:**
   - Check CORS settings
   - Verify API URLs
   - Test endpoints

4. **Deployment Issues:**
   - Check build logs
   - Verify environment variables
   - Check service configurations

### Debug Commands

```bash
# Check build locally
npm run build

# Test API endpoints
curl -X GET https://your-backend-url.com/api/health

# Check environment variables
echo $NEXT_PUBLIC_API_URL
```

## Next Steps

After successful deployment:

1. **Domain Setup**: Configure custom domain
2. **SSL Certificate**: Ensure HTTPS is enabled
3. **Monitoring**: Set up alerts and monitoring
4. **Performance**: Optimize for production
5. **Backup**: Set up database backups
6. **Documentation**: Update API documentation

## Support

For issues and questions:
- Check the troubleshooting section
- Review GitHub Actions logs
- Check platform-specific documentation
- Create GitHub issues for bugs

---

**Note**: This guide assumes you have basic knowledge of Git, Node.js, and deployment platforms. Adjust configurations based on your specific requirements and chosen platforms.
