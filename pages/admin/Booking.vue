<template>
  <div>
    <h1>Daftar Booking (Pending)</h1>

    <!-- Tampilkan pesan jika tidak ada booking yang pending -->
    <div v-if="bookings.length === 0">
      <p>Tidak ada booking yang pending.</p>
    </div>

    <!-- Tampilkan tabel booking -->
    <table v-else>
      <thead>
        <tr>
          <th>ID Booking</th>
          <th>Nama User</th>
          <th>Buku</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="booking in bookings" :key="booking.id_peminjaman">
          <td>{{ booking.id_peminjaman }}</td>
          <!-- Periksa apakah booking.user ada sebelum mengakses booking.user.name -->
          <td>{{ booking.user ? booking.user.name : 'Tidak Ditemukan' }}</td>
          <td>{{ booking.buku ? booking.buku.judul : 'Tidak Ditemukan' }}</td>
          <td>{{ booking.status }}</td>
          <td>
            <button
              v-if="booking.status === 'pending'"
              @click="approveBooking(booking.id_peminjaman)"
            >
              Setujui
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { getAllBookings, approveBooking } from '~/api/peminjaman'; // pastikan path api benar

export default {
  data() {
    return {
      bookings: [], // Menyimpan data booking
    };
  },
  methods: {
    // Mengambil semua booking yang pending
    async fetchBookings() {
      try {
        const response = await getAllBookings(); // Ambil data booking dari API
        // Simpan data yang diterima ke dalam state bookings
        this.bookings = response.data;
      } catch (error) {
        console.error('Error fetching bookings:', error);
        this.$toast.error('Gagal mengambil data booking');
      }
    },

    // Menyetujui booking
    async approveBooking(id) {
      try {
        await approveBooking(id); // Panggil API untuk menyetujui booking
        // Setelah booking disetujui, ambil ulang data booking
        this.fetchBookings();
        this.$toast.success('Booking berhasil disetujui');
      } catch (error) {
        console.error('Error approving booking:', error);
        this.$toast.error('Gagal menyetujui booking');
      }
    }
  },
  created() {
    // Ambil data booking ketika halaman pertama kali dimuat
    this.fetchBookings();
  },
};
</script>

<style scoped>
/* Style untuk tabel dan button */
table {
  width: 100%;
  border-collapse: collapse;
}

table, th, td {
  border: 1px solid #ddd;
}

th, td {
  padding: 10px;
  text-align: left;
}

button {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 5px;
}

button:hover {
  background-color: #218838;
}

button:disabled {
  background-color: #ccc;
}
</style>
