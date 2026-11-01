/* =====================================================================
   Anggota & Pengurus (admin-anggota.html)  — FR-02 (daftar) + persetujuan pendaftar
   - data dummy di array ANGGOTA; tabel dirender ulang dari data
   - pill status (Semua/Aktif/Menunggu persetujuan/Nonaktif), pencarian, filter peran & tahun
   - Setujui (langsung) / Tolak (modal + alasan opsional), hapus anggota (modal hapus bersama)
   - akun admin sendiri tidak dapat dihapus (tombol nonaktif + tooltip)
   ===================================================================== */
(function () {
  'use strict';

  const PER_HALAMAN = 8;
  const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const STATUS = {
    aktif:    { label: 'Aktif',    kelas: 'bg-success-subtle text-success-emphasis' },
    menunggu: { label: 'Menunggu', kelas: 'bg-warning-subtle text-warning-emphasis' },
    nonaktif: { label: 'Nonaktif', kelas: 'bg-secondary-subtle text-secondary-emphasis' },
  };

  // akunSaya: akun admin yang sedang masuk (dianggap Budi Santoso) — tidak boleh dihapus sendiri
  let ANGGOTA = [
    { id: 1,  nama: 'Zaka',  email: 'zaka@organisasi.id',   peran: 'Pengurus', tgl: '2024-01-12', status: 'aktif', akunSaya: true },
  ];

  const $ = (id) => document.getElementById(id);
  const state = { status: '', cari: '', peran: '', tahun: '', halaman: 1 };

  const tglPendek = (iso) => { const [t, b, h] = iso.split('-'); return `${h} ${BULAN[Number(b) - 1]} ${t}`; };
  const tglDaftar = (a) => `${tglPendek(a.tgl)}${a.jam ? ', ' + a.jam : ''}`;

  function el(tag, kelas, teks) {
    const e = document.createElement(tag);
    if (kelas) e.className = kelas;
    if (teks !== undefined) e.textContent = teks;
    return e;
  }
  function td(teks, kelas) { return el('td', kelas, teks); }
  function badge(status) {
    const s = STATUS[status];
    return el('span', `badge rounded-pill status-badge ${s.kelas}`, s.label);
  }
  function tombolIkon(ikon, label, atribut = {}) {
    const b = el('button', 'btn-icon');
    b.type = 'button';
    b.setAttribute('aria-label', label);
    Object.entries(atribut).forEach(([k, v]) => b.setAttribute(k, v));
    b.innerHTML = `<i class="${ikon}" aria-hidden="true"></i>`;
    return b;
  }

  /* ---------- Tooltip (dibuat ulang setiap render) ---------- */
  function pasangTooltip(root) {
    if (typeof bootstrap === 'undefined') return;
    root.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((e) => new bootstrap.Tooltip(e));
  }
  function bersihkanTooltip(root) {
    if (typeof bootstrap === 'undefined' || !bootstrap.Tooltip.getInstance) return;
    root.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((e) => { const t = bootstrap.Tooltip.getInstance(e); if (t) t.dispose(); });
  }

  /* ---------- Pill & hitungan ---------- */
  function hitung(status) { return status ? ANGGOTA.filter((a) => a.status === status).length : ANGGOTA.length; }

  function gambarPill() {
    document.querySelectorAll('[data-pill]').forEach((b) => {
      const aktif = b.dataset.pill === state.status;
      b.classList.toggle('active', aktif);
      b.setAttribute('aria-pressed', aktif ? 'true' : 'false');
    });
    document.querySelectorAll('[data-hitung]').forEach((c) => { c.textContent = hitung(c.dataset.hitung); });
  }

  /* ---------- Daftar anggota ---------- */
  function terfilter() {
    const q = state.cari.trim().toLowerCase();
    return ANGGOTA.filter((a) =>
      (!state.status || a.status === state.status) &&
      (!state.peran || a.peran === state.peran) &&
      (!state.tahun || a.tgl.startsWith(state.tahun)) &&
      (!q || a.nama.toLowerCase().includes(q) || a.email.toLowerCase().includes(q)));
  }

  function gambarDaftar() {
    const tbody = $('tabelAnggota');
    bersihkanTooltip(tbody);
    const hasil = terfilter();
    const halamanTotal = Math.max(1, Math.ceil(hasil.length / PER_HALAMAN));
    if (state.halaman > halamanTotal) state.halaman = halamanTotal;
    const mulai = (state.halaman - 1) * PER_HALAMAN;
    const tampil = hasil.slice(mulai, mulai + PER_HALAMAN);

    tbody.replaceChildren();
    tampil.forEach((a) => {
      const tr = el('tr');
      tr.dataset.baris = '';
      tr.dataset.id = a.id;
      const tdNama = td(a.nama, 'td-nama');
      if (a.akunSaya) tdNama.appendChild(el('span', 'nama-anda', '(Anda)'));
      tr.append(tdNama, td(a.email), td(a.peran, 'td-peran'), td(tglPendek(a.tgl)));
      const tdStatus = el('td'); tdStatus.appendChild(badge(a.status));
      const aksi = el('div', 'aksi');
      aksi.appendChild(tombolIkon('fa-regular fa-eye', `Lihat detail ${a.nama}`, { 'data-lihat': a.id }));
      const ubah = el('a', 'btn-icon'); ubah.href = `admin-anggota-form.html?id=${a.id}`;
      ubah.setAttribute('aria-label', `Ubah ${a.nama}`);
      ubah.innerHTML = '<i class="fa-regular fa-pen-to-square" aria-hidden="true"></i>';
      aksi.appendChild(ubah);
      if (a.akunSaya) {
        const wrap = el('span', 'tombol-nonaktif-wrap');
        wrap.tabIndex = 0;
        wrap.setAttribute('data-bs-toggle', 'tooltip');
        wrap.setAttribute('data-bs-title', 'Anda tidak dapat menghapus akun sendiri.');
        wrap.setAttribute('aria-label', 'Hapus tidak tersedia: Anda tidak dapat menghapus akun sendiri');
        const b = tombolIkon('fa-regular fa-trash-can', `Hapus ${a.nama}`); b.disabled = true;
        wrap.appendChild(b); aksi.appendChild(wrap);
      } else {
        aksi.appendChild(tombolIkon('fa-regular fa-trash-can', `Hapus ${a.nama}`, { 'data-hapus': '', 'data-jenis': 'anggota', 'data-nama': a.nama }));
      }
      const tdAksi = el('td'); tdAksi.appendChild(aksi);
      tr.append(tdStatus, tdAksi);
      tbody.appendChild(tr);
    });
    if (!tampil.length) {
      const tr = el('tr', 'tabel-kosong');
      const sel = td('Belum ada anggota yang cocok'); sel.colSpan = 6;
      tr.appendChild(sel); tbody.appendChild(tr);
    }
    pasangTooltip(tbody);

    $('infoAnggota').textContent = tampil.length
      ? `Menampilkan ${mulai + 1}–${mulai + tampil.length} dari ${hasil.length} anggota`
      : 'Menampilkan 0 anggota';

    const pag = $('paginasiAnggota');
    pag.replaceChildren();
    $('navAnggota').hidden = halamanTotal <= 1;
    if (halamanTotal > 1) {
      const buat = (isi, hal, { aktif = false, mati = false, label = '' } = {}) => {
        const li = el('li', `page-item${aktif ? ' active' : ''}${mati ? ' disabled' : ''}`);
        if (aktif) li.setAttribute('aria-current', 'page');
        const a = el('a', 'page-link'); a.href = '#'; a.innerHTML = isi; a.dataset.hal = hal;
        if (label) a.setAttribute('aria-label', label);
        if (mati) { a.tabIndex = -1; a.setAttribute('aria-disabled', 'true'); }
        li.appendChild(a); pag.appendChild(li);
      };
      buat('&lsaquo;', state.halaman - 1, { mati: state.halaman === 1, label: 'Halaman sebelumnya' });
      for (let n = 1; n <= halamanTotal; n++) buat(String(n), n, { aktif: n === state.halaman });
      buat('&rsaquo;', state.halaman + 1, { mati: state.halaman === halamanTotal, label: 'Halaman berikutnya' });
    }
  }

  /* ---------- Menunggu persetujuan ---------- */
  function gambarMenunggu() {
    const daftar = ANGGOTA.filter((a) => a.status === 'menunggu');
    const alert = $('alertMenunggu');
    alert.hidden = daftar.length === 0;
    alert.textContent = `${daftar.length} pendaftar menunggu persetujuan. Akun baru aktif dan dapat masuk setelah Anda menyetujuinya.`;
    const tbody = $('tabelPendaftar');
    tbody.replaceChildren();
    daftar.forEach((a) => {
      const tr = el('tr'); tr.dataset.id = a.id;
      tr.append(td(a.nama, 'td-nama'), td(a.email), td(tglDaftar(a)));
      const tdS = el('td'); tdS.appendChild(badge('menunggu'));
      const aksi = el('div', 'btn-aksi-setuju');
      const setuju = el('button', 'btn btn-primary', 'Setujui'); setuju.type = 'button';
      setuju.dataset.setujui = a.id; setuju.setAttribute('aria-label', `Setujui pendaftaran ${a.nama}`);
      const tolak = el('button', 'btn btn-light border', 'Tolak'); tolak.type = 'button';
      tolak.dataset.tolak = a.id; tolak.setAttribute('aria-label', `Tolak pendaftaran ${a.nama}`);
      aksi.append(setuju, tolak);
      const tdA = el('td'); tdA.appendChild(aksi);
      tr.append(tdS, tdA);
      tbody.appendChild(tr);
    });
    if (!daftar.length) {
      const tr = el('tr', 'tabel-kosong');
      const sel = td('Tidak ada pendaftar yang menunggu persetujuan'); sel.colSpan = 5;
      tr.appendChild(sel); tbody.appendChild(tr);
    }
  }

  function gambar() {
    gambarPill();
    const menunggu = state.status === 'menunggu';
    $('panelDaftar').hidden = menunggu;
    $('panelMenunggu').hidden = !menunggu;
    if (menunggu) gambarMenunggu(); else gambarDaftar();
  }

  /* ---------- Interaksi ---------- */
  document.querySelectorAll('[data-pill]').forEach((b) => {
    b.addEventListener('click', () => { state.status = b.dataset.pill; state.halaman = 1; gambar(); });
  });

  $('formFilter').addEventListener('submit', (e) => {
    e.preventDefault();
    state.cari = $('filterCari').value; state.peran = $('filterPeran').value; state.tahun = $('filterTahun').value;
    state.halaman = 1; gambar();
  });
  $('formFilter').addEventListener('reset', () => {
    setTimeout(() => { state.cari = ''; state.peran = ''; state.tahun = ''; state.halaman = 1; gambar(); }, 0);
  });

  $('paginasiAnggota').addEventListener('click', (e) => {
    const a = e.target.closest('a[data-hal]');
    if (!a || a.closest('.disabled')) return;
    e.preventDefault();
    state.halaman = Number(a.dataset.hal); gambarDaftar();
  });

  // Setujui / Tolak / Lihat (delegasi)
  let idTolak = null;
  document.addEventListener('click', (e) => {
    const setuju = e.target.closest('[data-setujui]');
    if (setuju) {
      const a = ANGGOTA.find((x) => x.id === Number(setuju.dataset.setujui));
      if (!a) return;
      a.status = 'aktif'; delete a.jam;
      gambar();
      tampilkanToast(`${a.nama} disetujui dan kini berstatus Aktif.`, 'sukses');
      return;
    }
    const tolak = e.target.closest('[data-tolak]');
    if (tolak) {
      const a = ANGGOTA.find((x) => x.id === Number(tolak.dataset.tolak));
      if (!a) return;
      idTolak = a.id;
      $('modalTolakPesan').textContent = `Pendaftaran “${a.nama}” akan ditolak. Pendaftar tidak akan dapat masuk ke aplikasi.`;
      $('alasanTolak').value = '';
      if (typeof bootstrap !== 'undefined') bootstrap.Modal.getOrCreateInstance($('modalTolak')).show();
      return;
    }
    const lihat = e.target.closest('[data-lihat]');
    if (lihat) {
      const a = ANGGOTA.find((x) => x.id === Number(lihat.dataset.lihat));
      if (!a) return;
      $('detNama').textContent = a.nama; $('detEmail').textContent = a.email; $('detPeran').textContent = a.peran;
      $('detGabung').textContent = tglPendek(a.tgl);
      $('detStatus').className = `badge rounded-pill status-badge ${STATUS[a.status].kelas}`;
      $('detStatus').textContent = STATUS[a.status].label;
      $('detUbah').href = `admin-anggota-form.html?id=${a.id}`;
      if (typeof bootstrap !== 'undefined') bootstrap.Modal.getOrCreateInstance($('modalDetail')).show();
    }
  });

  $('btnKonfirmasiTolak').addEventListener('click', () => {
    const a = ANGGOTA.find((x) => x.id === idTolak);
    if (!a) return;
    ANGGOTA = ANGGOTA.filter((x) => x.id !== idTolak);
    idTolak = null;
    if (typeof bootstrap !== 'undefined') bootstrap.Modal.getOrCreateInstance($('modalTolak')).hide();
    gambar();
    tampilkanToast(`Pendaftaran ${a.nama} ditolak.`, 'info');
  });

  // Hapus anggota: baris dihapus oleh admin.js; di sini data & hitungan disinkronkan
  let idHapus = null;
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-hapus]');
    const tr = t && t.closest('[data-id]');
    if (tr) idHapus = Number(tr.dataset.id);
  }, true);
  $('btnKonfirmasiHapus').addEventListener('click', () => {
    if (idHapus === null) return;
    ANGGOTA = ANGGOTA.filter((x) => x.id !== idHapus);
    idHapus = null;
    gambar();
  });

  /* ---------- Awal: ?tab=menunggu membuka tab persetujuan langsung ---------- */
  const tab = new URLSearchParams(window.location.search).get('tab');
  if (tab === 'menunggu') state.status = 'menunggu';
  gambar();
})();