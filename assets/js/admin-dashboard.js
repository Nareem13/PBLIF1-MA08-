/* admin-dashboard.js — grafik Rekap per Periode (FR-07) di Dashboard Admin
   Data di bawah adalah DUMMY mengikuti desain Figma (Mei–Okt 2026).
   Total: 38 kegiatan, 412 peserta. Ganti DATA dengan respons backend nanti. */

const DATA = {
  bulan: {
    label:    ['Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt'],
    kegiatan: [5, 6, 7, 6, 8, 6],
    peserta:  [52, 64, 78, 70, 90, 58],
  },
  // Triwulan: data dimulai Mei, sehingga TW II hanya memuat Mei–Jun
  triwulan: {
    label:    ['TW II (Mei–Jun)', 'TW III', 'TW IV (Okt)'],
    kegiatan: [11, 21, 6],
    peserta:  [116, 238, 58],
  },
  tahun: {
    label:    ['2026'],
    kegiatan: [38],
    peserta:  [412],
  },
};

const WARNA = { kegiatan: '#0d6efd', peserta: '#adb5bd' };   // sama dengan legenda

const elKegiatan = document.getElementById('rekapKegiatan');
const elPeserta  = document.getElementById('rekapPeserta');
const kanvas     = document.getElementById('grafikRekap');
const elGagal    = document.getElementById('grafikGagal');
const tbodyData  = document.querySelector('#tabelGrafik tbody');

const jumlah = (arr) => arr.reduce((a, b) => a + b, 0);
const formatAngka = (n) => n.toLocaleString('id-ID');

/* Tabel data (untuk pembaca layar & cadangan bila grafik gagal) */
function isiTabel(d) {
  tbodyData.replaceChildren();
  d.label.forEach((nama, i) => {
    const tr = document.createElement('tr');
    [nama, d.kegiatan[i], d.peserta[i]].forEach((v, k) => {
      const sel = document.createElement(k === 0 ? 'th' : 'td');
      if (k === 0) sel.scope = 'row';
      sel.textContent = String(v);
      tr.appendChild(sel);
    });
    tbodyData.appendChild(tr);
  });
}

function perbaruiRingkasan(d) {
  elKegiatan.textContent = formatAngka(jumlah(d.kegiatan));
  elPeserta.textContent  = formatAngka(jumlah(d.peserta));
}

/* Grafik */
let grafik = null;
function buatGrafik(d) {
  if (typeof Chart === 'undefined') {            // Chart.js gagal dimuat
    kanvas.classList.add('d-none');
    elGagal.classList.remove('d-none');
    const tabel = document.getElementById('tabelGrafik');
    tabel.classList.remove('visually-hidden');   // tampilkan tabel sebagai cadangan
    return;
  }
  const kurangiGerak = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  grafik = new Chart(kanvas, {
    type: 'bar',
    data: {
      labels: d.label,
      datasets: [
        { label: 'Kegiatan', data: d.kegiatan, backgroundColor: WARNA.kegiatan, borderRadius: 3, maxBarThickness: 18 },
        { label: 'Peserta',  data: d.peserta,  backgroundColor: WARNA.peserta,  borderRadius: 3, maxBarThickness: 18 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: kurangiGerak ? false : { duration: 300 },
      plugins: { legend: { display: false } },       // legenda memakai elemen HTML sendiri
      scales: {
        x: { grid: { display: false }, border: { display: false }, ticks: { color: '#5c636a', font: { size: 11 } } },
        y: { display: false, beginAtZero: true },
      },
    },
  });
}

function tampilkanPeriode(kunci) {
  const d = DATA[kunci];
  perbaruiRingkasan(d);
  isiTabel(d);
  if (grafik) {
    grafik.data.labels = d.label;
    grafik.data.datasets[0].data = d.kegiatan;
    grafik.data.datasets[1].data = d.peserta;
    grafik.update();
  }
}

document.querySelectorAll('input[name="periode"]').forEach((radio) => {
  radio.addEventListener('change', () => { if (radio.checked) tampilkanPeriode(radio.value); });
});

/* Awal: periode Bulan (grafik sudah dibuat dengan data ini, tak perlu update ulang) */
buatGrafik(DATA.bulan);
perbaruiRingkasan(DATA.bulan);
isiTabel(DATA.bulan);