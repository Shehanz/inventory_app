
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { requireAuth } = require('../middleware/auth');

module.exports = function createAuthRouter(db) {
  const router = express.Router();

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 1000 * 60 * 60 * 8, // 8 jam
  };

  // LOGIN
  router.post('/login', async (req, res) => {
    const email =
      typeof req.body.email === 'string'
        ? req.body.email.trim().toLowerCase()
        : '';

    const password =
      typeof req.body.password === 'string'
        ? req.body.password
        : '';

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email dan password wajib diisi.',
      });
    }

    try {
      const result = await db.query(
        `SELECT id_user, nama, email, password_hash, role, is_active
         FROM app_users
         WHERE LOWER(email) = $1`,
        [email]
      );

      const user = result.rows[0];

      // Pesan dibuat umum agar tidak membocorkan keberadaan akun.
      if (!user || !user.is_active) {
        return res.status(401).json({
          message: 'Email atau password salah.',
        });
      }

      const passwordValid = await bcrypt.compare(
        password,
        user.password_hash
      );

      if (!passwordValid) {
        return res.status(401).json({
          message: 'Email atau password salah.',
        });
      }

      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET belum dikonfigurasi.');
        return res.status(500).json({
          message: 'Konfigurasi autentikasi belum tersedia.',
        });
      }

      const token = jwt.sign(
        {
          id_user: user.id_user,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );

      res.cookie('token', token, cookieOptions);

      return res.json({
        message: 'Login berhasil.',
        user: {
          id_user: user.id_user,
          nama: user.nama,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('POST login:', error.message);
      return res.status(500).json({
        message: 'Terjadi kesalahan saat login.',
      });
    }
  });

  // CEK PENGGUNA YANG SEDANG LOGIN
  router.get('/me', requireAuth, async (req, res) => {
    try {
      const result = await db.query(
        `SELECT id_user, nama, email, role
         FROM app_users
         WHERE id_user = $1 AND is_active = TRUE`,
        [req.user.id_user]
      );

      if (result.rowCount === 0) {
        res.clearCookie('token', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
        });

        return res.status(401).json({
          message: 'Akun tidak aktif atau tidak ditemukan.',
        });
      }

      return res.json({ user: result.rows[0] });
    } catch (error) {
      console.error('GET auth/me:', error.message);
      return res.status(500).json({
        message: 'Gagal memeriksa sesi login.',
      });
    }
  });

  // LOGOUT
  router.post('/logout', (req, res) => {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return res.json({ message: 'Logout berhasil.' });
  });

  return router;
};
