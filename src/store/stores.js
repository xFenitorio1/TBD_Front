import { defineStore } from 'pinia'
import api from '../api/axios'

export const useStoreStore = defineStore('stores', {
  state: () => ({
    stores: [],
    loading: false,
    summaryStockStore: [],
  }),

  actions: {
    async fetchStores() {
      try {
        this.loading = true
        const res = await api.get('/stores')
        this.stores = res.data


      } catch (err) {
        console.error('Error obteniendo tiendas:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async createStore(storeData) {
      try {
        await api.post('/stores/create', storeData)
        await this.fetchStores()
      } catch (err) {
        console.error('Error creando tienda:', err)
        throw err
      }
    },

    async updateStore(storeData) {
      try {
        await api.put('/stores/update', storeData)
        await this.fetchStores()
      } catch (err) {
        console.error('Error actualizando tienda:', err)
        throw er
      }
    },

    async deleteStore(id) {
      try {
        await api.delete(`/stores/delete/${id}`)
        await this.fetchStores()
      } catch (err) {
        console.error('Error eliminando tienda:', err)
        throw err
      }
    },

    async fetchSummaryStockStore(id_store) {
      try {
        const res = await api.get(`/stores/summaryStockStore`)
        this.summaryStockStore = res.data || []

        return res.data
      } catch (err) {
        console.error('Error obteniendo resumen de stock por tienda:', err)
        throw err
      }
    }
  }
})
