import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:4000',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async config => {
    if (localStorage.getItem('userInfo')) {
      config.headers.Authorization = `Bearer ${
        JSON.parse(localStorage.getItem('userInfo')).token
      }`;
    }
    return config;
  },
  error => {
    Promise.reject(error);
  }
);

export default apiClient;
