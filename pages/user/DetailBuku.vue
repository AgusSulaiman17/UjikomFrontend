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
          <p><strong>Kategori:</strong> {{ buku.kategori?.kategori || "Tidak diketahui" }}</p>
          <p><strong>Jumlah:</strong> {{ buku.jumlah || "Tidak diketahui" }}</p>
          <p class="text-muted">{{ buku.deskripsi || "Tidak ada deskripsi yang tersedia." }}</p>

          <!-- Tombol Booking -->
          <button class="btn btn-success mt-3 w-50" @click="bookingBuku" :disabled="loadingBooking">
            {{ loadingBooking ? "Memproses..." : "Booking Buku" }}
          </button>

          <!-- Tombol Tambah/Hapus Favorit -->
          <button
            class="btn mt-3 w-50 favorit-btn"
            :class="{ 'btn-danger': isFavorit, 'btn-outline-danger': !isFavorit }"
            @click="toggleFavorit"
          >
            ♥ {{ isFavorit ? "Hapus dari Favorit" : "Tambah ke Favorit" }}
          </button>

          <!-- Tombol Kembali -->
          <button class="btn btn-dark mt-3 w-50" @click="$router.push('/user/listbuku')">Kembali</button>

          <!-- Notifikasi -->
          <div v-if="successMessage" class="alert alert-success mt-3">{{ successMessage }}</div>
          <div v-if="errorMessage" class="alert alert-danger mt-3">{{ errorMessage }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getBukuById } from "@/api/buku";
import { createBooking } from "@/api/peminjaman";
import { addFavorit, getFavoritByUser, deleteFavorit } from "@/api/favorit";
import AppNavbar from "~/components/AppNavbar.vue";

export default {
  layout: "blank",
  name: "DetailBuku",
  components: {
    AppNavbar,
  },
  data() {
    return {
      buku: {},
      error: null,
      loading: true,
      loadingBooking: false,
      isFavorit: false, // Menyimpan status favorit
      successMessage: "",
      errorMessage: "",
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

      // Cek apakah buku sudah ada di favorit
      this.checkFavorit();
    } catch (error) {
      this.error = error.message || "Gagal memuat detail buku.";
      console.error("Error:", error);
    } finally {
      this.loading = false;
    }
  },
  methods: {
    async bookingBuku() {
      this.successMessage = "";
      this.errorMessage = "";
      this.loadingBooking = true;

      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.id) {
        this.errorMessage = "User belum login!";
        this.$toast.error("User belum login!");
        this.loadingBooking = false;
        return;
      }

      const idUser = Number(user.id);
      const idBuku = Number(this.buku.id_buku);

      if (isNaN(idBuku)) {
        this.errorMessage = "ID Buku tidak valid!";
        this.$toast.error("ID Buku tidak valid!");
        this.loadingBooking = false;
        return;
      }

      const formData = new FormData();
      formData.append("id_user", idUser);
      formData.append("id_buku", idBuku);

      try {
        const response = await createBooking(formData);
        this.successMessage = response.message || "Booking berhasil!";
        this.$toast.success("Booking berhasil!");

        setTimeout(() => {
          this.$router.push("/user/booking");
        },);
      } catch (error) {
        this.errorMessage = error.message || "Gagal melakukan booking.";
        this.$toast.error(this.errorMessage);
      } finally {
        this.loadingBooking = false;
      }
    },
    async toggleFavorit() {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.id) {
        this.$toast.error("User belum login!");
        return;
      }

      const idUser = Number(user.id);
      const idBuku = Number(this.buku.id_buku);

      if (isNaN(idBuku)) {
        this.$toast.error("ID Buku tidak valid!");
        return;
      }

      try {
        if (this.isFavorit) {
          await deleteFavorit(idUser, idBuku);
          this.isFavorit = false;
          this.$toast.success("Dihapus dari favorit!");
        } else {
          await addFavorit({ id_user: idUser, id_buku: idBuku });
          this.isFavorit = true;
          this.$toast.success("Ditambahkan ke favorit!");
        }
      } catch (error) {
        this.$toast.error(error.message || "Gagal memperbarui favorit.");
      }
    },
    async checkFavorit() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || !user.id) return;

  const idUser = Number(user.id);

  try {
    const response = await getFavoritByUser(idUser);
    console.log("Respons API Favorit:", response); // Tambahkan log ini

    const favoritList = response.data || response; // Pastikan mengambil data yang benar
    if (!Array.isArray(favoritList)) {
      console.error("Error: favoritList bukan array!", favoritList);
      return;
    }

    this.isFavorit = favoritList.some((item) => item.id_buku === this.buku.id_buku);
  } catch (error) {
    console.error("Gagal memeriksa status favorit:", error);
  }
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

/* Tombol Favorit */
.favorit-btn {
  font-size: 18px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
</style>
