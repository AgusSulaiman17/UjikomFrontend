<template>
  <b-modal v-model="localShowModal" :title="isEditMode ? 'Edit Peminjaman' : 'Tambah Peminjaman'" size="lg" @ok="submitForm">
    <b-form @submit.prevent="submitForm">

      <!-- Pencarian dan Pilihan User -->
      <b-form-group label="Cari User (Nama atau Email)">
        <b-form-input v-model="searchUser"
          @focus="showUserDropdown = true" @blur="hideDropdown('user')" />
        <b-list-group v-if="showUserDropdown">
          <b-list-group-item
            v-for="user in filteredUsers"
            :key="user.value"
            @mousedown="selectUser(user)">
            {{ user.text }}
          </b-list-group-item>
          <b-list-group-item v-if="filteredUsers.length === 0" disabled>
            User tidak tersedia
          </b-list-group-item>
        </b-list-group>
      </b-form-group>

      <!-- Pencarian dan Pilihan Buku -->
      <b-form-group label="Cari Buku (Judul)">
        <b-form-input v-model="searchBook"
          @focus="showBookDropdown = true" @blur="hideDropdown('book')" />
        <b-list-group v-if="showBookDropdown">
          <b-list-group-item
            v-for="book in filteredBooks"
            :key="book.value"
            @mousedown="selectBook(book)">
            {{ book.text }}
          </b-list-group-item>
          <b-list-group-item v-if="filteredBooks.length === 0" disabled>
            Buku tidak tersedia
          </b-list-group-item>
        </b-list-group>
      </b-form-group>

    </b-form>
  </b-modal>
</template>

<script>
import { getAllUsers } from "@/api/users";
import { getAllBuku } from "@/api/buku";

export default {
  props: {
    showModal: Boolean,
    peminjamanData: {
      type: Object,
      default: () => ({
        id_peminjaman: null,
        id_user: null,
        id_buku: null,
        tanggal_pinjam: "",
        durasi_hari: 5,
        status_kembali: false,
      }),
    },
  },
  data() {
    return {
      form: {},
      userOptions: [],
      bookOptions: [],
      searchUser: "",
      searchBook: "",
      showUserDropdown: false,
      showBookDropdown: false,
      localShowModal: this.showModal, // Menyimpan nilai showModal ke data lokal
    };
  },
  computed: {
    isEditMode() {
      return this.form.id_peminjaman !== null;
    },
    filteredUsers() {
      if (!this.searchUser) return this.userOptions;
      return this.userOptions.filter(user => user.text.toLowerCase().includes(this.searchUser.toLowerCase()));
    },
    filteredBooks() {
      if (!this.searchBook) return this.bookOptions;
      return this.bookOptions.filter(book => book.text.toLowerCase().includes(this.searchBook.toLowerCase()));
    }
  },
  watch: {
    showModal(newVal) {
      if (newVal) {
        this.initializeForm();
      }
      this.localShowModal = newVal;
    },
    localShowModal(newVal) {
      this.$emit('update:showModal', newVal);
    }
  },
  methods: {
    async fetchUsers() {
      try {
        const response = await getAllUsers();
        this.userOptions = response.data.map(user => ({
          value: user.id,
          text: `${user.name} (${user.email})`, // Menampilkan nama dan email
        }));
      } catch (error) {
        console.error("Gagal mengambil data user:", error);
      }
    },
    async fetchBooks() {
      try {
        const response = await getAllBuku();
        this.bookOptions = response.data.map(book => ({
          value: book.id_buku,
          text: book.judul,
        }));
      } catch (error) {
        console.error("Gagal mengambil data buku:", error);
      }
    },
    initializeForm() {
      this.form = {
        id_peminjaman: this.peminjamanData.id_peminjaman || null,
        id_user: this.peminjamanData.id_user ? Number(this.peminjamanData.id_user) : null,
        id_buku: this.peminjamanData.id_buku ? Number(this.peminjamanData.id_buku) : null,
      };
    },
    selectUser(user) {
      this.form.id_user = user.value;
      this.searchUser = user.text;
      this.showUserDropdown = false;
    },
    selectBook(book) {
      this.form.id_buku = book.value;
      this.searchBook = book.text;
      this.showBookDropdown = false;
    },
    hideDropdown(type) {
      setTimeout(() => {
        if (type === "user") this.showUserDropdown = false;
        if (type === "book") this.showBookDropdown = false;
      }, 200);
    },
    submitForm() {
      if (!this.form.id_user || !this.form.id_buku) {
        this.$toast.error("User dan Buku harus dipilih!");
        return;
      }

      const formData = new FormData();
      formData.append("id_user", this.form.id_user);
      formData.append("id_buku", this.form.id_buku);

      this.$emit("submit", formData);
    }
  },
  mounted() {
    this.fetchUsers();
    this.fetchBooks();
  },
};
</script>
