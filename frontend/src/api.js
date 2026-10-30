import axios from 'axios';
// Let Axios set the correct content type automatically: JSON for objects and
// multipart/form-data (including its boundary) for FormData resume uploads.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    error.userMessage = message;
    return Promise.reject(error);
  }
);
export const getError = (error) => error?.response?.data?.message || error?.userMessage || 'Something went wrong. Please try again.';
export { api };
export default api;
