import { defineStore } from 'pinia'
import api from '../api/axios'

export const useLogisticsStore = defineStore('logistics', {
    state: () => ({
        stores: [],
        distributionCenters: [],
        transferSuggestion: null,
        loading: false,
        error: null
    }),

    actions: {
        async fetchStores() {
            this.loading = true
            try {
                const response = await api.get('/stores')
                this.stores = response.data
            } catch (err) {
                this.error = err.message
                console.error('Error fetching stores:', err)
            } finally {
                this.loading = false
            }
        },

        async fetchDistributionCenters() {
            this.loading = true
            try {
                const response = await api.get('/centros-distribucion')
                this.distributionCenters = response.data
            } catch (err) {
                this.error = err.message
                console.error('Error fetching distribution centers:', err)
            } finally {
                this.loading = false
            }
        },

        async getTransferSuggestion(expectingStoreId, productId, quantity) {
            this.loading = true
            this.transferSuggestion = null
            try {
                const response = await api.get('/logistics/optimal-transfer', {
                    params: {
                        expectingStoreId,
                        productId,
                        quantity
                    }
                })
                this.transferSuggestion = response.data
                return response.data
            } catch (err) {
                this.error = err.message
                console.error('Error getting transfer suggestion:', err)
                throw err
            } finally {
                this.loading = false
            }
        },

        async assignDistributionCenters(storeId) {
            this.loading = true
            try {
                const response = await api.get(`/logistics/assign-distribution-center/${storeId}`)
                return response.data
            } catch (err) {
                this.error = err.message
                console.error('Error assigning distribution centers:', err)
                throw err
            } finally {
                this.loading = false
            }
        },

        async calculateCoverage(storeId) {
            this.loading = true
            try {
                const response = await api.get(`/logistics/coverage/${storeId}`)
                return response.data
            } catch (err) {
                this.error = err.message
                console.error('Error calculating coverage:', err)
                throw err
            } finally {
                this.loading = false
            }
        },

        async calculateTransferDistance(originStoreId, destStoreId) {
            this.loading = true
            try {
                const response = await api.get('/logistics/transfer-distance', {
                    params: {
                        originStoreId,
                        destStoreId
                    }
                })
                return response.data
            } catch (err) {
                this.error = err.message
                console.error('Error calculating transfer distance:', err)
                throw err
            } finally {
                this.loading = false
            }
        }
    }
})
