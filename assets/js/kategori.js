/* =====================================================================
   Kategori Kegiatan (admin-kategori.html) — FR-01
   - tabel dari data dummy, pencarian, modal Tambah/Ubah (nama wajib & unik)
   - kategori yang dipakai kegiatan tidak dapat dihapus (ikon nonaktif + tooltip)
   - hapus kategori kosong lewat modal hapus bersama
   Penyimpanan hanya SIMULASI di memori halaman.
   ===================================================================== */
(function () {
  'use strict';

  let KATEGORI = [
    { id: 1, nama: 'Rapat',      deskripsi: 'Rapat rutin dan koordinasi pengurus',  jumlah: 14 },
    { id: 2, nama: 'Pelatihan',  deskripsi: 'Pelatihan dan seminar untuk anggota',  jumlah: 9 },
    { id: 3, nama: 'Sosial',     deskripsi: 'Kegiatan bakti sosial dan kerja bakti', jumlah: 8 },
    { id: 4, nama: 'Olahraga',   deskripsi: 'Turnamen dan kegiatan olahraga',        jumlah: 4 },
    { id: 5, nama: 'Lainnya',    deskripsi: 'Kegiatan di luar kategori lain',        jumlah: 3 },
    { id: 6, nama: 'Keagamaan',  deskripsi: 'Kegiatan keagamaan',                    jumlah: 0 },
  ];
  let idBerikut = 7;

  const $ = (id) => document.getElementById(id);
  const tbody = $('tabelKategori');
  const modalEl = $('modalKategori');
  const inNama = $('namaKategori');
  const inDesk = $('deskripsiKategori');
  const btnSimpan = $('btnSimpanKategori');
  let kata = '';
  let idUbah = null;                                // null = Tambah

  const el = (tag, kelas, teks) => { const e = document.createElement(tag); if (kelas) e.className = kelas; if (teks !== undefined) e.textContent = teks; return e; };
  const modalBs = () => (typeof bootstrap !== 'undefined' ? bootstrap.Modal.getOrCreateInstance(modalEl) : null);

  /* ---------- Tabel ---------- */
  function bersihkanTooltip() {
    if (typeof bootstrap === 'undefined' || !bootstrap.Tooltip.getInstance) return;
    tbody.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((e) => { const t = bootstrap.Tooltip.getInstance(e); if (t) t.dispose(); });
  }

  function gambar() {
    bersihkanTooltip();
    const q = kata.trim().toLowerCase();
    const tampil = KATEGORI.filter((k) => !q || k.nama.toLowerCase().includes(q));
    tbody.replaceChildren();

    tampil.forEach((k) => {
      const tr = el('tr'); tr.dataset.baris = ''; tr.dataset.id = k.id;
      const aksi = el('div', 'aksi');

      const ubah = el('button', 'btn-icon'); ubah.type = 'button';
      ubah.dataset.ubah = k.id; ubah.setAttribute('aria-label', `Ubah ${k.nama}`);
      ubah.innerHTML = '<i class="fa-regular fa-pen-to-square" aria-hidden="true"></i>';
      aksi.appendChild(ubah);

      const hapus = el('button', 'btn-icon'); hapus.type = 'button';
      hapus.innerHTML = '<i class="fa-regular fa-trash-can" aria-hidden="true"></i>';
      if (k.jumlah > 0) {                           // dipakai kegiatan: tidak boleh dihapus
        hapus.disabled = true;
        hapus.setAttribute('aria-label', `Hapus ${k.nama}`);
        const wrap = el('span', 'tombol-nonaktif-wrap'); wrap.tabIndex = 0;
        wrap.setAttribute('data-bs-toggle', 'tooltip');
        wrap.setAttribute('data-bs-title', `Dipakai oleh ${k.jumlah} kegiatan`);
        wrap.setAttribute('aria-label', `Hapus ${k.nama} tidak tersedia: dipakai oleh ${k.jumlah} kegiatan`);
        wrap.appendChild(hapus); aksi.appendChild(wrap);
      } else {
        hapus.setAttribute('data-hapus', ''); hapus.dataset.jenis = 'kategori'; hapus.dataset.nama = k.nama;
        hapus.setAttribute('aria-label', `Hapus ${k.nama}`);
        aksi.appendChild(hapus);
      }

      const tdAksi = el('td'); tdAksi.appendChild(aksi);
      tr.append(el('td', 'td-nama', k.nama), el('td', 'td-deskripsi', k.deskripsi || '–'), el('td', '', String(k.jumlah)), tdAksi);
      tbody.appendChild(tr);
    });

    if (!tampil.length) {
      const tr = el('tr', 'tabel-kosong');
      const td = el('td', '', q ? 'Belum ada kategori yang cocok' : 'Belum ada kategori. Klik “+ Tambah Kategori” untuk membuatnya.');
      td.colSpan = 4; tr.appendChild(td); tbody.appendChild(tr);
    }
    if (typeof bootstrap !== 'undefined') tbody.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((e) => new bootstrap.Tooltip(e));

    $('infoKategori').textContent = q ? `Menampilkan ${tampil.length} dari ${KATEGORI.length} kategori` : `Menampilkan ${tampil.length} kategori`;
  }

  $('formFilter').addEventListener('submit', (e) => { e.preventDefault(); kata = $('filterCari').value; gambar(); });
  $('formFilter').addEventListener('reset', () => setTimeout(() => { kata = ''; gambar(); }, 0));

  /* ---------- Modal Tambah / Ubah ---------- */
  function bersihkanSalah() { inNama.classList.remove('is-invalid'); inNama.removeAttribute('aria-invalid'); }
  function pesanNama(v) {
    const n = v.trim();
    if (!n) return 'Nama kategori wajib diisi.';
    if (KATEGORI.some((k) => k.id !== idUbah && k.nama.toLowerCase() === n.toLowerCase())) return 'Nama kategori sudah ada.';
    return '';
  }
  function perbaruiTombol() { btnSimpan.disabled = inNama.value.trim() === ''; }   // aktif setelah nama terisi

  function bukaModal(k) {
    idUbah = k ? k.id : null;
    $('modalKategoriJudul').textContent = k ? 'Ubah Kategori' : 'Tambah Kategori';
    inNama.value = k ? k.nama : '';
    inDesk.value = k ? k.deskripsi : '';
    bersihkanSalah(); perbaruiTombol();
    const m = modalBs(); if (m) m.show();
  }

  $('btnTambahKategori').addEventListener('click', () => bukaModal(null));
  tbody.addEventListener('click', (e) => {
    const b = e.target.closest('[data-ubah]');
    if (!b) return;
    const k = KATEGORI.find((x) => x.id === Number(b.dataset.ubah));
    if (k) bukaModal(k);
  });

  modalEl.addEventListener('shown.bs.modal', () => inNama.focus());
  inNama.addEventListener('input', () => {
    perbaruiTombol();
    if (inNama.classList.contains('is-invalid') && !pesanNama(inNama.value)) bersihkanSalah();
  });

  $('formKategori').addEventListener('submit', (e) => {
    e.preventDefault();
    const pesan = pesanNama(inNama.value);
    if (pesan) {
      inNama.classList.add('is-invalid'); inNama.setAttribute('aria-invalid', 'true');
      $('namaKategoriFeedback').textContent = pesan; inNama.focus();
      return;
    }
    const nama = inNama.value.trim(); const deskripsi = inDesk.value.trim();
    if (idUbah === null) {
      KATEGORI.push({ id: idBerikut++, nama, deskripsi, jumlah: 0 });
    } else {
      const k = KATEGORI.find((x) => x.id === idUbah); k.nama = nama; k.deskripsi = deskripsi;
    }
    const baru = idUbah === null;
    const m = modalBs(); if (m) m.hide();
    gambar();
    tampilkanToast(baru ? 'Kategori berhasil ditambahkan.' : 'Kategori berhasil diperbarui.', 'sukses');
  });

  /* ---------- Hapus (modal hapus bersama di admin.js menghapus barisnya; data disinkronkan di sini) ---------- */
  let idHapus = null;
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-hapus]');
    const tr = t && t.closest('[data-id]');
    if (tr) idHapus = Number(tr.dataset.id);
  }, true);
  $('btnKonfirmasiHapus').addEventListener('click', () => {
    if (idHapus === null) return;
    KATEGORI = KATEGORI.filter((k) => k.id !== idHapus);
    idHapus = null;
    gambar();
  });

  gambar();
})();