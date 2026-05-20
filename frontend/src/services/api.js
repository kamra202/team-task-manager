import axios from 'axios'

const baseURL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? '/api' : 'http://127.0.0.1:5000')

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg =
      err.response?.data?.error ||
      err.response?.data?.msg ||
      err.message ||
      'Request failed'
    return Promise.reject({ ...err, message: msg })
  },
)

export default api

export const authApi = {
  signup: (body) => api.post('/signup', body),
  login: (body) => api.post('/login', body),
  me: () => api.get('/me'),
}

export const projectsApi = {
  list: () => api.get('/projects'),
  create: (body) => api.post('/projects', body),
  update: (id, body) => api.put(`/projects/${id}`, body),
  delete: (id) => api.delete(`/projects/${id}`),
}

export const tasksApi = {
  list: (params) => api.get('/tasks', { params }),
  create: (body) => api.post('/tasks', body),
  update: (id, body) => api.put(`/tasks/${id}`, body),
  delete: (id) => api.delete(`/tasks/${id}`),
}

export const usersApi = {
  list: () => api.get('/users'),
}

export const statsApi = {
  get: () => api.get('/stats'),
}
