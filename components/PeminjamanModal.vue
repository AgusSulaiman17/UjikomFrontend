<template>
  <b-modal
    v-model="showModal"
    :title="isEditMode ? 'Edit Peminjaman' : 'Tambah Peminjaman'"
    size="lg"
    @ok="submitForm"
    @update:showModal="updateShowModal"
  >
    <b-form @submit.prevent="submitForm">
      <b-form-group label="Pilih User" label-for="userSelect">
        <b-form-select id="userSelect" v-model="form.id_user" :options="userOptions" required></b-form-select>
      </b-form-group>

      <b-form-group label="Pilih Buku" label-for="bookSelect">
        <b-form-select id="bookSelect" v-model="form.id_buku" :options="bookOptions" required></b-form-select>
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
      form: {
        id_peminjaman: null,
        id_user: null,
        id_buku: null,
        tanggal_pinjam: "",
        durasi_hari: 5,
        status_kembali: false,
      },
      userOptions: [],
      bookOptions: [],
    };
  },
  watch: {
    peminjamanData: {
      handler(newVal) {
        if (newVal) {
          this.form = {
            id_peminjaman: newVal.id_peminjaman ?? null,
            id_user: newVal.id_user ?? null,
            id_buku: newVal.id_buku ?? null,
            tanggal_pinjam: newVal.tanggal_pinjam ?? "",
            durasi_hari: newVal.durasi_hari ?? 5,
            status_kembali: newVal.status_kembali ?? false,
          };
        }
      },
      deep: true,
      immediate: true,
    },
  },
  computed: {
    isEditMode() {
      return this.form.id_peminjaman !== null && this.form.id_peminjaman !== undefined;
    },
  },
  methods: {
    async fetchUsers() {
  try {
    const response = await getAllUsers();
    console.log("Data User:", response.data);
    this.userOptions = response.data.map(user => ({
      value: user.id_user,
      text: user.name,
    }));
  } catch (error) {
    console.error("Gagal mengambil data user:", error);
  }
}
,
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
    updateShowModal(value) {
      this.$emit("update:showModal", value);
    },
    submitForm() {
      this.$emit("submit", this.form);
    },
  },
  mounted() {
    this.fetchUsers();
    this.fetchBooks();
  },
};
</script>
