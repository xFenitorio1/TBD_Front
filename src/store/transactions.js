import { defineStore } from 'pinia'
import api from '../api/axios'

export const useTransactionStore = defineStore('transactions', {
  state: () => ({
    transactions: [],
    loading: false,
    error: null
  }),

  actions: {

    async fetchTransactions() {
      try {
        this.loading = true
        const res = await api.get('/transactions')
        this.transactions = res.data

      } catch (err) {
        console.error(err)
        this.error = err
      } finally {
        this.loading = false
      }
    },


    async fetchTransactionById(id) {
      try {
        const res = await api.get(`/transactions/${id}`)
        return res.data
      } catch (err) {
        console.error('Error obteniendo transacción por ID:', err)
        throw err
      }
    },

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

    async getUnusualTransactions() {
      try {
        const res = await api.get('/transactions/unusual')

        return res.data
      } catch (err) {
        console.error('Error buscando transacciones inusuales:', err)
        throw err
      }
    },

    async fetchStoreTransactions(id_store) {
      try {
        const res = await api.get(`/transactions/myStoreTransactions`, {
          params: { id_store }

        })

        this.transactions = res.data

        return res.data

      } catch (err) {
        console.error('Error obteniendo transacciones de tienda:', err)
        throw err
      }
    },

    async fetchTransactionsByUser(id_user) {
      return this.fetchStoreTransactions(id_user)
    },

    async createTransaction(transaction) {
      try {
        let res


        if (transaction.type_transaction === 'Transfer') {
          res = await api.put('/transactions/transfer', transaction)
        } else {
          res = await api.post('/transactions', transaction)
        }

        await this.fetchTransactions()
        return res.data

      } catch (err) {
        console.error('Error creando transacción:', err)
        throw err
      }
    },

    async transferInventory(transferData) {
      try {
        const res = await api.put('/transactions/transfer', transferData)
        await this.fetchTransactions()

        return res.data
      } catch (err) {
        console.error('Error en transferencia:', err)
        throw err
      }
    },

    async recentTransactions() {
      try {
        const res = await api.get('/transactions/recentTransactions')

        return res.data
      } catch (err) {
        console.error('Error fetching recent transactions:', err)
        throw err
      }
    }
  }
})
