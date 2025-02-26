import axios from 'axios';

const API_URL = 'http://localhost:8080/users'; // Ganti dengan URL API backend Anda

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
    const token = getAuthToken(); // Ambil token
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`; // Menambahkan token ke header
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Fungsi untuk membuat pengguna baru
export const createUser = async (userData) => {
  try {
    const response = await axiosInstance.post('/', userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error creating user');
  }
};

// Fungsi untuk mengambil semua pengguna
export const getAllUsers = async () => {
  try {
    const response = await axiosInstance.get('/');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error fetching users');
  }
};

// Fungsi untuk mengambil pengguna berdasarkan ID
export const getUserById = async (id) => {
  try {
    console.log("Mengambil user dengan ID:", id); // Debugging

    const response = await axiosInstance.get(`/${id}`);
    console.log("Response API:", response.data); // Debugging

    return response.data;
  } catch (error) {
    console.error("Error response:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || "Error fetching user");
  }
};


// Fungsi untuk memperbarui pengguna
export const updateUser = async (id, userData) => {
  try {
    const response = await axiosInstance.put(`/${id}`, userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error updating user');
  }
};

// Fungsi untuk menghapus pengguna
export const deleteUser = async (id) => {
  try {
    const response = await axiosInstance.delete(`/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error deleting user');
  }
};
