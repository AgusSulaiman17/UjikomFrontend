import axios from 'axios';

const API_URL = 'http://localhost:8080/penerbit'; // Ganti dengan URL API backend Anda

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


// Fungsi untuk membuat penerbit baru
export const createPenerbit = async (penerbitData) => {
  try {
    const response = await axiosInstance.post('/', penerbitData);
    return response.data;
  } catch (error) {
    console.error('Error creating penerbit:', error);
    throw new Error(error.response?.data?.error || 'Error creating publisher');
  }
};

// Fungsi untuk mengambil semua penerbit
export const getAllPenerbit = async () => {
  try {
    const response = await axiosInstance.get('/');
    return response.data;
  } catch (error) {
    console.error('Error fetching penerbit:', error);  // Menambahkan log untuk error
    throw new Error(error.response?.data?.error || 'Error fetching publishers');
  }
};

// Fungsi untuk mengambil penerbit berdasarkan ID
export const getPenerbitById = async (id) => {
  try {
    const response = await axiosInstance.get(`/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error fetching publisher');
  }
};

// Fungsi untuk memperbarui penerbit
export const updatePenerbit = async (id, penerbitData) => {
  try {
    const response = await axiosInstance.put(`/${id}`, penerbitData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error updating publisher');
  }
};

// Fungsi untuk menghapus penerbit
export const deletePenerbit = async (id) => {
  try {
    const response = await axiosInstance.delete(`/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error deleting publisher');
  }
};
