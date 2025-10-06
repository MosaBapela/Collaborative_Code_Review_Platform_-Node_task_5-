import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import { pool } from './config/database';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Server is running'
  });
});

// Test database endpoint
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time');
    res.json({
      status: 'success',
      message: 'Database connected',
      current_time: result.rows[0].current_time
    });
  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: err.message
    });
  }
});

// Start server after testing database connection
pool.query('SELECT NOW()')
  .then(() => {
    console.log('✅ Database connected successfully');
    
    app.listen(config.port, () => {
      console.log(`🚀 Server running on http://localhost:${config.port}`);
      console.log(`📊 Health check: http://localhost:${config.port}/health`);
      console.log(`🗄️  Test database: http://localhost:${config.port}/test-db`);
    });
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
    console.error('Please check your DATABASE_URL in .env file');
    process.exit(1);
  });