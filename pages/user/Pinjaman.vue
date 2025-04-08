<template>
  <div class="Pinjaman">
    <AppNavbar />
    <div class="container mt-6">
      <h2 class="mb-3 text-center">Daftar Peminjaman</h2>

      <!-- Tampilkan loading saat data sedang diambil -->
      <div v-if="loading" class="alert alert-info text-center">Memuat data...</div>

      <!-- Tampilkan error jika terjadi kesalahan -->
      <div v-if="error" class="alert alert-danger text-center">{{ error }}</div>

      <!-- Jika ada data peminjaman -->
      <div v-if="peminjaman.length">
        <div v-for="(item) in peminjaman" :key="item.id_peminjaman" class="peminjaman-item card-shadow">
          <div class="card shadow-sm">
            <div class="row no-gutters">
              <div class="col-md-3 d-flex justify-content-center align-items-center">
                <img
                  :src="(item.buku?.gambar) ? ((item.buku?.gambar).startsWith('http') ? (item.buku?.gambar) : `http://localhost:8080/${(item.buku?.gambar)}`) : 'default.jpg'"
                  :alt="item.judul || 'Gambar Tidak Tersedia'" class="gambar-buku" />
              </div>
              <div class="col-md-9">
                <div class="card-body">
                  <h5 class="card-title">{{ item.buku ? item.buku.judul : 'Data buku tidak tersedia' }}</h5>
                  <p class="card-text">
                    <strong>Tanggal Pinjam:</strong> {{ formatTanggal(item.tanggal_pinjam) }}
                  </p>
                  <p class="card-text">
                    <strong>Tanggal Pengembalian:</strong> {{ hitungTanggalKembali(item.tanggal_pinjam) }}
                  </p>
                  <div v-if="telatKembali(item.tanggal_pinjam)" class="denda-alert">
                    <strong>⚠️ Telat mengembalikan!</strong><br>
                    Denda dikenakan sebesar <strong>Rp3.000 / hari</strong><br>
                    <span>Total denda saat ini: <strong>Rp{{ hitungDenda(item.tanggal_pinjam).toLocaleString('id-ID')
                        }}</strong></span>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Jika tidak ada data -->
      <div v-else-if="!loading" class="alert alert-warning text-center">Tidak ada peminjaman yang disetujui.</div>
    </div>
  </div>
</template>

<script>
import { getPeminjamanByUserId } from '~/api/peminjaman';
import Footer from '~/components/Footer.vue';

export default {
  layout: 'blank',
  components: {
    Footer
  },
  data() {
    return {
      peminjaman: [],
      error: null,
      loading: true
    };
  },
  async mounted() {
    await this.ambilDataPeminjaman();
  },
  methods: {
    async ambilDataPeminjaman() {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const idUser = user?.id || '';
        if (!idUser) throw new Error('User tidak ditemukan di local storage');

        const response = await getPeminjamanByUserId(idUser);
        this.peminjaman = Array.isArray(response.data)
          ? response.data.filter(item => item.status === 'disetujui')
          : [];
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },
    formatTanggal(tanggal) {
      return new Date(tanggal).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    },
    hitungTanggalKembali(tanggalPinjam) {
      const tanggal = new Date(tanggalPinjam);
      tanggal.setDate(tanggal.getDate() + 5); // Tambah 5 hari
      return this.formatTanggal(tanggal);
    },
    telatKembali(tanggalPinjam) {
      const tanggalKembali = new Date(tanggalPinjam);
      tanggalKembali.setDate(tanggalKembali.getDate() + 5);
      const hariIni = new Date();
      return hariIni > tanggalKembali;
    },
    hitungDenda(tanggalPinjam) {
      const tanggalKembali = new Date(tanggalPinjam);
      tanggalKembali.setDate(tanggalKembali.getDate() + 5);
      const hariIni = new Date();

      if (hariIni <= tanggalKembali) return 0;

      const selisihMs = hariIni - tanggalKembali;
      const selisihHari = Math.floor(selisihMs / (1000 * 60 * 60 * 24));
      return selisihHari * 3000;
    }
  }
};
</script>

<style scoped>
.container {
  max-width: 1200px;
}

.peminjaman-item {
  margin-bottom: 15px;
}

.card {
  border: none;
  border-radius: 10px;
  overflow: hidden;
  transition: transform 0.2s ease-in-out;
}

.gambar-buku {
  width: 100px;
  height: 150px;
  object-fit: cover;
  border-radius: 5px;
}

.denda-alert {
  background-color: #ffe2e2;
  border-left: 5px solid #dc3545;
  padding: 1rem;
  margin-top: 1rem;
  border-radius: 8px;
  color: #a30000;
  font-weight: bold;
  font-size: 0.95rem;
  animation: pulse 1s ease-in-out infinite alternate;
}

@keyframes pulse {
  from {
    transform: scale(1);
  }

  to {
    transform: scale(1.01);
  }
}

.font-weight-bold {
  font-weight: bold;
}
</style>
