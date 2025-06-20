# Product Requirements Document (PRD)
## AI Food Review VRM Character Web Application
**For Development Team**

### **Project Overview**

**Product Name:** VRM Food Reviewer  
**Target:** Web application with future mobile expansion  
**Core Value:** AI-generated passionate food reviews delivered by VRM characters with location-based restaurant integration and social sharing

---

## **🚀 Available Development Resources**

### **Ready-to-Use GCP Resources**
```
Project ID: aipartner-426616
Available APIs: All Google Maps Platform APIs
├── Places API (restaurant information retrieval)
├── Geocoding API (location conversion)  
├── Maps JavaScript API (map display)
└── All other Maps APIs
```

**Development Impact:**
- ✅ **No API key creation/setup required**
- ✅ **Billing already configured - start development immediately**
- ✅ **Location features can be prioritized from day 1**

### **Voice Synthesis API**
```
Available Endpoint: 
https://voicevox-proto-639959525777.asia-northeast2.run.app

Protocol: VOICEVOX-compatible API
```

**Changes from Original Plan:**
- ~~aivis speech API~~ → **VOICEVOX API**
- Better suited for Japanese voice synthesis
- Already deployed - no additional infrastructure setup needed

### **Accelerated Development Timeline**
With these resources available:
- **Phase 1**: 3-4 weeks → **2-3 weeks** (no DB setup)
- **Phase 2**: 1-2 weeks → **1 week** (simplified architecture)
- **Overall**: **4-7 weeks total** (vs. original 9-13 weeks)
- **Benefits**: 50%+ faster development, zero infrastructure complexity

---

## **1. Product Vision & Goals**

### **Vision Statement**
Create an entertaining web application where users upload food photos and receive passionate food reviews delivered by animated VRM characters, with seamless restaurant information integration and social media sharing.

### **Success Metrics**
- User engagement: Average session time > 3 minutes
- Social sharing: 40%+ of reviews shared on Twitter
- Location accuracy: 85%+ correct restaurant identification
- Technical performance: < 3 seconds total processing time

---

## **2. Technical Architecture**

### **Technology Stack**
```
Frontend: TypeScript + React + Vite
├── @pixiv/three-vrm       # VRM character control
├── three.js               # 3D rendering
├── @google/maps           # Location & restaurant data
└── Web Audio API          # Audio playback

Backend: TypeScript + Express (Stateless)
├── @google/generative-ai  # Gemini API integration
├── axios                  # VOICEVOX API calls
├── @google/maps           # Places API
├── multer                 # Temporary image handling
└── express-session        # Memory-based session management

Deploy: Vercel (Frontend) + Railway (Backend)
Storage: None - Real-time processing only
```

### **Monorepo Structure**
```
├── packages/
│   ├── frontend/          # React application
│   ├── backend/           # Express API server (stateless)
│   └── shared/            # Common TypeScript types
├── package.json           # Workspace configuration
└── README.md
```

---

## **3. Core Features & User Flow**

### **Primary User Journey**
1. **Image Upload** → User uploads food photo
2. **Location Detection** → Auto-detect nearby restaurants
3. **Restaurant Selection** → User confirms/selects restaurant
4. **AI Review Generation** → Gemini API creates passionate food review
5. **VRM Performance** → Character delivers review with emotions
6. **Voice Synthesis** → VOICEVOX converts text to audio
7. **Social Sharing** → One-click Twitter post with hashtags

### **Feature Requirements**

#### **F1: Image Processing & Upload**
- **Input:** JPEG/PNG images up to 10MB
- **Validation:** Food detection confidence > 70%
- **Output:** Processed image + extracted food type

#### **F2: AI Food Review Generation**
- **Service:** Google Gemini API
- **Input:** Food image + restaurant context
- **Output:** 
  - Long-form passionate review (300-500 chars)
  - Short social media version (140 chars)
  - Emotion markers for VRM expression

#### **F3: VRM Character Expression**
- **Library:** @pixiv/three-vrm (avoid reinventing)
- **Expressions:** 
  - Joy (うまい, 最高)
  - Surprised (うわあ, すごい)
  - Satisfied (満足, ごちそうさま)
  - Neutral (default)
- **Implementation:** BlendShape manipulation only (no complex gestures)

