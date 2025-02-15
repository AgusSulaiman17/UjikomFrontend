<template>
  <div class="sidebar">
    <div class="profile">
      <img
        v-if="user.image"
        :src="user.image.startsWith('http') ? user.image : `http://localhost:8080/${user.image}`"
        :alt="user.name"
        class="profile-img"
      />
      <h2 class="user-name">{{ user.name }}</h2>
    </div>
    <nav>
      <ul>
        <li><nuxt-link to="/admin/dashboard"><BIconHouse /> Dashboard</nuxt-link></li>
        <li><nuxt-link to="/admin/users"><BIconPerson /> Pengguna</nuxt-link></li>
        <li><nuxt-link to="/admin/peminjaman"><BIconJournalAlbum /> Peminjaman</nuxt-link></li>
        <!-- Dropdown Buku -->
        <li>
          <a href="#" @click.prevent="toggleDropdown('buku')">
            <BIconBook /> Buku <span :class="dropdowns.buku ? 'rotate' : ''">▼</span>
          </a>
          <ul v-show="dropdowns.buku" class="dropdown">
            <li><nuxt-link to="/admin/buku"><BIconBook /> Buku</nuxt-link></li>
            <li><nuxt-link to="/admin/penulis"><BIconPencilSquare /> Penulis</nuxt-link></li>
        <li><nuxt-link to="/admin/kategori"><BIconTags /> Kategori</nuxt-link></li>
        <li><nuxt-link to="/admin/penerbit"><BIconBuilding /> Penerbit</nuxt-link></li>
          </ul>
        </li>
        <li>
          <a href="#" @click.prevent="logout"><BIconBoxArrowRight /> Logout</a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
import { BIconHouse, BIconBook, BIconPerson, BIconBoxArrowRight, BIconJournalAlbum, BIconPencilSquare, BIconTags, BIconBuilding } from "bootstrap-vue";

export default {
  components: {
    BIconHouse,
    BIconBook,
    BIconPerson,
    BIconBoxArrowRight,
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
        peminjaman: false,
      },
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
  },
  methods: {
    toggleDropdown(menu) {
      this.dropdowns[menu] = !this.dropdowns[menu];
    },
    logout() {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      this.$router.push("/login");
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
}

.profile {
  text-align: center;
  background: rgba(0, 0, 0, 0.6);
  padding: 25px;
  width: 100%;
  transition: background 0.3s ease;
}

.profile:hover {
  background: rgba(0, 0, 0, 0.8);
}

.profile-img {
  width: 110px;
  height: 110px;
  object-fit: cover;
  border-radius: 50%;
  border: 4px solid white;
  transition: transform 0.3s ease;
}

.profile-img:hover {
  transform: scale(1.1);
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
  transition: background 0.3s ease, transform 0.3s ease;
}

nav ul li a:hover {
  background: #047857;
  transform: translateX(10px);
}

nav ul li a:active {
  transform: translateX(5px);
}

/* Dropdown */
.dropdown {
  list-style: none;
  padding-left: 20px;
  margin: 0;
}

.dropdown li {
  margin: 5px 0;
}

.dropdown li a {
  font-size: 14px;
  border-radius: 5px;
  background: #159a74;
}

.dropdown li a:hover {
  background: #0e7e5a;
  transform: translateX(5px);
}

/* Icon Arrow */
span {
  float: right;
  transition: transform 0.3s ease;
}

.rotate {
  transform: rotate(180deg);
}
</style>
