# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VRM Food Reviewer is an AI-powered web application that generates passionate food reviews delivered by VRM characters with location-based restaurant integration and social sharing. The project uses a stateless architecture with no database - all processing is real-time.

## Commands

### Development Setup
The project is fully implemented and ready to run:

```bash
# Install dependencies across all packages
npm install

# Start all services (backend + frontend)
npm run dev

# Build all packages for production
npm run build

# Type checking across packages
npm run typecheck

# Linting
npm run lint
```

### Package Management
```bash
# Work with specific packages
cd packages/frontend && npm run dev     # Frontend on port 3000
cd packages/backend && npm run dev      # Backend on port 3001
cd packages/shared && npm run build     # Build shared types
```

## Architecture

### Monorepo Structure
- `packages/frontend/` - React + TypeScript + Vite application
- `packages/backend/` - Express + TypeScript stateless API server  
- `packages/shared/` - Common TypeScript types and interfaces

### Key Technology Stack
- **Frontend**: React 18+, TypeScript, Vite, three.js, @pixiv/three-vrm, GLTFLoader
- **Backend**: Express, TypeScript, Google Auth Library, stateless sessions, multer for temporary files
- **External APIs**: Google Gemini (AI), Google Maps/Places, VOICEVOX (voice synthesis)
- **Authentication**: GCP Service Account (recommended) with API key fallback

### Stateless Architecture
- No database or persistent storage
- Memory-based sessions only
- Temporary image processing with immediate cleanup
- Real-time processing pipeline: Image → AI Review → VRM Performance → Voice → Social Share

## External Resources

### Google Cloud Platform
- Project ID: `aipartner-426616` 
- All Google Maps Platform APIs available (Places, Geocoding, Maps JavaScript)
- **Service Account**: `vrm-food-reviewer-api` with appropriate IAM roles
- **Authentication**: Service account JSON key at `packages/backend/config/service-account-key.json`

### VOICEVOX API
- Endpoint: `https://voicevox-proto-639959525777.asia-northeast2.run.app`
- Japanese voice synthesis service
- Ready for production use

### VRM Character
- Model file: `packages/frontend/public/models/misuzu.vrm`
- 3D character with expression system support
- Supports joy, surprised, satisfied, and neutral emotions

## Core Processing Pipeline

1. **Image Upload** → User uploads food photo (JPEG/PNG, up to 10MB)
2. **Location Detection** → Auto-detect nearby restaurants using Google Places API
3. **AI Review Generation** → Google Gemini creates passionate food review with emotion markers
4. **VRM Performance** → Character displays emotions using BlendShape manipulation
5. **Voice Synthesis** → VOICEVOX converts review text to audio
6. **Social Sharing** → One-click Twitter sharing with hashtags

## Key Implementation Details

### VRM Character System
- Uses @pixiv/three-vrm library
- Emotions: joy, surprised, satisfied, neutral
- BlendShape manipulation only (no complex gestures)
- Emotion markers sync with audio playback

### API Integration Points
- **POST /api/upload** - Image processing
- **POST /api/review** - AI review generation  
- **POST /api/voice** - Text-to-speech conversion
- **GET /api/places** - Restaurant location search

### Performance Requirements
- Image processing: < 2 seconds
- AI review generation: < 5 seconds
- Total user journey: < 15 seconds from upload to shareable result
- VRM rendering: 60fps desktop, 30fps mobile

## Environment Variables Required

### Backend (packages/backend/.env)
```bash
# GCP Service Account Authentication (Recommended)
GOOGLE_APPLICATION_CREDENTIALS=./config/service-account-key.json

# Legacy API Keys (for compatibility/fallback)
GOOGLE_AI_API_KEY=your_gemini_api_key
GOOGLE_MAPS_API_KEY=your_maps_api_key

# VOICEVOX
VOICEVOX_ENDPOINT=https://voicevox-proto-639959525777.asia-northeast2.run.app

# Session Management
SESSION_SECRET=your_secure_session_secret

# Server Configuration
PORT=3001
NODE_ENV=development
LOG_LEVEL=info
```

### Frontend (packages/frontend/.env)
```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3001

# VRM Configuration
VITE_DEFAULT_VRM_URL=/models/misuzu.vrm
```

## Implementation Status

**✅ COMPLETE** - All phases implemented and production-ready:

1. **✅ Phase 1**: Core MVP - Image upload, AI review, VRM display, voice synthesis
2. **✅ Phase 2**: Location integration, restaurant matching, social sharing  
3. **✅ Phase 3**: Mobile optimization, security enhancements with Service Account authentication

## Quick Start Guide

1. **Clone and Install**
   ```bash
   git clone <repository>
   cd vrm-food-reviewer
   npm install
   ```

2. **Setup Environment Variables**
   - Copy `.env.example` files to `.env` in backend and frontend packages
   - Place service account JSON key at `packages/backend/config/service-account-key.json`
   - Configure API keys if needed

3. **Start Development**
   ```bash
   npm run dev
   ```
   - Backend: http://localhost:3001
   - Frontend: http://localhost:3000

4. **Test Application**
   - Upload a food image
   - Allow location access for restaurant detection
   - Generate AI review with VRM character animation
   - Generate voice synthesis
   - Share on Twitter

## Security & Privacy

- **Service Account Authentication**: Enterprise-grade GCP authentication
- **Temporary image processing only** - no storage
- **User location consent required**
- **No personal data retention**
- **Secure credential management** with proper file permissions
- **GDPR compliant** due to stateless architecture