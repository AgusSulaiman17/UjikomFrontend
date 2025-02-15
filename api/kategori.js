import axios from 'axios';

const API_URL = 'http://localhost:8080/kategori'; // Ganti dengan URL API backend Anda

// Fungsi untuk mendapatkan token dari localStorage
const getAuthToken = () => {
  return localStorage.getItem('token'); // Ambil token dari localStorage
};

// Mengonfigurasi axios untuk menyertakan token di header
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
        console.log("Token added to request header:", `Bearer ${token}`);
      } else {
        console.log("No token found in localStorage");
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// Fungsi untuk membuat kategori baru
export const createKategori = async (kategoriData) => {
  try {
    const response = await axiosInstance.post('/', kategoriData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error creating category');
  }
};

// Fungsi untuk mengambil semua kategori
export const getAllKategori = async () => {
  try {
    const response = await axiosInstance.get('/');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error fetching categories');
  }
};

// Fungsi untuk mengambil kategori berdasarkan ID
export const getKategoriById = async (id) => {
  try {
    const response = await axiosInstance.get(`/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error fetching category');
  }
};

// Fungsi untuk memperbarui kategori
export const updateKategori = async (id, kategoriData) => {
  try {
    const response = await axiosInstance.put(`/${id}`, kategoriData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error updating category');
  }
};

// Fungsi untuk menghapus kategori
export const deleteKategori = async (id) => {
  try {
    const response = await axiosInstance.delete(`/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error deleting category');
  }
};
