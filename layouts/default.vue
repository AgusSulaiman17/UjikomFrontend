<template>
  <div class="layout-container">
    <!-- Sidebar tetap di kiri -->
    <Sidebar class="sidebar" />

    <!-- Konten utama di sebelah kanan Sidebar -->
    <div class="main-content">
      <Nuxt /> <!-- Konten halaman yang sesuai akan dirender di sini -->
    </div>
  </div>
</template>

<script>
import Sidebar from '~/components/Sidebar.vue';

export default {
  name: 'default',
  components: {
    Sidebar,
  },
};
</script>

<style scoped>
.layout-container {
  display: flex; /* Menggunakan Flexbox untuk tata letak */
  position: relative;
}

.sidebar {
  position: fixed; /* Membuat Sidebar tetap berada di tempat saat scroll */
  top: 0;
  left: 0;
  width: 250px; /* Tentukan lebar Sidebar */
  height: 100vh; /* Agar Sidebar mengisi seluruh tinggi layar */
  color: white;
  z-index: 10; /* Pastikan Sidebar berada di atas konten */
}

.main-content {
  margin-left: 270px;
  flex-grow: 1;
  height: 100vh; /* Agar konten mengisi sisa ruang */
  overflow-y: auto; /* Agar konten dapat scroll secara vertikal */
}
</style>
