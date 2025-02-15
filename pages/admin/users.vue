<template>
  <div class="">
    <Header />
  <div class="container mt-4">

    <!-- Input Pencarian -->
    <b-form-group class="mb-3 card-shadow">
      <b-form-input
        v-model="searchQuery"
        placeholder="Cari berdasarkan nama atau email..."
        debounce="300"
        size="lg"
        class="shadow-sm"
      ></b-form-input>
    </b-form-group>

    <!-- Tombol Tambah Pengguna -->
    <b-button variant="success" @click="openAddModal" class="mb-3">Tambah Pengguna <b-icon-plus></b-icon-plus></b-button>

    <!-- Card for Table -->
      <b-table
        striped
        hover
        bordered
        responsive
        :items="paginatedUsers"
        :fields="fields"
        class="bg-light table-hover card-shadow"
      >
        <template #cell(image)="data">
          <img
            v-if="data.item.image"
            :src="data.item.image.startsWith('http') ? data.item.image : `http://localhost:8080/${data.item.image}`"
            :alt="data.item.name"
            class="rounded-circle border shadow-sm"
            width="50"
            height="50"
          />
          <span v-else class="text-muted">Tidak ada foto</span>
        </template>

        <template #cell(actions)="data">
          <b-button
            variant="primary"
            size="sm"
            @click="openEditModal(data.item)"
            class="btn bg-kuning"><b-icon-pencil></b-icon-pencil>
          </b-button>
          <b-button
            variant="danger"
            size="sm"
            @click="confirmDeleteUser(data.item.id)"
            class="btn bg-merah"><b-icon-trash></b-icon-trash>
          </b-button>
        </template>
      </b-table>

    <!-- Pagination -->
    <b-pagination
      v-model="currentPage"
      :total-rows="filteredUsers.length"
      :per-page="perPage"
      aria-controls="user-table"
      align="center"
      class="mt-3"
      size="lg"
    ></b-pagination>

    <!-- Modal Component -->
    <UserModal
      :showModal="showModal"
      :userData="currentUser"
      @submit="handleSubmit"
    />

    <!-- Modal Konfirmasi Hapus -->
    <NotificationModal
      :isVisible="isDeleteModalVisible"
      :messageTitle="'Konfirmasi Penghapusan'"
      :messageBody="'Apakah Anda yakin ingin menghapus pengguna ini?'"
      @close="closeDeleteModal"
    >
      <template #footer>
        <button @click="deleteUser" class="btn btn-danger">Ya, Hapus</button>
        <button @click="closeDeleteModal" class="btn btn-secondary">Batal</button>
      </template>
    </NotificationModal>
  </div>
</div>
</template>

<script>
import { getAllUsers, deleteUser, createUser, updateUser } from '~/api/users';
import UserModal from '~/components/UserModal.vue';
import NotificationModal from '~/components/NotificationModal.vue';  // Import modal konfirmasi
import Header from '~/components/Header.vue';

export default {
  components: {
    UserModal,
    NotificationModal,
    Header
  },
  data() {
    return {
      users: [],
      searchQuery: "",
      perPage: 5,
      currentPage: 1,
      showModal: false,
      currentUser: {
        id: null,
        name: '',
        email: '',
        role: '',
        alamat: '',
        no_telepon: '',
      },
      isDeleteModalVisible: false,  // State untuk visibilitas modal konfirmasi hapus
      userToDelete: null,  // Menyimpan ID pengguna yang akan dihapus
      fields: [
        { key: 'image', label: 'Foto', sortable: false },
        { key: 'name', label: 'Nama', sortable: true },
        { key: 'email', label: 'Email', sortable: true },
        { key: 'role', label: 'Role', sortable: true },
        { key: 'alamat', label: 'Alamat', sortable: false },
        { key: 'no_telepon', label: 'No. Telepon', sortable: false },
        { key: 'actions', label: 'Aksi' }
      ],
    };
  },
  async mounted() {
    try {
      const data = await getAllUsers();
      this.users = data.data;
    } catch (error) {
      console.error('Error fetching users:', error);
    }
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
  methods: {
    name:'users',
    openAddModal() {
      this.currentUser = {
        id: null,
        name: '',
        email: '',
        role: '',
        alamat: '',
        no_telepon: '',
      };
      this.showModal = true;
    },
    openEditModal(user) {
      this.currentUser = { ...user };
      this.showModal = true;
    },
    async handleSubmit(userData) {
      try {
        if (userData.id) {
          await updateUser(userData.id, userData);
          this.$toast.success('Pengguna berhasil diperbarui!');
        } else {
          await createUser(userData);
          this.$toast.success('Pengguna berhasil ditambahkan!');
        }
        this.showModal = false;
        await this.fetchUsers();
      } catch (error) {
        this.$toast.error('Terjadi kesalahan. Silakan coba lagi!');
      }
    },
    async deleteUser() {
      if (!this.userToDelete) return;
      try {
        await deleteUser(this.userToDelete);
        this.users = this.users.filter(user => user.id !== this.userToDelete);
        this.$toast.success('Pengguna berhasil dihapus!');
        this.closeDeleteModal();
      } catch (error) {
        this.$toast.error('Terjadi kesalahan saat menghapus pengguna!');
        this.closeDeleteModal();
      }
    },
    confirmDeleteUser(userId) {
  this.userToDelete = userId;
  this.isDeleteModalVisible = true;  // Pastikan hanya modal konfirmasi yang terbuka
},
    closeDeleteModal() {
      this.isDeleteModalVisible = false;  // Sembunyikan modal konfirmasi
      this.userToDelete = null;  // Reset ID pengguna yang akan dihapus
    },
    async fetchUsers() {
      try {
        const data = await getAllUsers();
        this.users = data.data;
      } catch (error) {
        console.error('Error fetching users:', error);
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
