<template>
  <b-modal v-model="showModal" :title="isEditMode ? 'Edit Pengguna' : 'Tambah Pengguna'" size="lg" @ok="submitForm"
    @hidden="closeModal">
    <b-form @submit.prevent="submitForm">
      <b-form-group label="Nama" label-for="name">
        <b-form-input id="name" v-model="form.name" :state="nameValid" @input="validateName" required></b-form-input>
        <b-form-invalid-feedback>
          Nama tidak boleh kosong atau hanya angka.
        </b-form-invalid-feedback>
      </b-form-group>

      <b-form-group label="Email" label-for="email">
        <b-form-input id="email" v-model="form.email" type="email" required :disabled="isEditMode"></b-form-input>
      </b-form-group>

      <b-form-group label="Alamat" label-for="alamat">
        <b-form-input id="alamat" v-model="form.alamat" :state="alamatValid" @input="validateAlamat" required></b-form-input>
        <b-form-invalid-feedback>
          Alamat tidak boleh kosong atau hanya angka.
        </b-form-invalid-feedback>
      </b-form-group>

      <b-form-group label="No. Telepon" label-for="no_telepon">
        <b-form-input id="no_telepon" v-model="form.no_telepon" required :disabled="isEditMode"></b-form-input>
      </b-form-group>

      <b-form-group label="Password" label-for="password" v-if="!isEditMode">
        <b-form-input id="password" v-model="form.password" type="password" required></b-form-input>
      </b-form-group>

      <b-form-group label="Password Baru (Kosongkan jika tidak ingin mengubah)" label-for="password-edit"
        v-if="isEditMode">
        <b-form-input id="password-edit" v-model="form.password" type="password"></b-form-input>
      </b-form-group>
    </b-form>
  </b-modal>
</template>


<script>
export default {
  props: {
    showModal: Boolean,
    userData: {
      type: Object,
      default: () => ({
        id: null,
        name: '',
        email: '',
        role: '',
        alamat: '',
        no_telepon: '',
        password: '',
      }),
    },
  },
  data() {
    return {
      form: { ...this.userData, password: "" },
      roleOptions: ['admin', 'user', 'petugas'],
      nameValid: null,
      alamatValid: null,
    };
  },
  computed: {
    isEditMode() {
      return !!this.userData.id;
    },
  },
  watch: {
    userData: {
      handler(newData) {
        if (this.showModal) {
          this.form = { ...newData, password: "" };
        }
      },
      immediate: true,
    },
  },
  methods: {
    isOnlyNumber(str) {
      return /^\d+$/.test(str.trim());
    },
    validateName() {
      this.nameValid = this.form.name.trim() !== '' && !this.isOnlyNumber(this.form.name);
    },
    validateAlamat() {
      this.alamatValid = this.form.alamat.trim() !== '' && !this.isOnlyNumber(this.form.alamat);
    },
    submitForm() {
      this.validateName();
      this.validateAlamat();

      if (!this.nameValid || !this.alamatValid) {
        return; // Hentikan submit jika tidak valid
      }

      const formData = { ...this.form };
      if (this.isEditMode && !formData.password) {
        delete formData.password;
      }
      this.$emit('submit', formData);
    },
    closeModal() {
      this.$emit("update:showModal", false);
      this.$nextTick(() => {
        this.resetForm();
      });
    },
    resetForm() {
      this.form = {
        id: null,
        name: '',
        email: '',
        role: '',
        alamat: '',
        no_telepon: '',
        password: '',
      };
      this.nameValid = null;
      this.alamatValid = null;
    },
  },
};
</script>
