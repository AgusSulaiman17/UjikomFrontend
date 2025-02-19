<template>
  <div class="pinjaman">
    <AppNavbar />

    <div class="peminjaman container mt-6">
      <h2 class="text-center mb-4">Daftar Booking Anda</h2>

      <div v-if="loading" class="text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div v-if="errorMessage" class="alert alert-danger text-center">{{ errorMessage }}</div>

      <div v-if="bookings.length > 0" class="d-flex flex-wrap justify-content-center">
        <div v-for="booking in bookings" :key="booking.id_peminjaman" class="card custom-card m-3">
          <div class="card__content">
            <p class="card__title">{{ booking.buku.judul }}</p>
            <p v-if="booking.status === 'pending'" class="text-ijomuda">Menunggu konfirmasi</p>
          </div>

          <img
            v-if="booking.buku.gambar"
            :src="booking.buku.gambar.startsWith('http') ? booking.buku.gambar : `http://localhost:8080/${booking.buku.gambar}`"
            :alt="booking.buku.judul"
            class="card-img"
          />

          <button @click="confirmDelete(booking.id_peminjaman)" class="btn btn-danger btn-sm delete-button">
            Batalkan
          </button>
        </div>
      </div>

      <div v-else class="text-center text-muted">Tidak ada booking ditemukan.</div>

      <NotificationModal
        :isVisible="isDeleteModalVisible"
        :messageTitle="'Konfirmasi Pembatalan'"
        :messageBody="'Apakah Anda yakin ingin membatalkan booking ini ini?'"
        @close="closeDeleteModal"
      >
        <template #footer>
          <button @click="deletePeminjaman" class="btn btn-danger">Ya</button>
          <button @click="closeDeleteModal" class="btn btn-secondary">Tidak</button>
        </template>
      </NotificationModal>
    </div>
  </div>
</template>

<script>
import { getBookingByUserId, deleteBooking } from "@/api/peminjaman";
import AppNavbar from "~/components/AppNavbar.vue";
import NotificationModal from "@/components/NotificationModal.vue";

export default {
  components: {
    AppNavbar,
    NotificationModal
  },
  layout: "blank",
  data() {
    return {
      bookings: [],
      loading: true,
      errorMessage: "",
      isDeleteModalVisible: false,
      selectedBookingId: null
    };
  },
  async mounted() {
    await this.fetchBookings();
  },
  methods: {
    async fetchBookings() {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.id) {
        this.errorMessage = "User belum login!";
        this.loading = false;
        return;
      }

      try {
        const response = await getBookingByUserId(user.id);
        this.bookings = response.data;
      } catch (error) {
        this.errorMessage = error.message || "Gagal mengambil data booking.";
      } finally {
        this.loading = false;
      }
    },
    confirmDelete(id) {
      this.selectedBookingId = id;
      this.isDeleteModalVisible = true;
    },
    closeDeleteModal() {
      this.isDeleteModalVisible = false;
      this.selectedBookingId = null;
    },
    async deletePeminjaman() {
      if (!this.selectedBookingId) return;

      try {
        await deleteBooking(this.selectedBookingId);
        this.bookings = this.bookings.filter(b => b.id_peminjaman !== this.selectedBookingId);

        this.$toast.success("Booking berhasil dibatalkan!");
      } catch (error) {
        this.$toast.error(error.message || "Gagal menghapus booking!");
      } finally {
        this.closeDeleteModal();
      }
    }
  }
};
</script>

<style scoped>
.container {
  max-width: 1400px;
}

h2 {
  font-weight: bold;
  color: #343a40;
}

.custom-card {
  position: relative;
  width: 300px;
  height: 200px;
  background-color: #f2f2f2;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  perspective: 1000px;
  border: 3px solid #000;
  box-shadow: 6px 6px 0 #000;
  transition: transform 0.3s ease;
}

.custom-card:hover {
  transform: scale(1.05);
}

.custom-card:hover .card__content {
  transform: translateY(-100%);
}

.custom-card:hover .card-img {
  transform: translateY(0);
}

.card-img {
  position: absolute;
  padding: 5px;
  width: 200px;
  height: 100px;
  transform: translateY(100%);
  transition: transform 0.5s ease-in-out;
}


.card__content {
  position: absolute;
  width: 100%;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
  background-color: #f2f2f2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  transition: transform 0.5s ease-in-out;
}

.delete-button {
  position: absolute;
  bottom: 10px;
  right: 10px;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.custom-card:hover .delete-button {
  opacity: 1;
}

.card__title {
  font-size: 18px;
  color: #333;
  font-weight: 700;
}

.text-warning {
  font-weight: bold;
}

.text-muted {
  font-style: italic;
}
</style>
