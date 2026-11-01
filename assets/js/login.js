/* login.js — validasi, state loading, dan state error halaman Login
   CATATAN: pengecekan akun di bawah hanya SIMULASI (data dummy).
   Ganti fungsi cekAkun() dengan permintaan ke backend nanti. */

const form       = document.getElementById('formLogin');
const alertBox   = document.getElementById('alertLogin');
const alertPesan = document.getElementById('alertLoginPesan');
const inputId    = document.getElementById('identitas');
const inputSandi = document.getElementById('kataSandi');
const fbId       = document.getElementById('identitasFeedback');
const fbSandi    = document.getElementById('kataSandiFeedback');
const btn        = document.getElementById('btnMasuk');
const spinner    = document.getElementById('spinnerMasuk');
const teksBtn    = document.getElementById('teksMasuk');

const AKUN_DUMMY = [
  { identitas: 'anggota@organisasi.id', kataSandi: 'password123', tujuan: 'dashboard-anggota.html' },
  { identitas: 'admin@organisasi.id',   kataSandi: 'admin123',    tujuan: 'admin-dashboard.html' },
];

/* ---------- Helper tampilan ---------- */
function tampilkanAlert(pesan) {
  alertPesan.textContent = pesan;
  alertBox.classList.remove('d-none');
}
function sembunyikanAlert() {
  alertBox.classList.add('d-none');
}
// tandaiInvalid() dan bersihkanInvalid() ada di auth.js
function setLoading(aktif) {
  btn.disabled = aktif;
  btn.setAttribute('aria-busy', String(aktif));
  spinner.classList.toggle('d-none', !aktif);
  teksBtn.textContent = aktif ? 'Memproses...' : 'Masuk';
}

/* ---------- Validasi sisi klien ---------- */
function validasi() {
  let valid = true;
  bersihkanInvalid(inputId, fbId);
  bersihkanInvalid(inputSandi, fbSandi);

  if (!inputId.value.trim()) {
    tandaiInvalid(inputId, fbId, 'Email atau nama pengguna wajib diisi.');
    valid = false;
  }
  if (!inputSandi.value) {
    tandaiInvalid(inputSandi, fbSandi, 'Kata sandi wajib diisi.');
    valid = false;
  }
  if (!valid) (inputId.classList.contains('is-invalid') ? inputId : inputSandi).focus();
  return valid;
}

/* ---------- Simulasi cek akun (ganti dengan backend) ---------- */
function cekAkun(identitas, kataSandi) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(AKUN_DUMMY.find((a) => a.identitas === identitas && a.kataSandi === kataSandi) || null);
    }, 1200);
  });
}

function tampilkanGagal() {
  tampilkanAlert('Email atau kata sandi salah. Silakan coba lagi.');
  tandaiInvalid(inputId, fbId);
  tandaiInvalid(inputSandi, fbSandi, 'Periksa kembali kata sandi Anda');
  // Sesuai desain: pesan di bawah email tidak ditampilkan pada error kredensial
  fbId.classList.remove('is-shown');
}

/* ---------- Submit ---------- */
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (btn.disabled) return;           // cegah klik ganda

  sembunyikanAlert();
  if (!validasi()) return;

  setLoading(true);
  const akun = await cekAkun(inputId.value.trim(), inputSandi.value);
  setLoading(false);

  if (akun) {
    window.location.href = akun.tujuan;   // anggota -> dashboard anggota, admin -> dashboard admin
  } else {
    tampilkanGagal();
    inputSandi.focus();
  }
});

/* Hapus tanda error begitu pengguna mulai mengetik ulang */
inputId.addEventListener('input', () => bersihkanInvalid(inputId, fbId));
inputSandi.addEventListener('input', () => bersihkanInvalid(inputSandi, fbSandi));

/* ---------- Pratinjau state untuk pencocokan dengan Figma ----------
   login.html?state=error    -> tampilan error
   login.html?state=loading  -> tampilan loading               */
const state = new URLSearchParams(window.location.search).get('state');
if (state === 'error') {
  tampilkanGagal();
} else if (state === 'loading') {
  setLoading(true);
} 