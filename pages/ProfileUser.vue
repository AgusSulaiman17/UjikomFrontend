<template>
  <div class="profile">
    <AppNavbar />
    <div class="mt-6">
      <div class="container mt-5">
        <div class="row justify-content-center">
          <div class="col-md-8">
            <div class="card shadow border-0 rounded-lg">
              <div class="card-body text-center p-5">
                <div class="profile-img-container">
                  <img
                    v-if="user.image"
                    :src="user.image.startsWith('http') ? user.image : 'http://localhost:8080/' + user.image"
                    alt="Profile Image"
                    class="profile-img"
                  />
                </div>
                <h3 class="card-title text-primary fw-bold">{{ user.name }}</h3>
                <p class="text-muted"><i class="bi bi-envelope"></i> {{ user.email }}</p>

                <hr />

                <div class="text-start">
                  <p><i class="bi bi-geo-alt-fill text-danger"></i> <strong>Alamat:</strong> {{ user.alamat }}</p>
                  <p><i class="bi bi-telephone-fill text-success"></i> <strong>No Telepon:</strong> {{ user.no_telepon }}</p>
                </div>

                <b-button variant="primary" class="mt-3 shadow-sm btn-edit" @click="showEditModal">
                  <i class="bi bi-pencil-square"></i> Edit Profil
                </b-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Edit Profil -->
      <b-modal v-model="showModal" title="Edit Profil" hide-footer class="modal">
        <form @submit.prevent="updateProfile">
          <div class="text-center mb-3">
            <img
              v-if="editedUser.imagePreview || editedUser.image"
              :src="
                editedUser.imagePreview ||
                (editedUser.image.startsWith('http') ? editedUser.image : 'http://localhost:8080/' + editedUser.image)
              "
              alt="Preview Image"
              class="rounded-circle img-thumbnail border border-secondary preview-img"
            />
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

          <b-button type="submit" variant="success" class="w-100 shadow-sm btn-save">
            <i class="bi bi-check-circle"></i> Simpan Perubahan
          </b-button>
        </form>
      </b-modal>
    </div>
  </div>
</template>

<script>
import { getUserById, updateUser } from "@/api/users";
import AppNavbar from "~/components/AppNavbar.vue";

export default {
  layout: "blank",
  components: {
    AppNavbar,
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
      this.editedUser = { ...this.user, password: "" };
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
    },
  },
};
</script>

<style scoped>
/* Animasi & Efek Hover */
.profile-img-container {
  display: inline-block;
  transition: transform 0.3s ease-in-out;
}
.profile-img-container:hover {
  transform: scale(1.1);
}

/* Gaya Foto Profil */
.profile-img {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 3px solid #007bff;
  padding: 5px;
}

/* Preview Image dalam Modal */
.preview-img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
}

/* Gaya Tombol */
.btn-edit {
  transition: all 0.3s ease-in-out;
}
.btn-edit:hover {
  background-color: #0056b3;
}

.btn-save {
  transition: all 0.3s ease-in-out;
}
.btn-save:hover {
  background-color: #218838;
}

/* Shadow untuk Card */
.card {
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
}

/* Modal */
.modal {
  z-index: 99999999;
}
</style>
