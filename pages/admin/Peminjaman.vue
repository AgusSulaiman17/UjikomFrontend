<template>
  <div class="">
    <Header />
  <div class="container mt-4">

    <b-form-group class="mb- card-shadow">
      <b-form-input v-model="searchQuery" placeholder="Cari berdasarkan nama peminjam..." debounce="300" size="lg"
        class="shadow-sm"></b-form-input>
    </b-form-group>

    <b-button variant="success" @click="openAddModal" class="mb-3">
      Tambah Peminjaman <b-icon-plus></b-icon-plus>
    </b-button>

      <b-table striped hover bordered responsive :items="paginatedPeminjaman" :fields="fields"
        class="bg-light  table-hover card-shadow">
        <template #cell(tanggal_pinjam)="data">
          {{ formatDateTime(data.value) }}
        </template>
        <template #cell(tanggal_kembali)="data">
          {{ formatDateTime(data.value) }}
        </template>
        <template #cell(actions)="data">
          <b-button variant="primary" size="sm" @click="openEditModal(data.item)" class="btn bg-kuning">
            <b-icon-pencil></b-icon-pencil>
          </b-button>
          <b-button variant="danger" size="sm" @click="confirmDeletePeminjaman(data.item)" class="btn bg-merah">
            <b-icon-trash></b-icon-trash>
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
  updatePeminjaman,
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
        { key: "user.nama", label: "Nama Peminjam", sortable: true },
        { key: "buku.judul", label: "Judul Buku", sortable: true },
        { key: "tanggal_pinjam", label: "Tanggal Pinjam", sortable: true },
        { key: "tanggal_kembali", label: "Tanggal Kembali", sortable: true },
        { key: "status_kembali", label: "Status Kembali", sortable: true },
        { key: "denda", label: "Denda", sortable: true },
        { key: "actions", label: "Aksi" },
      ],
    };
  },
  computed: {
    filteredPeminjaman() {
      if (!this.searchQuery) return this.peminjaman;
      const query = this.searchQuery.toLowerCase();
      return this.peminjaman.filter((peminjaman) =>
        peminjaman.user.nama.toLowerCase().includes(query)
      );
    },
    paginatedPeminjaman() {
      const start = (this.currentPage - 1) * this.perPage;
      const end = start + this.perPage;
      return this.filteredPeminjaman.slice(start, end);
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
    openEditModal(peminjaman) {
      this.currentPeminjaman = { ...peminjaman };
      this.showModal = true;
    },
    async handleSubmit(peminjamanData) {
      console.log("Payload yang dikirim:", JSON.stringify(peminjamanData, null, 2));
      try {
        if (peminjamanData.id_peminjaman) {
          await updatePeminjaman(peminjamanData.id_peminjaman, peminjamanData);
          this.$toast.success("Peminjaman berhasil diperbarui!");
        } else {
          await createPeminjaman({
            id_user: peminjamanData.id_user,
            id_buku: peminjamanData.id_buku,
            tanggal_pinjam: new Date().toISOString(), // Format yang benar
            durasi_hari: 5, // Default durasi hari
            status_kembali: false, // Default status kembali
          });
          this.$toast.success("Peminjaman berhasil ditambahkan!");
        }
        this.showModal = false;
        await this.fetchPeminjaman();
      } catch (error) {
        console.error("Terjadi kesalahan saat menambahkan peminjaman:", error);
        this.$toast.error("Terjadi kesalahan. Silakan coba lagi!");
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
      } else {
        console.error("ID peminjaman tidak ditemukan!");
      }
    },
    closeDeleteModal() {
      this.isDeleteModalVisible = false;
      this.peminjamanToDelete = null;
    },
    async fetchPeminjaman() {
      try {
        const data = await getAllPeminjaman();
        this.peminjaman = data.data;
      } catch (error) {
        console.error("Error fetching peminjaman:", error);
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

.card {
  margin-top: 20px;
}
</style>
