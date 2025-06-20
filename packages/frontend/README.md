# Frontend Package

React + TypeScript + Vite application for VRM Food Reviewer.

## Setup Complete ✅

This package has been implemented with all core functionality:

### Implemented Features
- React 18 with TypeScript and Vite
- VRM character display and expression system
- Image upload interface with validation
- Location detection and restaurant integration
- Twitter sharing functionality
- Mobile-responsive design
- Audio playback for voice synthesis
- Emotion-synced VRM animations

### Key Components
- `VRMViewer` - 3D VRM character rendering with real model (みすず.vrm)
- `ImageUpload` - File upload with drag-and-drop support and validation
- `FoodReviewDisplay` - AI-generated review presentation with formatting
- `RestaurantInfo` - Location-based restaurant search and selection
- `SocialShare` - Twitter sharing integration with preview
- `AudioPlayer` - Voice synthesis playback with controls

### Custom Hooks
- `useAppState` - Central state management for the application
- `useLocation` - Browser geolocation handling

### VRM Character System
- **Real VRM Model**: Located at `public/models/misuzu.vrm`
- **Expression Support**: Joy, surprised, satisfied, neutral emotions
- **Animation Sync**: Synchronized with AI emotion markers
- **Fallback System**: Placeholder character for development/testing

### Environment Variables Required
```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3001

# VRM Configuration
VITE_DEFAULT_VRM_URL=/models/misuzu.vrm
```

### Browser Compatibility
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **WebGL Support**: Required for VRM 3D rendering
- **File API**: Required for image upload
- **Geolocation API**: Required for location features

### Development Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run typecheck # Type checking
npm run lint     # ESLint checking
```