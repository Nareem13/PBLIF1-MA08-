/* =====================================================================
   Rekap Kegiatan (admin-rekap.html) — FR-07
   Data di bawah DUMMY (Mei–Okt 2026: 38 kegiatan, 412 peserta; rincian per kategori
   sesuai halaman Kategori). Ganti DATA dengan respons backend nanti.
   Filter diterapkan lewat tombol "Terapkan"; angka memakai format Indonesia.
   ===================================================================== */
(function () {
  'use strict';

  const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const BULAN_PENDEK = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const ROMAWI = ['I', 'II', 'III', 'IV'];
  const KATEGORI = ['Rapat', 'Pelatihan', 'Sosial', 'Olahraga', 'Lainnya', 'Keagamaan'];

  // DATA[tahun][indeksBulan][kategori] = [jumlahKegiatan, jumlahPeserta]
  const DATA = {
    2026: {
      4: { Rapat: [2, 20], Pelatihan: [1, 12], Sosial: [1, 10], Olahraga: [1, 10] },                    // Mei  5 / 52
      5: { Rapat: [3, 30], Pelatihan: [1, 14], Sosial: [1, 10], Olahraga: [1, 10] },                    // Jun  6 / 64
      6: { Rapat: [3, 33], Pelatihan: [2, 24], Sosial: [1, 11], Olahraga: [1, 10] },                    // Jul  7 / 78
      7: { Rapat: [2, 22], Pelatihan: [2, 24], Sosial: [1, 12], Lainnya: [1, 12] },                     // Agu  6 / 70
      8: { Rapat: [2, 24], Pelatihan: [2, 26], Sosial: [3, 30], Olahraga: [1, 10] },                    // Sep  8 / 90
      9: { Rapat: [2, 20], Pelatihan: [1, 12], Sosial: [1, 10], Lainnya: [2, 16] },                     // Okt  6 / 58
    },
  };

  const $ = (id) => document.getElementById(id);
  const angka = (n) => n.toLocaleString('id-ID');
  const desimal = (n) => n.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  /* ---------- Hitung ---------- */
  function totalBulan(tahun, bulan, kategori) {
    const b = (DATA[tahun] || {})[bulan] || {};
    return Object.entries(b)
      .filter(([k]) => !kategori || k === kategori)
      .reduce((s, [, v]) => [s[0] + v[0], s[1] + v[1]], [0, 0]);
  }

  function hitung(f) {
    const bulan = [];
    for (let m = f.dari; m <= f.sampai; m++) {
      const [k, p] = totalBulan(f.tahun, m, f.kategori);
      bulan.push({ m, k, p });
    }
    let periode;
    if (f.jenis === 'bulan') {
      periode = bulan.map((b) => ({ label: `${BULAN_PENDEK[b.m]} ${f.tahun}`, pendek: BULAN_PENDEK[b.m], k: b.k, p: b.p }));
    } else if (f.jenis === 'triwulan') {
      const peta = new Map();
      bulan.forEach((b) => {
        const q = Math.floor(b.m / 3);
        const g = peta.get(q) || { label: `Triwulan ${ROMAWI[q]} ${f.tahun}`, pendek: `TW ${ROMAWI[q]}`, k: 0, p: 0 };
        g.k += b.k; g.p += b.p; peta.set(q, g);
      });
      periode = [...peta.values()];
    } else {
      periode = [{ label: String(f.tahun), pendek: String(f.tahun), k: bulan.reduce((s, b) => s + b.k, 0), p: bulan.reduce((s, b) => s + b.p, 0) }];
    }
    const totK = bulan.reduce((s, b) => s + b.k, 0);
    const totP = bulan.reduce((s, b) => s + b.p, 0);
    // bulan tersibuk: kegiatan terbanyak, seri → peserta terbanyak, seri → lebih awal
    const sibuk = bulan.filter((b) => b.k > 0).sort((a, b) => b.k - a.k || b.p - a.p || a.m - b.m)[0] || null;
    return { periode, totK, totP, sibuk };
  }

  function teksPeriode(f) {
    const rentang = f.dari === f.sampai ? `${BULAN_PENDEK[f.dari]} ${f.tahun}` : `${BULAN_PENDEK[f.dari]} – ${BULAN_PENDEK[f.sampai]} ${f.tahun}`;
    return f.kategori ? `${f.kategori} · ${rentang}` : rentang;
  }

  /* ---------- Tampilan ---------- */
  let grafik = null;
  let filterAktif = null;
  let adaData = true;

  function el(tag, kelas, teks) { const e = document.createElement(tag); if (kelas) e.className = kelas; if (teks !== undefined) e.textContent = teks; return e; }

  function gambarGrafik(periode) {
    const kotak = $('kotakGrafik'); const pesan = $('grafikPesan');
    if (grafik) { grafik.destroy(); grafik = null; }
    if (!adaData) { kotak.hidden = true; pesan.hidden = false; pesan.textContent = 'Belum ada kegiatan pada periode ini.'; return; }
    if (typeof Chart === 'undefined') { kotak.hidden = true; pesan.hidden = false; pesan.textContent = 'Grafik tidak dapat dimuat. Data tersedia pada tabel di bawah.'; return; }
    kotak.hidden = false; pesan.hidden = true;
    const kurangiGerak = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    grafik = new Chart($('grafikRekap'), {
      type: 'bar',
      data: {
        labels: periode.map((x) => x.pendek),
        datasets: [
          { label: 'Kegiatan', data: periode.map((x) => x.k), backgroundColor: '#0d6efd', borderRadius: 3, maxBarThickness: 26, yAxisID: 'y' },
          { label: 'Peserta',  data: periode.map((x) => x.p), backgroundColor: '#adb5bd', borderRadius: 3, maxBarThickness: 26, yAxisID: 'y1' },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        animation: kurangiGerak ? false : { duration: 300 },
        plugins: { legend: { display: false } },        // legenda HTML di header kartu
        scales: {                                      // dua skala tersembunyi: batang kegiatan & peserta sama-sama terbaca
          x:  { grid: { display: false }, border: { display: false }, ticks: { color: '#5c636a', font: { size: 11 } } },
          y:  { display: false, beginAtZero: true, suggestedMax: Math.max(...periode.map((x) => x.k)) * 1.15 },
          y1: { display: false, beginAtZero: true, suggestedMax: Math.max(...periode.map((x) => x.p)) * 1.15 },
        },
      },
    });
  }

  function tampilkan(f) {
    filterAktif = f;
    const h = hitung(f);
    adaData = h.totK > 0;
    const jenisNama = { bulan: 'Bulan', triwulan: 'Triwulan', tahun: 'Tahun' }[f.jenis];

    $('statKegiatan').textContent = angka(h.totK);
    $('capKegiatan').textContent = teksPeriode(f);
    $('statPeserta').textContent = angka(h.totP);
    $('statRata').textContent = adaData ? desimal(h.totP / h.totK) : '–';
    $('statSibuk').textContent = h.sibuk ? BULAN[h.sibuk.m] : '–';
    $('capSibuk').textContent = h.sibuk ? `${angka(h.sibuk.k)} kegiatan` : 'Belum ada data';

    $('judulTabel').textContent = `Rekap per ${jenisNama}`;
    $('captionRekap').textContent = `Rekap kegiatan per ${jenisNama.toLowerCase()}, ${teksPeriode(f)}`;
    const tbody = $('tabelRekap');
    tbody.replaceChildren();
    if (adaData) {
      h.periode.forEach((x) => {
        const tr = el('tr');
        const th = el('th', '', x.label); th.scope = 'row';
        tr.append(th, el('td', '', angka(x.k)), el('td', '', angka(x.p)), el('td', '', x.k ? desimal(x.p / x.k) : '–'));
        tbody.appendChild(tr);
      });
    } else {
      const tr = el('tr', 'tabel-kosong');
      const td = el('td', '', 'Belum ada kegiatan pada periode yang dipilih'); td.colSpan = 4;
      tr.appendChild(td); tbody.appendChild(tr);
    }
    $('totalRekap').hidden = !adaData;
    $('totKegiatan').textContent = angka(h.totK);
    $('totPeserta').textContent = angka(h.totP);
    $('totRata').textContent = adaData ? desimal(h.totP / h.totK) : '–';

    gambarGrafik(h.periode);
    aturEkspor();
    $('statusRekap').textContent = adaData
      ? `Rekap diperbarui: ${angka(h.totK)} kegiatan dan ${angka(h.totP)} peserta, ${teksPeriode(f)}.`
      : `Rekap diperbarui: tidak ada kegiatan pada ${teksPeriode(f)}.`;
  }

  const tooltipSiap = () => typeof bootstrap !== 'undefined' && !!bootstrap.Tooltip && typeof bootstrap.Tooltip.getInstance === 'function';

  /* ---------- Ekspor (simulasi; mengikuti filter aktif) ---------- */
  function aturEkspor() {
    [['wrapPdf', 'btnPdf'], ['wrapExcel', 'btnExcel']].forEach(([w, b]) => {
      const wrap = $(w); const btn = $(b);
      btn.disabled = !adaData;
      if (!adaData) {
        wrap.tabIndex = 0;
        wrap.setAttribute('data-bs-toggle', 'tooltip');
        wrap.setAttribute('data-bs-title', 'Tidak ada data untuk diekspor.');
        if (tooltipSiap() && !bootstrap.Tooltip.getInstance(wrap)) new bootstrap.Tooltip(wrap);
      } else {
        wrap.removeAttribute('tabindex'); wrap.removeAttribute('data-bs-toggle'); wrap.removeAttribute('data-bs-title');
        if (tooltipSiap()) { const t = bootstrap.Tooltip.getInstance(wrap); if (t) t.dispose(); }
      }
    });
  }
  [['btnPdf', 'PDF'], ['btnExcel', 'Excel']].forEach(([id, jenis]) => {
    $(id).addEventListener('click', () => {
      tampilkanToast(`Ekspor ${jenis} (${teksPeriode(filterAktif)}) akan aktif setelah aplikasi terhubung ke backend.`, 'info');
    });
  });

  /* ---------- Filter ---------- */
  function bacaFilter() {
    return {
      jenis: document.querySelector('input[name="jenis"]:checked').value,
      tahun: Number($('filterTahun').value),
      dari: Number($('filterDari').value),
      sampai: Number($('filterSampai').value),
      kategori: $('filterKategori').value,
    };
  }

  $('formRekap').addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = $('btnTerapkan');
    if (btn.disabled) return;
    const f = bacaFilter();
    const sampai = $('filterSampai');
    if (f.dari > f.sampai) {                          // rentang terbalik
      sampai.classList.add('is-invalid'); sampai.setAttribute('aria-invalid', 'true'); sampai.focus();
      return;
    }
    sampai.classList.remove('is-invalid'); sampai.removeAttribute('aria-invalid');

    btn.disabled = true; btn.setAttribute('aria-busy', 'true'); btn.textContent = 'Memuat...';
    // TODO backend: ambil data sesuai filter. Di sini hanya jeda singkat untuk mensimulasikan pemuatan.
    setTimeout(() => {
      try { tampilkan(f); }
      finally { btn.disabled = false; btn.removeAttribute('aria-busy'); btn.textContent = 'Terapkan'; }   // tombol selalu kembali aktif
    }, 350);
  });

  ['filterDari', 'filterSampai'].forEach((id) => $(id).addEventListener('change', () => {
    const s = $('filterSampai');
    if (Number($('filterDari').value) <= Number(s.value)) { s.classList.remove('is-invalid'); s.removeAttribute('aria-invalid'); }
  }));

  tampilkan(bacaFilter());
})();