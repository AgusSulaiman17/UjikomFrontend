<template>
  <div class="sidebar">
    <div class="profile">
      <img
        v-if="user.image"
        :src="user.image.startsWith('http') ? user.image : `http://localhost:8080/${user.image}`"
        :alt="user.name"
        class="profile-img"
        @click="$router.push({ name: 'profile', params: { id: user.id } })"
      />
      <h2 class="user-name">{{ user.name }}</h2>
    </div>
    <nav>
      <ul>
        <li>
          <nuxt-link to="/admin/dashboard" v-if="user.role === 'admin'" exact-active-class="active">
            <BIconHouse /> Dashboard
          </nuxt-link>
          <nuxt-link to="/petugas/dashboard" v-if="user.role === 'petugas'" exact-active-class="active">
            <BIconHouse /> Dashboard
          </nuxt-link>
        </li>
        <li>
          <nuxt-link to="/admin/users" v-if="user.role === 'admin' || user.role === 'petugas'" exact-active-class="active">
            <BIconPerson /> Pengguna
          </nuxt-link>
        </li>
        <li>
          <nuxt-link to="/admin/unappusers" v-if="user.role === 'admin' || user.role === 'petugas'" exact-active-class="active">
            <BIconPersonCheckFill /> Pendaftar
          </nuxt-link>
        </li>
        <li>
          <nuxt-link to="/admin/booking" v-if="user.role === 'admin' || user.role === 'petugas'" exact-active-class="active">
            <BIconJournalCheck /> Booking
          </nuxt-link>
        </li>
        <li>
          <nuxt-link to="/admin/peminjaman" v-if="user.role === 'admin' || user.role === 'petugas'" exact-active-class="active">
            <BIconJournalAlbum /> Peminjaman
          </nuxt-link>
        </li>
        <li>
          <nuxt-link to="/admin/buku" v-if="user.role === 'petugas'" exact-active-class="active">
            <BIconJournalAlbum /> Data Buku
          </nuxt-link>
        </li>
        <!-- Dropdown Buku -->
        <li class="dropdown-wrapper" v-if="user.role === 'admin'">
          <a href="#" @click.prevent="toggleDropdown('buku')" class="dropdown-btn">
            <BIconBook /> Data Buku <span :class="dropdowns.buku ? 'rotate' : ''">▼</span>
          </a>
          <ul v-show="dropdowns.buku" class="dropdown">
            <li>
              <nuxt-link to="/admin/buku" exact-active-class="active">
                <BIconBook /> Buku
              </nuxt-link>
            </li>
            <li>
              <nuxt-link to="/admin/penulis"  exact-active-class="active">
                <BIconPencilSquare /> Penulis
              </nuxt-link>
            </li>
            <li>
              <nuxt-link to="/admin/kategori" exact-active-class="active">
                <BIconTags /> Kategori
              </nuxt-link>
            </li>
            <li>
              <nuxt-link to="/admin/penerbit" exact-active-class="active">
                <BIconBuilding /> Penerbit
              </nuxt-link>
            </li>
          </ul>
        </li>
        <li>
          <a href="#" @click.prevent="isLogoutModalVisible = true" class="mb-4">
            <BIconBoxArrowRight /> Logout
          </a>
        </li>
      </ul>
    </nav>

    <!-- Notification Modal untuk Logout -->
    <NotificationModal
      :isVisible="isLogoutModalVisible"
      :messageTitle="'Konfirmasi Logout'"
      :messageBody="'Apakah Anda yakin ingin keluar?'"
      @close="isLogoutModalVisible = false"
    >
      <template #footer>
        <button @click="confirmLogout" class="btn btn-danger">
          Ya, Keluar
        </button>
        <button @click="isLogoutModalVisible = false" class="btn btn-secondary">
          Batal
        </button>
      </template>
    </NotificationModal>

  </div>
</template>

<script>
import {
  BIconHouse,
  BIconBook,
  BIconPerson,
  BIconBoxArrowRight,
} from "bootstrap-vue";
import NotificationModal from "@/components/NotificationModal.vue"; // Pastikan file modal sudah ada

