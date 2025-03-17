<template>
  <div class="history">
    <AppNavbar />
  <div class="container mt-6">
    <h2 class="mb-3 text-center">Daftar Peminjaman</h2>

    <div v-if="loading" class="alert alert-info text-center">Memuat data...</div>
    <div v-if="error" class="alert alert-danger text-center">{{ error }}</div>

    <div v-if="peminjamanDikembalikan.length">
      <div v-for="(item) in peminjamanDikembalikan" :key="item.id_peminjaman" class="peminjaman-item">
        <div class="card" @click="goToDetail(item)">
          <div class="row no-gutters">
            <div class="col-md-3 d-flex justify-content-center align-items-center">
              <img
                :src="(item.buku?.gambar) ? ((item.buku?.gambar).startsWith('http') ? (item.buku?.gambar) : `http://localhost:8080/${(item.buku?.gambar)}`) : 'default.jpg'"
                :alt="item.judul || 'Gambar Tidak Tersedia'"
                class="gambar-buku"
              />
            </div>
            <div class="col-md-9">
              <div class="card-body">
                <h5 class="card-title">{{ item.buku ? item.buku.judul : 'Data buku tidak tersedia' }}</h5>
                <p class="card-text"><strong>Tanggal Pinjam:</strong> {{ formatTanggal(item.tanggal_pinjam) }}</p>
                <p class="card-text"><strong>Tanggal Kembali:</strong> {{ formatTanggal(item.tanggal_kembali) }}</p>
                <p class="card-text">
                  <strong>Status:</strong>
                  <span class="badge bg-success">Dikembalikan</span>
                </p>
                <button class="btn btn-danger mt-2" @click="hapusPeminjaman(item.id_peminjaman)">
                  Hapus Riwayat
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="!loading" class="alert alert-warning text-center">Tidak ada peminjaman yang dikembalikan.</div>
  </div>
</div>
</template>

<script>
import { getPeminjamanByUserId, deletePeminjamanByUser } from '~/api/peminjaman';
import Footer from '~/components/Footer.vue';

export default {
  layout:'blank',
  components :{
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
  computed: {
    // Filter hanya peminjaman yang statusnya "dikembalikan"
    peminjamanDikembalikan() {
      return this.peminjaman.filter(item => item.status === 'dikembalikan');
    }
  },
  methods: {
    async ambilDataPeminjaman() {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user?.id) throw new Error('User tidak ditemukan di local storage');

        const response = await getPeminjamanByUserId(user.id);
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
    goToDetail(item) {
    if (item && item.id_buku) {
      this.$router.push({ name: 'detail-buku', params: { id_buku: item.id_buku } });
    }
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
