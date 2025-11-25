import { defineStore } from 'pinia'
import api from '../api/axios'

export const useUserStore = defineStore('userStore', {
  state: () => ({
    users: [],
    selectedUser: null,
    loading: false,
    error: null
  }),

  actions: {
    // Obtener todos los usuarios
    async fetchUsers() {
      this.loading = true
      try {
        const res = await api.get('/user')
        this.users = res.data
      } catch (err) {
        console.error('Error obteniendo usuarios:', err)
        this.error = err
        throw err
      } finally {
        this.loading = false
      }
    },

    // Obtener usuario por ID
    async fetchUserById(id) {
      this.loading = true
      try {
        const res = await api.get(`/user/${id}`)
        this.selectedUser = res.data
        return res.data
      } catch (err) {
        console.error('Error obteniendo usuario por ID:', err)
        this.error = err
        throw err
      } finally {
        this.loading = false
      }
    },

    // Actualizar usuario
    async updateUser(user) {
      this.loading = true
      try {
        const res = await api.put('/user/update', user)
        return res.data    
      } catch (err) {
        console.error('Error actualizando usuario:', err)
        this.error = err
        throw err
      } finally {
        this.loading = false
      }
    }
  }
})
