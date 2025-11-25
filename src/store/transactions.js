import { defineStore } from 'pinia'
import api from '../api/axios'

export const useTransactionStore = defineStore('transactions', {
  state: () => ({
    transactions: [],
    loading: false,
    error: null
  }),

  actions: {
    // --------------------------------------------------
    // 🟦 GET: Obtener todas las transacciones
    // --------------------------------------------------
    async fetchTransactions() {
      try {
        this.loading = true
        const res = await api.get('/transactions')
        this.transactions = res.data
        console.log("PENEPENEPNEPNEPNEPNEPNE:")
      } catch (err) {
        console.error(err)
        this.error = err
      } finally {
        this.loading = false
      }
    },

    // --------------------------------------------------
    // 🟦 GET: Obtener transacción por ID
    // /api/transactions/{id}
    // --------------------------------------------------
    async fetchTransactionById(id) {
      try {
        const res = await api.get(`/transactions/${id}`)
        return res.data
      } catch (err) {
        console.error('Error obteniendo transacción por ID:', err)
        throw err
      }
    },

    // --------------------------------------------------
    // 🟦 GET: Buscar por TYPE
    // /api/transactions/searchByType?type=VENTA
    // --------------------------------------------------
    async fetchTransactionsByType(type) {
      try {
        const res = await api.get(`/transactions/searchByType`, {
          params: { type }
        })
        return res.data
      } catch (err) {
        console.error('Error buscando transacciones por tipo:', err)
        throw err
      }
    },

    // --------------------------------------------------
    // 🟦 GET: Buscar por fecha exacta
    // /api/transacti ons/searchByDate?date=2025-01-01
    // --------------------------------------------------
    async fetchTransactionsByDate(date) {
      try {
        const res = await api.get(`/transactions/searchByDate`, {
          params: { date }
        })
        return res.data
      } catch (err) {
        console.error('Error buscando transacciones por fecha:', err)
        throw err
      }
    },

    // --------------------------------------------------
    // 🟦 GET: Transacciones inusuales
    // /api/transactions/unusual
    // --------------------------------------------------
    async getUnusualTransactions() {
      try {
        const res = await api.get('/transactions/unusual')
        return res.data
      } catch (err) {
        console.error('Error buscando transacciones inusuales:', err)
        throw err
      }
    },

    // --------------------------------------------------
    // 🟦 GET: Transacciones por tienda según ID de usuario
    // /api/transactions/myStoreTransactions?id_user=XX
    // --------------------------------------------------
    async fetchStoreTransactions(id_store) {
      try {
        const res = await api.get(`/transactions/myStoreTransactions`, {
          params: { id_store }
          
        })
        console.log("Fetched store transactions:", res.data)
        this.transactions = res.data

        return res.data
        
      } catch (err) {
        console.error('Error obteniendo transacciones de tienda:', err)
        throw err
      }
    },

    // Alias for fetchStoreTransactions
    async fetchTransactionsByUser(id_user) {
      return this.fetchStoreTransactions(id_user)
    },

    // --------------------------------------------------
    // 🟩 POST: Crear transacción
    // /api/transactions
    // --------------------------------------------------
    async createTransaction(transaction) {
      try {
        console.log("Creating transaction with data:", transaction)
        const res = await api.post('/transactions', transaction)
        await this.fetchTransactions()
        return res.data
      } catch (err) {
        console.error('Error creando transacción:', err)
        throw err
      }
    },

    // --------------------------------------------------
    // 🟧 PUT: Transferir inventario
    // /api/transactions/transfer
    // --------------------------------------------------
    async transferInventory(transferData) {
      try {
        const res = await api.put('/transactions/transfer', transferData)
        await this.fetchTransactions()
        return res.data
      } catch (err) {
        console.error('Error en transferencia:', err)
        throw err
      }
    }
  }
})
