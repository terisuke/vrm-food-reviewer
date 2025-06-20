import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { uploadRouter } from './routes/upload';
import { reviewRouter } from './routes/review';
import { voiceRouter } from './routes/voice';
import { placesRouter } from './routes/places';
import { healthRouter } from './routes/health';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

// Session middleware (memory-based, stateless)
app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 // 1 hour
  }
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API routes
app.use('/api/upload', uploadRouter);
app.use('/api/review', reviewRouter);
app.use('/api/voice', voiceRouter);
app.use('/api/places', placesRouter);
app.use('/api/health', healthRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'VRM Food Reviewer API',
    version: '1.0.0',
    endpoints: [
      'POST /api/upload',
      'POST /api/review', 
      'POST /api/voice',
      'GET /api/places',
      'GET /api/health'
    ]
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = config.port;

app.listen(PORT, () => {
  logger.info(`🚀 VRM Food Reviewer API server running on port ${PORT}`);
  logger.info(`📖 API documentation available at http://localhost:${PORT}`);
});