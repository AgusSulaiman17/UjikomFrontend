<template>
  <b-modal v-model="showModal" :title="isEditMode ? 'Edit Buku' : 'Tambah Buku'" size="lg" @ok="submitForm"
    @update:showModal="updateShowModal">
    <b-form @submit.prevent="submitForm">
      <b-form-group label="Judul Buku" label-for="judul">
        <b-form-input id="judul" v-model="form.judul" required></b-form-input>
      </b-form-group>

      <b-form-group label="Penerbit" label-for="penerbit">
        <b-form-select id="penerbit" v-model="form.id_penerbit" :options="penerbitOptions" required>
          <template #first>
            <option value="">Pilih Penerbit</option>
          </template>
        </b-form-select>
      </b-form-group>

      <b-form-group label="Penulis" label-for="penulis">
        <b-form-select id="penulis" v-model="form.id_penulis" :options="penulisOptions" required>
          <template #first>
            <option value="">Pilih Penulis</option>
          </template>
        </b-form-select>
      </b-form-group>

      <b-form-group label="Kategori" label-for="kategori">
        <b-form-select id="kategori" v-model="form.id_kategori" :options="kategoriOptions" required>
          <template #first>
            <option value="">Pilih Kategori</option>
          </template>
        </b-form-select>
      </b-form-group>

      <b-form-group label="Deskripsi" label-for="deskripsi">
        <b-form-textarea id="deskripsi" v-model="form.deskripsi" rows="3" required></b-form-textarea>
      </b-form-group>

      <b-form-group label="ISBN" label-for="isbn">
        <b-form-input id="isbn" v-model="form.isbn" required></b-form-input>
      </b-form-group>

      <b-form-group label="Jumlah Buku" label-for="jumlah">
        <b-form-input id="jumlah" v-model="form.jumlah" type="number" required></b-form-input>
      </b-form-group>

      <b-form-group label="Gambar Buku" label-for="gambar">
        <!-- Tampilkan gambar yang sudah ada -->
        <div v-if="form.gambar && typeof form.gambar === 'string'" class="mb-3">
          <b-img :src="form.gambar" alt="Gambar Buku" thumbnail width="100" class="mb-2"></b-img>
          <b-button variant="danger" size="sm" @click="hapusGambar">Hapus Gambar</b-button>
        </div>
        <!-- Input untuk mengunggah gambar baru -->
        <b-form-file id="gambar" @change="handleFileUpload" :placeholder="form.gambar ? 'Ganti gambar...' : 'Pilih gambar...'"
          :accept="'image/*'"></b-form-file>
      </b-form-group>
    </b-form>
  </b-modal>
</template>

<script>
import { getAllPenerbit } from "~/api/penerbit";
import { getAllPenulis } from "~/api/penulis";
import { getAllKategori } from "~/api/kategori";

export default {
  props: {
    showModal: Boolean,
    bukuData: {
      type: Object,
      default: () => ({
        id_buku: null,
        judul: "",
        id_penerbit: "",
        id_penulis: "",
        id_kategori: "",
        deskripsi: "",
        jumlah: 1,
        isbn: "",
        status: true,
        gambar: null,
      }),
    },
  },
  data() {
    return {
      form: {
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
      penerbitOptions: [],
      penulisOptions: [],
      kategoriOptions: [],
    };
  },
  async created() {
    await this.fetchPenerbit();
    await this.fetchPenulis();
    await this.fetchKategori();
  },
  watch: {
    bukuData: {
      handler(newVal) {
        if (newVal) {
          this.form = { ...newVal };
          this.form.id_penerbit = newVal.id_penerbit || "";
          this.form.id_penulis = newVal.id_penulis || "";
          this.form.id_kategori = newVal.id_kategori || "";
          this.form.gambar = newVal.gambar || null;
        }
      },
      deep: true,
      immediate: true,
    },
  },
  computed: {
    isEditMode() {
      return this.form.id_buku !== null && this.form.id_buku !== undefined;
    },
  },
  methods: {
    updateShowModal(value) {
      this.$emit("update:showModal", value);
    },
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.form.gambar = file;
      }
    },
    hapusGambar() {
      this.form.gambar = null;
    },
    async fetchPenerbit() {
      try {
        const response = await getAllPenerbit();
        this.penerbitOptions = response.data.map((p) => ({
          value: p.id_penerbit,
          text: p.nama,
        }));
      } catch (error) {
        console.error("Gagal mengambil data penerbit:", error);
      }
    },
    async fetchPenulis() {
      try {
        const response = await getAllPenulis();
        this.penulisOptions = response.data.map((p) => ({
          value: p.id_penulis,
          text: p.nama,
        }));
      } catch (error) {
        console.error("Gagal mengambil data penulis:", error);
      }
    },
    async fetchKategori() {
      try {
        const response = await getAllKategori();
        this.kategoriOptions = response.data.map((k) => ({
          value: k.id,
          text: k.kategori,
        }));
      } catch (error) {
        console.error("Gagal mengambil data kategori:", error);
      }
    },
    submitForm() {
      const formData = new FormData();
      if (this.isEditMode) {
        formData.append("id_buku", this.form.id_buku);
      }
      formData.append("judul", this.form.judul);
      formData.append("id_penerbit", this.form.id_penerbit);
      formData.append("id_penulis", this.form.id_penulis);
      formData.append("id_kategori", this.form.id_kategori);
      formData.append("deskripsi", this.form.deskripsi);
      formData.append("jumlah", this.form.jumlah);
      formData.append("isbn", this.form.isbn);
      if (this.form.gambar && typeof this.form.gambar !== "string") {
        formData.append("gambar", this.form.gambar);
      }

      this.$emit("submit", formData);
    },
  },
};
</script>

<style scoped>
/* Tambahkan gaya CSS sesuai kebutuhan */
</style>
