# Shared Package

**Status: ✅ COMPLETE**

Common TypeScript types and interfaces for VRM Food Reviewer, providing type safety across frontend and backend packages.

## Features Implemented

### Core Type Definitions
- ✅ **API Types**: Request/response interfaces for all API endpoints
- ✅ **VRM Types**: Character control and expression interfaces
- ✅ **Restaurant Types**: Location and Google Places API types
- ✅ **Voice Types**: VOICEVOX and audio synthesis types
- ✅ **Emotion Types**: Character emotion and animation types

### Package Structure
```
├── src/
│   ├── api.ts         # API request/response types
│   ├── vrm.ts         # VRM-related interfaces
│   ├── restaurant.ts  # Location and restaurant types
│   ├── voice.ts       # Voice synthesis types
│   ├── emotion.ts     # Emotion and animation types
│   └── index.ts       # Main exports
├── dist/              # Compiled JavaScript (generated)
├── package.json
└── tsconfig.json
```

## Key Types Available

### API Types
```typescript
interface FoodReviewRequest
interface FoodReviewResponse
interface ImageUploadRequest
interface ImageUploadResponse
interface HealthCheckResponse
interface ApiError
```

### VRM Character Types
```typescript
interface VRMController
interface VRMLoadOptions
interface VRMExpressionPreset
interface VRMCharacter
```

### Restaurant & Location Types
```typescript
interface RestaurantInfo
interface LocationRequest
interface PlacesSearchRequest
interface PlacesSearchResponse
```

### Voice & Emotion Types
```typescript
interface VoicevoxRequest
interface VoicevoxResponse
interface EmotionMarker
interface EmotionSequence
interface AudioSynthesisRequest
```

## Development Commands

```bash
# Build the package
npm run build

# Watch mode for development
npm run dev

# Type checking
npm run typecheck

# Clean build artifacts
npm run clean
```

## Usage in Other Packages

```typescript
// Frontend/Backend usage
import { 
  FoodReviewRequest, 
  FoodReviewResponse,
  RestaurantInfo,
  EmotionMarker
} from '@vrm-food-reviewer/shared';
```

## Build Output

The package builds to CommonJS format in the `dist/` directory with TypeScript declaration files, making it compatible with both frontend and backend usage.