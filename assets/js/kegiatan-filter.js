/* kegiatan-filter.js — filter tabel kegiatan (FR-05, FR-06), dipakai Dashboard Admin & Daftar Kegiatan
   Kebutuhan HTML:
     form#formFilter dengan field name: cari, kategori, tanggal, pic, status
       - status boleh berupa <select> (Dashboard) atau <input type="hidden"> yang digerakkan pill (Daftar)
     tbody#tabelKegiatan berisi <tr data-baris data-kategori data-status data-pic data-tanggal>
     tr#barisKosong (hidden) dan elemen #infoJumlah (opsional)
     pill status (opsional): <button data-pill-status="berlangsung"> ("" = Semua) */
(function () {
  const form = document.getElementById('formFilter');
  const tbody = document.getElementById('tabelKegiatan');
  if (!form || !tbody) return;

  const kosong = document.getElementById('barisKosong');
  const info = document.getElementById('infoJumlah');
  const teksAwal = info ? info.textContent : '';
  const pills = [...document.querySelectorAll('[data-pill-status]')];
  const kolomStatus = form.elements['status'];

  function cocok(tr, f) {
    const nama = tr.querySelector('.td-nama').textContent.toLowerCase();
    if (f.cari && !nama.includes(f.cari.trim().toLowerCase())) return false;
    if (f.kategori && tr.dataset.kategori !== f.kategori) return false;
    if (f.status && tr.dataset.status !== f.status) return false;
    if (f.pic && tr.dataset.pic !== f.pic) return false;
    if (f.tanggal && tr.dataset.tanggal !== f.tanggal) return false;
    return true;
  }

  function terapkan() {
    const data = new FormData(form);
    const f = {
      cari: data.get('cari') || '', kategori: data.get('kategori') || '',
      tanggal: data.get('tanggal') || '', pic: data.get('pic') || '', status: data.get('status') || '',
    };
    const baris = [...tbody.querySelectorAll('tr[data-baris]')];
    let jumlah = 0;
    baris.forEach((tr) => {
      const ok = cocok(tr, f);
      tr.hidden = !ok;
      if (ok) jumlah += 1;
    });
    if (kosong) kosong.hidden = jumlah > 0;
    if (info) info.textContent = jumlah === baris.length ? teksAwal : `Menampilkan ${jumlah} kegiatan yang cocok`;
  }

  function aktifkanPill(nilai) {
    pills.forEach((p) => {
      const aktif = p.dataset.pillStatus === nilai;
      p.classList.toggle('active', aktif);
      p.setAttribute('aria-pressed', String(aktif));
    });
  }

  pills.forEach((p) => {
    p.addEventListener('click', () => {
      if (kolomStatus) kolomStatus.value = p.dataset.pillStatus;
      aktifkanPill(p.dataset.pillStatus);
      terapkan();
    });
  });

  form.addEventListener('submit', (e) => { e.preventDefault(); terapkan(); });
  form.addEventListener('reset', () => {
    setTimeout(() => {                                  // tunggu nilai form dikosongkan
      if (pills.length && kolomStatus) { kolomStatus.value = ''; aktifkanPill(''); }   // input hidden tidak ikut di-reset
      terapkan();
    }, 0);
  });
})();