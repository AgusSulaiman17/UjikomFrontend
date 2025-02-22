<template>
  <div class="container mt-4">
    <h2 class="mb-3 text-center">Daftar Peminjaman</h2>

    <!-- Tampilkan loading saat data sedang diambil -->
    <div v-if="loading" class="alert alert-info text-center">Memuat data...</div>

    <!-- Tampilkan error jika terjadi kesalahan -->
    <div v-if="error" class="alert alert-danger text-center">{{ error }}</div>

    <!-- Jika ada data peminjaman -->
    <div v-if="peminjaman.length">
      <div v-for="(item) in peminjaman" :key="item.id_peminjaman" class="peminjaman-item">
        <div class="card shadow-sm">
          <div class="row no-gutters">
            <div class="col-md-3 d-flex justify-content-center align-items-center">
              <img
                :src="(item.buku?.gambar) ? ((item.buku?.gambar).startsWith('http') ? (item.buku?.gambar): `http://localhost:8080/${(item.buku?.gambar)}`) : 'default.jpg'"
                :alt="item.judul || 'Gambar Tidak Tersedia'"
                class="gambar-buku"
              />
            </div>
            <div class="col-md-9">
              <div class="card-body">
                <h5 class="card-title">{{ item.buku ? item.buku.judul : 'Data buku tidak tersedia' }}</h5>
                <p class="card-text">
                  <strong>Tanggal Pinjam:</strong> {{ formatTanggal(item.tanggal_pinjam) }}
                </p>
                <p class="card-text">
                  <strong>Tanggal Kembali:</strong> {{ item.status_kembali ? formatTanggal(item.tanggal_kembali) : 'Belum dikembalikan' }}
                </p>
                <p class="card-text">
                  <strong>Status:</strong>
                  <span :class="getStatusClass(item.status)">{{ item.status }}</span>
                </p>
                <button class="btn btn-danger mt-2" @click="hapusPeminjaman(item.id_peminjaman)">
                  Hapus Peminjaman
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Jika tidak ada data -->
    <div v-else-if="!loading" class="alert alert-warning text-center">Tidak ada data peminjaman.</div>
  </div>
</template>

<script>
import { getPeminjamanByUserId, deletePeminjamanByUser } from '~/api/peminjaman';

export default {
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
        console.log("User dari local storage:", user);

        const idUser = user?.id || '';
        if (!idUser) throw new Error('User tidak ditemukan di local storage');

        const response = await getPeminjamanByUserId(idUser);
        console.log("Data peminjaman:", response);

        this.peminjaman = Array.isArray(response.data) ? response.data : [];

      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },
    async hapusPeminjaman(id) {
      if (!confirm('Apakah kamu yakin ingin menghapus peminjaman ini?')) return;

      try {
        await deletePeminjamanByUser(id);
        this.peminjaman = this.peminjaman.filter(item => item.id_peminjaman !== id);
        alert('Peminjaman berhasil dihapus');
      } catch (error) {
        alert(error.message);
      }
    },
    formatTanggal(tanggal) {
      return new Date(tanggal).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    },
    getStatusClass(status) {
      return {
        'badge bg-success': status === 'dikembalikan',
        'badge bg-warning text-dark': status === 'dipinjam',
        'badge bg-danger': status === 'terlambat'
      };
    }
  }
};
</script>

<style scoped>
/* Container Styling */
.container {
  max-width: 1200px;
}

/* Style untuk setiap item peminjaman */
.peminjaman-item {
  margin-bottom: 15px;
}

.card {
  border: none;
  border-radius: 10px;
  overflow: hidden;
  transition: transform 0.2s ease-in-out;
}

.card:hover {
  transform: scale(1.02);
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.15);
}

.gambar-buku {
  width: 100px;
  height: 150px;
  object-fit: cover;
  border-radius: 5px;
}

/* Status Styling */
.badge {
  padding: 5px 10px;
  font-size: 14px;
  border-radius: 5px;
}
</style>
