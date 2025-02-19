<template>
  <div class="container mt-5">
    <AppNavbar />

    <h2 class="text-center mb-4 mt-6">Daftar Buku Favorit</h2>

    <div v-if="loading" class="text-center">
      <p>Memuat data...</p>
    </div>

    <div v-else-if="favorit.length === 0" class="text-center">
      <p>Belum ada buku favorit.</p>
    </div>

    <div v-else class="row">
      <div v-for="item in favorit" :key="item.buku?.id_buku" class="col-md-4 mb-4">
        <div class="card card-shadow">
          <img
            :src="item.buku?.gambar ? (item.buku.gambar.startsWith('http') ? item.buku.gambar : `http://localhost:8080/${item.buku.gambar}`) : 'default.jpg'"
            class="card-img-top"
            :alt="item.buku?.judul || 'Gambar Tidak Tersedia'"
          />
          <div class="card-body">
            <h5 class="card-title">{{ item.buku?.judul || 'Judul Tidak Tersedia' }}</h5>
            <p class="card-text"><strong>Penulis:</strong> {{ item.buku?.penulis?.nama || 'Tidak diketahui' }}</p>
            <p class="card-text"><strong>Penerbit:</strong> {{ item.buku?.penerbit?.nama || 'Tidak diketahui' }}</p>

            <button
              class="btn btn-danger w-100"
              @click="hapusFavorit(item.buku?.id_buku)"
              :disabled="!item.buku"
            >
              Hapus dari Favorit
            </button>
          </div>
        </div>
      </div>
    </div>

    <button class="btn btn-dark mt-4" @click="$router.push('/user/listbuku')">Kembali ke Daftar Buku</button>
  </div>
</template>

<script>
import { getFavoritByUser, deleteFavorit } from "@/api/favorit";
import AppNavbar from "~/components/AppNavbar.vue";

export default {
  layout:'blank',
  name: "FavoritBuku",
  components: {
    AppNavbar,
  },
  data() {
    return {
      favorit: [],
      loading: true,
    };
  },
  async mounted() {
    this.ambilDataFavorit();
  },
  methods: {
    async ambilDataFavorit() {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.id) {
        this.$toast.error("User belum login!");
        this.loading = false;
        return;
      }

      try {
        const response = await getFavoritByUser(user.id);
        console.log("Data dari API:", response); // Debugging

        if (response && Array.isArray(response.data)) {
          this.favorit = response.data;
        } else if (Array.isArray(response)) {
          this.favorit = response;
        } else {
          this.favorit = [];
        }
      } catch (error) {
        console.error("Error mengambil data favorit:", error);
        this.$toast.error(error.message || "Gagal mengambil data favorit.");
      } finally {
        this.loading = false;
      }
    },
    async hapusFavorit(idBuku) {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.id) {
        this.$toast.error("User belum login!");
        return;
      }

      try {
        await deleteFavorit(user.id, idBuku);
        this.favorit = this.favorit.filter(item => item.buku?.id_buku !== idBuku);
        this.$toast.success("Buku dihapus dari favorit.");
      } catch (error) {
        console.error("Error menghapus favorit:", error);
        this.$toast.error(error.message || "Gagal menghapus dari favorit.");
      }
    },
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
