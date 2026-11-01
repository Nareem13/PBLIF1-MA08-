/* register.js — validasi, loading, dan halaman berhasil pada Register
   CATATAN: pengecekan "email sudah terdaftar" hanya SIMULASI (data dummy).
   Ganti cekEmailTerdaftar()/kirimPendaftaran() dengan permintaan ke backend. */

const formReg     = document.getElementById('formRegister');
const kartuForm   = document.getElementById('kartuForm');
const kartuOk     = document.getElementById('kartuBerhasil');
const judulOk     = document.getElementById('judulBerhasil');
const btnDaftar   = document.getElementById('btnDaftar');
const spinnerDft  = document.getElementById('spinnerDaftar');
const teksDaftar  = document.getElementById('teksDaftar');
const bantuanSandi = document.getElementById('kataSandiBantuan');

const f = {
  nama:       { input: document.getElementById('namaLengkap'),     fb: document.getElementById('namaFeedback') },
  email:      { input: document.getElementById('email'),           fb: document.getElementById('emailFeedback') },
  sandi:      { input: document.getElementById('kataSandi'),       fb: document.getElementById('kataSandiFeedback') },
  konfirmasi: { input: document.getElementById('konfirmasiSandi'), fb: document.getElementById('konfirmasiFeedback') },
  setuju:     { input: document.getElementById('setuju'),          fb: document.getElementById('setujuFeedback') },
};

const EMAIL_DUMMY_TERDAFTAR = 'anggota@organisasi.id';
const POLA_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function salah(kunci, pesan) { tandaiInvalid(f[kunci].input, f[kunci].fb, pesan); }

function bersihkan(kunci) {
  bersihkanInvalid(f[kunci].input, f[kunci].fb);
  if (kunci === 'sandi') bantuanSandi.classList.remove('d-none');   // tampilkan lagi "Minimal 8 karakter"
}

function setLoading(aktif) {
  btnDaftar.disabled = aktif;
  btnDaftar.setAttribute('aria-busy', String(aktif));
  spinnerDft.classList.toggle('d-none', !aktif);
  teksDaftar.textContent = aktif ? 'Memproses...' : 'Daftar';
}

function tampilkanBerhasil() {
  kartuForm.classList.add('d-none');
  kartuOk.classList.remove('d-none');
  judulOk.focus();
}

/* ---------- Validasi sisi klien ---------- */
function validasi() {
  Object.keys(f).forEach(bersihkan);
  const urutan = [];                       // kunci field yang salah, sesuai urutan di form

  if (!f.nama.input.value.trim()) {
    salah('nama', 'Nama lengkap wajib diisi.'); urutan.push('nama');
  }

  const email = f.email.input.value.trim();
  if (!email) {
    salah('email', 'Email wajib diisi.'); urutan.push('email');
  } else if (!POLA_EMAIL.test(email)) {
    salah('email', 'Format email tidak valid'); urutan.push('email');
  }

  const sandi = f.sandi.input.value;
  if (!sandi) {
    salah('sandi', 'Kata sandi wajib diisi.'); bantuanSandi.classList.add('d-none'); urutan.push('sandi');
  } else if (sandi.length < 8) {
    salah('sandi', 'Kata sandi minimal 8 karakter.'); bantuanSandi.classList.add('d-none'); urutan.push('sandi');
  }

  const konf = f.konfirmasi.input.value;
  if (!konf) {
    salah('konfirmasi', 'Konfirmasi kata sandi wajib diisi.'); urutan.push('konfirmasi');
  } else if (konf !== sandi) {
    salah('konfirmasi', 'Kata sandi tidak cocok'); urutan.push('konfirmasi');
  }

  if (!f.setuju.input.checked) {
    salah('setuju'); urutan.push('setuju');
  }

  if (urutan.length) f[urutan[0]].input.focus();
  return urutan.length === 0;
}

/* ---------- Simulasi server (ganti dengan backend) ---------- */
function kirimPendaftaran(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data.email.toLowerCase() === EMAIL_DUMMY_TERDAFTAR
        ? { ok: false, galat: 'emailTerdaftar' }
        : { ok: true });
    }, 1200);
  });
}

/* ---------- Submit ---------- */
formReg.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (btnDaftar.disabled) return;          // cegah klik ganda
  if (!validasi()) return;

  setLoading(true);
  const hasil = await kirimPendaftaran({
    nama: f.nama.input.value.trim(),
    email: f.email.input.value.trim(),
  });
  setLoading(false);

  if (hasil.ok) {
    tampilkanBerhasil();
  } else if (hasil.galat === 'emailTerdaftar') {
    salah('email', 'Email sudah terdaftar. Silakan masuk.');
    f.email.input.focus();
  }
});

/* Hapus tanda error begitu pengguna memperbaiki isian */
f.nama.input.addEventListener('input',   () => bersihkan('nama'));
f.email.input.addEventListener('input',  () => bersihkan('email'));
f.sandi.input.addEventListener('input',  () => bersihkan('sandi'));
f.konfirmasi.input.addEventListener('input', () => bersihkan('konfirmasi'));
f.setuju.input.addEventListener('change', () => bersihkan('setuju'));

/* ---------- Pratinjau state untuk pencocokan dengan Figma ----------
   register.html?state=error    -> state error validasi
   register.html?state=berhasil -> halaman berhasil               */
const state = new URLSearchParams(window.location.search).get('state');
if (state === 'error') {
  salah('email', 'Format email tidak valid');
  salah('konfirmasi', 'Kata sandi tidak cocok');
} else if (state === 'berhasil') {
  tampilkanBerhasil();
}