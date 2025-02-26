<template>
  <div class="kategori">
    <Header />
    <div class="container mt-4">

      <!-- Input Pencarian -->
      <b-form-group class="mb-3 card-shadow">
        <b-form-input v-model="searchQuery" placeholder="Cari berdasarkan nama kategori..." debounce="300" size="lg"
          class="shadow-sm"></b-form-input>
      </b-form-group>

      <!-- Tombol Tambah Kategori -->
      <b-button variant="success" @click="openAddModal" class="mb-3">Tambah Kategori
        <b-icon-plus></b-icon-plus></b-button>

      <!-- Card for Table -->
      <b-table striped hover bordered responsive :items="paginatedCategories" :fields="fields"
        class="bg-light table-hover card-shadow">
        <template #cell(index)="data">
          {{ (currentPage - 1) * perPage + data.index + 1 }}
        </template>
        <template #cell(actions)="data">
          <b-button variant="primary" size="sm" @click="openEditModal(data.item)"
            class="btn bg-kuning"><b-icon-pencil></b-icon-pencil>
          </b-button>
          <b-button variant="danger" size="sm" @click="confirmDeleteCategory(data.item.id)"
            class="btn bg-merah"><b-icon-trash></b-icon-trash>
          </b-button>
        </template>
      </b-table>

      <!-- Pagination -->
      <b-pagination v-model="currentPage" :total-rows="filteredCategories.length" :per-page="perPage"
        aria-controls="category-table" align="center" class="mt-3" size="lg"></b-pagination>

      <!-- Modal Component -->
      <KategoriModal :showModal="showModal" :categoryData="currentCategory" @submit="handleSubmit"
        @update:showModal="showModal = false" @hidden="showModal = false" />

      <!-- Modal Konfirmasi Hapus -->
      <NotificationModal :isVisible="isDeleteModalVisible" :messageTitle="'Konfirmasi Penghapusan'"
        :messageBody="'Apakah Anda yakin ingin menghapus kategori ini?'" @close="closeDeleteModal">
        <template #footer>
          <button @click="deleteCategory" class="btn btn-danger">Ya, Hapus</button>
          <button @click="closeDeleteModal" class="btn btn-secondary">Batal</button>
        </template>
      </NotificationModal>
    </div>
  </div>
</template>

<script>
import { getAllKategori, deleteKategori, createKategori, updateKategori } from '~/api/kategori';
import Header from '~/components/Header.vue';
import KategoriModal from '~/components/KategoriModal.vue';
import NotificationModal from '~/components/NotificationModal.vue';

export default {
  components: {
    KategoriModal,
    NotificationModal,
    Header
  },
  data() {
    return {
      categories: [],
      searchQuery: "",
      perPage: 5,
      currentPage: 1,
      showModal: false,
      currentCategory: {
        id: null,
        kategori: '',
      },
      isDeleteModalVisible: false,
      categoryToDelete: null,
      fields: [
        { key: "index", label: "No" },
        { key: 'kategori', label: 'Nama Kategori', sortable: true },
        { key: 'actions', label: 'Aksi' }
      ],
    };
  },
  computed: {
    filteredCategories() {
      if (!this.searchQuery) return this.categories;
      const query = this.searchQuery.toLowerCase();
      return this.categories.filter(category =>
        category.kategori.toLowerCase().includes(query)
      );
    },
    paginatedCategories() {
      const start = (this.currentPage - 1) * this.perPage;
      const end = start + this.perPage;
      return this.filteredCategories.slice(start, end);
    }
  },
  async mounted() {
    await this.fetchCategories();
  },
  methods: {
    openAddModal() {
      this.currentCategory = { id: null, kategori: '' }; // Membuka modal dengan kategori kosong
      this.showModal = true;
    },
    openEditModal(category) {
      this.currentCategory = { ...category }; // Mengirim data kategori untuk diedit
      this.showModal = true;
    },
    async handleSubmit(categoryData) {
      try {
        if (categoryData.id) {
          // Jika ada ID, lakukan PUT (update)
          await updateKategori(categoryData.id, categoryData);
          this.$toast.success('Kategori berhasil diperbarui!');
        } else {
          // Jika tidak ada ID, lakukan POST (create)
          await createKategori(categoryData);
          this.$toast.success('Kategori berhasil ditambahkan!');
        }
        this.showModal = false;
        await this.fetchCategories();
      } catch (error) {
        const errorMessage = error.message || "Terjadi kesalahan. Silakan coba lagi!";
        this.$toast.error(errorMessage);
      }
    },
    async deleteCategory() {
      if (!this.categoryToDelete) return;
      try {
        await deleteKategori(this.categoryToDelete);
        this.categories = this.categories.filter(category => category.id !== this.categoryToDelete);
        this.$toast.success('Kategori berhasil dihapus!');
        this.closeDeleteModal();
      } catch (error) {
        this.$toast.error('Terjadi kesalahan saat menghapus kategori!');
        this.closeDeleteModal();
      }
    },
    confirmDeleteCategory(categoryId) {
      this.categoryToDelete = categoryId;
      this.isDeleteModalVisible = true;
    },
    closeDeleteModal() {
      this.isDeleteModalVisible = false;
      this.categoryToDelete = null;
    },
    async fetchCategories() {
      try {
        const data = await getAllKategori();
        this.categories = data.data;
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    }
  },
};
</script>

<style scoped>
/* Styling untuk input pencarian */
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
