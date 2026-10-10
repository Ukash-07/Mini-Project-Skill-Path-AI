const app = require('./app');
const pool = require('./config/database');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Test database connection
    const connection = await pool.getConnection();
    console.log('Database connected successfully to MySQL host:', process.env.DB_HOST || 'localhost');
    connection.release();

    app.listen(PORT, () => {
      console.log(`========================================`);
      console.log(`Server listening on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`========================================`);
    });
  } catch (err) {
    console.error('Failed to start server due to database connection error:', err);
    process.exit(1);
  }
}

startServer();
