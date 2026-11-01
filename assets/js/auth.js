/* auth.js — perilaku bersama halaman Login & Register */

// Tampilkan / sembunyikan kata sandi.
// Pakai: <button data-toggle-password="#idInput"> berisi <i class="fa-solid fa-eye">
document.querySelectorAll('[data-toggle-password]').forEach((btn) => {
  const input = document.querySelector(btn.dataset.togglePassword);
  const icon = btn.querySelector('i');
  if (!input) return;

  btn.addEventListener('click', () => {
    const tampil = input.type === 'password';
    input.type = tampil ? 'text' : 'password';
    icon.classList.toggle('fa-eye', !tampil);
    icon.classList.toggle('fa-eye-slash', tampil);
    btn.setAttribute('aria-pressed', String(tampil));
    btn.setAttribute('aria-label', tampil ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi');
  });
});

/* ---------- Helper validasi bersama (Login & Register) ----------
   Pesan error tampil lewat kelas .is-shown (lihat style.css). */
function tandaiInvalid(input, feedback, pesan) {
  input.classList.add('is-invalid');
  input.setAttribute('aria-invalid', 'true');
  if (pesan) feedback.textContent = pesan;
  feedback.classList.add('is-shown');
}
function bersihkanInvalid(input, feedback) {
  input.classList.remove('is-invalid');
  input.removeAttribute('aria-invalid');
  feedback.classList.remove('is-shown');
}