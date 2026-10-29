
import { useEffect, useState } from 'react'
import {
  LayoutDashboard, Package, Tags, ArrowDownUp,
  Search, Plus, Bell, Settings, Menu, Boxes,
  AlertTriangle, TrendingUp, MoreHorizontal,
  Pencil, Trash2, X
} from 'lucide-react'

import './App.css'

const API_URL = 'http://localhost:3000'

function App() {
  const [activeMenu, setActiveMenu] = useState('Dashboard')
  const [barang, setBarang] = useState([])
  const [kategori, setKategori] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    kode_barang: '',
    nama_barang: '',
    id_kategori: '',
    stok: 0,
    satuan: 'pcs',
    harga: 0,
  })

  async function loadData() {
    setLoading(true)
    setError('')

    try {
      const [barangRes, kategoriRes] = await Promise.all([
        fetch(`${API_URL}/api/barang`),
        fetch(`${API_URL}/api/kategori`),
      ])

      if (!barangRes.ok || !kategoriRes.ok) {
        throw new Error('Gagal mengambil data dari server.')
      }

      setBarang(await barangRes.json())
      setKategori(await kategoriRes.json())
    } catch (err) {
      setError(err.message || 'Tidak dapat terhubung ke backend.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const totalStok = barang.reduce(
    (total, item) => total + Number(item.stok || 0), 0
  )

  const stokMenipis = barang.filter(
    item => Number(item.stok) <= 5
  ).length

  const totalNilai = barang.reduce(
    (total, item) =>
      total + Number(item.stok || 0) * Number(item.harga || 0), 0
  )

  const filteredBarang = barang.filter(item =>
    `${item.nama_barang} ${item.kode_barang} ${item.nama_kategori || ''}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  function openAddModal() {
    setEditingId(null)
    setForm({
      kode_barang: '',
      nama_barang: '',
      id_kategori: '',
      stok: 0,
      satuan: 'pcs',
      harga: 0,
    })
    setShowModal(true)
  }

  function openEditModal(item) {
    setEditingId(item.id_barang)
    setForm({
      kode_barang: item.kode_barang,
      nama_barang: item.nama_barang,
      id_kategori: item.id_kategori ?? '',
      stok: item.stok,
      satuan: item.satuan,
      harga: item.harga,
    })
    setShowModal(true)
  }

  async function saveBarang(e) {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const url = editingId
        ? `${API_URL}/api/barang/${editingId}`
        : `${API_URL}/api/barang`

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          id_kategori: form.id_kategori || null,
          stok: Number(form.stok),
          harga: Number(form.harga),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Gagal menyimpan barang.')
      }

      setShowModal(false)
      await loadData()
    } catch (err) {
      setError(err.message || 'Gagal menyimpan data.')
    } finally {
      setSaving(false)
    }
  }

  async function deleteBarang(item) {
    const yakin = window.confirm(
      `Yakin ingin menghapus ${item.nama_barang}?`
    )
    if (!yakin) return

    try {
      const response = await fetch(
        `${API_URL}/api/barang/${item.id_barang}`,
        { method: 'DELETE' }
      )

      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Gagal menghapus.')

      await loadData()
    } catch (err) {
      setError(err.message || 'Gagal menghapus barang.')
    }
  }

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard },
    { label: 'Data Barang', icon: Package },
    { label: 'Kategori', icon: Tags },
    { label: 'Riwayat Stok', icon: ArrowDownUp },
  ]

  const rupiah = value => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo"><Boxes size={23} /></div>
          <div>
            <h2>Stockwise</h2>
            <span>INVENTORY SYSTEM</span>
          </div>
        </div>

        <div className="nav-label">MENU UTAMA</div>
        <nav className="nav-menu">
          {menuItems.map(item => {
            const Icon = item.icon
            return (
              <button
                key={item.label}
                className={`nav-item ${activeMenu === item.label ? 'active' : ''}`}
                onClick={() => {
                  setActiveMenu(item.label)
                  if (item.label === 'Kategori') {
                    window.location.hash = 'kategori'
                  } else {
                    window.location.hash = item.label === 'Data Barang' ? 'barang' : ''
                  }
                }}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="sidebar-bottom">
          <button className="nav-item">
            <Settings size={19} />
            <span>Pengaturan</span>
          </button>
          <div className="profile">
            <div className="avatar">AD</div>
            <div className="profile-info">
              <strong>Administrator</strong>
              <span>Admin Inventaris</span>
            </div>
            <MoreHorizontal size={19} />
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <span>/</span>
            <strong>{activeMenu}</strong>
          </div>
          <div className="topbar-right">
            <span className="system-status">
              <span className="status-dot" /> Sistem Lokal
            </span>
            <button className="icon-button" aria-label="Notifikasi">
              <Bell size={19} />
              <span className="notification-dot" />
            </button>
            <div className="avatar top-avatar">AD</div>
          </div>
        </header>

        <div className="page-content">
          <section className="page-heading">
            <div>
              <div className="eyebrow">OVERVIEW</div>
              <h1>Dashboard Inventaris</h1>
              <p>Pantau dan kelola persediaan barang lu dalam satu tempat.</p>
            </div>
            <button className="primary-button" onClick={openAddModal}>
              <Plus size={18} /> Tambah Barang
            </button>
          </section>

          {error && (
            <div className="alert-error">
              <AlertTriangle size={18} />
              <span>{error}</span>
              <button onClick={loadData}>Coba lagi</button>
            </div>
          )}

          <section className="stats-grid">
            <StatCard
              label="Jenis Barang"
              value={barang.length.toLocaleString('id-ID')}
              note="Total produk terdaftar"
              icon={Package}
              tone="blue"
            />
            <StatCard
              label="Total Stok"
              value={totalStok.toLocaleString('id-ID')}
              note="Unit barang tersedia"
              icon={Boxes}
              tone="violet"
            />
            <StatCard
              label="Stok Menipis"
              value={stokMenipis.toLocaleString('id-ID')}
              note="Barang dengan stok ≤ 5"
              icon={AlertTriangle}
              tone="orange"
            />
            <StatCard
              label="Nilai Persediaan"
              value={rupiah(totalNilai)}
              note="Estimasi nilai stok"
              icon={TrendingUp}
              tone="green"
            />
          </section>

          <section className="inventory-panel" id="barang">
            <div className="panel-heading">
              <div>
                <h2>Daftar Barang</h2>
                <p>Kelola seluruh barang yang tercatat dalam sistem.</p>
              </div>
              <button className="secondary-button" onClick={loadData}>
                <ArrowDownUp size={16} /> Refresh
              </button>
            </div>

            <div className="table-toolbar">
              <div className="search-box">
                <Search size={18} />
                <input
                  placeholder="Cari nama, kode, atau kategori barang..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {search && (
                  <button aria-label="Hapus pencarian" onClick={() => setSearch('')}>
                    <X size={15} />
                  </button>
                )}
              </div>
              <span className="result-count">
                {filteredBarang.length} barang
              </span>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>BARANG</th>
                    <th>KATEGORI</th>
                    <th>STOK</th>
                    <th>HARGA SATUAN</th>
                    <th>NILAI STOK</th>
                    <th>STATUS</th>
                    <th>AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="7" className="empty-state">Memuat data barang...</td></tr>
                  ) : filteredBarang.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="empty-state">
                        <Package size={32} />
                        <strong>{search ? 'Barang tidak ditemukan' : 'Belum ada data barang'}</strong>
                        <span>{search ? 'Coba kata kunci lain.' : 'Klik Tambah Barang untuk mulai mengisi inventaris.'}</span>
                      </td>
                    </tr>
                  ) : filteredBarang.map(item => (
                    <tr key={item.id_barang}>
                      <td>
                        <div className="product-cell">
                          <div className="product-icon"><Package size={19} /></div>
                          <div>
                            <strong>{item.nama_barang}</strong>
                            <span>{item.kode_barang}</span>
                          </div>
                        </div>
                      </td>
                      <td><span className="category-chip">{item.nama_kategori || 'Tanpa kategori'}</span></td>
                      <td><strong>{Number(item.stok).toLocaleString('id-ID')}</strong> <span className="unit">{item.satuan}</span></td>
                      <td>{rupiah(item.harga)}</td>
                      <td className="value-cell">{rupiah(Number(item.stok) * Number(item.harga))}</td>
                      <td>
                        <span className={`stock-status ${Number(item.stok) <= 5 ? 'low' : 'available'}`}>
                          <span />{Number(item.stok) <= 5 ? 'Menipis' : 'Tersedia'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="action-button edit" title="Edit" onClick={() => openEditModal(item)}><Pencil size={16} /></button>
                          <button className="action-button delete" title="Hapus" onClick={() => deleteBarang(item)}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="table-footer">
              <span>Menampilkan {filteredBarang.length} dari {barang.length} barang</span>
              <span>Data tersimpan di PostgreSQL</span>
            </div>
          </section>

          <section className="bottom-grid">
            <div className="bottom-panel" id="kategori">
              <div className="panel-heading">
                <div><h2>Kategori Barang</h2><p>Pengelompokan inventaris</p></div>
                <Tags size={20} className="muted-icon" />
              </div>
              {kategori.length === 0 ? (
                <p className="muted-text">Belum ada kategori.</p>
              ) : kategori.map(item => (
                <div className="category-row" key={item.id_kategori}>
                  <div className="category-icon"><Tags size={17} /></div>
                  <span>{item.nama_kategori}</span>
                  <span className="category-total">
                    {barang.filter(b => Number(b.id_kategori) === Number(item.id_kategori)).length} barang
                  </span>
                </div>
              ))}
            </div>

            <div className="bottom-panel">
              <div className="panel-heading">
                <div><h2>Ringkasan Sistem</h2><p>Status aplikasi lokal</p></div>
                <TrendingUp size={20} className="muted-icon" />
              </div>
              <div className="system-row">
                <span>Frontend React</span><span className="system-ok">Berjalan</span>
              </div>
              <div className="system-row">
                <span>Backend Express</span><span className="system-ok">Terhubung</span>
              </div>
              <div className="system-row">
                <span>Database PostgreSQL</span><span className="system-ok">Lokal</span>
              </div>
            </div>
          </section>
        </div>
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <form className="modal-card" onSubmit={saveBarang} onClick={e => e.stopPropagation()}>
            <div className="modal-heading">
              <div>
                <h2>{editingId ? 'Edit Barang' : 'Tambah Barang'}</h2>
                <p>Isi informasi barang inventaris lu.</p>
              </div>
              <button type="button" className="icon-button" onClick={() => setShowModal(false)}><X size={19} /></button>
            </div>

            <div className="form-grid">
              <label>Kode Barang
                <input required maxLength="30" value={form.kode_barang} onChange={e => setForm({...form, kode_barang: e.target.value})} placeholder="BRG-001" />
              </label>
              <label>Nama Barang
                <input required maxLength="150" value={form.nama_barang} onChange={e => setForm({...form, nama_barang: e.target.value})} placeholder="Nama barang" />
              </label>
              <label>Kategori
                <select value={form.id_kategori} onChange={e => setForm({...form, id_kategori: e.target.value})}>
                  <option value="">Tanpa kategori</option>
                  {kategori.map(k => <option key={k.id_kategori} value={k.id_kategori}>{k.nama_kategori}</option>)}
                </select>
              </label>
              <label>Satuan
                <input required maxLength="30" value={form.satuan} onChange={e => setForm({...form, satuan: e.target.value})} placeholder="pcs" />
              </label>
              <label>Stok
                <input required type="number" min="0" step="1" value={form.stok} onChange={e => setForm({...form, stok: e.target.value})} />
              </label>
              <label>Harga Satuan (Rp)
                <input required type="number" min="0" step="0.01" value={form.harga} onChange={e => setForm({...form, harga: e.target.value})} />
              </label>
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={() => setShowModal(false)}>Batal</button>
              <button type="submit" className="primary-button" disabled={saving}>
                {saving ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Simpan Barang'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, note, icon: Icon, tone }) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${tone}`}><Icon size={21} /></div>
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      <span className="stat-note">{note}</span>
    </article>
  )
}

export default App
