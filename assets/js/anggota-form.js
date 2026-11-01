/* anggota-form.js — Form Tambah/Ubah Anggota (FR-02)
   admin-anggota-form.html          -> Tambah
   admin-anggota-form.html?id=3     -> Ubah (data dummy)
   Penyimpanan hanya SIMULASI. Ganti simpanAnggota() dengan permintaan ke backend. */
(function () {
  'use strict';

  const DATA_DUMMY = {
    1:  { nama: 'Budi Santoso',  email: 'budi@organisasi.id',   hp: '081234567801', peran: 'Pengurus', status: 'aktif', akunSaya: true },
  };

  const el = (id) => document.getElementById(id);
  const form = el('formAnggota');
  const btnSimpan = el('btnSimpan');
  const btnBatal = el('btnBatal');
  const spinner = el('spinnerSimpan');
  const teksSimpan = el('teksSimpan');
  const FIELD = ['nama', 'email', 'hp', 'peran', 'status'];

  let idUbah = null;                                 // null = mode Tambah
  const modeUbah = () => idUbah !== null;

  /* Email harus unik (tidak peka huruf besar); saat ubah, email milik sendiri dikecualikan */
  function emailDipakai(nilai) {
    const q = nilai.trim().toLowerCase();
    return Object.entries(DATA_DUMMY).some(([id, d]) => String(id) !== String(idUbah) && d.email.toLowerCase() === q);
  }

  const ATURAN = {
    nama:   (v) => (v.trim() ? '' : 'Nama lengkap wajib diisi.'),
    email:  (v) => {
      const e = v.trim();
      if (!e) return 'Email wajib diisi.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) return 'Format email tidak valid. Contoh: nama@organisasi.id';
      if (emailDipakai(e)) return 'Email sudah dipakai anggota lain.';
      return '';
    },
    hp:     (v) => {
      const n = v.replace(/[\s-]/g, '');
      if (!n) return '';                              // opsional
      return /^(\+62|62|0)8\d{7,12}$/.test(n) ? '' : 'Nomor HP tidak valid. Contoh: 081234567890';
    },
    peran:  (v) => (v ? '' : 'Pilih peran.'),
    status: (v) => (v ? '' : 'Pilih status.'),
  };

  function tandaiSalah(input, pesan) {
    input.classList.add('is-invalid');
    input.setAttribute('aria-invalid', 'true');
    el(input.id + 'Feedback').textContent = pesan;
  }
  function bersihkanSalah(input) {
    input.classList.remove('is-invalid');
    input.removeAttribute('aria-invalid');
  }
  function periksa(id) {
    const input = el(id);
    const pesan = ATURAN[id](input.value);
    if (pesan) tandaiSalah(input, pesan); else bersihkanSalah(input);
    return pesan === '';
  }
  function periksaSemua() {
    const salah = FIELD.filter((id) => !periksa(id));
    if (salah.length) el(salah[0]).focus();
    return salah.length === 0;
  }

  /* ---------- Mode Tambah / Ubah ---------- */
  (function tentukanMode() {
    const param = new URLSearchParams(window.location.search).get('id');
    if (param === null) return;
    const data = Object.prototype.hasOwnProperty.call(DATA_DUMMY, param) ? DATA_DUMMY[param] : null;
    if (!data) { el('alertTidakDitemukan').hidden = false; return; }

    idUbah = param;
    el('judulHalaman').textContent = 'Ubah Anggota';
    el('subjudulHalaman').innerHTML = 'Perbarui data anggota atau pengurus. Tanda <span aria-hidden="true">*</span><span class="visually-hidden">bintang</span> wajib diisi.';
    el('crumbAktif').textContent = 'Ubah Anggota';
    teksSimpan.textContent = 'Simpan Perubahan';
    document.title = document.title.replace('Tambah Anggota', 'Ubah Anggota');

    if (data.status === 'menunggu') {                 // pendaftar belum disetujui: tampilkan statusnya apa adanya
      const opt = document.createElement('option');
      opt.value = 'menunggu'; opt.textContent = 'Menunggu persetujuan';
      el('status').appendChild(opt);
    }
    FIELD.forEach((id) => { el(id).value = data[id]; });
    if (data.akunSaya) {                              // admin tidak boleh menonaktifkan akunnya sendiri
      el('status').disabled = true;
      el('statusBantuan').hidden = false;
    }
  })();

  /* ---------- Pelacakan perubahan (untuk konfirmasi Batal) ---------- */
  const ambilNilai = () => JSON.stringify(FIELD.map((id) => el(id).value));
  const nilaiAwal = ambilNilai();
  const adaPerubahan = () => ambilNilai() !== nilaiAwal;

  FIELD.forEach((id) => {
    const input = el(id);
    input.addEventListener(input.tagName === 'SELECT' ? 'change' : 'input', () => {
      if (input.classList.contains('is-invalid')) periksa(id);
    });
  });
  el('email').addEventListener('blur', () => { if (el('email').value.trim()) periksa('email'); });   // cek keunikan saat selesai mengetik

  /* ---------- Batal ---------- */
  const KEMBALI = 'admin-anggota.html';
  btnBatal.addEventListener('click', () => {
    if (!adaPerubahan() || typeof bootstrap === 'undefined') { window.location.href = KEMBALI; return; }
    bootstrap.Modal.getOrCreateInstance(el('modalBatal')).show();
  });
  el('btnBuang').addEventListener('click', () => { window.location.href = KEMBALI; });

  /* ---------- Simpan ---------- */
  function setMenyimpan(aktif) {
    btnSimpan.disabled = aktif;
    btnBatal.disabled = aktif;
    btnSimpan.setAttribute('aria-busy', String(aktif));
    spinner.classList.toggle('d-none', !aktif);
    teksSimpan.textContent = aktif ? 'Menyimpan...' : (modeUbah() ? 'Simpan Perubahan' : 'Simpan Anggota');
  }
  function simpanAnggota(/* data */) {
    // TODO backend: POST untuk tambah, PUT/PATCH untuk ubah (idUbah); server juga wajib memeriksa keunikan email
    return new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 900));
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (btnSimpan.disabled) return;
    if (!periksaSemua()) return;
    setMenyimpan(true);
    const hasil = await simpanAnggota(new FormData(form));
    if (hasil.ok) window.location.href = `${KEMBALI}?pesan=${modeUbah() ? 'anggota-diperbarui' : 'anggota-disimpan'}`;
    else setMenyimpan(false);
  });
})();