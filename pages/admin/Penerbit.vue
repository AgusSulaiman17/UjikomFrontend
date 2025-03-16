<template>
  <div class="">
    <Header />
  <div class="container mt-4">

    <b-form-group class="mb-3 card-shadow">
      <b-form-input v-model="searchQuery" placeholder="Cari berdasarkan nama penerbit..." debounce="300" size="lg"
        class="shadow-sm"></b-form-input>
    </b-form-group>

    <b-button variant="success" @click="openAddModal" class="mb-3">
      Tambah Penerbit <b-icon-plus></b-icon-plus>
    </b-button>

      <b-table striped hover bordered responsive :items="paginatedPenerbit" :fields="fields"
        class="bg-light table-hover card-shadow">
        <template #cell(index)="data">
          {{ (currentPage - 1) * perPage + data.index + 1 }}
        </template>
        <template #cell(actions)="data">
          <b-button variant="primary" size="sm" @click="openEditModal(data.item)" class="btn bg-kuning">
            <b-icon-pencil></b-icon-pencil>
          </b-button>
          <b-button variant="danger" size="sm" @click="confirmDeletePenerbit(data.item)" class="btn bg-merah">
            <b-icon-trash></b-icon-trash>
          </b-button>
        </template>
      </b-table>
      <div v-if="paginatedPenerbit.length === 0" class="text-center p-3">
        <b-icon-exclamation-circle class="text-muted" font-scale="2"></b-icon-exclamation-circle>
        <p class="mt-2 text-muted">Data Kosong</p>
      </div>

    <b-pagination v-model="currentPage" :total-rows="filteredPenerbit.length" :per-page="perPage"
      aria-controls="penerbit-table" align="center" class="mt-3" size="lg"></b-pagination>

    <!-- Modal Tambah/Edit Penerbit -->
    <PenerbitModal :showModal="showModal" :penerbitData="currentPenerbit" @submit="handleSubmit"
      @update:showModal="showModal = $event" />

    <!-- Modal Konfirmasi Hapus -->
    <NotificationModal :isVisible="isDeleteModalVisible" :messageTitle="'Konfirmasi Penghapusan'"
      :messageBody="'Apakah Anda yakin ingin menghapus penerbit ini?'" @close="closeDeleteModal">
      <template #footer>
        <button @click="deletePenerbit" class="btn btn-danger">
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
  getAllPenerbit,
  deletePenerbit,
  createPenerbit,
  updatePenerbit,
} from "~/api/penerbit";
import PenerbitModal from "~/components/PenerbitModal.vue";
import NotificationModal from "~/components/NotificationModal.vue";
import Header from "~/components/Header.vue";

export default {
  components: {
    PenerbitModal,
    NotificationModal,
    Header
  },
  data() {
    return {
      penerbit: [],
      searchQuery: "",
      perPage: 5,
      currentPage: 1,
      showModal: false,
      currentPenerbit: {
        id: null,
        nama: "",
      },
      isDeleteModalVisible: false,
      penerbitToDelete: null,
      fields: [
      { key: "index", label: "No" },
        { key: "nama", label: "Nama Penerbit", sortable: true },
        { key: "actions", label: "Aksi" },
      ],
    };
  },
  computed: {
    filteredPenerbit() {
      if (!this.searchQuery) return this.penerbit;
      const query = this.searchQuery.toLowerCase();
      return this.penerbit.filter((penerbit) =>
        penerbit.nama.toLowerCase().includes(query)
      );
    },
    paginatedPenerbit() {
      const start = (this.currentPage - 1) * this.perPage;
      const end = start + this.perPage;
      return this.filteredPenerbit.slice(start, end);
    },
  },
  async mounted() {
    await this.fetchPenerbit();
  },
  methods: {
    openAddModal() {
      this.currentPenerbit = { id: null, nama: "" };
      this.showModal = true;
    },
    openEditModal(penerbit) {
      this.currentPenerbit = { ...penerbit }; // Salin agar ID tidak hilang
      this.showModal = true;
    },
    async handleSubmit(penerbitData) {
      try {
  if (penerbitData.id) {
    await updatePenerbit(penerbitData.id, { nama: penerbitData.nama });
    this.$toast.success("Penerbit berhasil diperbarui!");
  } else {
    await createPenerbit({ nama: penerbitData.nama });
    this.$toast.success("Penerbit berhasil ditambahkan!");
  }
  this.showModal = false;
  await this.fetchPenerbit();
} catch (error) {
  const errorMessage = error.message || "Terjadi kesalahan. Silakan coba lagi!";
  this.$toast.error(errorMessage);
}

    },
    async deletePenerbit() {
      if (!this.penerbitToDelete) {
        console.error("ID penerbit tidak ditemukan!"); // Debugging
        return;
      }
      try {
        await deletePenerbit(this.penerbitToDelete);
        this.penerbit = this.penerbit.filter((penerbit) => penerbit.id_penerbit !== this.penerbitToDelete);
        this.$toast.success("Penerbit berhasil dihapus!");
        this.closeDeleteModal();
      } catch (error) {
        this.$toast.error("Terjadi kesalahan saat menghapus penerbit!");
        this.closeDeleteModal();
      }
    },
    confirmDeletePenerbit(penerbit) {
      if (penerbit && penerbit.id_penerbit) {
        this.penerbitToDelete = penerbit.id_penerbit;
        this.isDeleteModalVisible = true;
      } else {
        console.error("ID penerbit tidak ditemukan!");
      }
    },
    closeDeleteModal() {
      this.isDeleteModalVisible = false;
      this.penerbitToDelete = null;
    },
    async fetchPenerbit() {
      try {
        const data = await getAllPenerbit();
        this.penerbit = data.data;
      } catch (error) {
        console.error("Error fetching penerbit:", error);
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
