<template>
  <div>
    <Header />
    <div class="mt-5 ml-5">
      <div class="cards-container">
        <div v-for="item in items" :key="item.title" class="card feature-card">
          <div class="card-details">
            <p class="text-title">
              <b-icon :icon="item.icon" class="icon-sidemargin"></b-icon> {{ item.title }}
            </p>
            <p class="text-body">{{ item.count }} data tersedia</p>
          </div>
          <button @click="$router.push(item.link)" class="card-button">
            Lihat Detail <b-icon icon="search"></b-icon>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getAllBuku } from "@/api/buku";
import { getAllPenerbit } from "@/api/penerbit";
import { getAllPenulis } from "@/api/penulis";
import { getAllUsers } from "@/api/users";
import { getAllKategori } from "@/api/kategori";
import { getAllPeminjaman } from "@/api/peminjaman";
import { getAllBookings } from "~/api/peminjaman";
import { getUsersUnapp } from "@/api/users";
import Header from "~/components/Header.vue";

export default {
  components: {
    Header,
  },
  data() {
    return {
      totalBuku: 0,
      totalPenerbit: 0,
      totalPenulis: 0,
      totalUsers: 0,
      totalKategori: 0,
      totalPeminjaman: 0,
      totalBooking: 0,
      totalUnApp: 0,
    };
  },
  computed: {
    items() {
      return [
        { title: "Buku", count: this.totalBuku, link: "/admin/buku", icon: "book" },
        { title: "Penerbit", count: this.totalPenerbit, link: "/admin/penerbit", icon: "building" },
        { title: "Penulis", count: this.totalPenulis, link: "/admin/penulis", icon: "pencil" },
        { title: "Users", count: this.totalUsers, link: "/admin/users", icon: "person" },
        { title: "Kategori", count: this.totalKategori, link: "/admin/kategori", icon: "tag" },
        { title: "Peminjaman", count: this.totalPeminjaman, link: "/admin/peminjaman", icon: "file-text" },
        { title: "Booking", count: this.totalBooking, link: "/admin/booking", icon: "file-text" },
        { title: "Pendaftar", count: this.totalUnApp, link: "/admin/unappusers", icon: "file-text" },
      ];
    },
  },
  async mounted() {
    try {
      const [
        buku, penerbit, penulis, users, kategori, peminjaman, booking, unApp,
      ] = await Promise.all([
        getAllBuku(), getAllPenerbit(), getAllPenulis(), getAllUsers(),
        getAllKategori(), getAllPeminjaman(), getAllBookings(), getUsersUnapp(),
      ]);

      this.totalBuku = buku.data?.length || 0;
      this.totalPenerbit = penerbit.data?.length || 0;
      this.totalPenulis = penulis.data?.length || 0;
      this.totalUsers = users.data?.length || 0;
      this.totalKategori = kategori.data?.length || 0;
      this.totalPeminjaman = peminjaman.data?.length || 0;
      this.totalBooking = booking.data?.length || 0;
      this.totalUnApp = unApp.data?.length || 0;
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    }
  },
};
</script>

<style scoped>
.cards-container {
  display: flex;
  flex-wrap: wrap;
  gap: 3rem;
  margin-left: 20px;
}

.card {
  width: 160px;
  height: 234px;
  border-radius: 20px;
  background: #f5f5f5;
  position: relative;
  padding: 1.8rem;
  border: 2px solid #c3c6ce;
  transition: 0.5s ease-out;
  overflow: visible;
  border: 0.3vmin solid #05060f;
  box-shadow: 0.2rem 0.2rem #05060f;
}

.card-details {
  color: black;
  height: 100%;
  display: grid;
  gap: 0.5em;
  place-content: center;
}

.card-button {
  transform: translate(-50%, 125%);
  width: 60%;
  border-radius: 1rem;
  border: none;
  background-color: #1e3630;
  color: #fff;
  font-size: 1rem;
  padding: 0.5rem 1rem;
  position: absolute;
  left: 50%;
  bottom: 0;
  opacity: 0;
  transition: 0.3s ease-out;
}

.text-body {
  color: rgb(134, 134, 134);
}

.text-title {
  font-size: 1.5em;
  font-weight: bold;
}

.card:hover {
  border-color: #254b42;
  box-shadow: 0 4px 18px 0 rgba(0, 0, 0, 0.25);
}

.card:hover .card-button {
  transform: translate(-50%, 50%);
  opacity: 1;
}

@media (max-width: 768px) {
  .cards-container {
    flex-direction: column;
    align-items: center;
  }
  .card {
    width: 80%;
  }
}
</style>
