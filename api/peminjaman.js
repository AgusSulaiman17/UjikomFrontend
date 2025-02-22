import axios from 'axios';

const API_URL = 'http://localhost:8080/peminjaman'; // Sesuaikan dengan endpoint backend peminjaman

// Fungsi untuk mendapatkan token dari localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Konfigurasi axios dengan token di header
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tambahkan token ke header Authorization setiap kali ada permintaan
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") { // Cek apakah berjalan di client
      const token = getAuthToken();
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Fungsi untuk membuat peminjaman baru
export const createPeminjaman = async (peminjamanData) => {
  try {
    const response = await axiosInstance.post('/', peminjamanData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error creating peminjaman');
  }
};

// Fungsi untuk mengambil semua peminjaman
export const getAllPeminjaman = async () => {
  try {
    const response = await axiosInstance.get('/');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error fetching peminjaman');
  }
};

// Fungsi untuk mengambil peminjaman berdasarkan ID User
export const getPeminjamanByUserId = async (idUser) => {
  try {
    const response = await axiosInstance.get(`/user/${idUser}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error fetching user peminjaman');
  }
};

// Fungsi untuk mengambil peminjaman berdasarkan ID
export const getPeminjamanById = async (id) => {
  try {
    const response = await axiosInstance.get(`/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error fetching peminjaman');
  }
};

// Fungsi untuk memperbarui peminjaman
export const updatePeminjaman = async (id, peminjamanData) => {
  try {
    const response = await axiosInstance.put(`/${id}`, peminjamanData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error updating peminjaman');
  }
};

// Fungsi untuk menghapus peminjaman
export const deletePeminjaman = async (id) => {
  try {
    const response = await axiosInstance.delete(`/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error deleting peminjaman');
  }
};

// Fungsi untuk menghapus peminjaman
export const deletePeminjamanByUser = async (id) => {
  try {
    const response = await axiosInstance.delete(`/byuser/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error deleting peminjaman');
  }
};

// Fungsi untuk menyetujui booking
export const approveBooking = async (id) => {
  try {
    const response = await axiosInstance.put(`/approve/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error approving booking');
  }
};

// Fungsi untuk mengembalikan buku
export const returnBook = async (id) => {
  try {
    const response = await axiosInstance.put(`/return/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error returning book');
  }
};

// Fungsi untuk membuat booking baru
export const createBooking = async (bookingData) => {
  try {
    const response = await axiosInstance.post('/booking', bookingData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error creating booking');
  }
};


// Fungsi untuk mengambil daftar booking berdasarkan ID User
export const getBookingByUserId = async (idUser) => {
  try {
    const response = await axiosInstance.get(`/booking/user/${idUser}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error fetching booking');
  }
};

// Fungsi untuk mengambil semua booking yang pending
export const getAllBookings = async () => {
  try {
    const response = await axiosInstance.get('/booking');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error fetching bookings');
  }
};

// Fungsi untuk mendapatkan booking berdasarkan ID
export const getBookingById = async (id) => {
  try {
    const response = await axiosInstance.get(`/booking/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error fetching booking');
  }
};

// Fungsi untuk menghapus booking
export const deleteBooking = async (id) => {
  try {
    const response = await axiosInstance.delete(`/booking/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error deleting booking');
  }
};
