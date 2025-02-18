<template>
  <b-modal v-model="localShowModal" :title="isEditMode ? 'Edit Peminjaman' : 'Tambah Peminjaman'" size="lg"
    @ok="submitForm">
    <b-form @submit.prevent="submitForm">
      <b-form-group label="Pilih User" label-for="userSelect">
        <b-form-select id="userSelect" v-model="form.id_user" :options="userOptions" required>
          <template #first>
            <option :value="null" disabled>Pilih User</option>
          </template>
        </b-form-select>
      </b-form-group>

      <b-form-group label="Pilih Buku" label-for="bookSelect">
        <b-form-select id="bookSelect" v-model="form.id_buku" :options="bookOptions" required>
          <template #first>
            <option :value="null" disabled>Pilih Buku</option>
          </template>
        </b-form-select>
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
      localShowModal: this.showModal, // Menyimpan nilai showModal ke data lokal
    };
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
  computed: {
    isEditMode() {
      return this.form.id_peminjaman !== null;
    },
  },
  methods: {
    async fetchUsers() {
  try {
    const response = await getAllUsers();
    console.log("Users fetched:", response.data);  // Log untuk memeriksa data yang diterima
    this.userOptions = response.data.map(user => ({
      value: user.id,  // Gunakan 'id' sesuai dengan data yang diterima
      text: user.name,  // Gunakan 'name' sesuai dengan data yang diterima
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
