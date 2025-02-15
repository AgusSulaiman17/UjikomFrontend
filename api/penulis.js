import axios from 'axios';

const API_URL = 'http://localhost:8080/penulis'; // Ganti dengan URL API backend Anda

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


// Fungsi untuk membuat penulis baru
export const createPenulis = async (penulisData) => {
  try {
    const response = await axiosInstance.post('/', penulisData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error creating author');
  }
};

// Fungsi untuk mengambil semua penulis
export const getAllPenulis = async () => {
  try {
    const response = await axiosInstance.get('/');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error fetching authors');
  }
};

// Fungsi untuk mengambil penulis berdasarkan ID
export const getPenulisById = async (id) => {
  try {
    const response = await axiosInstance.get(`/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error fetching author');
  }
};

// Fungsi untuk memperbarui penulis
export const updatePenulis = async (id, penulisData) => {
  try {
    const response = await axiosInstance.put(`/${id}`, penulisData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error updating author');
  }
};

// Fungsi untuk menghapus penulis
export const deletePenulis = async (id) => {
  try {
    const response = await axiosInstance.delete(`/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error deleting author');
  }
};
