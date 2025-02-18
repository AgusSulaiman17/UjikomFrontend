<template>
  <div class="container d-flex justify-content-center">
    <AppNavbar />
    <div class="card detail-card mt-6">
      <div class="row no-gutters">
        <!-- Kolom untuk Gambar -->
        <div class="col-md-4 d-flex align-items-center justify-content-center p-3">
          <img
            v-if="buku.gambar"
            :src="buku.gambar.startsWith('http') ? buku.gambar : `http://localhost:8080/${buku.gambar}`"
            :alt="buku.judul"
            class="img-fluid rounded shadow"
          />
        </div>

        <!-- Kolom untuk Detail Buku -->
        <div class="col-md-8 p-4 d-flex flex-column justify-content-center">
          <h2 class="card-title text-uppercase font-weight-bold">{{ buku.judul || "Judul Buku" }}</h2>
          <p><strong>Penulis:</strong> {{ buku.penulis?.nama || "Tidak diketahui" }}</p>
          <p><strong>Penerbit:</strong> {{ buku.penerbit?.nama || "Tidak diketahui" }}</p>
          <p><strong>Kategori:</strong> {{ buku.kategori?.nama || "Tidak diketahui" }}</p>
          <p class="text-muted">{{ buku.deskripsi || "Tidak ada deskripsi yang tersedia." }}</p>
          <button class="btn btn-dark mt-3 w-50" @click="$router.push('/user/listbuku')">Kembali</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getBukuById } from "@/api/buku";
import AppNavbar from "~/components/AppNavbar.vue";

export default {
  layout:'blank',
  name: "DetailBuku",
  components:{
    AppNavbar
  },
  data() {
    return {
      buku: {},
      error: null,
      loading: true,
    };
  },
  async mounted() {
    const idBuku = this.$route.params.id_buku;

    if (!idBuku) {
      this.error = "ID buku tidak ditemukan.";
      this.loading = false;
      return;
    }

    try {
      const response = await getBukuById(idBuku);
      if (!response.data) {
        throw new Error("Buku tidak ditemukan.");
      }
      this.buku = response.data;
    } catch (error) {
      this.error = error.message || "Gagal memuat detail buku.";
      console.error("Error:", error);
    } finally {
      this.loading = false;
    }
  },
};
</script>

<style scoped>
.detail-card {
  width: 900px;
  background: #fff;
  border: 6px solid #000;
  box-shadow: 12px 12px 0 #000;
  transition: transform 0.3s, box-shadow 0.3s;
}

.detail-card:hover {
  transform: translate(-5px, -5px);
  box-shadow: 15px 15px 0 #000;
}

.img-fluid {
  max-height: 350px;
  object-fit: cover;
}
</style>
