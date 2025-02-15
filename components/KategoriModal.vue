<template>
  <b-modal
    v-model="showModal"
    :title="isEditMode ? 'Edit Kategori' : 'Tambah Kategori'"
    size="lg"
    @ok="submitForm"
  >
    <b-form @submit.prevent="submitForm">
      <b-form-group label="Nama Kategori" label-for="name">
        <b-form-input
          id="name"
          v-model="form.kategori"
          required
          :state="form.kategori && form.kategori.length > 0"
        ></b-form-input>
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
      form: { ...this.categoryData }, // Memastikan form terupdate dengan data dari categoryData
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
      this.$emit('submit', this.form);  // Kirim data form ke parent
    },
  },
};
</script>
