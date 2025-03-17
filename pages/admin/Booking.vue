<template>
  <div>
    <Header />
    <div class="container mt-6">
      <!-- Input Pencarian -->
      <b-form-group class="mb-3 card-shadow">
        <b-form-input v-model="searchQuery" placeholder="Cari berdasarkan nama user..." debounce="300" size="lg"
          class="shadow-sm"></b-form-input>
      </b-form-group>

      <!-- Tabel Booking -->
      <b-table striped hover bordered responsive :items="paginatedBookings" :fields="fields"
        class="bg-light table-hover card-shadow">
        <template #cell(index)="data">
          {{ (currentPage - 1) * perPage + data.index + 1 }}
        </template>
        <template #cell(user)="data">
          {{ data.item.user ? data.item.user.name : "Tidak Ditemukan" }}
        </template>
        <template #cell(buku)="data">
          {{ data.item.buku ? data.item.buku.judul : "Tidak Ditemukan" }}
        </template>
        <template #cell(actions)="data">
          <b-button v-if="data.item.status === 'pending'" variant="success" size="sm"
            @click="showApproveModal(data.item.id_peminjaman)" class="btn bg-hijau">
            <b-icon-check></b-icon-check> Setujui
          </b-button>
          <b-button variant="danger" size="sm" @click="showDeleteModal(data.item.id_peminjaman)">
            <b-icon-trash></b-icon-trash> Batalkan
          </b-button>
        </template>
      </b-table>
      <div v-if="paginatedBookings.length === 0" class="text-center p-3">
        <b-icon-exclamation-circle class="text-muted" font-scale="2"></b-icon-exclamation-circle>
        <p class="mt-2 text-muted">Data Kosong</p>
      </div>

      <!-- Pagination -->
      <b-pagination v-model="currentPage" :total-rows="filteredBookings.length" :per-page="perPage" align="center"
        class="mt-3" size="lg"></b-pagination>

      <!-- Modal Konfirmasi Persetujuan -->
      <NotificationModal :isVisible="isApproveModalVisible" :messageTitle="'Konfirmasi Persetujuan'"
        :messageBody="'Apakah Anda yakin ingin menyetujui pemesanan ini?'" @close="closeApproveModal">
        <template #footer>
          <button @click="confirmApproveBooking" class="btn btn-success" :disabled="isLoadingApprove">
            <b-icon v-if="isLoadingApprove" icon="arrow-clockwise" animation="spin"></b-icon>
            <span v-else>Ya, Setujui</span>
          </button>
          <button @click="closeApproveModal" class="btn btn-secondary" :disabled="isLoadingApprove">
            Batal
          </button>
        </template>
      </NotificationModal>

      <!-- Modal Konfirmasi Hapus -->
      <NotificationModal :isVisible="isDeleteModalVisible" :messageTitle="'Konfirmasi Pembatalan'"
        :messageBody="'Apakah Anda yakin ingin Membatalkan booking ini?'" @close="closeDeleteModal">
        <template #footer>
          <button @click="confirmDeleteBooking" class="btn btn-danger" :disabled="isLoadingDelete">
            <b-icon v-if="isLoadingDelete" icon="arrow-clockwise" animation="spin"></b-icon>
            <span v-else>Ya</span>
          </button>
          <button @click="closeDeleteModal" class="btn btn-secondary" :disabled="isLoadingDelete">
            Batal
          </button>
        </template>
      </NotificationModal>

    </div>
  </div>
</template>

<script>
import { getAllBookings, approveBooking, deleteBooking } from "~/api/peminjaman";
import Header from "~/components/Header.vue";
import NotificationModal from "~/components/NotificationModal.vue";

export default {
  components: { Header, NotificationModal },
  data() {
    return {
      bookings: [],
      searchQuery: "",
      perPage: 10,
      currentPage: 1,
      isLoadingApprove: false,
      isLoadingDelete: false,
      isApproveModalVisible: false,
      isDeleteModalVisible: false,
      selectedBookingId: null,
      fields: [
        { key: "index", label: "No" },
        { key: "user", label: "Nama User", sortable: true },
        { key: "buku", label: "Buku", sortable: true },
        { key: "status", label: "Status" },
        { key: "actions", label: "Aksi" },
      ],
    };
  },
  computed: {
    filteredBookings() {
      if (!this.searchQuery) return this.bookings;
      const query = this.searchQuery.toLowerCase();
      return this.bookings.filter((booking) =>
        booking.user?.name.toLowerCase().includes(query)
      );
    },
    paginatedBookings() {
      const start = (this.currentPage - 1) * this.perPage;
      const end = start + this.perPage;
      return this.filteredBookings.slice(start, end);
    },
  },
  async mounted() {
    await this.fetchBookings();
  },
  methods: {
    async fetchBookings() {
      try {
        const response = await getAllBookings();
        this.bookings = response.data;
      } catch (error) {
        console.error("Error fetching bookings:", error);
        this.$toast.error("Gagal mengambil data booking");
      }
    },
    showApproveModal(id) {
      this.selectedBookingId = id;
      this.isApproveModalVisible = true;
    },
    closeApproveModal() {
      this.isApproveModalVisible = false;
      this.selectedBookingId = null;
    },
    async confirmApproveBooking() {
      if (!this.selectedBookingId) return;

      this.isLoadingApprove = true;
      try {
        await approveBooking(this.selectedBookingId);
        this.bookings = this.bookings.filter(
          (booking) => booking.id_peminjaman !== this.selectedBookingId
        );
        this.$toast.success("Booking berhasil disetujui!");
      } catch (error) {
        this.$toast.error("Gagal menyetujui booking!");
      } finally {
        this.isLoadingApprove = false;
        this.closeApproveModal();
      }
    },
    showDeleteModal(id) {
      this.selectedBookingId = id;
      this.isDeleteModalVisible = true;
    },
    closeDeleteModal() {
      this.isDeleteModalVisible = false;
      this.selectedBookingId = null;
    },
    async confirmDeleteBooking() {
      if (!this.selectedBookingId) return;

      this.isLoadingDelete = true;
      try {
        await deleteBooking(this.selectedBookingId);
        this.bookings = this.bookings.filter(
          (booking) => booking.id_peminjaman !== this.selectedBookingId
        );
        this.$toast.success("Booking berhasil dihapus!");
      } catch (error) {
        this.$toast.error("Gagal menghapus booking!");
      } finally {
        this.isLoadingDelete = false;
        this.closeDeleteModal();
      }
    },
  },
};
</script>

<style scoped>
.b-form-input {
  border-radius: 30px;
  background-color: #f1f1f1;
}

.b-button {
  transition: all 0.3s ease;
}

.b-button:hover {
  background-color: #d9534f;
  border-color: #c9302c;
}

.table-hover tbody tr:hover {
  background-color: #f8f9fa;
}

.b-pagination .page-item.active .page-link {
  background-color: #007bff;
  border-color: #007bff;
}

.b-pagination .page-item .page-link {
  border-radius: 20px;
  padding: 8px 15px;
}

.bg-hijau {
  background-color: #28a745;
  color: white;
}

.bg-hijau:hover {
  background-color: #218838;
}

.bg-light {
  background-color: #f8f9fa;
}
</style>
