<template>
  <div class="body">
    <div class="container">
      <div class="right">
        <img src="@/static/images/landing2.png" alt="Register Image" class="register-img">
      </div>
      <div class="left">
        <form class="form" @submit.prevent="registerUser">
          <p class="title">REGISTER</p>
          <div class="input-block">
            <input v-model.trim="user.name" class="input" type="text" id="name" required>
            <label for="name">Nama</label>
          </div>
          <div class="input-block">
            <input v-model.trim="user.email" class="input" type="email" id="email" required>
            <label for="email">Email</label>
          </div>
          <div class="input-block">
            <input v-model="user.password" class="input" type="password" id="password" required>
            <label for="password">Password</label>
          </div>
          <div class="input-block">
            <input v-model="user.no_telepon" type="text" class="form-control input" id="no_telepon" required
              title="Nomor telepon harus diawali dengan 0 dan memiliki 9-10 digit"
              :class="{ filled: user.no_telepon.length > 0 }" />

            <label for="no_telepon">No Telepon</label>
          </div>
          <div class="input-block">
            <textarea v-model.trim="user.alamat" class="input textarea" id="alamat" required></textarea>
            <label for="alamat">Alamat</label>
          </div>
          <button type="submit" :disabled="loading">
            {{ loading ? "Mendaftar..." : "Daftar" }}
          </button>
          <nuxt-link to="/login" class="login-link">
            Sudah punya akun? <span>Masuk</span>
          </nuxt-link>
          <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { createUserUnapp } from "@/api/users";

export default {
  layout: "blank",
  data() {
    return {
      user: {
        name: "",
        email: "",
        password: "",
        no_telepon: "",
        alamat: "",
      },
      loading: false,
      successMessage: "",
      errorMessage: "",
    };
  },
  methods: {
    async registerUser() {
      this.successMessage = "";
      this.errorMessage = "";

      // Validasi Nomor Telepon
      const phoneRegex = /^0\d{7,15}$/;
      if (!phoneRegex.test(this.user.no_telepon)) {
        this.errorMessage = "Nomor telepon tidak valid";
        return;
      }

      this.loading = true;
      try {
        const response = await createUserUnapp(this.user);
        this.successMessage = response.message || "Pendaftaran berhasil, menunggu persetujuan admin.";

        // Reset hanya jika pendaftaran berhasil
        this.user = { name: "", email: "", password: "", no_telepon: "", alamat: "" };
      } catch (error) {
        this.errorMessage = error.response?.data?.message || error.message || "Terjadi kesalahan saat mendaftar.";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.body {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
  background: linear-gradient(135deg, #e6f9ed, #c5d6c1);
}

.container {
  display: flex;
  width: 850px;
  height: 600px;
  max-width: 100%;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border-radius: 25px;
  box-shadow: 0px 20px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  padding: 40px;
}

.right {
  width: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.left {
  width: 50%;
  padding: 25px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.register-img {
  width: 400px;
  height: auto;
  object-fit: cover;
  border-radius: 20px;
}

.title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 35px;
  color: #3b3b3b;
  text-align: center;
}

.input-block {
  position: relative;
  margin-bottom: 20px;
  width: 100%;
}

.input {
  width: 100%;
  padding: 10px 0;
  border: none;
  border-bottom: 2px solid #d6d8e1;
  font-size: 16px;
  background-color: transparent;
  transition: border-color 0.3s ease;
}

.textarea {
  resize: none;
  height: 50px;
}

.input:focus {
  border-bottom: 2px solid #a8d7b8;
  outline: none;
}

label {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  color: #aaaaaa;
  font-size: 14px;
  transition: all 0.3s ease;
}

.input:focus+label,
.input:valid+label {
  top: -10px;
  font-size: 12px;
  color: #a8d7b9;
}

button {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background-color: #5cb785;
  color: white;
  font-size: 18px;
  cursor: pointer;
  transition: background 0.3s ease;
  font-weight: bold;
  margin-top: 15px;
}

button:hover {
  background-color: #4a9663;
}

.login-link {
  display: block;
  text-align: center;
  margin-top: 15px;
  color: #333;
  font-size: 14px;
  text-decoration: none;
}

.login-link span {
  color: #5cb785;
  font-weight: bold;
}

button:hover {
  background-color: #4a9663;
}

.input+label {
  top: 50%;
  transform: translateY(-50%);
  transition: all 0.3s ease;
}

.input.filled+label,
.input:focus+label {
  top: -10px;
  font-size: 12px;
  color: #a8d7b9;
}

.success-message {
  color: #27ae60;
  text-align: center;
  font-size: 14px;
  margin-top: 10px;
}

.error-message {
  color: #e74c3c;
  text-align: center;
  font-size: 14px;
  margin-top: 10px;
}
</style>
