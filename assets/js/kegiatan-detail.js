/* =====================================================================
   Detail Kegiatan & Peserta (admin-kegiatan-detail.html?id=N)
   - memuat data dummy berdasarkan ?id=, menangani id tidak valid
   - pencarian peserta (nama/email), hapus peserta (modal hapus bersama)
   - "Tambah Peserta" nonaktif untuk kegiatan Selesai/Batal
   ===================================================================== */
(function () {
  'use strict';

  const HARI  = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const STATUS = {
    direncanakan: { label: 'Direncanakan', kelas: 'bg-info-subtle text-info-emphasis' },
    berlangsung:  { label: 'Berlangsung',  kelas: 'bg-primary-subtle text-primary-emphasis' },
    selesai:      { label: 'Selesai',      kelas: 'bg-success-subtle text-success-emphasis' },
    batal:        { label: 'Batal',        kelas: 'bg-danger-subtle text-danger-emphasis' },
  };
  const KATEGORI = { rapat: 'Rapat', pelatihan: 'Pelatihan', sosial: 'Sosial', olahraga: 'Olahraga', lainnya: 'Lainnya' };
  const PER_HALAMAN = 6;

  // Data dummy (id sama dengan daftar kegiatan & form)
  const KEGIATAN = {
    1: { nama: 'Rapat Koordinasi Bulanan',   kategori: 'rapat',     tanggal: '2026-10-18', mulai: '19.00', selesai: '21.00', lokasi: 'Sekretariat',          pic: 'Budi Santoso', status: 'berlangsung',  jumlah: 24, deskripsi: 'Pembahasan program kerja bulan Oktober, evaluasi kegiatan bulan lalu, dan persiapan kegiatan akhir tahun.' },
    2: { nama: 'Pelatihan Dasar Organisasi', kategori: 'pelatihan', tanggal: '2026-10-21', mulai: '09.00', selesai: '15.00', lokasi: 'Aula Lt. 2',           pic: 'Sari Dewi',    status: 'direncanakan', jumlah: 30, deskripsi: 'Pelatihan dasar berorganisasi untuk anggota baru: komunikasi, kerja tim, dan manajemen waktu.' },
    3: { nama: 'Bakti Sosial Panti Asuhan',  kategori: 'sosial',    tanggal: '2026-10-24', mulai: '08.00', selesai: '12.00', lokasi: 'Panti Asuhan Harapan', pic: 'Rudi Hartono', status: 'direncanakan', jumlah: 18, deskripsi: 'Kunjungan dan penyerahan bantuan kepada anak-anak Panti Asuhan Harapan.' },
    4: { nama: 'Kerja Bakti Lingkungan',     kategori: 'sosial',    tanggal: '2026-10-27', mulai: '07.00', selesai: '10.00', lokasi: 'Lingkungan RW 05',     pic: 'Dewi Lestari', status: 'batal',        jumlah: 0,  deskripsi: 'Kerja bakti membersihkan lingkungan sekitar kampus. Dibatalkan karena cuaca.' },
    5: { nama: 'Evaluasi Triwulan III',      kategori: 'rapat',     tanggal: '2026-10-31', mulai: '19.00', selesai: '21.00', lokasi: 'Sekretariat',          pic: 'Budi Santoso', status: 'direncanakan', jumlah: 15, deskripsi: 'Evaluasi capaian program kerja triwulan III dan penyusunan rencana triwulan IV.' },
    6: { nama: 'Seminar Kepemimpinan',       kategori: 'pelatihan', tanggal: '2026-10-10', mulai: '13.00', selesai: '16.00', lokasi: 'Aula Lt. 2',           pic: 'Sari Dewi',    status: 'selesai',      jumlah: 42, deskripsi: 'Seminar kepemimpinan mahasiswa bersama pembicara tamu.' },
    7: { nama: 'Turnamen Futsal Antaranggota', kategori: 'olahraga', tanggal: '2026-10-04', mulai: '15.00', selesai: '18.00', lokasi: 'Lapangan Futsal',    pic: 'Rudi Hartono', status: 'selesai',      jumlah: 36, deskripsi: 'Turnamen futsal persahabatan antaranggota organisasi.' },
    8: { nama: 'Rapat Koordinasi September', kategori: 'rapat',     tanggal: '2026-09-18', mulai: '19.00', selesai: '21.00', lokasi: 'Sekretariat',          pic: 'Budi Santoso', status: 'selesai',      jumlah: 22, deskripsi: 'Koordinasi program kerja bulan September.' },
  };

  const PESERTA = [
    { nama: 'Budi Santoso', peran: 'Pengurus', email: 'budi@organisasi.id' },
    { nama: 'Sari Dewi',    peran: 'Pengurus', email: 'sari@organisasi.id' },
    { nama: 'Rudi Hartono', peran: 'Pengurus', email: 'rudi@organisasi.id' },
    { nama: 'Dewi Lestari', peran: 'Anggota',  email: 'dewi@organisasi.id' },
    { nama: 'Ahmad Fauzi',  peran: 'Anggota',  email: 'ahmad@organisasi.id' },
    { nama: 'Maya Putri',   peran: 'Anggota',  email: 'maya@organisasi.id' },
  ];

  // Seluruh anggota organisasi (kandidat peserta)
  const ANGGOTA = PESERTA.concat([
    { nama: 'Hendra Wijaya', peran: 'Anggota',  email: 'hendra@organisasi.id' },
    { nama: 'Rina Kartika',  peran: 'Anggota',  email: 'rina@organisasi.id' },
    { nama: 'Tono Prasetyo', peran: 'Anggota',  email: 'tono@organisasi.id' },
    { nama: 'Lina Marlina',  peran: 'Pengurus', email: 'lina@organisasi.id' },
  ]);

  const $ = (id) => document.getElementById(id);
  const param = new URLSearchParams(window.location.search).get('id');
  const kegiatan = /^\d+$/.test(param || '') && Object.prototype.hasOwnProperty.call(KEGIATAN, param) ? KEGIATAN[param] : null;

  if (!kegiatan) {
    $('kontenDetail').hidden = true;
    $('tidakDitemukan').hidden = false;
    $('crumbAktif').textContent = 'Tidak ditemukan';
    document.title = 'Kegiatan tidak ditemukan | Aplikasi Agenda Kegiatan Organisasi Mahasiswa';
    return;
  }

  /* ---------- Isi informasi ---------- */
  const [th, bl, hr] = kegiatan.tanggal.split('-').map(Number);
  const hari = HARI[new Date(Date.UTC(th, bl - 1, hr)).getUTCDay()];
  const st = STATUS[kegiatan.status];

  document.title = `${kegiatan.nama} | Aplikasi Agenda Kegiatan Organisasi Mahasiswa`;
  $('crumbAktif').textContent = kegiatan.nama;
  $('judulKegiatan').textContent = kegiatan.nama;
  $('infoKategori').textContent = KATEGORI[kegiatan.kategori];
  $('infoTanggal').textContent = `${hari}, ${hr} ${BULAN[bl - 1]} ${th}`;
  $('infoJam').textContent = `${kegiatan.mulai} – ${kegiatan.selesai} WIB`;
  $('infoLokasi').textContent = kegiatan.lokasi;
  $('infoPic').textContent = kegiatan.pic;
  $('infoDeskripsi').textContent = kegiatan.deskripsi;
  $('statTanggal').textContent = `${hr} ${BULAN[bl - 1].slice(0, 3)}`;
  $('statJam').textContent = `${hari}, ${kegiatan.mulai} WIB`;
  ['badgeStatus', 'infoStatus'].forEach((id) => {
    const el = $(id);
    el.className = `badge rounded-pill status-badge ${st.kelas}`;
    el.textContent = st.label;
  });
  $('tombolUbah').href = `admin-kegiatan-form.html?id=${param}`;
  $('tombolHapus').dataset.nama = kegiatan.nama;

  /* ---------- Tambah Peserta: hanya untuk kegiatan yang belum selesai/batal ---------- */
  const tombolTambah = $('tombolTambahPeserta');
  const wrapTambah = $('wrapTambah');
  const bisaTambah = kegiatan.status === 'direncanakan' || kegiatan.status === 'berlangsung';
  if (bisaTambah) {
    tombolTambah.setAttribute('data-bs-toggle', 'modal');
    tombolTambah.setAttribute('data-bs-target', '#modalTambahPeserta');
  } else {
    tombolTambah.disabled = true;
    wrapTambah.tabIndex = 0;
    wrapTambah.setAttribute('data-bs-toggle', 'tooltip');
    wrapTambah.setAttribute('data-bs-title', `Peserta tidak dapat ditambah pada kegiatan yang ${st.label.toLowerCase() === 'batal' ? 'dibatalkan' : 'sudah selesai'}.`);
    wrapTambah.setAttribute('aria-label', `Tambah Peserta (nonaktif: kegiatan ${st.label.toLowerCase()})`);
    if (typeof bootstrap !== 'undefined') new bootstrap.Tooltip(wrapTambah);
  }

  /* ---------- Daftar peserta ---------- */
  let total = kegiatan.jumlah;
  let daftar = PESERTA.slice(0, Math.min(PESERTA.length, total));
  let kata = '';

  const tbody = $('tabelPeserta');
  const info = $('infoPeserta');
  const pag = $('paginasiPeserta');

  function buatSel(teks, kelas) {
    const td = document.createElement('td');
    if (kelas) td.className = kelas;
    td.textContent = teks;
    return td;
  }

  function gambar() {
    const q = kata.trim().toLowerCase();
    const cocok = daftar.filter((p) => !q || p.nama.toLowerCase().includes(q) || p.email.toLowerCase().includes(q));
    const tampil = q ? cocok : cocok.slice(0, PER_HALAMAN);       // halaman 1 saja (pagination hanya tampilan)

    tbody.replaceChildren();
    tampil.forEach((p, i) => {
      const tr = document.createElement('tr');
      tr.dataset.baris = '';
      tr.dataset.email = p.email;
      tr.appendChild(buatSel(String(i + 1), 'td-no'));
      tr.appendChild(buatSel(p.nama, 'td-nama'));
      tr.appendChild(buatSel(p.peran));
      tr.appendChild(buatSel(p.email));
      const aksi = document.createElement('td');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-icon';
      btn.setAttribute('data-hapus', '');
      btn.dataset.jenis = 'peserta';
      btn.dataset.nama = p.nama;
      btn.setAttribute('aria-label', `Hapus peserta ${p.nama}`);
      btn.innerHTML = '<i class="fa-regular fa-trash-can" aria-hidden="true"></i>';
      aksi.appendChild(btn);
      tr.appendChild(aksi);
      tbody.appendChild(tr);
    });
    if (!tampil.length) {
      const tr = document.createElement('tr');
      tr.className = 'tabel-kosong';
      const td = document.createElement('td');
      td.colSpan = 5;
      td.textContent = q ? 'Tidak ada peserta yang cocok' : 'Belum ada peserta';
      tr.appendChild(td);
      tbody.appendChild(tr);
    }

    gambarModal();
    $('jumlahPeserta').textContent = total;
    $('statPeserta').textContent = total;
    if (q) info.textContent = `${tampil.length} peserta cocok dari ${total} peserta`;
    else if (!tampil.length) info.textContent = 'Menampilkan 0 peserta';
    else info.textContent = `Menampilkan 1–${tampil.length} dari ${total} peserta`;

    // Pagination (simulasi): jumlah halaman mengikuti total peserta
    const halaman = Math.ceil(total / PER_HALAMAN);
    pag.replaceChildren();
    $('navPeserta').hidden = q !== '' || halaman <= 1;
    if (halaman > 1) {
      const buat = (isi, { aktif = false, mati = false, label = '' } = {}) => {
        const li = document.createElement('li');
        li.className = `page-item${aktif ? ' active' : ''}${mati ? ' disabled' : ''}`;
        if (aktif) li.setAttribute('aria-current', 'page');
        const a = document.createElement('a');
        a.className = 'page-link';
        a.href = '#';
        a.innerHTML = isi;
        if (label) a.setAttribute('aria-label', label);
        if (mati) { a.tabIndex = -1; a.setAttribute('aria-disabled', 'true'); }
        li.appendChild(a);
        pag.appendChild(li);
      };
      buat('&lsaquo;', { mati: true, label: 'Halaman sebelumnya' });
      for (let n = 1; n <= halaman; n++) buat(String(n), { aktif: n === 1 });
      buat('&rsaquo;', { label: 'Halaman berikutnya' });
    }
  }

  /* ---------- Modal Tambah Peserta ---------- */
  const modalEl = $('modalTambahPeserta');
  const wadah = $('daftarAnggota');
  const dipilih = new Set();
  let kataAnggota = '';

  function perbaruiFooter() {
    $('jumlahDipilih').textContent = `${dipilih.size} anggota dipilih`;
    const btn = $('btnTambahkan');
    btn.textContent = `Tambahkan (${dipilih.size})`;
    btn.disabled = dipilih.size === 0;
  }

  function gambarModal() {
    const terdaftar = new Set(daftar.map((p) => p.email));
    dipilih.forEach((em) => { if (terdaftar.has(em)) dipilih.delete(em); });
    const q = kataAnggota.trim().toLowerCase();
    wadah.querySelectorAll('.anggota-row, .anggota-kosong').forEach((n) => n.remove());
    const cocok = ANGGOTA.filter((a) => !q || a.nama.toLowerCase().includes(q) || a.email.toLowerCase().includes(q));
    cocok.forEach((a) => {
      const sudah = terdaftar.has(a.email);
      const id = `pilih-${a.email.split('@')[0]}`;
      const lbl = document.createElement('label');
      lbl.className = `anggota-row${sudah ? ' sudah' : ''}`;
      lbl.htmlFor = id;
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.className = 'form-check-input';
      cb.id = id;
      cb.value = a.email;
      cb.disabled = sudah;
      cb.checked = dipilih.has(a.email);
      const nama = document.createElement('span');
      nama.className = 'anggota-nama';
      nama.textContent = a.nama;
      const peran = document.createElement('span');
      peran.className = 'anggota-peran';
      peran.textContent = a.peran;
      lbl.append(cb, nama, peran);
      if (sudah) {
        const ket = document.createElement('span');
        ket.className = 'anggota-ket';
        ket.textContent = 'Sudah terdaftar';
        lbl.appendChild(ket);
      }
      wadah.appendChild(lbl);
    });
    if (!cocok.length) {
      const p = document.createElement('p');
      p.className = 'anggota-kosong';
      p.textContent = 'Tidak ada anggota yang cocok';
      wadah.appendChild(p);
    }
    perbaruiFooter();
  }

  wadah.addEventListener('change', (e) => {
    const cb = e.target;
    if (!(cb instanceof HTMLInputElement) || cb.type !== 'checkbox') return;
    if (cb.checked) dipilih.add(cb.value); else dipilih.delete(cb.value);
    perbaruiFooter();
  });
  $('cariAnggota').addEventListener('input', (e) => { kataAnggota = e.target.value; gambarModal(); });

  function resetModal() {
    dipilih.clear();
    kataAnggota = '';
    $('cariAnggota').value = '';
    gambarModal();
  }
  modalEl.addEventListener('hidden.bs.modal', resetModal);

  $('btnTambahkan').addEventListener('click', () => {
    if (!dipilih.size) return;
    const baru = ANGGOTA.filter((a) => dipilih.has(a.email));
    daftar = daftar.concat(baru);
    total += baru.length;
    const n = baru.length;
    dipilih.clear();
    if (typeof bootstrap !== 'undefined') bootstrap.Modal.getOrCreateInstance(modalEl).hide();
    kata = ''; $('cariPeserta').value = '';
    gambar();
    tampilkanToast(`${n} peserta berhasil ditambahkan.`, 'sukses');
  });

  // Setelah modal hapus (admin.js) menghapus baris peserta, sinkronkan data & angka
  let terakhir = null;
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-hapus]');
    if (t) terakhir = t.closest('[data-email]') ? t.closest('[data-email]').dataset.email : null;
  }, true);
  $('btnKonfirmasiHapus').addEventListener('click', () => {
    if (!terakhir) return;
    daftar = daftar.filter((p) => p.email !== terakhir);
    total = Math.max(0, total - 1);
    terakhir = null;
    gambar();
  });

  $('formCariPeserta').addEventListener('submit', (e) => { e.preventDefault(); kata = $('cariPeserta').value; gambar(); });
  $('cariPeserta').addEventListener('input', (e) => { kata = e.target.value; gambar(); });

  gambar();
})();