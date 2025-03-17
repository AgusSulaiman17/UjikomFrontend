<template>
  <div class="container ">
    <AppNavbar />
    <h2 class="text-center mt-6 mb-5">Daftar Buku</h2>
    <div v-if="isLoading" class="text-center my-4">
      <b-spinner label="Loading..."></b-spinner>
      <p>Sedang memuat data...</p>
    </div>
    <div class="row mb-5">
      <div class="col-md-3">
        <input type="text" v-model="searchQuery" placeholder="Cari buku..." class="form-control filter-item" />
      </div>
      <div class="col-md-3 ">
        <select v-model="selectedPenulis" class="form-control filter-item">
          <option value="">Semua Penulis</option>
          <option v-for="penulis in penulisList" :key="penulis.id_penulis" :value="penulis.id_penulis">
            {{ penulis.nama }}
          </option>
        </select>
      </div>
      <div class="col-md-3 ">
        <select v-model="selectedPenerbit" class="form-control filter-item">
          <option value="">Semua Penerbit</option>
          <option v-for="penerbit in penerbitList" :key="penerbit.id_penerbit" :value="penerbit.id_penerbit">
            {{ penerbit.nama }}
          </option>
        </select>
      </div>
      <div class="col-md-3 mb-3 ">
        <select v-model="selectedKategori" class="form-control filter-item">
          <option value="">Semua Kategori</option>
          <option v-for="kategori in kategoriList" :key="kategori.id" :value="kategori.id">
            {{ kategori.kategori }}
          </option>
        </select>
      </div>
      <div class="col-md-3">
        <button @click="resetFilters" class="reset-button">Reset Filter</button>
      </div>

    </div>

    <div class="row mt-4">
      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <div v-if="filteredBuku.length === 0 && !error" class="alert alert-info">Tidak ada buku untuk ditampilkan.</div>

      <div v-for="buku in filteredBuku" :key="buku.id_buku" class="col-md-3 col-sm-6 mb-4">
        <div class="card" @click="$router.push({ name: 'detail-buku', params: { id_buku: buku.id_buku } })">
          <div class="banner">
            <span class="banner-text">BUKU</span>
            <span class="banner-text">DETAIL</span>
          </div>
          <div class="card-img">
            <img v-if="buku.gambar"
              :src="buku.gambar.startsWith('http') ? buku.gambar : `http://localhost:8080/${buku.gambar}`"
              :alt="buku.judul" class="img" />
          </div>
          <span class="card-title">{{ buku.judul }}</span>
          <p class="card-subtitle">Penulis: {{ buku.penulis?.nama || 'Tidak diketahui' }}</p>
          <p class="card-subtitle">Penerbit: {{ buku.penerbit?.nama || 'Tidak diketahui' }}</p>
          <p class="card-subtitle">Kategori: {{ buku.kategori?.kategori || 'Tidak diketahui' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getAllBuku } from "@/api/buku";
import { getAllPenulis } from "@/api/penulis";
import { getAllPenerbit } from "@/api/penerbit";
import { getAllKategori } from "@/api/kategori";
import AppNavbar from "~/components/AppNavbar.vue";
import Footer from "~/components/Footer.vue";

export default {
  name: 'ListBuku',
  layout: 'blank',
  components: {
    AppNavbar,
    Footer
  },
  data() {
    return {
      bukuList: [],
      penulisList: [],
      penerbitList: [],
      kategoriList: [],
      searchQuery: "",
      selectedPenulis: "",
      selectedPenerbit: "",
      selectedKategori: "",
      error: null,
    };
  },
  computed: {
    filteredBuku() {
      console.log("Kategori yang dipilih:", this.selectedKategori);
      return this.bukuList
        .filter((buku) => {
          console.log("Buku:", buku);
          return buku.judul.toLowerCase().includes(this.searchQuery.toLowerCase());
        })
        .filter((buku) => {
          return this.selectedPenulis ? buku.id_penulis === parseInt(this.selectedPenulis) : true;
        })
        .filter((buku) => {
          return this.selectedPenerbit ? buku.id_penerbit === parseInt(this.selectedPenerbit) : true;
        })
        .filter((buku) => {
          return this.selectedKategori ? buku.kategori?.id == this.selectedKategori : true;
        })

    },
  },
  methods: {
    async fetchData(apiFunc, targetList, errorMessage) {
      try {
        this.error = null;
        const response = await apiFunc();
        this[targetList] = response.data || [];
      } catch (error) {
        this.error = errorMessage;
        console.error(error);
      }
    },
    resetFilters() {
      this.searchQuery = "";
      this.selectedPenulis = "";
      this.selectedPenerbit = "";
      this.selectedKategori = "";
    }
  },
  async mounted() {
    await this.fetchData(getAllBuku, "bukuList", "Gagal memuat data buku.");
    await this.fetchData(getAllPenulis, "penulisList", "Gagal memuat data penulis.");
    await this.fetchData(getAllPenerbit, "penerbitList", "Gagal memuat data penerbit.");
    await this.fetchData(getAllKategori, "kategoriList", "Gagal memuat data kategori.");

    // 🔎 Debugging: Cek apakah kategori ada dalam setiap buku
    console.log("Data Buku:", this.bukuList);
    console.log("Data Kategori:", this.kategoriList);
  },
};
</script>

<style scoped>
.filter-container {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.filter-item {
  width: 100%;
  padding: 2px;
  background: #fff;
  border: 3px solid #000;
  border-top: none;
  border-left: none;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s ease;
  text-align: center;
  cursor: pointer;
}

.filter-item:hover,
.filter-item:focus {
  box-shadow: 7px 7px 0 #000;
  transform: scale(1.05);
  outline: none;
}

.card {
  width: 250px;
  height: 350px;
  padding: 20px;
  background: #fff;
  border: 3px solid #000;
  box-shadow: 4px 4px 0 #000;
  transform: rotate(-2deg);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  text-align: center;
  cursor: pointer;
}

.card:hover {
  transform: rotate(0deg) scale(1.05);
  box-shadow: 8px 8px 0 #000;
}

.banner {
  position: absolute;
  top: 3px;
  right: -95px;
  background: #000;
  color: #fff;
  padding: 10px;
  width: 250px;
  text-align: center;
  transform: rotate(45deg);
  font-weight: bold;
  font-size: 16px;
  z-index: 999;
  letter-spacing: 1px;
  transition: background 0.5s ease;
}

.banner-text {
  display: inline-block;
  transition: opacity 0.5s ease, transform 0.5s ease;
  width: 90%;
  position: absolute;
  left: 10%;
  top: 50%;
  transform: translateY(-50%);
  margin: 0;
  padding: 0;
}

.banner:hover .banner-text:first-child {
  opacity: 0;
  transform: translateY(-100%);
}

.banner:hover .banner-text:last-child {
  opacity: 1;
  transform: translateY(-40%);
}

.banner-text:last-child {
  opacity: 0;
  transform: translateY(60%);
}

.banner:hover {
  background: red;
}

.card-img {
  position: relative;
  overflow: hidden;
  border-radius: 5px;
}

.card-img .img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  transition: transform 0.5s ease-in-out, filter 0.5s ease-in-out;
}

.card:hover .img {
  transform: scale(1.1);
}

.card-title {
  font-size: 20px;
  font-weight: bold;
  color: #000;
  text-transform: uppercase;
  margin-top: 10px;
}

.card-subtitle {
  font-size: 14px;
  color: #333;
  margin-top: 5px;
}

.reset-button {
  background: red;
  color: white;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-button:hover,
.reset-button:focus {
  box-shadow: 7px 7px 0 #000;
  transform: scale(1.05);
  outline: none;
  background: darkred;
}

</style>
