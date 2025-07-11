# GitHub Secrets Configuration Template

This file contains all the secrets you need to configure in your GitHub repository for the CI/CD pipeline to work.

## How to Add Secrets

1. Go to your GitHub repository
2. Click on **Settings** tab
3. Navigate to **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add each secret below

## Required Secrets

### Deployment Platform Secrets

```bash
# Vercel Configuration
VERCEL_TOKEN=your_vercel_token_here
VERCEL_ORG_ID=your_vercel_org_id_here
VERCEL_PROJECT_ID=your_vercel_project_id_here

# Railway Configuration
RAILWAY_TOKEN=your_railway_token_here
RAILWAY_PRODUCTION_SERVICE=your_production_service_id
RAILWAY_STAGING_SERVICE=your_staging_service_id
```

### Application Secrets

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/amadeus-travel

# Authentication
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters

# API Configuration
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
NEXT_PUBLIC_APP_URL=https://your-frontend-domain.com

# Amadeus API (Optional)
AMADEUS_CLIENT_ID=your_amadeus_client_id
AMADEUS_CLIENT_SECRET=your_amadeus_client_secret
```

### Optional Secrets

```bash
# Notifications
SLACK_WEBHOOK=your_slack_webhook_url

# Security Scanning
SNYK_TOKEN=your_snyk_token

# Performance Monitoring
LHCI_GITHUB_APP_TOKEN=your_lighthouse_ci_token
```

## Getting Your Tokens

### Vercel Token
1. Go to https://vercel.com/account/tokens
2. Generate a new token
3. Copy the token value

### Vercel Org ID & Project ID
1. Go to your Vercel project settings
2. Find "General" tab
3. Copy the values from the project information

### Railway Token
1. Go to https://railway.app/account/tokens
2. Generate a new token
3. Copy the token value

### MongoDB URI
1. Go to MongoDB Atlas
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string

### JWT Secret
Generate a secure random string:
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

## Environment Variables vs Secrets

- **Secrets**: Sensitive data that should never be exposed (tokens, passwords, keys)
- **Environment Variables**: Non-sensitive configuration that can be public

## Security Best Practices

1. **Never commit secrets to code**
2. **Use different secrets for staging and production**
3. **Rotate secrets regularly**
4. **Use minimal required permissions**
5. **Monitor secret usage**

## Troubleshooting

### Common Issues

1. **Secret not found**: Check spelling and ensure secret is added to repository
2. **Permission denied**: Ensure tokens have correct permissions
3. **Invalid secret format**: Check secret format matches expected pattern

### Testing Secrets

You can test if secrets are properly configured by:
1. Running the GitHub Actions workflow
2. Checking the workflow logs
3. Verifying deployments succeed

## Next Steps

After adding all secrets:
1. Push code to trigger GitHub Actions
2. Monitor workflow execution
3. Verify deployments work correctly
4. Test the deployed application

---

**Important**: Keep this file secure and never commit actual secret values to version control.
