import { defineStore } from 'pinia'
import axios from 'axios'

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
        const res = await axios.get('/api/transactions')
        this.transactions = res.data
      } catch (err) {
        console.error(err)
        this.error = err
      } finally {
        this.loading = false
      }
    },

    async createTransaction(transaction) {
      const res = await axios.post('/api/transactions', transaction)
      await this.fetchTransactions()
      return res.data
    },

    async transferInventory(transferData) {
      const res = await axios.put('/api/transactions/transfer', transferData)
      await this.fetchTransactions()
      return res.data
    },

    async getUnusualTransactions() {
      const res = await axios.get('/api/transactions/unusual')
      return res.data
    }
  }
})
