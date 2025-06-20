# VRM Food Reviewer - Production Deployment Guide

**Status: Ready for Production Deployment**

This guide covers deploying the VRM Food Reviewer application to production with GCP Service Account authentication.

## 🎯 Deployment Overview

### Recommended Architecture
- **Frontend**: Vercel (Static Site Hosting)
- **Backend**: Railway or Render (Node.js Container)
- **Authentication**: GCP Service Account
- **External APIs**: Google Gemini, Google Maps, VOICEVOX

### Prerequisites
- GCP Project: `aipartner-426616` 
- Service Account JSON key
- Vercel account
- Railway/Render account
- Domain name (optional)

## 🔐 Security Setup

### 1. Service Account Configuration

**Create Production Service Account:**
```bash
# In GCP Console or Cloud Shell
gcloud iam service-accounts create vrm-food-reviewer-prod \
    --display-name="VRM Food Reviewer Production" \
    --description="Production service account for VRM Food Reviewer"

# Grant required roles
gcloud projects add-iam-policy-binding aipartner-426616 \
    --member="serviceAccount:vrm-food-reviewer-prod@aipartner-426616.iam.gserviceaccount.com" \
    --role="roles/aiplatform.user"

gcloud projects add-iam-policy-binding aipartner-426616 \
    --member="serviceAccount:vrm-food-reviewer-prod@aipartner-426616.iam.gserviceaccount.com" \
    --role="roles/serviceusage.serviceUsageConsumer"

# Create and download key
gcloud iam service-accounts keys create vrm-food-reviewer-prod-key.json \
    --iam-account=vrm-food-reviewer-prod@aipartner-426616.iam.gserviceaccount.com
```

**Enable Required APIs:**
```bash
gcloud services enable generativelanguage.googleapis.com
gcloud services enable places-backend.googleapis.com
gcloud services enable geocoding-backend.googleapis.com
gcloud services enable maps-backend.googleapis.com
```

### 2. ~~Frontend API Key~~ ✅ Not Required

**Frontend API Key is NOT needed** - All Google API calls (Maps, Places, Geocoding) are handled through the backend using Service Account authentication. This provides:
- Better security (no API keys exposed to browser)
- Centralized authentication management
- No need for browser-specific API key restrictions

## 🚀 Backend Deployment (Railway)

### 1. Prepare Backend for Deployment

**Create deployment script:**
```bash
# Create deployment-script.sh in packages/backend/
cat > packages/backend/deployment-script.sh << 'EOF'
#!/bin/bash
# Decode service account key from environment variable
echo $GOOGLE_SERVICE_ACCOUNT_KEY | base64 -d > /tmp/service-account.json
export GOOGLE_APPLICATION_CREDENTIALS=/tmp/service-account.json

# Start the application
npm start
EOF

chmod +x packages/backend/deployment-script.sh
```

**Update package.json for production:**
```json
{
  "scripts": {
    "start": "node dist/index.js",
    "deploy": "bash deployment-script.sh"
  }
}
```

### 2. Deploy to Railway

**Setup Railway Project:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and create project
railway login
railway init
railway link
```

**Environment Variables in Railway:**
```bash
# Service Account (base64 encoded)
GOOGLE_SERVICE_ACCOUNT_KEY=<base64_encoded_json_content>
GOOGLE_APPLICATION_CREDENTIALS=/tmp/service-account.json

# VOICEVOX
VOICEVOX_ENDPOINT=https://voicevox-proto-639959525777.asia-northeast2.run.app

# Session Management
SESSION_SECRET=<secure_random_string_production>

# Environment
NODE_ENV=production
PORT=3001
LOG_LEVEL=info
```

**Deploy:**
```bash
cd packages/backend
railway up
```

### 3. Alternative: Deploy to Render

**Create render.yaml:**
```yaml
services:
  - type: web
    name: vrm-food-reviewer-backend
    env: node
    buildCommand: npm install && npm run build
    startCommand: bash deployment-script.sh
    envVars:
      - key: GOOGLE_SERVICE_ACCOUNT_KEY
        sync: false
      - key: VOICEVOX_ENDPOINT
        value: https://voicevox-proto-639959525777.asia-northeast2.run.app
      - key: SESSION_SECRET
        generateValue: true
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3001
```

## 🌐 Frontend Deployment (Vercel)

### 1. Prepare Frontend for Deployment

**Update environment variables:**
```bash
# In Vercel dashboard or .env.production
VITE_API_BASE_URL=https://your-backend-domain.railway.app
VITE_DEFAULT_VRM_URL=/models/misuzu.vrm
```

### 2. Deploy to Vercel

**Using Vercel CLI:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from project root
cd vrm-food-reviewer
vercel

# Follow prompts:
# - Link to existing project or create new
# - Set build command: npm run build --workspace=packages/frontend
# - Set output directory: packages/frontend/dist
# - Set root directory: packages/frontend
```

