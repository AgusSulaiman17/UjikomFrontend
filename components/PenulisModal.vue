<template>
  <b-modal
    v-model="showModal"
    :title="isEditMode ? 'Edit Penulis' : 'Tambah Penulis'"
    size="lg"
    @ok="submitForm"
    @hide="closeModal"
  >
    <b-form @submit.prevent="submitForm">
      <b-form-group label="Nama Penulis" label-for="nama">
        <b-form-input id="nama" v-model="form.nama" required></b-form-input>
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
      console.log("🔵 Mengirim data dari modal:", this.form);
      this.$emit("submit", this.form);
    },
    closeModal() {
      this.$emit("update:showModal", false);
      this.form = { id: null, nama: "" }; // Reset form agar modal tidak terbuka kembali
    },
  },
};
</script>
