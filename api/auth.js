import axios from 'axios';

const API_URL = 'http://localhost:8080'; // Sesuaikan dengan backend kamu

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data; // Mengembalikan token dan user data
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};
