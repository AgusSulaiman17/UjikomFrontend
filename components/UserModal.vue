<template>
  <b-modal v-model="showModal" :title="isEditMode ? 'Edit Pengguna' : 'Tambah Pengguna'" size="lg" @ok="submitForm"
    @hidden="closeModal">

    <b-form @submit.prevent="submitForm">
      <b-form-group label="Nama" label-for="name">
        <b-form-input id="name" v-model="form.name" required :state="form.name && form.name.length > 0"></b-form-input>
      </b-form-group>

      <b-form-group label="Email" label-for="email">
        <b-form-input id="email" v-model="form.email" type="email" required :state="form.email && form.email.length > 0"
          :disabled="isEditMode"></b-form-input>
      </b-form-group>


      <b-form-group label="Role" label-for="role" v-if="user?.role === 'admin'">
        <b-form-select id="role" v-model="form.role" :options="roleOptions" required></b-form-select>
      </b-form-group>


      <b-form-group label="Alamat" label-for="alamat">
        <b-form-input id="alamat" v-model="form.alamat" required></b-form-input>
      </b-form-group>

      <b-form-group label="No. Telepon" label-for="no_telepon">
        <b-form-input id="no_telepon" v-model="form.no_telepon" required :disabled="isEditMode"></b-form-input>
      </b-form-group>


      <!-- Input Password (wajib diisi saat Tambah, opsional saat Edit) -->
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
      form: { ...this.userData, password: "" }, // Salin data user, pastikan password kosong saat edit
      roleOptions: ['admin', 'user', 'petugas'],
    };
  },
  computed: {
    isEditMode() {
      return !!this.userData.id;
    },
    user() {
      return this.$store.getters.getUser || {}; // Jika null, gunakan object kosong
    }
  },
  watch: {
    watch: {
      userData: {
        handler(newData) {
          if (this.showModal) {
            this.form = JSON.parse(JSON.stringify(newData)); // Salin data secara mendalam
            this.form.password = ""; // Kosongkan password saat edit
          }
        },
        deep: true,
        immediate: true,
      },
    }

    ,
    userData: {
      handler(newData) {
        if (this.showModal) {
          this.form = { ...newData, password: "" };
        }
      },
      immediate: true, // Pastikan data langsung disalin saat komponen dimuat
    },
  },
  methods: {
    submitForm() {
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
    },
  },
};
</script>
