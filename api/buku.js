import axios from 'axios';

const API_URL = 'http://localhost:8080/buku'; // Ubah ke endpoint backend buku

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
    const token = getAuthToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Token added to request header:', `Bearer ${token}`);
    } else {
      console.log('No token found in localStorage');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Fungsi untuk membuat buku baru
export const createBuku = async (bukuData) => {
  try {
    const response = await axiosInstance.post('/', bukuData);
    return response.data;
  } catch (error) {
    console.error('Error creating buku:', error);
    throw new Error(error.response?.data?.error || 'Error creating book');
  }
};

// Fungsi untuk mengambil semua buku
export const getAllBuku = async () => {
  try {
    const response = await axiosInstance.get('/');
    return response.data;
  } catch (error) {
    console.error('Error fetching buku:', error);
    throw new Error(error.response?.data?.error || 'Error fetching books');
  }
};

// Fungsi untuk mengambil buku berdasarkan ID
export const getBukuById = async (id) => {
  try {
    const response = await axiosInstance.get(`/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error fetching book');
  }
};

// Fungsi untuk memperbarui buku
export const updateBuku = async (id, bukuData) => {
  try {
    const response = await axiosInstance.put(`/${id}`, bukuData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error updating book');
  }
};

// Fungsi untuk menghapus buku
export const deleteBuku = async (id) => {
  try {
    const response = await axiosInstance.delete(`/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error deleting book');
  }
};