**Using Git Integration:**
1. Connect your GitHub repository to Vercel
2. Configure build settings:
   - **Build Command**: `npm run build --workspace=packages/frontend`
   - **Output Directory**: `packages/frontend/dist`
   - **Root Directory**: `packages/frontend`
3. Add environment variables in Vercel dashboard

## 📋 Production Checklist

### Pre-Deployment
- [ ] Service account created with minimal permissions
- [ ] Environment variables documented
- [ ] Service account key base64 encoded
- [ ] Security review completed

### Backend Deployment
- [ ] Railway/Render project created
- [ ] Environment variables configured
- [ ] Service account key uploaded
- [ ] Health check endpoint accessible
- [ ] CORS configured for frontend domain
- [ ] Logging configured and working

### Frontend Deployment
- [ ] Vercel project created
- [ ] Build configuration verified
- [ ] Environment variables set
- [ ] VRM model file accessible
- [ ] API endpoints connecting successfully
- [ ] Cross-origin requests working

### Post-Deployment Testing
- [ ] Health check: `https://your-backend.railway.app/api/health`
- [ ] Image upload functionality
- [ ] AI review generation
- [ ] VRM character loading and animation
- [ ] Voice synthesis
- [ ] Location detection
- [ ] Restaurant search
- [ ] Twitter sharing
- [ ] Mobile responsiveness

## 🔧 Production Configuration

### Backend Configuration
```bash
# Production environment variables
NODE_ENV=production
PORT=3001
LOG_LEVEL=info
SESSION_SECRET=<64-character-random-string>
GOOGLE_APPLICATION_CREDENTIALS=/tmp/service-account.json
VOICEVOX_ENDPOINT=https://voicevox-proto-639959525777.asia-northeast2.run.app
```

### Frontend Configuration
```bash
# Production environment variables
VITE_API_BASE_URL=https://your-backend-domain.railway.app
VITE_DEFAULT_VRM_URL=/models/misuzu.vrm
```

### CORS Configuration
```typescript
// Backend CORS setup for production
app.use(cors({
  origin: [
    'https://your-frontend-domain.vercel.app',
    'https://your-custom-domain.com'
  ],
  credentials: true
}));
```

## 📊 Monitoring & Maintenance

### Health Monitoring
- Monitor `/api/health` endpoint
- Set up uptime monitoring (Uptime Robot, Pingdom)
- Configure alerting for service failures

### Log Management
- Backend logs available in Railway/Render dashboard
- Frontend errors in Vercel Function Logs
- Configure log retention policies

### Performance Monitoring
- Monitor API response times
- Track VRM model loading performance
- Monitor external API quotas (Google AI, Maps)

### Security Maintenance
- Rotate service account keys quarterly
- Review and update API key restrictions
- Monitor GCP IAM audit logs
- Keep dependencies updated

## 🆘 Troubleshooting

### Common Issues

**Service Account Authentication Fails:**
- Verify base64 encoding is correct
- Check IAM roles are properly assigned
- Ensure APIs are enabled in GCP project

**Frontend Can't Connect to Backend:**
- Verify CORS configuration
- Check API_BASE_URL environment variable
- Ensure backend is accessible publicly

**VRM Model Won't Load:**
- Verify model file is in `public/models/` directory
- Check file permissions and accessibility
- Monitor browser console for WebGL errors

**Google Maps API Errors:**
- Verify API key restrictions
- Check billing account is active
- Ensure APIs are enabled

### Support Resources
- **Backend Logs**: Railway/Render dashboard
- **Frontend Logs**: Vercel dashboard
- **GCP Logs**: Cloud Console → Logging
- **API Status**: Google Cloud Status page

---

## 🎉 Deployment Complete

Once deployed, your VRM Food Reviewer application will be:
- ✅ Securely authenticated with GCP Service Account
- ✅ Scalable and stateless
- ✅ Globally distributed via CDN
- ✅ Production-ready with monitoring
- ✅ Mobile-optimized with PWA capabilities

**Live URLs:**
- Frontend: `https://your-project.vercel.app`
- Backend API: `https://your-project.railway.app`
- Health Check: `https://your-project.railway.app/api/health`