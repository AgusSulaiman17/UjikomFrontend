<template>
  <div class="container">
    <div class="row justify-content-between align-items-center mb-5">
      <div class="col-auto">
        <h3>Buku Yang Ada Disini</h3>
      </div>
      <div class="col-auto">
        <nuxt-link to="/ListBuku" class="btn-custom">Lihat Semua <b-icon-eye></b-icon-eye></nuxt-link>
      </div>
    </div>
    <div class="slider">
      <div v-if="bukuList.length" class="slides-container" :style="{ transform: `translateX(-${currentSlideIndex * 100}%)` }">
        <div class="card" v-for="buku in bukuList" :key="buku.id_buku" @click="$router.push({ name: 'detail-buku', params: { id_buku: buku.id_buku } })">
          <div class="banner">
            <span class="banner-text">BARU</span>
            <span class="banner-text">POPULER</span>
          </div>
          <img v-if="buku.gambar"
               :src="buku.gambar.startsWith('http') ? buku.gambar : `http://localhost:8080/${buku.gambar}`"
               :alt="buku.judul" class="card-img-top" />
          <div v-else class="text-center p-3">Tidak ada gambar</div>
          <div class="card-info">
            <h3 class="card-title">{{ buku.judul }}</h3>
          </div>
        </div>
      </div>
      <div class="controls">
        <button @click="prevSlide" :disabled="currentSlideIndex === 0">&lt;</button>
        <button @click="nextSlide" :disabled="isLastSlide"> &gt; </button>
      </div>
      <div class="indicators">
        <span
          v-for="(dot, index) in totalSlides"
          :key="index"
          :class="{ active: index === currentSlideIndex }"
          @click="goToSlide(index)"
        ></span>
      </div>
    </div>
  </div>
</template>

<script>
import { getAllBuku } from '@/api/buku';

export default {
  data() {
    return {
      bukuList: [],
      currentSlideIndex: 0,
      maxSlideIndex: 0,
      autoSlideInterval: null,
      totalSlides: 0,
      waiting: false,
    };
  },
  async created() {
    try {
      const response = await getAllBuku();
      this.bukuList = response.data;

      if (this.bukuList.length) {
        this.calculateMaxSlideIndex();
        this.startAutoSlide();
      }
    } catch (error) {
      console.error("Error fetching buku list:", error);
    }
  },
  computed: {
    isLastSlide() {
      return this.currentSlideIndex === this.maxSlideIndex;
    },
  },
  methods: {
    prevSlide() {
      if (this.currentSlideIndex > 0) {
        this.currentSlideIndex -= 1;
      }
    },
    async nextSlide() {
      if (this.isLastSlide) {
        this.stopAutoSlide();
        this.waiting = true;
        await this.delay(5000);
        this.waiting = false;
        this.currentSlideIndex = 0;
        this.startAutoSlide();
      } else {
        this.currentSlideIndex += 1;
      }
    },
    goToSlide(index) {
      this.currentSlideIndex = index;
    },
    startAutoSlide() {
      this.autoSlideInterval = setInterval(() => {
        if (!this.waiting) {
          this.nextSlide();
        }
      }, 6000);
    },
    stopAutoSlide() {
      clearInterval(this.autoSlideInterval);
    },
    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },
    calculateMaxSlideIndex() {
      const visibleCards = 4;
      this.totalSlides = Math.ceil(this.bukuList.length / visibleCards);
      this.maxSlideIndex = this.totalSlides - 1;
    },
  },
  beforeDestroy() {
    this.stopAutoSlide();
  },
};
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.lihat-semua {
  background-color: #70a799;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.lihat-semua:hover {
  background-color: #2a594d;
}

.slider {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.slides-container {
  display: flex;
  gap: 1rem;
  transition: transform 0.5s ease;
}

.card {
  flex: 1 0 calc(25% - 1rem);
  background: #fff;
  border: 6px solid #000;
  box-shadow: 4px 4px 0 #000;
  transform: rotate(-2deg);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  text-align: center;
}

.card:hover {
  transform: rotate(0deg) scale(1.05);
  box-shadow: 8px 8px 0 #000;
}

.card:active {
  animation: shake 0.5s ease-in-out;
}

.card-img-top {
  width: 50%;
  height: auto;
  object-fit: cover;
  display: block;
  margin: 0 auto;
}

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

.banner {
  position: absolute;
  top: 3px;
  right: -95px;
  background: #000;
  color: #fff;
  padding: 10px;
  width: 350px;
  text-align: center;
  transform: rotate(45deg);
  font-weight: bold;
  font-size: 14px;
  letter-spacing: 1px;
  transition: background 0.5s ease;
}

.banner-text {
  display: inline-block;
  transition: opacity 0.5s ease, transform 0.5s ease;
  width: 100%;
  position: absolute;
  left: 13%;
  top: 50%;
  transform: translateY(-50%);
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

.card-title {
  font-size: 20px;
  font-weight: bold;
  color: #000;
  text-transform: uppercase;
  margin-bottom: 5px;
}

.controls {
  display: flex;
  justify-content: space-between;
  position: absolute;
  top: 50%;
  width: 100%;
  transform: translateY(-50%);
}

button {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background 0.3s, transform 0.2s;
}

button:hover {
  background: rgba(255, 0, 0, 0.8);
  transform: scale(1.1);
}

.indicators {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.indicators span {
  width: 12px;
  height: 12px;
  margin: 0 5px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.3s;
}

.indicators span.active {
  background: rgba(0, 0, 0, 0.9);
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25%, 75% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
}

.indicators span {
  width: 12px;
  height: 12px;
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid #000;
  border-radius: 50%;
  transition: background 0.3s;
}

.indicators span.active {
  background: red;
}
</style>
