<template>
<div class="buku">
  <Header />
  <div class="container mt-4">

    <b-form-group class="mb-3 card-shadow">
      <b-form-input v-model="searchQuery" placeholder="Cari berdasarkan judul buku..." debounce="300" size="lg"
        class="shadow-sm"></b-form-input>
    </b-form-group>

    <b-button variant="success" @click="openAddModal" class="mb-3">
      Tambah Buku <b-icon-plus></b-icon-plus>
    </b-button>

      <b-table :items="buku" :fields="fields" class="card-shadow">
        <template #cell(index)="data">
          {{ (currentPage - 1) * perPage + data.index + 1 }}
        </template>
        <template #cell(gambar)="data">
          <b-img v-if="data.item.gambar" :src="data.item.gambar" alt="Gambar Buku" width="50" height="70" />
          <span v-else>Tidak ada gambar</span>
        </template>

        <template #cell(actions)="data">
          <b-button variant="primary" size="sm" @click="openEditModal(data.item)" class="btn bg-kuning">
            <b-icon-pencil></b-icon-pencil>
          </b-button>
          <b-button variant="danger" size="sm" @click="confirmDeleteBuku(data.item)" class="btn bg-merah">
            <b-icon-trash></b-icon-trash>
          </b-button>
        </template>
      </b-table>

    <b-pagination v-model="currentPage" :total-rows="filteredBuku.length" :per-page="perPage" aria-controls="buku-table"
      align="center" class="mt-3" size="lg"></b-pagination>

    <!-- Modal Tambah/Edit Buku -->
    <BukuModal :showModal="showModal" :bukuData="currentBuku" @submit="handleSubmit"
      @update:showModal="showModal = $event" />

    <!-- Modal Konfirmasi Hapus -->
    <NotificationModal :isVisible="isDeleteModalVisible" :messageTitle="'Konfirmasi Penghapusan'"
      :messageBody="'Apakah Anda yakin ingin menghapus buku ini?'" @close="closeDeleteModal">
      <template #footer>
        <button @click="deleteBuku" class="btn btn-danger">
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
import { getAllBuku, deleteBuku, createBuku, updateBuku } from "~/api/buku";
import BukuModal from "~/components/BukuModal.vue";
import Header from "~/components/Header.vue";
import NotificationModal from "~/components/NotificationModal.vue";

export default {
  components: {
    BukuModal,
    NotificationModal,
    Header
  },
  data() {
    return {
      buku: [],
      searchQuery: "",
      perPage: 5,
      currentPage: 1,
      showModal: false,
      currentBuku: {
        id_buku: null,
        judul: "",
        id_penerbit: "",
        id_penulis: "",
        id_kategori: "",
        deskripsi: "",
        jumlah: 1,
        isbn: "",
        gambar: null,
      },
      isDeleteModalVisible: false,
      bukuToDelete: null,
      fields: [
      { key: "index", label: "No" },
        { key: "gambar", label: "Gambar" },
        { key: "judul", label: "Judul Buku", sortable: true },
        { key: "penulis", label: "Penulis", sortable: true },
        { key: "penerbit", label: "Penerbit", sortable: true },
        { key: "kategori", label: "Kategori", sortable: true },
        { key: "isbn", label: "ISBN", sortable: true },
        { key: "jumlah", label: "Jumlah", sortable: true },
        { key: "deskripsi", label: "Deskripsi", sortable: true },
        { key: "actions", label: "Aksi" },
      ],
    };
  },
  computed: {
    filteredBuku() {
      if (!this.searchQuery) return this.buku;
      const query = this.searchQuery.toLowerCase();
      return this.buku.filter((buku) => buku.judul.toLowerCase().includes(query));
    },
    paginatedBuku() {
      const start = (this.currentPage - 1) * this.perPage;
      const end = start + this.perPage;
      return this.filteredBuku.slice(start, end);
    },
  },
  async mounted() {
    await this.fetchBuku();
  },
  methods: {
    openEditModal(item) {
      this.currentBuku = { ...item };
      this.showModal = true;
    },
    openAddModal() {
      this.currentBuku = {
        id_buku: null,
        judul: "",
        id_penerbit: "",
        id_penulis: "",
        id_kategori: "",
        deskripsi: "",
        jumlah: 1,
        isbn: "",
        gambar: null,
      };
      this.showModal = true;
    },
    async handleSubmit(formData) {
      try {
        if (this.currentBuku.id_buku) {
          await updateBuku(this.currentBuku.id_buku, formData);
          this.$toast.success("Buku berhasil diperbarui!");
        } else {
          await createBuku(formData);
          this.$toast.success("Buku berhasil ditambahkan!");
        }
        this.showModal = false;
        await this.fetchBuku();
      } catch (error) {
        const errorMessage = error.message || "Terjadi kesalahan. Silakan coba lagi!";
        this.$toast.error(errorMessage);
      }
    },
    async deleteBuku() {
      if (!this.bukuToDelete) {
        console.error("ID buku tidak ditemukan!");
        return;
      }
      try {
        await deleteBuku(this.bukuToDelete);
        this.buku = this.buku.filter((buku) => buku.id_buku !== this.bukuToDelete);
        this.$toast.success("Buku berhasil dihapus!");
        this.closeDeleteModal();
      } catch (error) {
        this.$toast.error("Terjadi kesalahan saat menghapus buku!");
        this.closeDeleteModal();
      }
    },
    confirmDeleteBuku(buku) {
      if (buku && buku.id_buku) {
        this.bukuToDelete = buku.id_buku;
        this.isDeleteModalVisible = true;
      } else {
        console.error("ID buku tidak ditemukan!");
      }
    },
    closeDeleteModal() {
      this.isDeleteModalVisible = false;
      this.bukuToDelete = null;
    },
    async fetchBuku() {
  try {
    const response = await getAllBuku();
    this.buku = response.data.map((b) => ({
      id_buku: b.id_buku,
      judul: b.judul,
      penulis: b.penulis ? b.penulis.nama : "Tidak diketahui",
      penerbit: b.penerbit ? b.penerbit.nama : "Tidak diketahui",
      kategori: b.kategori ? b.kategori.kategori : "Tidak ada",
      isbn: b.isbn,
      jumlah: b.jumlah,
      status: b.status,
      gambar: b.gambar ? `http://localhost:8080/${b.gambar}` : "",
      deskripsi: b.deskripsi || 'Tidak ada deskripsi',
    }));
  } catch (error) {
    console.error("Error fetching buku:", error);
  }
}
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
