/* admin.js — perilaku bersama semua halaman Panel Admin
   - tampilkanToast(pesan, jenis)   jenis: 'sukses' | 'info' | 'bahaya'
   - modal konfirmasi hapus         tombol: <button data-hapus data-jenis="kegiatan" data-nama="...">
                                    baris yang dihapus: elemen terdekat ber-atribut data-baris
   - tooltip Bootstrap              elemen: data-bs-toggle="tooltip"
   - tombol ekspor (simulasi)       elemen: data-ekspor
   Bila Bootstrap JS gagal dimuat, halaman tetap tampil (fitur modal/toast saja yang nonaktif). */

const bootstrapSiap = typeof bootstrap !== 'undefined';

/* ---------- Toast ---------- */
function tampilkanToast(pesan, jenis = 'sukses') {
  if (!bootstrapSiap) return;

  let wadah = document.getElementById('toastContainer');
  if (!wadah) {
    wadah = document.createElement('div');
    wadah.id = 'toastContainer';
    wadah.className = 'toast-container position-fixed top-0 end-0 p-3';
    document.body.appendChild(wadah);
  }

  const ikon = { sukses: 'fa-circle-check', info: 'fa-circle-info', bahaya: 'fa-circle-exclamation' }[jenis] || 'fa-circle-info';
  const el = document.createElement('div');
  el.className = `toast app-toast app-toast-${jenis}`;
  el.setAttribute('role', jenis === 'bahaya' ? 'alert' : 'status');
  el.setAttribute('aria-live', jenis === 'bahaya' ? 'assertive' : 'polite');
  el.setAttribute('aria-atomic', 'true');

  const isi = document.createElement('div');
  isi.className = 'd-flex';
  const body = document.createElement('div');
  body.className = 'toast-body';
  const i = document.createElement('i');
  i.className = `fa-solid ${ikon} mt-1`;
  i.setAttribute('aria-hidden', 'true');
  const teks = document.createElement('span');
  teks.textContent = pesan;                       // textContent: aman dari injeksi HTML
  body.append(i, teks);
  const tutup = document.createElement('button');
  tutup.type = 'button';
  tutup.className = 'btn-close me-2 m-auto';
  tutup.setAttribute('data-bs-dismiss', 'toast');
  tutup.setAttribute('aria-label', 'Tutup');
  isi.append(body, tutup);
  el.appendChild(isi);
  wadah.appendChild(el);

  el.addEventListener('hidden.bs.toast', () => el.remove());
  new bootstrap.Toast(el, { delay: 4000 }).show();
}

/* ---------- Modal konfirmasi hapus ---------- */
const modalHapusEl = document.getElementById('modalHapus');
if (modalHapusEl && bootstrapSiap) {
  const modalHapus = bootstrap.Modal.getOrCreateInstance(modalHapusEl);
  const judul = document.getElementById('modalHapusJudul');
  const pesan = document.getElementById('modalHapusPesan');
  const btnKonfirmasi = document.getElementById('btnKonfirmasiHapus');
  let sasaran = null;                              // baris yang akan dihapus
  let ringkas = null;                              // { jenis, nama }
  let alihan = '';                                 // bila diisi (data-alihan), pindah halaman setelah konfirmasi

  document.addEventListener('click', (e) => {
    const tombol = e.target.closest('[data-hapus]');
    if (!tombol) return;
    sasaran = tombol.closest('[data-baris]');
    ringkas = { jenis: tombol.dataset.jenis || 'data', nama: tombol.dataset.nama || '' };
    alihan = tombol.dataset.alihan || '';
    judul.textContent = `Hapus ${ringkas.jenis}?`;
    pesan.textContent = `“${ringkas.nama}” akan dihapus. Tindakan ini tidak dapat dibatalkan.`;
    modalHapus.show();
  });

  btnKonfirmasi.addEventListener('click', () => {
    if (alihan) { window.location.href = alihan; return; }   // mis. hapus dari halaman detail → kembali ke daftar
    if (sasaran) sasaran.remove();
    modalHapus.hide();
    const kapital = ringkas.jenis.charAt(0).toUpperCase() + ringkas.jenis.slice(1);
    tampilkanToast(`${kapital} “${ringkas.nama}” berhasil dihapus.`, 'sukses');
    sasaran = null;
  });
}

/* ---------- Tooltip ---------- */
if (bootstrapSiap) {
  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((el) => new bootstrap.Tooltip(el));
}

/* ---------- Ekspor (simulasi) ---------- */
document.querySelectorAll('[data-ekspor]').forEach((btn) => {
  btn.addEventListener('click', () => {
    tampilkanToast('Fitur ekspor akan aktif setelah aplikasi terhubung ke backend.', 'info');
  });
});

/* ---------- Tautan "#" di pagination tidak menggulung halaman ke atas ---------- */
document.addEventListener('click', (e) => {
  const a = e.target.closest('.pagination a[href="#"]');
  if (a) e.preventDefault();
});

/* ---------- Toast dari parameter ?pesan= (mis. setelah simpan data di halaman form) ----------
   Hanya kunci yang terdaftar yang ditampilkan: teks dari URL tidak pernah dicetak langsung. */
const PESAN_TOAST = {
  'kegiatan-disimpan':   'Kegiatan berhasil disimpan.',
  'kegiatan-diperbarui': 'Kegiatan berhasil diperbarui.',
  'kegiatan-dihapus':    'Kegiatan berhasil dihapus.',
  'anggota-disimpan':    'Anggota berhasil disimpan.',
  'anggota-diperbarui':  'Anggota berhasil diperbarui.',
};
(function () {
  const url = new URL(window.location.href);
  const kunci = url.searchParams.get('pesan');
  if (kunci === null) return;
  if (Object.prototype.hasOwnProperty.call(PESAN_TOAST, kunci)) tampilkanToast(PESAN_TOAST[kunci], 'sukses');
  url.searchParams.delete('pesan');                  // supaya toast tidak muncul lagi saat halaman dimuat ulang
  try { history.replaceState(null, '', url.pathname + url.search + url.hash); } catch (e) { /* abaikan */ }
})();