<template>
  <div :class="{ 'hidden': isHidden }" class="navbar-wrapper">
    <b-navbar toggleable="lg" class="content p-2 p-md-0 rounded-5">
      <div class="container-fluid">
        <b-navbar-brand href="#" class="judul bg-white p-2 rounded-3 font-weight-bold">
          <img src="../static/images/logoFinal.svg" alt="" class="logo">
        </b-navbar-brand>
        <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

        <b-collapse v-if="!user" id="nav-collapse" is-nav>
          <b-navbar-nav class="ml-auto">
            <b-nav-item>
              <b-button class="btn-custom">Login
                <b-icon-door-open-fill></b-icon-door-open-fill>
              </b-button>
            </b-nav-item>
          </b-navbar-nav>
        </b-collapse>

        <b-collapse v-if="user" id="nav-collapse" is-nav>
          <b-navbar-nav class="ml-auto">
            <b-nav-item v-if="user.role === 'admin'"></b-nav-item>
            <b-nav-item>
              <nuxt-link to="/user/Dashboard" class="nav-link-animated" exact-active-class="active-link">
                <BIconHouse /> Dashboard
              </nuxt-link>
            </b-nav-item>
            <b-nav-item v-if="user.role === 'user'">
              <nuxt-link to="/user/listbuku" class="nav-link-animated" exact-active-class="active-link">
                <BIconBookmarks /> Daftar Buku
              </nuxt-link>
            </b-nav-item>
            <b-nav-item v-if="user.role === 'user' || user.role === 'petugas'" @mouseover="showBookingMenu = true"
              @mouseleave="showBookingMenu = false" class="position-relative">

              <nuxt-link to="/user/Pinjaman" class="nav-link-animated" exact-active-class="active-link">
                <BIconCardChecklist /> Pinjaman
              </nuxt-link>

              <!-- Transisi untuk submenu -->
              <transition name="fade">
                <div v-show="showBookingMenu" class="submenu">
                  <nuxt-link to="/user/booking" class="submenu-link">
                    <BIconClock /> Booking
                  </nuxt-link>
                  <nuxt-link to="/user/history" class="submenu-link">
                    <BIconClockHistory /> History
                  </nuxt-link>
                </div>
              </transition>
            </b-nav-item>
            <b-nav-item v-if="user.role === 'user' || user.role === 'petugas'">
              <nuxt-link to="/user/favorite" class="nav-link-animated" exact-active-class="active-link">
                <BIconStarHalf /> Favorite
              </nuxt-link>
            </b-nav-item>
          </b-navbar-nav>

          <b-navbar-nav class="ml-5">
            <b-nav-item-dropdown right>
              <template #button-content>
                <img :src="user.image.startsWith('http') ? buku.gambar : `http://localhost:8080/${user.image}`"
                  class="avatar" />
                <em class="text-ijotua">{{ user.name }}</em>
              </template>
              <b-dropdown-item @click="$router.push({ name: 'profile', params: { id_user: user.id_user } })">
                Profile <b-icon-person></b-icon-person>
              </b-dropdown-item>
              <b-dropdown-item @click.prevent="logout">
                <span v-if="!isLoading">Sign Out</span>
                <span v-else class="spinner"></span>
                <b-icon-box-arrow-right></b-icon-box-arrow-right>
              </b-dropdown-item>
            </b-nav-item-dropdown>
          </b-navbar-nav>
        </b-collapse>
      </div>
    </b-navbar>
  </div>
</template>


<script>
import NotificationModal from './NotificationModal.vue';

