<template>
  <div class="container-fluid d-flex">
    <!-- Desktop View -->
    <div class="col-lg-6 d-none d-md-block content-left">
      <h1 class="judul">Website Peminjaman Buku Perpustakaan <span class="highlight font-irish text-ijomuda">Lentera</span></h1>
      <p class="description">Website Peminjaman Buku untuk Perpustakaan Lentera yang asli cuman ada disini.
        cepat pinjam buku sebanyak banyaknya buat anda menjadi lebih pintar
      </p>

    </div>

    <!-- Image Slider on Desktop -->
    <div class="col-lg-6 d-none d-md-flex justify-content-center align-items-center slider-container">
      <transition name="slide-fade" mode="out-in">
        <div class="card bayangan bg-ijomuda" :key="film[currentIndex].judul">
          <img :src="film[currentIndex].img" :alt="film[currentIndex].judul" class="card-img">
          <div class="card-body">
            <h2 class="card-title text-white">{{ film[currentIndex].judul }}</h2>
          </div>
        </div>
      </transition>
    </div>

    <!-- Mobile View -->
    <div class="col-12 d-md-none">
      <h1 class="judul">Website Peminjaman Buku Lentera</h1>
      <p class="description">Website Peminjaman Buku untuk Perpustakaan <span class="highlight">Lentera</span></p>

    </div>
  </div>
</template>


<script>
export default {
  name: "HeroLanding",
  data() {
    return {
      film: [
        { img: 'images/landing2.png', judul: 'Buku Terbaik' },
        { img: 'images/landing2.png', judul: 'Web Terpercaya' },
      ],
      currentIndex: 0,
    };
  },
};
</script>

<style scoped>
/* General Styling */
.judul {
  font-size: 60px;
  font-weight: bold;
}

.highlight {
  font-weight: bold;
}

.description {
  font-size: 20px;
  margin-top: 20px;
}

.content-left {
  padding: 20px;
}

.action-buttons {
  margin-top: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-img {
  width: 100%;
  height: auto;
}

.slider-container {
  position: relative;
}

/* Mobile and Tablet */
@media (max-width: 768px) {
  .judul {
    font-size: 30px;
  }

  .description {
    font-size: 12px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 10px;
  }
}

/* Image Slider Transitions */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.5s ease;
}

.slide-fade-enter, .slide-fade-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

/* Card Styling */
.bayangan {
  border-radius: 10px;
  box-shadow: inset 0 46px 69px rgba(0, 0, 0, 0.1);
}

.card-body {
  padding: 20px;
  text-align: center;
}

.tombol-landing{
 font-size: 20px;
}
</style>
