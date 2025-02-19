import axios from 'axios';

const API_URL = 'http://localhost:8080/favorit'; // Sesuaikan dengan endpoint backend favorit

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

// Fungsi untuk menambahkan buku ke daftar favorit
export const addFavorit = async (favoritData) => {
  try {
    const response = await axiosInstance.post('/', favoritData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error adding favorit');
  }
};

// Fungsi untuk mengambil daftar favorit berdasarkan ID User
export const getFavoritByUser = async (idUser) => {
  try {
    const response = await axiosInstance.get(`/${idUser}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error fetching favorit');
  }
};

// Fungsi untuk menghapus buku dari daftar favorit
export const deleteFavorit = async (idUser, idBuku) => {
  try {
    const response = await axiosInstance.delete(`/${idUser}/${idBuku}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error deleting favorit');
  }
};
