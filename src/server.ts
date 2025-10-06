import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { config } from './config/env';
import { pool } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { WebSocketManager } from './utils/websocket';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import projectRoutes from './routes/project.routes';
import submissionRoutes from './routes/submission.routes';
import commentRoutes from './routes/comment.routes';

const app = express();
const server = createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/comments', commentRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Test database endpoint
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    res.json({
      status: 'success',
      message: 'Database connected',
      current_time: result.rows[0].current_time,
      postgresql_version: result.rows[0].pg_version,
      tables: tablesResult.rows.map(row => row.table_name)
    });
  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: err.message
    });
  }
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize WebSocket
export const wsManager = new WebSocketManager(server);

// Test database connection and start server
pool.query('SELECT NOW()')
  .then(() => {
    console.log('\n' + '='.repeat(60));
    console.log('✅ Database connected successfully');
    console.log('='.repeat(60));
    
    server.listen(config.port, () => {
      console.log('\n🚀 Server running on http://localhost:' + config.port);
      console.log('\n📋 Available Endpoints:');
      console.log('─'.repeat(60));
      
      // General endpoints
      console.log('\n🔍 General:');
      console.log('  📊 Health check:     http://localhost:' + config.port + '/health');
      console.log('  🗄️  Test database:    http://localhost:' + config.port + '/test-db');
      
      // Authentication endpoints
      console.log('\n🔐 Authentication:');
      console.log('  POST   /api/auth/register        - Register new user');
      console.log('  POST   /api/auth/login           - Login user');
      
      // User endpoints
      console.log('\n👤 Users:');
      console.log('  GET    /api/users/:id            - Get user profile');
      console.log('  PUT    /api/users/:id            - Update user profile');
      console.log('  DELETE /api/users/:id            - Delete user');
      console.log('  GET    /api/users/:id/notifications - Get user notifications');
      console.log('  PUT    /api/notifications/:id/read  - Mark notification as read');
      console.log('  PUT    /api/notifications/read-all  - Mark all as read');
      
      // Project endpoints
      console.log('\n📁 Projects:');
      console.log('  POST   /api/projects             - Create project');
      console.log('  GET    /api/projects             - List all projects');
      console.log('  GET    /api/projects/:id         - Get project details');
      console.log('  GET    /api/projects/:id/members - Get project members');
      console.log('  POST   /api/projects/:id/members - Add member to project');
      console.log('  DELETE /api/projects/:id/members/:userId - Remove member');
      console.log('  GET    /api/projects/:id/submissions    - List submissions');
      console.log('  GET    /api/projects/:id/stats   - Get project statistics');
      
      // Submission endpoints
      console.log('\n📝 Submissions:');
      console.log('  POST   /api/submissions          - Create submission');
      console.log('  GET    /api/submissions/:id      - Get submission details');
      console.log('  PUT    /api/submissions/:id/status      - Update status');
      console.log('  DELETE /api/submissions/:id      - Delete submission');
      console.log('  POST   /api/submissions/:id/approve     - Approve submission');
      console.log('  POST   /api/submissions/:id/request-changes - Request changes');
      console.log('  GET    /api/submissions/:id/reviews     - Get review history');
      
      // Comment endpoints
      console.log('\n💬 Comments:');
      console.log('  POST   /api/comments/submissions/:id/comments - Add comment');
      console.log('  GET    /api/comments/submissions/:id/comments - List comments');
      console.log('  PUT    /api/comments/:id         - Update comment');
      console.log('  DELETE /api/comments/:id         - Delete comment');
      
      // WebSocket
      console.log('\n🔌 WebSocket:');
      console.log('  ws://localhost:' + config.port + '/ws?token=YOUR_JWT_TOKEN');
      
      console.log('\n' + '='.repeat(60));
      console.log('✨ Server is ready to accept requests!');
      console.log('='.repeat(60) + '\n');
    });
  })
  .catch((err) => {
    console.log('\n' + '='.repeat(60));
    console.error('❌ Database connection failed');
    console.log('='.repeat(60));
    console.error('\n🔴 Error:', err.message);
    console.error('\n💡 Troubleshooting:');
    console.error('  1. Check if PostgreSQL is running');
    console.error('  2. Verify DATABASE_URL in .env file');
    console.error('  3. Ensure database "' + process.env.DATABASE_URL?.split('/').pop() + '" exists');
    console.error('  4. Check username and password are correct');
    console.log('\n' + '='.repeat(60) + '\n');
    process.exit(1);
  });