/* dashboard.js — perilaku Dashboard Anggota
   - Pemfilteran agenda (FR-05): nama/PIC, kategori, status, tanggal
   - State: loading, kosong, error
   CATATAN: data agenda saat ini berasal dari HTML statis. Saat backend siap,
   ganti isi ambilAgenda() dengan permintaan ke server lalu render ulang daftarnya. */

const formFilter  = document.getElementById('formFilter');
const areaAgenda  = document.getElementById('areaAgenda');
const daftar      = document.getElementById('daftarAgenda');
const elLoading   = document.getElementById('agendaLoading');
const elKosong    = document.getElementById('agendaKosong');
const elError     = document.getElementById('agendaError');
const elHasil     = document.getElementById('hasilFilter');
const btnReset    = document.getElementById('btnReset');
const btnCobaLagi = document.getElementById('btnCobaLagi');
const btnCari     = formFilter ? formFilter.querySelector('button[type="submit"]') : null;

const WAKTU_MUAT_MS = 600;    // simulasi jeda jaringan
let sedangMemuat = false;

/* ---------- Data dari baris HTML ---------- */
const baris = [...daftar.querySelectorAll('.agenda-item')];

function bacaBaris(li) {
  const metaPic = li.querySelector('.agenda-meta span:last-child');
  return {
    nama: li.querySelector('.agenda-name').textContent.trim(),
    pic: metaPic ? metaPic.textContent.replace(/^PIC:\s*/i, '').trim() : '',
    kategori: li.dataset.kategori || '',
    status: li.dataset.status || '',
    tanggal: li.querySelector('time').getAttribute('datetime') || '',   // format YYYY-MM-DD
  };
}

/* ---------- Aturan pencocokan (FR-05) ---------- */
function cocokFilter(item, f) {
  const kata = f.cari.trim().toLowerCase();
  if (kata && !(item.nama + ' ' + item.pic).toLowerCase().includes(kata)) return false;
  if (f.kategori && item.kategori !== f.kategori) return false;
  if (f.status && item.status !== f.status) return false;
  if (f.tanggal && item.tanggal !== f.tanggal) return false;
  return true;
}

function bacaFilter() {
  const data = new FormData(formFilter);
  return {
    cari: data.get('cari') || '',
    kategori: data.get('kategori') || '',
    status: data.get('status') || '',
    tanggal: data.get('tanggal') || '',
  };
}

/* ---------- Tampilan state ---------- */
function tampilkan(mode) {            // 'daftar' | 'loading' | 'kosong' | 'error'
  daftar.hidden = mode !== 'daftar';
  elLoading.classList.toggle('d-none', mode !== 'loading');
  elKosong.classList.toggle('d-none', mode !== 'kosong');
  elError.classList.toggle('d-none', mode !== 'error');
  areaAgenda.setAttribute('aria-busy', String(mode === 'loading'));
}

function umumkan(jumlah) {
  elHasil.textContent = jumlah > 0
    ? `Menampilkan ${jumlah} kegiatan.`
    : 'Tidak ada kegiatan yang cocok dengan pencarian.';
}

/* ---------- Pengambilan data (simulasi) ---------- */
function ambilAgenda() {
  // TODO backend: ganti dengan fetch('/api/kegiatan?...') lalu render ulang daftar
  return new Promise((resolve) => setTimeout(() => resolve(baris), WAKTU_MUAT_MS));
}

async function jalankanPencarian() {
  if (sedangMemuat) return;           // cegah klik ganda
  sedangMemuat = true;
  if (btnCari) btnCari.disabled = true;
  tampilkan('loading');

  try {
    await ambilAgenda();
    const filter = bacaFilter();
    let jumlah = 0;
    baris.forEach((li) => {
      const cocok = cocokFilter(bacaBaris(li), filter);
      li.hidden = !cocok;
      if (cocok) jumlah += 1;
    });
    tampilkan(jumlah > 0 ? 'daftar' : 'kosong');
    umumkan(jumlah);
  } catch (err) {
    tampilkan('error');
  } finally {
    sedangMemuat = false;
    if (btnCari) btnCari.disabled = false;
  }
}

/* ---------- Event ---------- */
if (formFilter) {
  formFilter.addEventListener('submit', (e) => {
    e.preventDefault();
    jalankanPencarian();
  });
}
if (btnReset) {
  btnReset.addEventListener('click', () => {
    formFilter.reset();
    jalankanPencarian();
  });
}
if (btnCobaLagi) btnCobaLagi.addEventListener('click', jalankanPencarian);

/* ---------- Pratinjau state untuk pencocokan dengan desain ----------
   dashboard-anggota.html?state=loading | kosong | error          */
const stateUrl = new URLSearchParams(window.location.search).get('state');
if (['loading', 'kosong', 'error'].includes(stateUrl)) {
  tampilkan(stateUrl);
}