# Backend Package

Express + TypeScript stateless API server for VRM Food Reviewer.

## Setup Complete ✅

This package has been implemented with all core functionality:

### Implemented Features
- Express server with TypeScript
- Stateless session management
- Image upload and processing
- Google Gemini API integration
- VOICEVOX API integration
- Google Places API integration
- CORS configuration
- Error handling middleware
- Health check endpoint

### API Endpoints
- `POST /api/upload` - Image upload and food detection
- `POST /api/review` - AI food review generation
- `POST /api/voice` - Text-to-speech synthesis
- `GET /api/places` - Restaurant search
- `GET /api/health` - Service health check

### Environment Variables Required

**Recommended Setup (Service Account):**
```bash
# GCP Service Account Authentication
GOOGLE_APPLICATION_CREDENTIALS=./config/service-account-key.json

# VOICEVOX API
VOICEVOX_ENDPOINT=https://voicevox-proto-639959525777.asia-northeast2.run.app

# Session Management
SESSION_SECRET=your_secure_session_secret

# Server Configuration
PORT=3001
NODE_ENV=development
LOG_LEVEL=info
```

**Legacy Setup (API Keys - for compatibility):**
```bash
# Legacy Google APIs (fallback)
GOOGLE_AI_API_KEY=your_gemini_api_key
GOOGLE_MAPS_API_KEY=your_maps_api_key

# Other variables same as above
VOICEVOX_ENDPOINT=https://voicevox-proto-639959525777.asia-northeast2.run.app
SESSION_SECRET=your_secure_session_secret
PORT=3001
NODE_ENV=development
```

### Service Account Setup
1. Place your GCP service account JSON key at: `config/service-account-key.json`
2. Ensure proper permissions: `chmod 600 config/service-account-key.json`
3. The service account should have these IAM roles:
   - AI Platform User (for Gemini API)
   - Maps Platform User (for Places/Geocoding APIs)
   - Service Usage Consumer

### Development Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run typecheck # Type checking
```