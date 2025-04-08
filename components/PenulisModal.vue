<template>
  <b-modal v-model="showModal" :title="isEditMode ? 'Edit Penulis' : 'Tambah Penulis'" size="lg" @ok="submitForm"
    @hide="closeModal">
    <b-form @submit.prevent="submitForm">
      <b-form-group label="Nama Penulis" label-for="nama">
        <b-form-input id="nama" v-model="form.nama" :state="namaValid" @input="validateNama" required
          placeholder="Masukkan nama penulis"></b-form-input>
        <b-form-invalid-feedback>
          Nama penulis tidak boleh kosong atau hanya berisi angka.
        </b-form-invalid-feedback>
      </b-form-group>

    </b-form>
  </b-modal>
</template>

<script>
export default {
  props: {
    showModal: Boolean,
    penulisData: {
      type: Object,
      default: () => ({
        id: null,
        nama: "",
      }),
    },
  },
  data() {
    return {
      form: {
        id: null,
        nama: "",
      },
      namaValid: null, // Validasi untuk nama penulis
    };
  },

  watch: {
    penulisData: {
      handler(newVal) {
        console.log("🟢 Data penulis diterima di modal:", newVal);
        if (newVal) {
          this.form = {
            id: newVal.id_penulis ?? null,
            nama: newVal.nama ?? "",
          };
        }
        console.log("🟠 ID penulis di modal setelah perbaikan:", this.form.id);
      },
      deep: true,
      immediate: true,
    },
  },
  computed: {
    isEditMode() {
      return this.form.id !== null && this.form.id !== undefined;
    },
  },

  methods: {
    submitForm() {
      this.validateNama();

      if (this.namaValid) {
        this.$emit("submit", this.form);
      }
    },
    closeModal() {
      this.$emit("update:showModal", false);
      this.form = { id: null, nama: "" };
      this.namaValid = null;
    },
    validateNama() {
      const nama = this.form.nama.trim();
      this.namaValid = nama.length > 0 && !this.isOnlyNumber(nama);
    },
    isOnlyNumber(str) {
      return /^\d+$/.test(str); // True jika hanya angka
    },
  },
};
</script>