#### **F4: Voice Synthesis**
- **Service:** VOICEVOX API (available endpoint above)
- **Input:** Generated review text
- **Output:** Audio file for character playback
- **Sync:** Basic audio playback (no real-time lip sync)

#### **F5: Location & Restaurant Integration**
- **Service:** Google Places API (Project: aipartner-426616)
- **Detection:** navigator.geolocation + image analysis
- **Data:** Restaurant name, rating, address, category
- **Fallback:** Manual restaurant search/selection

#### **F6: Social Media Sharing**
- **Platform:** Twitter (Phase 1 only)
- **Method:** Web Intent API (no OAuth required)
- **Content:** Short review + restaurant info + hashtags
- **Format:**
```
[Short review] 🍴

📍 [Restaurant Name]
⭐ [Rating]/5
🎬 VRM character food review

#FoodReviewAI #VRM #[RestaurantCategory]
```

---

## **4. Development Phases**

### **Phase 1: Core MVP (2-3 weeks)** *(Accelerated - No DB Setup)*
**Sprint 1: Foundation**
- Project setup with monorepo structure
- Image upload & temporary processing pipeline
- Gemini API integration for review generation
- Basic VRM character display
- **Google Maps API integration** (immediate start)

**Sprint 2: Core Features**
- VRM emotion expression system
- VOICEVOX integration
- Audio playback coordination
- Basic UI/UX implementation

**Deliverables:**
- Working web application
- Image → AI review → VRM performance pipeline
- Audio synthesis and playback

### **Phase 2: Enhancement (1 week)** *(Significantly Accelerated)*
**Sprint 3: Location & Social Features**
- Location detection and restaurant matching
- Restaurant information display
- Twitter sharing functionality
- Short review generation and hashtag automation

**Deliverables:**
- Complete feature set
- Location-aware restaurant integration
- One-click social sharing

### **Phase 3: Mobile Preparation (2-3 weeks)**
**Sprint 4-5: Optimization & PWA**
- Performance optimization
- Progressive Web App implementation
- Mobile-responsive design
- React Native architecture planning

**Deliverables:**
- PWA-ready web application
- Mobile development roadmap
- Performance benchmarks achieved

**🚀 Total Development Time: 4-7 weeks (vs. original 9-13 weeks)**

---

## **5. Technical Specifications**

### **API Integrations**

#### **Gemini AI Integration**
```typescript
interface FoodReviewRequest {
  imageBase64: string;
  restaurantContext?: RestaurantInfo;
  reviewStyle: 'passionate' | 'casual';
}

interface FoodReviewResponse {
  longReview: string;           // 300-500 characters
  shortReview: string;          // < 140 characters  
  emotionMarkers: EmotionMarker[];
  foodType: string;
}
```

#### **VOICEVOX API Integration**
```typescript
interface VoicevoxRequest {
  text: string;
  speaker: number;      // Speaker ID (0-46 available)
}

interface VoicevoxResponse {
  audioBuffer: ArrayBuffer;
  duration: number;
}

// API Endpoint
const VOICEVOX_ENDPOINT = 'https://voicevox-proto-639959525777.asia-northeast2.run.app';
```

#### **VRM Expression System**
```typescript
interface EmotionMarker {
  timestamp: number;
  emotion: 'joy' | 'surprised' | 'satisfied' | 'neutral';
  intensity: number; // 0.0 - 1.0
}

interface VRMController {
  loadVRM(url: string): Promise<VRM>;
  setExpression(emotion: string, intensity: number): void;
  playEmotionSequence(markers: EmotionMarker[]): void;
}
```

#### **Restaurant Data Integration (GCP Project: aipartner-426616)**
```typescript
interface RestaurantInfo {
  name: string;
  address: string;
  rating: number;
  category: string;
  placeId: string;
}

// Available APIs
interface GoogleMapsAPIs {
  placesAPI: 'Text Search, Nearby Search, Place Details';
  geocodingAPI: 'Address ↔ Coordinates conversion';
  mapsJavaScriptAPI: 'Interactive map display';
}
```

### **Performance Requirements**
- **Image upload:** < 2 seconds processing
- **AI review generation:** < 5 seconds
- **VRM rendering:** 60fps on desktop, 30fps on mobile
- **Total user journey:** < 15 seconds from upload to shareable result

