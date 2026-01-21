import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ROLES } from '../composables/useRoleUtils'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(null)
  const isAuthenticated = computed(() => !!user.value)
  const isSuperAdmin = computed(() => {
    const role = user.value?.role
    return role === ROLES.SUPER_ADMIN
  })

  const isAdministrator = computed(() => {
    const role = user.value?.role
    return role === ROLES.ADMIN
  })

  const isEmployee = computed(() => {
    const role = user.value?.role
    return role === ROLES.EMPLOYEE
  })

  const canManageUsers = computed(() => isSuperAdmin.value || isAdministrator.value)

  const canViewOperations = computed(() => isAdministrator.value || isEmployee.value)
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
      const parsed = JSON.parse(json)

      // Normalize role if it comes with prefix
      if (parsed.rol && parsed.rol.startsWith('ROLE_')) {
        parsed.rol = parsed.rol.replace('ROLE_', '')
      }

      return parsed
    } catch (e) {
      console.error('Invalid JWT', e)
      return null
    }
  }

  const register = async (payload) => {
    try {
      const response = await fetch('http://localhost:8020/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.value}`
        },
        body: JSON.stringify(payload)
      })

      const rawText = await response.text() // ← siempre leer como texto

      if (!response.ok) {
        throw new Error(rawText || `Error ${response.status}`)
      }

      let data

      // Intentamos parsear JSON
      try {
        data = JSON.parse(rawText)
      } catch (e) {
        // No es JSON → devolvemos texto como OK
        data = rawText
      }

      return { success: true, data }

    } catch (err) {
      console.error('Error en registro:', err)
      return { success: false, error: err.message }
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

        const role = payload.rol ? payload.rol.replace('ROLE_', '') : null


        user.value = {
          email: payload.sub,
          role: role,
          storeU_id: payload.storeU_id
        }
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(user.value))

        // Redirect based on role
        if (isSuperAdmin.value) {
          router.push('/users')
        } else {
          router.push('/dashboard')
        }

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
      const parsedUser = JSON.parse(storedUser)
      // Ensure role is sanitized even if restoring from old bad state
      if (parsedUser.role && parsedUser.role.includes('ROLE_')) {
        parsedUser.role = parsedUser.role.replace('ROLE_', '')
        localStorage.setItem('user', JSON.stringify(parsedUser))
      }
      user.value = parsedUser
      token.value = storedToken
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    isSuperAdmin,
    isAdministrator,
    isEmployee,
    canManageUsers,
    canViewOperations,
    login,
    register,
    logout,
    initializeAuth
  }
})