export default {
  name: 'AppNavbar',
  components: {
    NotificationModal,
  },
  data() {
    return {
      isHidden: false,
      lastScrollTop: 0,
      isSidebarOpen: false,
      showLogoutConfirmationModal: false,
      isLoading: false,
      showBookingMenu: false,
    };
  },
  computed: {
    user() {
      return this.$store.getters.getUser;
    }
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll);
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (user && token) {
      this.$store.commit('setUser', JSON.parse(user));
      this.$store.commit('setToken', token);
    }
  },
  methods: {
    handleScroll() {
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
      this.isHidden = currentScroll > this.lastScrollTop;
      this.lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    },
    logout() {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      this.$router.push("/login");
    },
    confirmLogout() {
      this.isLoading = true;
      setTimeout(() => {
        this.$store.commit('logout');
        this.$router.push('/');
        this.showLogoutConfirmationModal = false;
        this.isLoading = false;
      }, 2000);
    },
    cancelLogout() {
      this.showLogoutConfirmationModal = false;
    },
    home() {
      this.$store.dispatch('setLoading', true);
      setTimeout(() => {
        const redirectPath = this.user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard';
        this.$router.push(redirectPath);
        this.$store.dispatch('setLoading', false);
      }, 500);
    },
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen;
    },
    isActive(path) {
      return this.$route.path === path;
    }
  },
  watch: {
    token(newToken) {
      if (!newToken) {
        this.$store.commit('logout');
        this.$router.push('/');
      }
    }
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.handleScroll);
  }
};
</script>

<style scoped>
/* Navbar */
.navbar-wrapper {
  position: fixed;
  margin-top: 10px;
  padding: 5px;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 9999;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.9);
  background: transparent;
  transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
}

.hidden {
  transform: translateY(-100%);
  opacity: 0;
}

/* Logo */
.logo {
  width: 60px;
  transition: transform 0.3s ease-in-out;
}

.logo:hover {
  transform: scale(1.1);
}

/* Avatar */
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #0B2447;
  transition: all 0.3s ease-in-out;
}

.avatar:hover {
  transform: scale(1.1);
}

/* Tombol Custom */
.btn-custom {
  background-color: #0B2447;
  color: white;
  font-size: 16px;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  box-shadow: 4px 4px 0px #0B2447;
  transition: all 0.3s ease-in-out;
}

.btn-custom:hover {
  background-color: #1E3A5F;
  box-shadow: none;
  transform: translateY(2px);
}

/* Efek Garis Bawah untuk Link */
.nav-link-animated {
  position: relative;
  color: #0B2447;
  text-decoration: none;
  font-size: 18px;
  padding: 8px 15px;
  transition: color 0.3s ease-in-out;
}

.nav-link-animated::after {
  content: "";
  position: absolute;
  width: 0;
  height: 2px;
  background: #0B2447;
  left: 0;
  bottom: 0;
  transition: width 0.3s ease-in-out;
}

.nav-link-animated:hover::after {
  width: 100%;
}

.nav-link-animated:hover {
  color: #1E3A5F;
}

/* Link Aktif */
.active-link {
  font-weight: bold;
  color: #1E3A5F;
  border-bottom: 2px solid #1E3A5F;
}

/* Spinner */
.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid white;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 0.5s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* Animasi Fade-in untuk Submenu */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Submenu Styling */
.submenu {
  position: absolute;
  left: 0;
  top: 100%;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.1);
  padding: 10px 0;
  min-width: 180px;
  z-index: 10;
  backdrop-filter: blur(8px);
}

/* Link dalam submenu */
.submenu-link {
  display: block;
  padding: 10px 20px;
  color: #0B2447;
  font-size: 16px;
  text-decoration: none;
  transition: all 0.3s ease-in-out;
  position: relative;
}

/* Efek Hover */
.submenu-link:hover {
  background: #f0f0f0;
  transform: translateX(5px);
  font-weight: bold;
}

/* Tambahkan efek garis animasi */
.submenu-link::after {
  content: "";
  position: absolute;
  width: 0;
  height: 2px;
  background: #0B2447;
  left: 10%;
  bottom: 5px;
  transition: width 0.3s ease-in-out;
}

.submenu-link:hover::after {
  width: 80%;
}
</style>