### **Security & Privacy**
- **Image handling:** Temporary processing only, immediately discarded after use
- **Location data:** User consent required, no server-side storage
- **Session data:** Memory-based only, no persistence
- **API keys:** Server-side only, environment variables
- **Data retention:** Zero personal data storage, minimal performance logging only
- **GDPR Compliance:** Inherent due to no data storage architecture

---

## **6. Success Criteria & Testing**

### **Acceptance Criteria**
- [ ] User can upload food image and receive AI-generated review
- [ ] VRM character displays appropriate emotions during review
- [ ] Restaurant information automatically detected and displayed
- [ ] One-click Twitter sharing functions correctly
- [ ] Application loads and responds within performance requirements
- [ ] Mobile browsers display and function correctly

### **Testing Strategy**
- **Unit Testing:** Jest for TypeScript functions
- **Integration Testing:** API endpoints and external service integration
- **E2E Testing:** Playwright for complete user journeys
- **Performance Testing:** Lighthouse audits and load testing
- **Device Testing:** Cross-browser and mobile device validation

---

## **7. Deployment & Infrastructure**

### **Production Environment**
```
Frontend: Vercel
├── Automatic deployments from main branch
├── Preview deployments for PRs
└── Global CDN distribution

Backend: Railway/Render
├── Auto-scaling Node.js containers
├── Environment variable management
├── Stateless architecture (no persistent storage)
└── Temporary file cleanup automation

Logging: File-based + Console output
├── Winston for structured logging
├── No personal data retention
└── Performance metrics only
```

### **Environment Variables Required**
```bash
# Google APIs (Project: aipartner-426616)
GOOGLE_MAPS_API_KEY=your_maps_api_key
GOOGLE_PLACES_API_KEY=your_places_api_key
GOOGLE_AI_API_KEY=your_gemini_api_key

# VOICEVOX
VOICEVOX_ENDPOINT=https://voicevox-proto-639959525777.asia-northeast2.run.app

# Session Management
SESSION_SECRET=your_session_secret

# Environment
NODE_ENV=production
PORT=3000
```

### **Development Workflow**
- **Git Strategy:** GitFlow with main/develop branches
- **Code Review:** Required for all PRs
- **CI/CD:** Automated testing and deployment
- **Monitoring:** Error tracking and performance monitoring

---

## **8. Future Considerations**

### **Mobile App Development (Phase 4)**
- **Framework:** React Native + Expo
- **Code Reuse:** 70-80% shared logic with web application
- **Native Features:** Camera integration, push notifications
- **Platform:** iOS and Android simultaneous release

### **Potential Enhancements**
- Multiple VRM character options
- Voice character selection
- Advanced gesture animation system
- Restaurant reservation integration
- Social features (user profiles, favorite restaurants)

---

## **9. Development Team Resources**

### **Quick Start Checklist**
- [ ] Clone repository and setup monorepo
- [ ] Access GCP project `aipartner-426616` for Google Maps APIs
- [ ] Test VOICEVOX endpoint: `https://voicevox-proto-639959525777.asia-northeast2.run.app`
- [ ] Setup Gemini API for AI review generation
- [ ] Configure environment variables
- [ ] Setup Vercel/Railway deployment pipelines

### **Key Dependencies**
```json
{
  "@pixiv/three-vrm": "^2.0.0",
  "@google/generative-ai": "^0.1.0",
  "@google/maps": "^1.0.0",
  "three": "^0.160.0",
  "react": "^18.0.0",
  "typescript": "^5.0.0",
  "express": "^4.18.0",
  "express-session": "^1.17.0",
  "multer": "^1.4.0",
  "winston": "^3.8.0"
}
```

### **Contact & Support**
- **GCP Project Access:** Request access to aipartner-426616
- **VOICEVOX Issues:** Test endpoint first, report if unavailable
- **Technical Questions:** [Your contact information]

---

**Document Version:** 1.1  
**Last Updated:** June 2025  
**Next Review:** After Phase 1 completion

**🚀 Ready to Start Development - All External APIs Available!**
**⚡ Simplified Stateless Architecture - Zero Database Complexity!**