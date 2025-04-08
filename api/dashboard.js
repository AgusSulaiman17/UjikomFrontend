import { getAllBuku } from "@/api/buku";
import { getAllPeminjaman } from "@/api/peminjaman";
import { getAllKategori } from "@/api/kategori";

export const getChartData = async ({ month = '' }) => {
  try {
    const [bukuRes, kategoriRes, peminjamanRes] = await Promise.all([
      getAllBuku(),
      getAllKategori(),
      getAllPeminjaman(),
    ]);

    const buku = bukuRes.data || [];
    const kategori = kategoriRes.data || [];
    const peminjaman = peminjamanRes.data || [];

    const allMonths = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    // === Pie Chart: Genre (Kategori) ===
    // Menghitung jumlah peminjaman untuk setiap genre (berdasarkan kategori yang ada di database)
    const genreCountTemp = {};
    peminjaman.forEach(item => {
      const bukuDipinjam = buku.find(b => b.id_buku === item.id_buku);
      if (!bukuDipinjam) return;

      const kat = kategori.find(k => k.id === bukuDipinjam.id_kategori);
      const genreName = kat ? kat.kategori : "Tidak diketahui";

      const date = new Date(item.tanggal_pinjam);
      if (isNaN(date)) return;

      const rawMonth = date.toLocaleString('id-ID', { month: 'long' });
      const itemMonth = rawMonth.charAt(0).toUpperCase() + rawMonth.slice(1);

      // Jika ada filter bulan, hanya ambil data untuk bulan tersebut
      if (month && itemMonth !== month) return;

      genreCountTemp[genreName] = (genreCountTemp[genreName] || 0) + 1;
    });

    // Untuk memastikan semua kategori dari database tampil,
    // kita ambil daftar kategori secara eksplisit
    const allCategories = kategori.map(k => k.kategori);
    const genreLabels = allCategories;
    const genreValues = allCategories.map(label => genreCountTemp[label] || 0);

    // === Line Chart: Peminjaman per Buku ===
    const lineLabels = month ? [month] : allMonths;
    const groupByBook = {};
    lineLabels.forEach(monthName => {
      groupByBook[monthName] = {};
    });

    peminjaman.forEach(item => {
      const date = new Date(item.tanggal_pinjam);
      if (isNaN(date)) return;

      const rawMonth = date.toLocaleString('id-ID', { month: 'long' });
      const itemMonth = rawMonth.charAt(0).toUpperCase() + rawMonth.slice(1);

      if (month && itemMonth !== month) return;

      const bukuDipinjam = buku.find(b => b.id_buku === item.id_buku);
      const judul = bukuDipinjam ? bukuDipinjam.judul : 'Tidak diketahui';

      if (!groupByBook[itemMonth]) groupByBook[itemMonth] = {};
      groupByBook[itemMonth][judul] = (groupByBook[itemMonth][judul] || 0) + 1;
    });

    const lineDatasetsObj = {};
    lineLabels.forEach(monthName => {
      const bukuObj = groupByBook[monthName];
      Object.entries(bukuObj).forEach(([judul, count]) => {
        if (!lineDatasetsObj[judul]) {
          lineDatasetsObj[judul] = Array(lineLabels.length).fill(0);
        }
        const index = lineLabels.indexOf(monthName);
        lineDatasetsObj[judul][index] = count;
      });
    });

    const peminjamanChartData = {
      labels: lineLabels,
      datasets: Object.entries(lineDatasetsObj).map(([judul, data]) => ({
        label: judul,
        data,
        fill: false,
        borderColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`,
        tension: 0.3
      }))
    };

    // === Bar Chart: Total Semua Peminjaman per Bulan ===
    const barLabels = month ? [month] : allMonths;
    const totalPeminjamanPerBulan = {};
    barLabels.forEach(m => totalPeminjamanPerBulan[m] = 0);

    peminjaman.forEach(item => {
      const date = new Date(item.tanggal_pinjam);
      if (isNaN(date)) return;

      const rawMonth = date.toLocaleString('id-ID', { month: 'long' });
      const itemMonth = rawMonth.charAt(0).toUpperCase() + rawMonth.slice(1);

      if (month && itemMonth !== month) return;

      totalPeminjamanPerBulan[itemMonth] = (totalPeminjamanPerBulan[itemMonth] || 0) + 1;
    });

    const barValues = barLabels.map(monthName => totalPeminjamanPerBulan[monthName] || 0);

    const bukuChartData = {
      labels: barLabels,
      datasets: [{
        label: 'Total Peminjaman Semua Buku',
        data: barValues,
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    };

    return {
      genre: {
        labels: genreLabels,
        values: genreValues,
      },
      peminjaman: peminjamanChartData,
      buku: bukuChartData
    };
  } catch (error) {
    console.error("Gagal mengambil data grafik:", error);
    return {
      genre: { labels: [], values: [] },
      peminjaman: { labels: [], datasets: [] },
      buku: { labels: [], datasets: [] },
    };
  }
};
