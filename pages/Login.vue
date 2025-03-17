<template>
  <div class="body">
    <div class="container">
      <div class="right">
        <img src="../static/images/landing1.png" alt="Login Image" class="login-img">
      </div>
      <div class="left">
        <form class="form" @submit.prevent="handleLogin">
          <p class="title">LOGIN</p>
          <div class="input-block">
            <input v-model="email" class="input" type="email" id="email" required>
            <label for="email">Email</label>
          </div>
          <div class="input-block">
            <input v-model="password" class="input" type="password" id="pass" required>
            <label for="pass">Password</label>
          </div>
          <div class="input-block">
            <button type="submit">Login</button>
          </div>
          <nuxt-link to="/register" class="login-link">
            Belum punya akun? <span>Register</span>
          </nuxt-link>
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  layout: 'blank',
  data() {
    return {
      email: '',
      password: '',
      errorMessage: '',
    };
  },
  methods: {
    async handleLogin() {
      try {
        const loginModule = await import('~/api/auth.js');
        const { token, user } = await loginModule.login(this.email, this.password);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        this.$router.push(
          user.role === 'admin' ? '/admin/dashboard' :
            user.role === 'petugas' ? '/petugas/dashboard' :
              '/user/dashboard'
        );
      } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
          this.errorMessage = error.response.data.message;
        } else {
          this.errorMessage = 'Login failed, please check your email and password';
        }
        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
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
  width: 750px;
  height: 480px;
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

.login-img {
  width: 100%;
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
  margin-bottom: 25px;
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
  padding: 15px;
  border: none;
  border-radius: 12px;
  background-color: #5cb785;
  color: white;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px;
}

button:hover {
  background-color: #4a9663;
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

.forgot {
  display: block;
  text-align: right;
  font-size: 14px;
  color: #84d38e;
  margin-top: 10px;
}

.error-message {
  color: #e74c3c;
  text-align: center;
  font-size: 14px;
  margin-top: 15px;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
</style>
