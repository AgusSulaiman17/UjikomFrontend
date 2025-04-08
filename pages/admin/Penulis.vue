<template>
  <div class="">
    <Header />
  <div class="container mt-6">

    <b-form-group class="mb-3 card-shadow">
      <b-form-input v-model="searchQuery" placeholder="Cari berdasarkan nama penulis..." debounce="300" size="lg"
        class="shadow-sm"></b-form-input>
    </b-form-group>

    <b-button variant="btn bg-ijomuda" @click="openAddModal" class="mb-3">
      Tambah Penulis <b-icon-plus></b-icon-plus>
    </b-button>

      <b-table striped hover bordered responsive :items="paginatedPenulis" :fields="fields"
        class="bg-light table-hover card-shadow">
        <template #cell(index)="data">
          {{ (currentPage - 1) * perPage + data.index + 1 }}
        </template>
        <template #cell(actions)="data">
          <b-button variant="primary" size="sm" @click="openEditModal(data.item)" class="btn bg-kuning">
            <b-icon-pencil></b-icon-pencil>
          </b-button>
          <b-button variant="danger" size="sm" @click="confirmDeletePenulis(data.item)" class="btn bg-merah">
            <b-icon-trash></b-icon-trash>
          </b-button>
        </template>
      </b-table>
      <div v-if="paginatedPenulis.length === 0" class="text-center p-3">
        <b-icon-exclamation-circle class="text-muted" font-scale="2"></b-icon-exclamation-circle>
        <p class="mt-2 text-muted">Data Kosong</p>
      </div>

    <b-pagination v-model="currentPage" :total-rows="filteredPenulis.length" :per-page="perPage"
      aria-controls="penulis-table" align="center" class="mt-3" size="lg"></b-pagination>

    <!-- Modal Tambah/Edit Penulis -->
    <PenulisModal :showModal="showModal" :penulisData="currentPenulis" @submit="handleSubmit"
      @update:showModal="showModal = $event" />

    <!-- Modal Konfirmasi Hapus -->
    <NotificationModal :isVisible="isDeleteModalVisible" :messageTitle="'Konfirmasi Penghapusan'"
      :messageBody="'Apakah Anda yakin ingin menghapus penulis ini?'" @close="closeDeleteModal">
      <template #footer>
        <button @click="deletePenulis" class="btn btn-danger">
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
  getAllPenulis,
  deletePenulis,
  createPenulis,
  updatePenulis,
} from "~/api/penulis";
import PenulisModal from "~/components/PenulisModal.vue";
import NotificationModal from "~/components/NotificationModal.vue";
import Header from "~/components/Header.vue";

export default {
  components: {
    PenulisModal,
    NotificationModal,
    Header
  },
  data() {
    return {
      penulis: [],
      searchQuery: "",
      perPage: 10,
      currentPage: 1,
      showModal: false,
      currentPenulis: {
        id: null,
        nama: "",
      },
      isDeleteModalVisible: false,
      penulisToDelete: null,
      fields: [
      { key: "index", label: "No" },
        { key: "nama", label: "Nama Penulis", sortable: true },
        { key: "actions", label: "Aksi" },
      ],
    };
  },
  computed: {
    filteredPenulis() {
  let hasil = this.penulis;

  if (this.searchQuery) {
    const query = this.searchQuery.toLowerCase();
    hasil = hasil.filter((penulis) =>
      penulis.nama.toLowerCase().includes(query)
    );
  }

  // Urutkan berdasarkan dibuat_pada dari terbaru ke terlama
  return hasil.sort((a, b) => new Date(b.dibuat_pada) - new Date(a.dibuat_pada));
},
    paginatedPenulis() {
      const start = (this.currentPage - 1) * this.perPage;
      const end = start + this.perPage;
      return this.filteredPenulis.slice(start, end);
    },
  },
  async mounted() {
    await this.fetchPenulis();
  },
  methods: {
    openAddModal() {
      this.currentPenulis = { id: null, nama: "" };
      this.showModal = true;
    },
    openEditModal(penulis) {
      this.currentPenulis = { ...penulis }; // Salin agar ID tidak hilang
      this.showModal = true;
    },
    async handleSubmit(penulisData) {
      try {
        if (penulisData.id) {
          await updatePenulis(penulisData.id, { nama: penulisData.nama });
          this.$toast.success("Penulis berhasil diperbarui!");
        } else {
          await createPenulis({ nama: penulisData.nama });
          this.$toast.success("Penulis berhasil ditambahkan!");
        }
        this.showModal = false;
        await this.fetchPenulis();
      } catch (error) {
        const errorMessage = error.message || "Terjadi kesalahan. Silakan coba lagi!";
        this.$toast.error(errorMessage);
      }
    },
    async deletePenulis() {
      if (!this.penulisToDelete) {
        console.error("ID penulis tidak ditemukan!"); // Debugging
        return;
      }
      try {
        // Menghapus penulis melalui API
        await deletePenulis(this.penulisToDelete); // Kirim ID yang benar
        // Menghapus penulis yang sudah dihapus dari data yang ditampilkan
        this.penulis = this.penulis.filter((penulis) => penulis.id_penulis !== this.penulisToDelete);
        this.$toast.success("Penulis berhasil dihapus!");
        this.closeDeleteModal();
      } catch (error) {
        this.$toast.error("Terjadi kesalahan saat menghapus penulis!");
        this.closeDeleteModal();
      }
    },
    confirmDeletePenulis(penulis) {
      console.log("Penulis yang akan dihapus:", penulis); // Debugging
      // Pastikan kita mengambil nilai id_penulis secara eksplisit
      if (penulis && penulis.id_penulis) {
        this.penulisToDelete = penulis.id_penulis; // Mengambil nilai id_penulis
        this.isDeleteModalVisible = true;
      } else {
        console.error("ID penulis tidak ditemukan!"); // Debugging lebih lanjut
      }
    },
    closeDeleteModal() {
      this.isDeleteModalVisible = false;
      this.penulisToDelete = null;
    },
    closeModal() {
    this.showModal = false;
    this.currentPenulis = { id: null, nama: "" }; // Reset data modal
  },
    async fetchPenulis() {
      try {
        const data = await getAllPenulis();
        console.log("Data Penulis:", data); // Debugging respons API

        // Menampilkan setiap penulis dan ID-nya untuk debugging
        this.penulis = data.data;
        this.penulis.forEach((penulis) => {
          console.log(penulis.id_penulis); // Pastikan ID terisi dengan benar
        });
      } catch (error) {
        console.error("Error fetching penulis:", error);
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
