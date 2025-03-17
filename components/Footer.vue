<template>
  <footer class="footer">
    <div class="container">
      <div class="row">
        <div class="col-md-6 text-center text-md-left">
          <h4 class="footer-title">Peminjaman Buku</h4>
          <p>&copy; {{ new Date().getFullYear() }} - Semua hak cipta dilindungi.</p>
        </div>
        <div class="col-md-6 text-center text-md-right">
          <ul class="footer-links">
            <li><nuxt-link to="/">Beranda</nuxt-link></li>
            <li><nuxt-link to="/user/listBuku">Daftar Buku</nuxt-link></li>
            <li><nuxt-link to="/user/pinjaman">Daftar Pinjaman</nuxt-link></li>
          </ul>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: linear-gradient(to right, #0B2447, #19376D);
  color: white;
  padding: 30px 0;
  text-align: center;
  margin-top: 100px;
  position: relative;
  box-shadow: 0px -5px 10px rgba(0, 0, 0, 0.2);
}

.footer::after {
  content: "";
  width: 80%;
  height: 1px;
  background: rgba(255, 255, 255, 0.2);
  display: block;
  margin: 10px auto;
}

.footer-title {
  font-size: 1.7rem;
  font-weight: 600;
  margin-bottom: 10px;
  letter-spacing: 1px;
}

.footer p {
  margin: 0;
  font-size: 14px;
  opacity: 0.8;
}

.footer-links {
  list-style: none;
  padding: 0;
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 10px;
}

.footer-links li {
  display: inline;
}

.footer-links a {
  color: white;
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s ease-in-out;
  padding: 5px 10px;
  border-radius: 5px;
}

.footer-links a:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #70a799;
}

@media (max-width: 768px) {
  .row {
    flex-direction: column;
    text-align: center;
  }
  .footer-links {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
