
require('dotenv').config();

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const createBarangRouter = require('./routes/barang');
const createAuthRouter = require('./routes/auth');
const { requireAuth } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());

const db = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Endpoint autentikasi: login, cek sesi, dan logout
app.use('/api/auth', createAuthRouter(db));

// Endpoint inventory wajib memiliki sesi login
app.use('/api', requireAuth, createBarangRouter(db));

// Endpoint utama
app.get('/', (req, res) => {
  res.json({ message: 'Inventory API berjalan!' });
});

// Tes koneksi database
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT current_database() AS database, NOW() AS waktu'
    );

    res.json({
      message: 'Koneksi PostgreSQL berhasil!',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Database error:', error.message);

    res.status(500).json({
      message: 'Koneksi PostgreSQL gagal.',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});

db.on('error', (error) => {
  console.error('PostgreSQL pool error:', error.message);
});
