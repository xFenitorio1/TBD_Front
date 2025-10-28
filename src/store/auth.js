import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  
  const router = useRouter()

  const login = async (email, password) => {
    // Mock login - accept any email/password combination
    user.value = {
      id: 1,
      email: email,
      name: email.split('@')[0],
      role: email.includes('admin') ? 'admin' : 'user'
    }
    localStorage.setItem('user', JSON.stringify(user.value))
    router.push('/dashboard')
    return { success: true }
  }

  const logout = () => {
    user.value = null
    localStorage.removeItem('user')
    router.push('/login')
  }

  const initializeAuth = () => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      user.value = JSON.parse(storedUser)
    }
  }

  return {
    user,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    initializeAuth
  }
})
