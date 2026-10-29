
const express = require('express');

module.exports = function createBarangRouter(db) {
  const router = express.Router();

  // GET: mengambil semua kategori
  router.get('/kategori', async (req, res) => {
    try {
      const result = await db.query(`
        SELECT id_kategori, nama_kategori
        FROM kategori
        ORDER BY nama_kategori ASC
      `);

      res.json(result.rows);
    } catch (error) {
      console.error('GET kategori:', error.message);
      res.status(500).json({ message: 'Gagal mengambil data kategori.' });
    }
  });

  // GET: mengambil semua barang beserta nama kategorinya
  router.get('/barang', async (req, res) => {
    try {
      const result = await db.query(`
        SELECT
          b.id_barang,
          b.kode_barang,
          b.nama_barang,
          b.id_kategori,
          k.nama_kategori,
          b.stok,
          b.satuan,
          b.harga,
          b.created_at
        FROM barang b
        LEFT JOIN kategori k
          ON b.id_kategori = k.id_kategori
        ORDER BY b.id_barang DESC
      `);

      res.json(result.rows);
    } catch (error) {
      console.error('GET barang:', error.message);
      res.status(500).json({ message: 'Gagal mengambil data barang.' });
    }
  });

  // POST: menambahkan barang baru
  router.post('/barang', async (req, res) => {
    const {
      kode_barang,
      nama_barang,
      id_kategori,
      stok,
      satuan,
      harga,
    } = req.body;

    if (
      typeof kode_barang !== 'string' || !kode_barang.trim() ||
      typeof nama_barang !== 'string' || !nama_barang.trim() ||
      typeof satuan !== 'string' || !satuan.trim()
    ) {
      return res.status(400).json({
        message: 'Kode, nama, dan satuan barang wajib diisi.',
      });
    }

    const stokNum = Number(stok);
    const hargaNum = Number(harga);
    const kategoriNum = id_kategori == null || id_kategori === ''
      ? null
      : Number(id_kategori);

    if (!Number.isInteger(stokNum) || stokNum < 0) {
      return res.status(400).json({
        message: 'Stok harus berupa bilangan bulat minimal 0.',
      });
    }

    if (!Number.isFinite(hargaNum) || hargaNum < 0) {
      return res.status(400).json({
        message: 'Harga harus berupa angka minimal 0.',
      });
    }

    if (
      kategoriNum !== null &&
      (!Number.isInteger(kategoriNum) || kategoriNum <= 0)
    ) {
      return res.status(400).json({
        message: 'Kategori tidak valid.',
      });
    }

    try {
      const result = await db.query(
        `INSERT INTO barang
          (kode_barang, nama_barang, id_kategori, stok, satuan, harga)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          kode_barang.trim(),
          nama_barang.trim(),
          kategoriNum,
          stokNum,
          satuan.trim(),
          hargaNum,
        ]
      );

      res.status(201).json({
        message: 'Barang berhasil ditambahkan.',
        data: result.rows[0],
      });
    } catch (error) {
      console.error('POST barang:', error.message);

      if (error.code === '23505') {
        return res.status(409).json({
          message: 'Kode barang sudah digunakan.',
        });
      }

      if (error.code === '23503') {
        return res.status(400).json({
          message: 'Kategori yang dipilih tidak ditemukan.',
        });
      }

      res.status(500).json({ message: 'Gagal menambahkan barang.' });
    }
  });

  // PUT: mengubah barang berdasarkan ID
  router.put('/barang/:id', async (req, res) => {
    const id = Number(req.params.id);
    const {
      kode_barang,
      nama_barang,
      id_kategori,
      stok,
      satuan,
      harga,
    } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'ID barang tidak valid.' });
    }

    if (
      typeof kode_barang !== 'string' || !kode_barang.trim() ||
      typeof nama_barang !== 'string' || !nama_barang.trim() ||
      typeof satuan !== 'string' || !satuan.trim()
    ) {
      return res.status(400).json({
        message: 'Kode, nama, dan satuan barang wajib diisi.',
      });
    }

    const stokNum = Number(stok);
    const hargaNum = Number(harga);
    const kategoriNum = id_kategori == null || id_kategori === ''
      ? null
      : Number(id_kategori);

    if (!Number.isInteger(stokNum) || stokNum < 0) {
      return res.status(400).json({ message: 'Stok tidak valid.' });
    }

    if (!Number.isFinite(hargaNum) || hargaNum < 0) {
      return res.status(400).json({ message: 'Harga tidak valid.' });
    }

    if (
      kategoriNum !== null &&
      (!Number.isInteger(kategoriNum) || kategoriNum <= 0)
    ) {
      return res.status(400).json({ message: 'Kategori tidak valid.' });
    }

    try {
      const result = await db.query(
        `UPDATE barang
         SET kode_barang = $1,
             nama_barang = $2,
             id_kategori = $3,
             stok = $4,
             satuan = $5,
             harga = $6
         WHERE id_barang = $7
         RETURNING *`,
        [
          kode_barang.trim(),
          nama_barang.trim(),
          kategoriNum,
          stokNum,
          satuan.trim(),
          hargaNum,
          id,
        ]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Barang tidak ditemukan.' });
      }

      res.json({
        message: 'Barang berhasil diperbarui.',
        data: result.rows[0],
      });
    } catch (error) {
      console.error('PUT barang:', error.message);

      if (error.code === '23505') {
        return res.status(409).json({
          message: 'Kode barang sudah digunakan.',
        });
      }

      if (error.code === '23503') {
        return res.status(400).json({
          message: 'Kategori yang dipilih tidak ditemukan.',
        });
      }

      res.status(500).json({ message: 'Gagal memperbarui barang.' });
    }
  });

  // DELETE: menghapus barang berdasarkan ID
  router.delete('/barang/:id', async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'ID barang tidak valid.' });
    }

    try {
      const result = await db.query(
        'DELETE FROM barang WHERE id_barang = $1 RETURNING id_barang',
        [id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Barang tidak ditemukan.' });
      }

      res.json({ message: 'Barang berhasil dihapus.' });
    } catch (error) {
      console.error('DELETE barang:', error.message);
      res.status(500).json({ message: 'Gagal menghapus barang.' });
    }
  });

  return router;
};
