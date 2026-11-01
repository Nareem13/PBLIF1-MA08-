/* kegiatan-form.js — Form Tambah/Ubah Kegiatan (FR-03)
   Satu form untuk dua mode:
     admin-kegiatan-form.html            -> Tambah
     admin-kegiatan-form.html?id=3       -> Ubah (data terisi dari DATA_DUMMY)
   CATATAN: penyimpanan hanya SIMULASI. Ganti simpanKegiatan() dengan permintaan ke backend. */

/* ---------- Data dummy untuk mode Ubah (id mengikuti baris di admin-kegiatan.html) ---------- */
const DATA_DUMMY = {
  1: { nama: 'Rapat Koordinasi Bulanan',    kategori: 'rapat',     status: 'berlangsung',  tanggal: '2026-10-18', mulai: '19:00', selesai: '21:00', lokasi: 'Sekretariat',         pic: 'Budi Santoso', deskripsi: 'Pembahasan program kerja bulan Oktober, evaluasi kegiatan bulan lalu, dan persiapan kegiatan akhir tahun.' },
  2: { nama: 'Pelatihan Dasar Organisasi',  kategori: 'pelatihan', status: 'direncanakan', tanggal: '2026-10-21', mulai: '09:00', selesai: '12:00', lokasi: 'Aula Lt. 2',          pic: 'Sari Dewi',    deskripsi: '' },
  3: { nama: 'Bakti Sosial Panti Asuhan',   kategori: 'sosial',    status: 'direncanakan', tanggal: '2026-10-24', mulai: '08:00', selesai: '14:00', lokasi: 'Panti Asuhan Harapan', pic: 'Rudi Hartono', deskripsi: '' },
  4: { nama: 'Kerja Bakti Lingkungan',      kategori: 'sosial',    status: 'batal',        tanggal: '2026-10-27', mulai: '07:00', selesai: '10:00', lokasi: 'Lingkungan RW 05',    pic: 'Dewi Lestari', deskripsi: '' },
  5: { nama: 'Evaluasi Triwulan III',       kategori: 'rapat',     status: 'direncanakan', tanggal: '2026-10-31', mulai: '19:00', selesai: '21:00', lokasi: 'Sekretariat',         pic: 'Budi Santoso', deskripsi: '' },
  6: { nama: 'Seminar Kepemimpinan',        kategori: 'pelatihan', status: 'selesai',      tanggal: '2026-10-10', mulai: '13:00', selesai: '16:00', lokasi: 'Aula Lt. 2',          pic: 'Sari Dewi',    deskripsi: '' },
  7: { nama: 'Turnamen Futsal Antaranggota', kategori: 'olahraga', status: 'selesai',      tanggal: '2026-10-04', mulai: '15:00', selesai: '18:00', lokasi: 'Lapangan Futsal',     pic: 'Rudi Hartono', deskripsi: '' },
  8: { nama: 'Rapat Koordinasi September',  kategori: 'rapat',     status: 'selesai',      tanggal: '2026-09-18', mulai: '19:00', selesai: '21:00', lokasi: 'Sekretariat',         pic: 'Budi Santoso', deskripsi: '' },
};

const form       = document.getElementById('formKegiatan');
const btnSimpan  = document.getElementById('btnSimpan');
const btnBatal   = document.getElementById('btnBatal');
const spinner    = document.getElementById('spinnerSimpan');
const teksSimpan = document.getElementById('teksSimpan');
const el = (id) => document.getElementById(id);

/* Peta id elemen -> kunci data (untuk mengisi form mode Ubah) */
const PETA = { namaKegiatan: 'nama', kategori: 'kategori', status: 'status', tanggal: 'tanggal',
               jamMulai: 'mulai', jamSelesai: 'selesai', lokasi: 'lokasi', pic: 'pic', deskripsi: 'deskripsi' };

