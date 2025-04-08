<template>
  <b-modal v-model="modalVisible" :title="isEditMode ? 'Edit Buku' : 'Tambah Buku'" size="lg" @ok="submitForm"
    @hide="closeModal">
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
        <!-- Tampilkan preview gambar -->
        <div class="text-center mb-3">
          <img v-if="previewGambar || form.gambar"
            :src="previewGambar || (typeof form.gambar === 'string' && form.gambar.startsWith('http') ? form.gambar : 'http://localhost:8080/' + form.gambar)"
            alt="Preview Image" class="rounded img-thumbnail border border-secondary" width="120" height="120" />
        </div>

        <!-- Input untuk mengunggah gambar baru -->
        <b-form-file id="gambar" @change="handleFileUpload"
          :placeholder="form.gambar ? 'Ganti gambar...' : 'Pilih gambar...'" :accept="'image/*'">
        </b-form-file>
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
      previewGambar: null,
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
    modalVisible: {
      get() {
        return this.showModal;
      },
      set(value) {
        this.$emit("update:showModal", value);
      },
    },
    isEditMode() {
      return this.form.id_buku !== null && this.form.id_buku !== undefined;
    },
  },
  methods: {
    closeModal() {
      this.$emit("update:showModal", false);
      this.form = {
        id_buku: null,
        judul: "",
        id_penerbit: "",
        id_penulis: "",
        id_kategori: "",
        deskripsi: "",
        jumlah: 1,
        isbn: "",
        gambar: null,
        previewGambar: null,
      };
      this.previewGambar = null;
    },
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.form.gambar = file;

        // Gunakan FileReader untuk membuat preview gambar
        const reader = new FileReader();
        reader.onload = (e) => {
          this.previewGambar = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
    hapusGambar() {
      this.form.gambar = null;
      this.previewGambar = null;
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
  // Validasi semua field wajib diisi
  if (
    !this.form.judul.trim() ||
    !this.form.id_penerbit ||
    !this.form.id_penulis ||
    !this.form.id_kategori ||
    !this.form.deskripsi.trim() ||
    !this.form.isbn.trim() ||
    !this.form.jumlah ||
    this.form.jumlah <= 0
  ) {
    this.$toast.error('Semua field harus diisi dengan benar.', {
      timeout: 3000,
      position: 'top-right',
    });
    return;
  }

  if (isNaN(this.form.jumlah) || this.form.jumlah <= 0) {
    this.$toast.error('Jumlah buku harus lebih dari 0.', {
      timeout: 3000,
      position: 'top-right',
    });
    return;
  }

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
}

  },
};
</script>

<style scoped></style>
