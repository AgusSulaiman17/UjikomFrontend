<template>
  <div>
    <Header />
    <div class="container mt-4">

      <b-form-group class="mb-3 card-shadow">
        <b-form-input v-model="searchQuery" placeholder="Cari berdasarkan nama peminjam..." debounce="300" size="lg"
          class="shadow-sm"></b-form-input>
      </b-form-group>
      <b-form-group label="Filter Bulan Peminjaman" class="mb-3">
        <b-form-select v-model="selectedMonth" :options="monthOptions" class="shadow-sm"></b-form-select>
      </b-form-group>

      <b-form-group label="Filter Tanggal Peminjaman" class="mb-3">
        <b-form-input type="date" v-model="selectedDate" class="shadow-sm"></b-form-input>
      </b-form-group>

      <b-button variant="success" @click="openAddModal" class="mb-3">
        Tambah Peminjaman <b-icon-plus></b-icon-plus>
      </b-button>

      <b-table striped hover bordered responsive :items="paginatedPeminjaman" :fields="fields"
        class="bg-light table-hover card-shadow">
        <template #cell(tanggal_pinjam)="data">
          {{ formatDateTime(data.value) }}
        </template>
        <template #cell(tanggal_kembali)="data">
          {{ formatDateTime(data.value) }}
        </template>
        <template #cell(status_kembali)="data">
          <span :class="data.value ? 'text-success' : 'text-danger'">
            {{ data.value ? 'Sudah Dikembalikan' : 'Dipinjam' }}
          </span>
        </template>
        <template #cell(actions)="data">
          <b-button variant="danger" size="sm" @click="confirmDeletePeminjaman(data.item)" class="btn bg-merah">
            <b-icon-trash></b-icon-trash>
          </b-button>
          <b-button v-if="!data.item.status_kembali" variant="primary" size="sm"
            @click="handleReturnBook(data.item.id_peminjaman)" class="ml-2">
            <b-icon-arrow-return-left></b-icon-arrow-return-left> Kembalikan
          </b-button>
        </template>
      </b-table>

      <b-pagination v-model="currentPage" :total-rows="filteredPeminjaman.length" :per-page="perPage"
        aria-controls="peminjaman-table" align="center" class="mt-3" size="lg"></b-pagination>

      <!-- Modal Tambah/Edit Peminjaman -->
      <PeminjamanModal :showModal="showModal" :peminjamanData="currentPeminjaman" @submit="handleSubmit"
        @update:showModal="showModal = $event" />

      <!-- Modal Konfirmasi Hapus -->
      <NotificationModal :isVisible="isDeleteModalVisible" :messageTitle="'Konfirmasi Penghapusan'"
        :messageBody="'Apakah Anda yakin ingin menghapus peminjaman ini?'" @close="closeDeleteModal">
        <template #footer>
          <button @click="deletePeminjaman" class="btn btn-danger">
            Ya, Hapus
          </button>
          <button @click="closeDeleteModal" class="btn btn-secondary">
            Batal
          </button>
        </template>
      </NotificationModal>
    </div>
  </div>
</template>

<script>
import {
  getAllPeminjaman,
  deletePeminjaman,
  createPeminjaman,
  returnBook
} from "~/api/peminjaman";
import PeminjamanModal from "~/components/PeminjamanModal.vue";
import NotificationModal from "~/components/NotificationModal.vue";
import Header from "~/components/Header.vue";

