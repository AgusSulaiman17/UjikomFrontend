<template>
  <div>
    <Header />
    <div class="container mt-6">
      <!-- Input Pencarian -->
      <b-form-group class="mb-3 card-shadow">
        <b-form-input v-model="searchQuery" placeholder="Cari berdasarkan nama atau email..." debounce="300" size="lg"
          class="shadow-sm">
        </b-form-input>
      </b-form-group>

      <!-- Tabel Pengguna -->
      <b-table striped hover bordered responsive :items="paginatedUsers" :fields="fields"
        class="bg-light table-hover card-shadow">

        <!-- Nomor urut -->
        <template #cell(index)="data">
          {{ (currentPage - 1) * perPage + data.index + 1 }}
        </template>

        <!-- Aksi -->
        <template #cell(actions)="data">
          <b-button variant="success" size="sm" @click="confirmApproveUser(data.item.id)" class="btn bg-hijau">
            <b-icon-check-circle></b-icon-check-circle> Setujui
          </b-button>
          <b-button variant="danger" size="sm" @click="confirmDeleteUser(data.item.id)" class="btn bg-merah">
            <b-icon-trash></b-icon-trash>
          </b-button>
        </template>

        <!-- Pesan jika data kosong -->
        <template #empty>
          <div class="text-center p-3">
            <b-icon-exclamation-circle class="text-muted" font-scale="2"></b-icon-exclamation-circle>
            <p class="mt-2 text-muted">Data tidak ada</p>
          </div>
        </template>
      </b-table>
      <div v-if="paginatedUsers.length === 0" class="text-center p-3">
        <b-icon-exclamation-circle class="text-muted" font-scale="2"></b-icon-exclamation-circle>
        <p class="mt-2 text-muted">Data Kosong</p>
      </div>

      <!-- Pagination -->
      <b-pagination v-model="currentPage" :total-rows="filteredUsers.length" :per-page="perPage" align="center"
        class="mt-3" size="lg">
      </b-pagination>

      <!-- Modal Konfirmasi Approve -->
      <NotificationModal :isVisible="isApproveModalVisible" :messageTitle="'Konfirmasi Persetujuan'"
        :messageBody="'Apakah Anda yakin ingin menyetujui pengguna ini?'" @close="closeApproveModal">

        <template #footer>
          <button @click="approveUser" class="btn btn-success" :disabled="isApproving">
            <b-icon v-if="isApproving" icon="arrow-clockwise" animation="spin"></b-icon>
            <span v-else>Ya, Setujui</span>
          </button>
          <button @click="closeApproveModal" class="btn btn-secondary" :disabled="isApproving">
            Batal
          </button>
        </template>

      </NotificationModal>

      <!-- Modal Konfirmasi Hapus -->
      <NotificationModal :isVisible="isDeleteModalVisible" :messageTitle="'Konfirmasi Penghapusan'"
        :messageBody="'Apakah Anda yakin ingin menghapus pengguna ini?'" @close="closeDeleteModal">

        <template #footer>
          <button @click="deleteUser" class="btn btn-danger">Ya, Hapus</button>
          <button @click="closeDeleteModal" class="btn btn-secondary">Batal</button>
        </template>
      </NotificationModal>
    </div>
  </div>
</template>

<script>
import { getUsersUnapp, ApproveUser, deleteUser } from "@/api/users";
import NotificationModal from '~/components/NotificationModal.vue';
import Header from '~/components/Header.vue';

export default {
  components: {
    NotificationModal,
    Header
  },
  data() {
    return {
      users: [],
      searchQuery: "",
      perPage: 10,
      currentPage: 1,
      showModal: false,
      currentUser: {},
      isDeleteModalVisible: false,
      isApproveModalVisible: false,
      userToApprove: null,
      userToDelete: null,
      isApproving: false,
      fields: [
        { key: "index", label: "No" },
        { key: "name", label: "Nama", sortable: true },
        { key: "email", label: "Email", sortable: true },
        { key: "no_telepon", label: "No. Telepon", sortable: false },
        { key: "alamat", label: "Alamat", sortable: false },
        { key: "actions", label: "Aksi" }
      ],
    };
  },
  computed: {
    filteredUsers() {
      if (!this.searchQuery) return this.users;
      const query = this.searchQuery.toLowerCase();
      return this.users.filter(user =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    },
    paginatedUsers() {
      const start = (this.currentPage - 1) * this.perPage;
      const end = start + this.perPage;
      return this.filteredUsers.slice(start, end);
    }
  },
  async mounted() {
    this.fetchUsers();
  },
  methods: {
    async fetchUsers() {
      try {
        const response = await getUsersUnapp();
        this.users = response.data || [];
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    },
    confirmApproveUser(userId) {
      this.userToApprove = userId;
      this.isApproveModalVisible = true;
    },
    closeApproveModal() {
      this.isApproveModalVisible = false;
      this.userToApprove = null;
    },
    async approveUser() {
      if (!this.userToApprove) return;

      this.isApproving = true; // Aktifkan loading

      try {
        await ApproveUser(this.userToApprove);
        this.users = this.users.filter((user) => user.id !== this.userToApprove);
        this.$toast.success("Pengguna berhasil disetujui!");
        this.closeApproveModal();
      } catch (error) {
        this.$toast.error("Gagal menyetujui pengguna.");
      } finally {
        this.isApproving = false; // Matikan loading setelah selesai
      }
    },
    confirmDeleteUser(userId) {
      this.userToDelete = userId;
      this.isDeleteModalVisible = true;
    },
    closeDeleteModal() {
      this.isDeleteModalVisible = false;
      this.userToDelete = null;
    },
    async deleteUser() {
      if (!this.userToDelete) return;
      try {
        await deleteUser(this.userToDelete);
        this.users = this.users.filter(user => user.id !== this.userToDelete);
        this.$toast.success("Pengguna berhasil dihapus!");
        this.closeDeleteModal();
      } catch (error) {
        this.$toast.error("Terjadi kesalahan saat menghapus pengguna!");
        this.closeDeleteModal();
      }
    }
  }
};
</script>