/* ---------- Aturan validasi: kembalikan pesan error, atau '' bila valid ---------- */
const ATURAN = {
  namaKegiatan: (v) => (v.trim() ? '' : 'Nama kegiatan wajib diisi.'),
  kategori:     (v) => (v ? '' : 'Pilih kategori.'),
  status:       (v) => (v ? '' : 'Pilih status.'),
  tanggal:      (v) => (v ? '' : 'Tanggal wajib diisi.'),
  jamMulai:     (v) => (v ? '' : 'Jam mulai wajib diisi.'),
  jamSelesai:   (v) => (v && el('jamMulai').value && v <= el('jamMulai').value ? 'Jam selesai harus setelah jam mulai.' : ''),
  lokasi:       (v) => (v.trim() ? '' : 'Lokasi wajib diisi.'),
  pic:          (v) => (v ? '' : 'Pilih penanggung jawab.'),
};
const URUTAN = Object.keys(ATURAN);        // sama dengan urutan di form

function tandaiSalah(input, pesan) {
  input.classList.add('is-invalid');
  input.setAttribute('aria-invalid', 'true');
  el(input.id + 'Feedback').textContent = pesan;     // .invalid-feedback bersaudara dengan input -> tampil otomatis
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
  const salah = URUTAN.filter((id) => !periksa(id));
  if (salah.length) el(salah[0]).focus();            // fokus ke isian pertama yang salah
  return salah.length === 0;
}

/* ---------- Mode Tambah / Ubah ---------- */
let modeUbah = false;
let idKegiatan = null;
(function tentukanMode() {
  const param = new URLSearchParams(window.location.search).get('id');
  if (param === null) return;
  const data = Object.prototype.hasOwnProperty.call(DATA_DUMMY, param) ? DATA_DUMMY[param] : null;
  if (!data) { el('alertTidakDitemukan').hidden = false; return; }   // id tidak dikenal: tetap mode Tambah

  modeUbah = true;
  idKegiatan = param;
  el('judulHalaman').textContent = 'Ubah Kegiatan';
  el('subjudulHalaman').innerHTML = 'Perbarui informasi kegiatan. Tanda <span aria-hidden="true">*</span><span class="visually-hidden">bintang</span> wajib diisi.';
  el('crumbAktif').textContent = 'Ubah Kegiatan';
  teksSimpan.textContent = 'Simpan Perubahan';
  document.title = document.title.replace('Tambah Kegiatan', 'Ubah Kegiatan');
  Object.entries(PETA).forEach(([id, kunci]) => { el(id).value = data[kunci]; });
})();

/* ---------- Pelacakan perubahan (untuk konfirmasi Batal) ---------- */
const ambilNilai = () => JSON.stringify(Object.keys(PETA).map((id) => el(id).value));
const nilaiAwal = ambilNilai();
const adaPerubahan = () => ambilNilai() !== nilaiAwal;

/* ---------- Event isian ---------- */
URUTAN.forEach((id) => {
  const input = el(id);
  const peristiwa = input.tagName === 'SELECT' ? 'change' : 'input';
  input.addEventListener(peristiwa, () => {
    if (input.classList.contains('is-invalid')) periksa(id);     // hapus/ubah pesan begitu pengguna memperbaiki
    if (id === 'jamMulai' && el('jamSelesai').value) periksa('jamSelesai');   // aturan jam bergantung pada jam mulai
  });
});

/* ---------- Batal ---------- */
const KEMBALI = 'admin-kegiatan.html';
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
  teksSimpan.textContent = aktif ? 'Menyimpan...' : (modeUbah ? 'Simpan Perubahan' : 'Simpan Kegiatan');
}

function simpanKegiatan(/* data */) {
  // TODO backend: kirim ke server (POST untuk tambah, PUT/PATCH untuk ubah dengan idKegiatan)
  return new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 900));
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (btnSimpan.disabled) return;                    // cegah klik ganda
  if (!periksaSemua()) return;

  setMenyimpan(true);
  const hasil = await simpanKegiatan(new FormData(form));
  if (hasil.ok) {
    // Daftar menampilkan toast sukses lewat ?pesan= (lihat admin.js)
    window.location.href = `${KEMBALI}?pesan=${modeUbah ? 'kegiatan-diperbarui' : 'kegiatan-disimpan'}`;
  } else {
    setMenyimpan(false);
  }
});