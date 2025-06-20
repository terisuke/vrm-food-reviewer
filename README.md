# VRM Food Reviewer

**Status: ✅ COMPLETE & PRODUCTION READY**

AI-generated passionate food reviews delivered by VRM characters with location-based restaurant integration and social sharing. This application uses real VRM 3D characters, Google AI for review generation, and enterprise-grade GCP Service Account authentication.

## 🚀 Quick Start

### Prerequisites
- Node.js ≥18.0.0
- npm ≥8.0.0
- Access to GCP Project: `aipartner-426616` (Service Account configured)
- VOICEVOX endpoint: `https://voicevox-proto-639959525777.asia-northeast2.run.app`

### Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd vrm-food-reviewer
   npm install
   ```

2. **Environment Configuration**
   ```bash
   # Backend environment
   cp packages/backend/.env.example packages/backend/.env
   
   # Frontend environment  
   cp packages/frontend/.env.example packages/frontend/.env
   ```

3. **Service Account Setup**
   - Place your GCP service account JSON key at:
     ```
     packages/backend/config/service-account-key.json
     ```
   - Ensure proper file permissions: `chmod 600 packages/backend/config/service-account-key.json`

4. **Start Development**
   ```bash
   # Start both backend and frontend
   npm run dev
   
   # Or start individually
   npm run dev --workspace=packages/backend   # Port 3001
   npm run dev --workspace=packages/frontend  # Port 3000
   ```

5. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Health Check: http://localhost:3001/api/health

### Key Features ✨
- **🤖 Real-time AI food review generation** using Google Gemini with Service Account authentication
- **🎭 Real VRM character expressions** with emotional synchronization (みすず character)
- **🎤 Japanese voice synthesis** via VOICEVOX API
- **📍 Location-aware restaurant detection** using Google Maps APIs
- **🐦 One-click social sharing** to Twitter with formatted content
- **🔒 Enterprise-grade security** with GCP Service Account authentication
- **⚡ Zero database complexity** - completely stateless architecture

### Project Structure
```
├── docs/                         # Documentation & Implementation logs
│   ├── PRD.md                   # Product Requirements Document
│   └── IMPLEMENTATION_LOG.md    # Complete implementation details
├── packages/
│   ├── shared/                  # Common TypeScript types
│   ├── backend/                 # Express API server with GCP auth
│   │   ├── config/             # Service account keys (gitignored)
│   │   └── src/                # Backend source code
│   └── frontend/               # React + Vite application
│       ├── public/models/      # VRM character files
│       └── src/                # Frontend source code
├── CLAUDE.md                   # Claude Code documentation
└── package.json               # Monorepo workspace configuration
```

## 🎮 How to Use

### User Journey
1. **📸 Upload Food Photo** - Drag & drop or select food image (JPEG/PNG, up to 10MB)
2. **📍 Enable Location** - Allow location access for restaurant detection
3. **🏪 Select Restaurant** - Choose from nearby restaurants or search manually
4. **🤖 Generate AI Review** - Create passionate food review with emotion markers
5. **🎭 Watch VRM Performance** - See みすず character express emotions while reading review
6. **🎤 Listen to Voice** - Generate and play Japanese voice synthesis
7. **🐦 Share on Twitter** - One-click sharing with formatted content and hashtags

### API Endpoints
- `GET /api/health` - Service health check
- `POST /api/upload` - Upload and validate food images
- `POST /api/review` - Generate AI food reviews with emotion markers
- `POST /api/voice` - Text-to-speech synthesis
- `GET /api/places?lat=&lng=&radius=` - Search nearby restaurants

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Development (starts both backend and frontend)
npm run dev

# Build all packages
npm run build

# Type checking
npm run typecheck

# Linting
npm run lint

# Clean build files
npm run clean
```

## 📚 Documentation
- 📋 **[Product Requirements Document](./docs/PRD.md)** - Complete specification
- 📝 **[Implementation Log](./docs/IMPLEMENTATION_LOG.md)** - Detailed implementation details
- 🤖 **[Claude Code Guide](./CLAUDE.md)** - Development guidance for AI assistants
- 🏗️ **Architecture**: Stateless React + Express with external AI services
- 🔧 **APIs**: Google Gemini, Google Maps, VOICEVOX

## 🚀 Deployment Ready

**Production Deployment:**
- ✅ Service Account authentication configured
- ✅ Environment variables documented
- ✅ Build process optimized
- ✅ Security best practices implemented
- ✅ Health monitoring endpoints available

**Next Steps:**
1. Deploy backend to Railway/Render with service account environment variables
2. Deploy frontend to Vercel
3. Configure production environment variables
4. Test production deployment with real data

---

**🎉 Fully implemented and ready for production deployment!**