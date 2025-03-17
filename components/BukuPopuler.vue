<template>
  <div class="container mt-5">
    <h2 class="text-center mb-4">3 Buku Terpopuler</h2>

    <div v-if="loading" class="text-center">
      <p>Memuat data...</p>
    </div>

    <div v-else-if="bukuTerbanyak.length === 0" class="text-center">
      <p>Belum ada data peminjaman.</p>
    </div>

    <div v-else class="row">
      <div v-for="item in bukuTerbanyak" :key="item.id_buku" class="col-md-4 mb-4">
        <div class="card card-shadow" @click="goToDetail(item)">
          <img
            :src="item.gambar ? (item.gambar.startsWith('http') ? item.gambar : `http://localhost:8080/${item.gambar}`) : 'default.jpg'"
            class="card-img-top" :alt="item.judul || 'Gambar Tidak Tersedia'" />
          <div class="card-body">
            <h5 class="card-title">{{ item.judul || 'Judul Tidak Tersedia' }}</h5>
            <p class="card-text"><strong>Penulis:</strong> {{ item.penulis || 'Tidak diketahui' }}</p>
            <p class="card-text"><strong>Penerbit:</strong> {{ item.penerbit || 'Tidak diketahui' }}</p>
            <p class="card-text"><strong>Jumlah Dipinjam:</strong> {{ item.jumlahDipinjam }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getAllPeminjaman } from "@/api/peminjaman";

export default {
  name: "BukuPalingDipinjam",
  data() {
    return {
      bukuTerbanyak: [],
      loading: true,
    };
  },
  async mounted() {
    this.ambilDataPeminjaman();
  },
  methods: {
    async ambilDataPeminjaman() {
      try {
        const response = await getAllPeminjaman();
        console.log("Data Peminjaman:", response); // Debugging

        if (response && Array.isArray(response.data)) { // Akses `response.data`
          this.prosesDataPeminjaman(response.data);
        } else {
          this.bukuTerbanyak = [];
        }
      } catch (error) {
        console.error("Error mengambil data peminjaman:", error);
        this.$toast.error(error.message || "Gagal mengambil data peminjaman.");
      } finally {
        this.loading = false;
      }
    },
    prosesDataPeminjaman(data) {
      const bukuCount = {};

      data.forEach((peminjaman) => {
        const buku = peminjaman.buku;
        if (buku) {
          if (!bukuCount[buku.id_buku]) {
            bukuCount[buku.id_buku] = {
              id_buku: buku.id_buku,
              judul: buku.judul,
              penulis: buku.penulis?.nama || "Tidak diketahui",
              penerbit: buku.penerbit?.nama || "Tidak diketahui",
              gambar: buku.gambar,
              jumlahDipinjam: 0,
            };
          }
          bukuCount[buku.id_buku].jumlahDipinjam += 1;
        }
      });

      this.bukuTerbanyak = Object.values(bukuCount)
        .sort((a, b) => b.jumlahDipinjam - a.jumlahDipinjam)
        .slice(0, 3); // Ambil hanya 2 buku dengan jumlah pinjaman terbanyak
    }
    ,
    goToDetail(item) {
    if (item && item.id_buku) {
      this.$router.push({ name: 'detail-buku', params: { id_buku: item.id_buku } });
    }
  }
  },
};
</script>

<style scoped>
.card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.2);
}

.card-img-top {
  height: 200px;
  object-fit: cover;
}
</style>
