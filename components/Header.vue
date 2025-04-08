<template>
  <header class="header mt-3">
    <div class="container">
      <h1 class="logo">{{ pageTitle }}</h1>
      <nav class="nav">
        <h5 class="user-role text-white">
          {{ formattedRole }}
        </h5>
      </nav>
    </div>
  </header>
</template>

<script>
export default {
  name: "HeaderComponent",

  data() {
    return {
      user: {
        name: "Admin",
        image: "",
        role: "",
      },
    };
  },

  computed: {
    pageTitle() {
      const titles = {
        "/admin/dashboard": "Dashboard",
        "/admin/buku": "Buku",
        "/admin/kategori": "Kategori",
        "/admin/peminjaman": "Peminjaman",
        "/admin/users": "Pengguna",
        "/admin/penerbit": "Penerbit",
        "/admin/penulis": "Penulis",
        "/admin/booking": "Pesanan",
        "/admin/unappusers": "Pendaftaran",
      };
      return titles[this.$route.path] || "Peminjaman Buku";
    },

    formattedRole() {
      if (!this.user.role) return "Tidak Diketahui";

      const roleUpper = this.user.role.toUpperCase();
      switch (roleUpper) {
        case "ADMIN":
          return "👑 ADMIN";
        case "PETUGAS":
          return "🛠️ PETUGAS";
          return roleUpper;
      }
    },
  },

  mounted() {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser) {
        this.user = storedUser;
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }

    this.$root.$on("userUpdated", (newUser) => {
      this.user = newUser;
    });
  },
};
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');

.header {
  position: fixed;
  top: 0;
  background: #116647;
  padding: 1rem;
  border-radius: 1rem;
  border: 0.3vmin solid #05060f;
  box-shadow: 0.2rem 0.2rem #05060f;
  width: 1240px;
  z-index: 3;
}

.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.logo {
  font-size: 1.8rem;
  font-weight: bold;
  cursor: pointer;
  transition: color 0.3s;
  color: #fff;
}

.user-role {
  font-size: 1.05rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  display: flex;
  align-items: center;
  gap: 10px;

  /* Warna modern dan gradasi halus */
  background: linear-gradient(90deg, #34c690, #1ebe83);
  -webkit-background-clip: text; /* untuk Chrome/Safari */
  background-clip: text; /* standar */

  -webkit-text-fill-color: transparent;

  /* Glow halus untuk kesan modern */
  text-shadow: 0 0 6px rgba(255, 255, 255, 0.3), 0 0 10px rgba(254, 255, 255, 0.15);
}

@keyframes fadeSlideIn {
  0% {
    opacity: 0;
    transform: translateY(-8px) scale(0.98);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}


@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.nav ul {
  display: flex;
  gap: 1.5rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav ul li a {
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  padding: 0.5rem;
  color: #05060f;
  border: 0.2vmin solid #05060f;
  border-radius: 0.5rem;
  background: #fff;
  transition: all 0.3s ease;
}

.nav ul li a:hover {
  background: #05060f;
  color: #fff;
}

@media (max-width: 768px) {
  .container {
    flex-direction: column;
    text-align: center;
  }

  .nav ul {
    flex-direction: column;
    margin-top: 1rem;
  }
}
</style>
