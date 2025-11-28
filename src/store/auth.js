import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(null)
  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => {
  const role = user.value?.role?.toUpperCase()
  return role === 'SUPERADMINISTRATOR' || role === 'ROLE_SUPERADMINISTRATOR'
})
  const router = useRouter()

  const decodeJwt = (token) => {
    if (!token) return null
    try {
      const parts = token.split('.')
      if (parts.length !== 3) return null
      let payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
      const pad = payload.length % 4
      if (pad === 2) payload += '=='
      else if (pad === 3) payload += '='
      else if (pad === 1) payload += '==='
      const json = atob(payload)
      return JSON.parse(json)
    } catch (e) {
      console.error('Invalid JWT', e)
      return null
    }
  }

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:8020/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || `Error ${response.status}`)
      }

      const data = await response.json()
      token.value = data.token

      const payload = decodeJwt(data.token)
      if (payload) {
        user.value = {
          email: payload.sub,
          role: payload.rol,
          storeU_id: payload.storeU_id
        }
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(user.value))
        router.push('/dashboard')
        return { success: true }
      } else {
        return { success: false, error: 'Token inválido' }
      }
    } catch (err) {
      console.error('Error en login:', err)
      return { success: false, error: err.message }
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    router.push('/login')
  }

  const initializeAuth = () => {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')
    if (storedUser && storedToken) {
      user.value = JSON.parse(storedUser)
      token.value = storedToken
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    initializeAuth
  }
})
