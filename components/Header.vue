<template>
  <header class="header mt-3">
    <div class="container ">
      <h1 class="logo">{{ pageTitle }}</h1>
      <nav class="nav">
        <img src="../static/images/logoFinal.svg" alt="">
      </nav>
    </div>
  </header>
</template>

<script>
export default {
  name: "HeaderComponent",
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
  },
};
</script>

<style scoped>
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
