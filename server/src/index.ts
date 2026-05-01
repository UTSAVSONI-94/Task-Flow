import dotenv from 'dotenv';
import path from 'path';
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
}
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/project.routes';
import taskRoutes from './routes/task.routes';
import dashboardRoutes from './routes/dashboard.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:id/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// Global error handler
app.use(errorHandler);

async function start() {
  console.log('--- STARTUP DIAGNOSTICS ---');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('MONGODB_URI SET?', process.env.MONGODB_URI ? 'YES' : 'NO');
  console.log('---------------------------');
  let uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow';

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error: any) {
    console.log('⚠️  Failed to connect to MongoDB Atlas. Error:', error.message);
    
    // Only fallback to memory server in local development
    if (process.env.NODE_ENV !== 'production' && !process.env.MONGODB_URI) {
      console.log('⚠️  Starting in-memory server for local development...');
      const mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log('✅ Connected to in-memory MongoDB');
    } else {
      console.error('❌ CRITICAL: Cannot connect to MongoDB in production.');
      console.error('👉 Ensure your MongoDB Atlas Network Access is set to 0.0.0.0/0 (Allow Access from Anywhere)');
      process.exit(1);
    }
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

export default app;