export default {
  components: {
    BIconHouse,
    BIconBook,
    BIconPerson,
    BIconBoxArrowRight,
    NotificationModal
  },
  data() {
    return {
      user: {
        name: "Admin",
        image: "",
        role: "",
      },
      dropdowns: {
        buku: false,
      },
      isLogoutModalVisible: false, // Untuk mengontrol tampilan modal logout
    };
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

    // Dengarkan event perubahan user dari root instance
    this.$root.$on("userUpdated", (newUser) => {
      this.user = newUser;
    });
  },
  methods: {
    toggleDropdown(menu) {
      this.dropdowns[menu] = !this.dropdowns[menu];
    },
    confirmLogout() {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      this.$router.push("/login");
    },
  },
  watch: {
    user: {
      handler(newUser) {
        localStorage.setItem("user", JSON.stringify(newUser));
      },
      deep: true,
    },
  },
};
</script>


<style scoped>
.sidebar {
  width: 250px;
  height: 100vh;
  background: #1ebe83;
  color: black;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 0.3vmin solid #05060f;
  box-shadow: 0.2rem 0.2rem #05060f;
  position: fixed;
  top: 0;
  left: 0;
  transition: transform 0.3s ease;
  overflow-y: auto;
  scrollbar-width: none;
  padding-top: 200px;
}

.sidebar::-webkit-scrollbar {
  display: none;
}


.profile {
  position: fixed; /* Agar tetap di tempat */
  top: 0;
  left: 0;
  width: 250px; /* Sesuaikan dengan sidebar */
  z-index: 1000;
  background: rgba(0, 0, 0, 0.6);
  padding: 25px;
  text-align: center;
  transition: background 0.3s ease;
}


.profile:hover {
  background: rgba(0, 0, 0, 0.8);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

.profile-img {
  width: 110px;
  height: 110px;
  object-fit: cover;
  border-radius: 50%;
  border: 4px solid white;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.profile-img:hover {
  transform: scale(1.1);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.user-name {
  margin: 10px 0 5px;
  font-size: 24px;
  font-weight: bold;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 1px;
}

nav ul {
  list-style: none;
  padding: 0;
  width: 100%;
  margin-top: 40px;
}

nav ul li {
  margin: 15px 0;
}

nav ul li a {
  text-decoration: none;
  color: white;
  font-size: 16px;
  display: block;
  padding: 12px;
  border-radius: 8px;
  transition: all 0.3s ease-in-out;
  position: relative;
}

nav ul li a:hover {
  background: #047857;
  transform: translateX(10px);
  box-shadow: 5px 5px 15px rgba(4, 120, 87, 0.4);
}

nav ul li .active {
  font-weight: bold;
}

/* STYLE BARU: Dropdown */
.dropdown-wrapper {
  position: relative;
}

.dropdown-btn {
  cursor: pointer;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  color: white;
  transition: all 0.3s ease-in-out;
}

.dropdown-btn:hover {
  background: linear-gradient(135deg, #0e7e5a, #159a74);
  box-shadow: 0 4px 10px rgba(14, 126, 90, 0.4);
  transform: translateX(10px);
}

/* Dropdown */
.dropdown {
  list-style: none;
  padding: 10px;
  margin: 0;
  backdrop-filter: blur(10px);
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  transition: max-height 0.3s ease-in-out;
}

.dropdown li {
  margin: 5px 0;
}

.dropdown li a {
  font-size: 14px;
  border-radius: 5px;
  background: #159a74;
  transition: all 0.3s ease-in-out;
  position: relative;
}

.dropdown li a:hover {
  background: #0e7e5a;
  transform: translateX(5px);
  box-shadow: 3px 3px 10px rgba(14, 126, 90, 0.4);
}

/* Animasi Arrow */
span {
  float: right;
  transition: transform 0.3s ease;
}

.rotate {
  transform: rotate(180deg);
}
</style>
