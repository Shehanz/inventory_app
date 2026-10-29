
require('dotenv').config();
const { Pool } = require('pg');

const db = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function seedDatabase() {
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    // 1. Seeding kategori
    await client.query(`
      INSERT INTO kategori (nama_kategori)
      VALUES
        ('Elektronik'),
        ('Alat Tulis'),
        ('Perlengkapan'),
        ('Aksesoris Komputer'),
        ('Peralatan Kantor')
      ON CONFLICT (nama_kategori) DO NOTHING;
    `);

    // 2. Ambil ID kategori berdasarkan nama
    const kategoriResult = await client.query(`
      SELECT id_kategori, nama_kategori
      FROM kategori;
    `);

    const kategori = Object.fromEntries(
      kategoriResult.rows.map((item) => [
        item.nama_kategori,
        item.id_kategori,
      ])
    );

    // 3. Data barang dummy
    const barang = [
      ['BRG-001', 'Mouse Wireless Logitech', 'Aksesoris Komputer', 25, 'pcs', 150000],
      ['BRG-002', 'Keyboard Mechanical', 'Aksesoris Komputer', 12, 'pcs', 450000],
      ['BRG-003', 'Monitor LED 24 Inch', 'Elektronik', 8, 'unit', 1850000],
      ['BRG-004', 'Laptop Stand Aluminium', 'Aksesoris Komputer', 20, 'pcs', 125000],
      ['BRG-005', 'Flashdisk 64GB', 'Elektronik', 35, 'pcs', 85000],
      ['BRG-006', 'Kabel HDMI 2 Meter', 'Elektronik', 18, 'pcs', 45000],
      ['BRG-007', 'Buku Tulis A5', 'Alat Tulis', 100, 'pcs', 8000],
      ['BRG-008', 'Pulpen Hitam', 'Alat Tulis', 150, 'pcs', 3500],
      ['BRG-009', 'Spidol Permanen', 'Alat Tulis', 60, 'pcs', 7000],
      ['BRG-010', 'Kertas A4 80 GSM', 'Peralatan Kantor', 40, 'rim', 55000],
      ['BRG-011', 'Stapler Besar', 'Peralatan Kantor', 15, 'pcs', 35000],
      ['BRG-012', 'Gunting Serbaguna', 'Perlengkapan', 22, 'pcs', 18000],
      ['BRG-013', 'Lakban Bening', 'Perlengkapan', 45, 'roll', 12000],
      ['BRG-014', 'Headset USB', 'Elektronik', 14, 'pcs', 225000],
      ['BRG-015', 'Webcam Full HD', 'Elektronik', 9, 'pcs', 375000],
    ];

    // 4. Masukkan barang tanpa menduplikasi kode
    for (const item of barang) {
      const [
        kode_barang,
        nama_barang,
        nama_kategori,
        stok,
        satuan,
        harga,
      ] = item;

      await client.query(
        `INSERT INTO barang
          (kode_barang, nama_barang, id_kategori, stok, satuan, harga)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (kode_barang) DO NOTHING`,
        [
          kode_barang,
          nama_barang,
          kategori[nama_kategori],
          stok,
          satuan,
          harga,
        ]
      );
    }

    await client.query('COMMIT');

    console.log('Seeding berhasil!');
    console.log('Kategori dan 15 data barang sudah diproses.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seeding gagal:', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await db.end();
  }
}

seedDatabase();
