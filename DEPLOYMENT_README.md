# Amadeus Travel Platform - Quick Deployment

This README provides quick deployment instructions for the Amadeus Travel Platform.

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+
- npm or yarn
- Git
- MongoDB (local or Atlas)

### 2. Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/amadeus-travel-platform.git
cd amadeus-travel-platform

# Run setup script
./setup.sh
```

### 3. Local Development
```bash
# Start backend
cd backend
npm run dev

# Start frontend (in new terminal)
cd frontend
npm run dev
```

### 4. Docker Development
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

## 🌐 Deployment

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Set root directory to `frontend`
3. Configure environment variables
4. Deploy

### Backend (Railway)
1. Connect GitHub repository to Railway
2. Set root directory to `backend`
3. Configure environment variables
4. Deploy

### CI/CD
The project includes GitHub Actions for:
- Automated testing
- Security scanning
- Staging deployments
- Production deployments

## 📋 Environment Variables

### Frontend
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Backend
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=your-secret-key
CORS_ORIGIN=https://your-frontend-domain.com
```

## 🔧 GitHub Secrets

Configure these secrets in your GitHub repository:

### Deployment
- `VERCEL_TOKEN`
- `RAILWAY_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

### Application
- `MONGODB_URI`
- `JWT_SECRET`
- `NEXT_PUBLIC_API_URL`

## 📚 Documentation

For detailed instructions, see:
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Complete deployment guide
- [Frontend README](./frontend/README.md) - Frontend specific instructions
- [Backend README](./backend/README.md) - Backend specific instructions

## 🆘 Support

- Create an issue for bugs
- Check the troubleshooting section in DEPLOYMENT_GUIDE.md
- Review GitHub Actions logs for CI/CD issues

## 🎯 Production Checklist

- [ ] Environment variables configured
- [ ] Database set up and connected
- [ ] GitHub repository configured
- [ ] Deployment platforms connected
- [ ] CI/CD pipeline working
- [ ] Domain configured
- [ ] SSL certificate enabled
- [ ] Monitoring set up

---

**Happy Deploying!** 🚀
