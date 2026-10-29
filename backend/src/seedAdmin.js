
require('dotenv').config();

const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const db = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function seedAdmin() {
  try {
    const nama = process.env.ADMIN_NAME || 'Administrator';
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password || password.length < 7) {
      throw new Error(
        'ADMIN_EMAIL wajib diisi dan ADMIN_PASSWORD minimal 12 karakter.'
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await db.query(
      `INSERT INTO app_users (nama, email, password_hash, role)
       VALUES ($1, $2, $3, 'admin')
       ON CONFLICT (email) DO NOTHING
       RETURNING id_user, nama, email, role`,
      [nama, email, passwordHash]
    );

    if (result.rowCount === 0) {
      console.log(
        'Email sudah terdaftar. Akun yang ada tidak diubah.'
      );
    } else {
      console.log('Akun admin berhasil dibuat:', result.rows[0]);
    }
  } catch (error) {
    console.error('Seeding admin gagal:', error.message);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
}

seedAdmin();
