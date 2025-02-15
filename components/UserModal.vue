<template>
  <b-modal
    v-model="showModal"
    :title="isEditMode ? 'Edit Pengguna' : 'Tambah Pengguna'"
    size="lg"
    @ok="submitForm"
  >
    <b-form @submit.prevent="submitForm">
      <b-form-group label="Nama" label-for="name">
        <b-form-input
          id="name"
          v-model="form.name"
          required
          :state="form.name && form.name.length > 0"
        ></b-form-input>
      </b-form-group>

      <b-form-group label="Email" label-for="email">
        <b-form-input
          id="email"
          v-model="form.email"
          type="email"
          required
          :state="form.email && form.email.length > 0"
        ></b-form-input>
      </b-form-group>

      <b-form-group label="Role" label-for="role">
        <b-form-select
          id="role"
          v-model="form.role"
          :options="roleOptions"
          required
        ></b-form-select>
      </b-form-group>

      <b-form-group label="Alamat" label-for="alamat">
        <b-form-input id="alamat" v-model="form.alamat" required></b-form-input>
      </b-form-group>

      <b-form-group label="No. Telepon" label-for="no_telepon">
        <b-form-input id="no_telepon" v-model="form.no_telepon" required></b-form-input>
      </b-form-group>

      <!-- Input Password (wajib diisi saat Tambah, opsional saat Edit) -->
      <b-form-group label="Password" label-for="password" v-if="!isEditMode">
        <b-form-input
          id="password"
          v-model="form.password"
          type="password"
          required
        ></b-form-input>
      </b-form-group>

      <b-form-group label="Password Baru (Kosongkan jika tidak ingin mengubah)" label-for="password-edit" v-if="isEditMode">
        <b-form-input
          id="password-edit"
          v-model="form.password"
          type="password"
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
      form: { ...this.userData }, // Salin data user
      roleOptions: ['admin', 'user'],
    };
  },
  computed: {
    isEditMode() {
      return !!this.userData.id;
    },
  },
  watch: {
  showModal(newVal) {
    console.log("showModal berubah menjadi:", newVal);
  },
  userData(newData) {
    console.log("userData berubah menjadi:", newData);
    this.form = { ...newData, password: '' }; // Reset password agar tidak terkirim tanpa perubahan
  }
},
  methods: {
    submitForm() {
      // Jika password kosong saat edit, hapus dari objek agar tidak terkirim
      if (this.isEditMode && !this.form.password) {
        delete this.form.password;
      }

      this.$emit('submit', this.form);
    },
  },
};
</script>
