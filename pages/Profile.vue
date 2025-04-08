<template>
  <div>
    <div class="container mt-6">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card shadow-lg border-0 rounded-lg">
            <div class="card-body text-center p-5">
              <img v-if="user.image"
                :src="user.image.startsWith('http') ? user.image : 'http://localhost:8080/' + user.image"
                alt="Profile Image" class="rounded-circle img-thumbnail border border-primary mb-3" width="150" height="150" />
              <h3 class="card-title text-primary fw-bold">{{ user.name }}</h3>
              <p class="text-muted"><i class="bi bi-envelope"></i> {{ user.email }}</p>

              <hr />

              <div class="text-start">
                <p><i class="bi bi-geo-alt-fill text-danger"></i> <strong>Alamat:</strong> {{ user.alamat }}</p>
                <p><i class="bi bi-telephone-fill text-success"></i> <strong>No Telepon:</strong> {{ user.no_telepon }}</p>
              </div>

              <b-button variant="primary" class="mt-3 shadow-sm" @click="showEditModal">
                <i class="bi bi-pencil-square"></i> Edit Profil
              </b-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Edit Profil -->
    <b-modal v-model="showModal" title="Edit Profil" hide-footer>
      <form @submit.prevent="updateProfile">
        <div class="text-center mb-3">
          <img v-if="editedUser.imagePreview || editedUser.image"
            :src="editedUser.imagePreview || (editedUser.image.startsWith('http') ? editedUser.image : 'http://localhost:8080/' + editedUser.image)"
            alt="Preview Image" class="rounded-circle img-thumbnail border border-secondary" width="120" height="120" />
        </div>

        <b-form-group label="Foto Profil">
          <b-form-file @change="handleImageUpload" accept="image/*"></b-form-file>
        </b-form-group>

        <b-form-group label="Nama">
          <b-form-input v-model="editedUser.name" required></b-form-input>
        </b-form-group>

        <b-form-group label="Email">
          <b-form-input v-model="editedUser.email" readonly></b-form-input>
        </b-form-group>

        <b-form-group label="Alamat">
          <b-form-input v-model="editedUser.alamat"></b-form-input>
        </b-form-group>

        <b-form-group label="No Telepon">
          <b-form-input v-model="editedUser.no_telepon" readonly></b-form-input>
        </b-form-group>

        <b-form-group label="Password Baru ( Kosongkan jika tidak ingin mengubah )">
          <b-form-input type="password" v-model="editedUser.password"></b-form-input>
        </b-form-group>

        <b-button type="submit" variant="success" class="w-100 shadow-sm">
          <i class="bi bi-check-circle"></i> Simpan Perubahan
        </b-button>
      </form>
    </b-modal>
  </div>
</template>


<script>
import { getUserById, updateUser } from "@/api/users";
import Header from "~/components/Header.vue";

export default {
  components:{
    Header
  },
  data() {
    return {
      user: {},
      editedUser: {},
      showModal: false,
      loading: true,
      error: null,
    };
  },
  async mounted() {
    try {
      const userData = JSON.parse(localStorage.getItem("user")) ?? {};

      if (userData && userData.id) {
        this.user = userData;
      }

      const id_user = this.$route.params.id || userData.id;
      if (!id_user) throw new Error("ID User tidak ditemukan");

      const response = await getUserById(id_user);
      if (response && response.data) {
        this.user = response.data;
        localStorage.setItem("user", JSON.stringify(this.user));
      }

      this.editedUser = { ...this.user };
    } catch (err) {
      this.error = err.message;
      console.error("Error fetching user:", err);
    }
  },
  methods: {
    showEditModal() {
      this.editedUser = { ...this.user, password: "" }; // Kosongkan password
      this.showModal = true;
    },
    handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.editedUser.imageFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
          this.$set(this.editedUser, "imagePreview", e.target.result);
        };
        reader.readAsDataURL(file);
      }
    },
    async updateProfile() {
      try {
        const formData = new FormData();
        formData.append("name", this.editedUser.name);
        formData.append("alamat", this.editedUser.alamat);

        // Jika pengguna memasukkan password baru, tambahkan ke formData
        if (this.editedUser.password && this.editedUser.password.trim() !== "") {
          formData.append("password", this.editedUser.password);
        }

        if (this.editedUser.imageFile) {
          formData.append("image", this.editedUser.imageFile);
        }

        const response = await updateUser(this.user.id, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (response.data) {
          this.user = { ...response.data };
          localStorage.setItem("user", JSON.stringify(this.user));
          this.$root.$emit("userUpdated", this.user);
        }

        this.showModal = false;
        this.$toast.success("Profil berhasil diperbarui!");
      } catch (error) {
        this.$toast.error("Gagal memperbarui profil!");
        console.error("Error updating profile:", error);
      }
    }

  }

};
</script>
