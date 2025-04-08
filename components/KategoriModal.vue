<template>
  <b-modal v-model="showModal" :title="isEditMode ? 'Edit Kategori' : 'Tambah Kategori'" size="lg" @ok="submitForm"
    @hide="closeModal">
    <b-form @submit.prevent="submitForm">
      <b-form-group label="Nama Kategori" label-for="name">
        <b-form-input id="name" v-model="form.kategori" :state="kategoriValid" @input="validateKategori" required
          placeholder="Masukkan nama kategori"></b-form-input>
        <b-form-invalid-feedback>
          Nama kategori tidak boleh kosong atau hanya angka.
        </b-form-invalid-feedback>
      </b-form-group>

    </b-form>
  </b-modal>
</template>

<script>
export default {
  props: {
    showModal: {
      type: Boolean,
      required: true,
    },
    categoryData: {
      type: Object,
      default: () => ({
        id: null,
        kategori: '',
      }),
    },
  },
  data() {
    return {
      form: { ...this.categoryData },
      kategoriValid: null, // null = belum dicek, true/false = valid/invalid
    };
  },
  watch: {
    categoryData(newVal) {
      this.form = { ...newVal }; // Memastikan form terupdate setiap categoryData berubah
    }
  },
  computed: {
    isEditMode() {
      return !!this.form.id; // Menentukan mode Edit jika ada ID
    },
  },
  methods: {
    submitForm() {
      this.validateKategori(); // validasi ulang saat submit

      if (this.kategoriValid) {
        this.$emit('submit', this.form);
      }
    },
    closeModal() {
      this.$emit("update:showModal", false);
      this.form = { id: null, kategori: '' };
      this.kategoriValid = null;
    },
    validateKategori() {
      const kategori = this.form.kategori.trim();
      this.kategoriValid = kategori.length > 0 && !this.isOnlyNumber(kategori);
    },
    isOnlyNumber(str) {
      return /^\d+$/.test(str); // True kalau hanya angka
    },
  }
};
</script>