export default {
  components: {
    PeminjamanModal,
    NotificationModal,
    Header
  },
  data() {
    return {
      peminjaman: [],
      searchQuery: "",
      perPage: 5,
      currentPage: 1,
      showModal: false,
      selectedMonth: "", // Filter bulan yang dipilih
      selectedDate: "", // Filter tanggal yang dipilih
      monthOptions: [
        { value: "", text: "Semua Bulan" },
        { value: "01", text: "Januari" },
        { value: "02", text: "Februari" },
        { value: "03", text: "Maret" },
        { value: "04", text: "April" },
        { value: "05", text: "Mei" },
        { value: "06", text: "Juni" },
        { value: "07", text: "Juli" },
        { value: "08", text: "Agustus" },
        { value: "09", text: "September" },
        { value: "10", text: "Oktober" },
        { value: "11", text: "November" },
        { value: "12", text: "Desember" }
      ],
      currentPeminjaman: {
        id_peminjaman: null,
        id_user: null,
        id_buku: null,
        tanggal_pinjam: "",
        durasi_hari: 5,
        status_kembali: false,
      },
      isDeleteModalVisible: false,
      peminjamanToDelete: null,
      fields: [
        { key: "user.name", label: "Nama Peminjam", sortable: true },
        { key: "buku.judul", label: "Judul Buku", sortable: true },
        { key: "tanggal_pinjam", label: "Tanggal Pinjam", sortable: true },
        { key: "tanggal_kembali", label: "Tanggal Kembali", sortable: true },
        { key: "status_kembali", label: "Status Peminjaman", sortable: true },
        { key: "denda", label: "Denda", sortable: true },
        { key: "actions", label: "Aksi" },
      ],
    };
  },
  computed: {
    paginatedPeminjaman() {
      const start = (this.currentPage - 1) * this.perPage;
      const end = start + this.perPage;
      return this.filteredPeminjaman.slice(start, end);
    },
    filteredPeminjaman() {
      return this.peminjaman.filter((peminjaman) => {
        const namaPeminjam = peminjaman.user && peminjaman.user.nama ? peminjaman.user.nama.toLowerCase() : '';
        const tanggalPinjam = this.formatDate(peminjaman.tanggal_pinjam);
        const bulanPinjam = this.getMonthFromDate(peminjaman.tanggal_pinjam);

        // Filter berdasarkan nama peminjam
        const matchNama = !this.searchQuery || namaPeminjam.includes(this.searchQuery.toLowerCase());

        // Filter berdasarkan bulan peminjaman
        const matchBulan = !this.selectedMonth || bulanPinjam === this.selectedMonth;

        // Filter berdasarkan tanggal peminjaman
        const matchTanggal = !this.selectedDate || tanggalPinjam === this.selectedDate;

        return matchNama && matchBulan && matchTanggal;
      });
    },
  },
  async mounted() {
    await this.fetchPeminjaman();
  },
  methods: {
    formatDateTime(dateTimeString) {
      if (!dateTimeString) return '';
      const date = new Date(dateTimeString);
      return date.toLocaleString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    },
    getMonthFromDate(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toISOString().slice(5, 7);
    },

    formatDate(dateTimeString) {
      if (!dateTimeString) return "";
      const date = new Date(dateTimeString);
      return date.toISOString().split("T")[0];
    },
    openAddModal() {
      this.currentPeminjaman = {
        id_peminjaman: null,
        id_user: null,
        id_buku: null,
        tanggal_pinjam: "",
        durasi_hari: 5,
        status_kembali: false,
      };
      this.showModal = true;
    },
    async handleSubmit(peminjamanData) {
      try {
        if (peminjamanData.get) {
          await createPeminjaman(peminjamanData);
        } else {
          await createPeminjaman({
            id_user: Number(peminjamanData.id_user),
            id_buku: Number(peminjamanData.id_buku),
          });
        }
        this.$toast.success("Peminjaman berhasil ditambahkan!");
        this.showModal = false;
        await this.fetchPeminjaman();
      } catch (error) {
        console.error("Error creating peminjaman:", error.response?.data || error.message);
        this.$toast.error(error.response?.data || error.message);
      }
    },
    async handleReturnBook(id) {
      try {
        await returnBook(id);
        this.$toast.success("Buku berhasil dikembalikan!");
        await this.fetchPeminjaman();
      } catch (error) {
        console.error("Error returning book:", error);
        this.$toast.error("Terjadi kesalahan saat mengembalikan buku!");
      }
    },
    async deletePeminjaman() {
      if (!this.peminjamanToDelete) {
        console.error("ID peminjaman tidak ditemukan!");
        return;
      }
      try {
        await deletePeminjaman(this.peminjamanToDelete);
        this.peminjaman = this.peminjaman.filter((peminjaman) => peminjaman.id_peminjaman !== this.peminjamanToDelete);
        this.$toast.success("Peminjaman berhasil dihapus!");
        this.closeDeleteModal();
      } catch (error) {
        this.$toast.error("Terjadi kesalahan saat menghapus peminjaman!");
        this.closeDeleteModal();
      }
    },
    confirmDeletePeminjaman(peminjaman) {
      if (peminjaman && peminjaman.id_peminjaman) {
        this.peminjamanToDelete = peminjaman.id_peminjaman;
        this.isDeleteModalVisible = true;
      }
    },
    closeDeleteModal() {
      this.isDeleteModalVisible = false;
    },
    async fetchPeminjaman() {
      try {
        const response = await getAllPeminjaman();
        this.peminjaman = response.data;
      } catch (error) {
        console.error("Error fetching peminjaman:", error);
      }
    }
  }
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

.card {
  margin-top: 20px;
}
</style>
