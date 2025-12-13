import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8020/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para agregar el token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403) {
      console.warn('Acceso prohibido: token inválido o rol insuficiente')
    }
    if (error.response && error.response.status === 401) {
      console.warn('Token expirado o no autorizado')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
