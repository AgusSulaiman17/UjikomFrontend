<template>
  <div>
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card shadow-lg">
            <div class="card-body text-center">
              <img v-if="user.image"
                :src="user.image.startsWith('http') ? user.image : 'http://localhost:8080/' + user.image"
                alt="Profile Image" class="rounded-circle img-thumbnail mb-3" width="150" height="150" />
              <h3 class="card-title">{{ user.name }}</h3>
              <p class="text-muted">{{ user.email }}</p>

              <hr />

              <div class="text-start">
                <p><strong>Role:</strong> {{ user.role }}</p>
                <p><strong>Alamat:</strong> {{ user.alamat }}</p>
                <p><strong>No Telepon:</strong> {{ user.no_telepon }}</p>
              </div>

              <button class="btn btn-primary mt-3" @click="openModal">
                <i class="fas fa-edit"></i> Edit Profil
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Edit Profil -->
    <div v-if="showModal" class="custom-modal" @keyup.esc="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Edit Profil</h5>
          <button type="button" class="btn-close" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="updateProfile">
            <div class="text-center mb-3">
              <img v-if="editedUser.imagePreview || editedUser.image"
                :src="editedUser.imagePreview || (editedUser.image.startsWith('http') ? editedUser.image : 'http://localhost:8080/' + editedUser.image)"
                alt="Preview Image" class="rounded-circle img-thumbnail" width="120" height="120" />
            </div>

            <div class="mb-3">
              <label class="form-label">Foto Profil</label>
              <input type="file" class="form-control" @change="handleImageUpload" accept="image/*" />
            </div>

            <div class="mb-3">
              <label class="form-label">Nama</label>
              <input type="text" class="form-control" v-model="editedUser.name" required />
            </div>

            <div class="mb-3">
              <label class="form-label">Email</label>
              <input type="email" class="form-control" v-model="editedUser.email" readonly />
            </div>

            <div class="mb-3">
              <label class="form-label">Alamat</label>
              <input type="text" class="form-control" v-model="editedUser.alamat" />
            </div>

            <div class="mb-3">
              <label class="form-label">No Telepon</label>
              <input type="text" class="form-control" v-model="editedUser.no_telepon" readonly />
            </div>

            <div class="mb-3">
              <label class="form-label">Password Baru</label>
              <input type="password" class="form-control" v-model="editedUser.password" />
            </div>
            <button type="submit" class="btn btn-success w-100">Simpan Perubahan</button>
          </form>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="custom-backdrop" @click="closeModal"></div>
  </div>
</template>

<script>
import { getUserById, updateUser } from "@/api/users";

export default {
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
        console.log("Menggunakan data dari local storage:", this.user);
      }

      const id_user = this.$route.params.id || userData.id;

      if (!id_user) {
        throw new Error("ID User tidak ditemukan di local storage atau route");
      }

      const response = await getUserById(id_user);
      if (response && response.data) {
        this.user = response.data;
        localStorage.setItem("user", JSON.stringify(this.user));
      } else {
        console.warn("Data user dari API kosong atau tidak ditemukan");
      }

      this.editedUser = { ...this.user };
      console.log("Data pengguna setelah fetch API:", this.user);
    } catch (err) {
      this.error = err.message;
      console.error("Error fetching user:", err);
    }
  },
  methods: {
    openModal() {
      this.editedUser = { ...this.user, password: "" };
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
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

        if (this.editedUser.password) {
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

          // Emit event agar sidebar tahu ada perubahan
          this.$root.$emit("userUpdated", this.user);
        }

        this.closeModal();
        alert("Profil berhasil diperbarui!");
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    }
  },
};
</script>

<style scoped>
/* Gaya untuk modal */
.custom-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 500px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  z-index: 1050;
  padding: 20px;
}

.custom-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1040;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}
</style>
