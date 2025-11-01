import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../api/axios'
import { useProductStore } from './product'


export const useInventoryStore = defineStore('inventory', () => {
  const stores = ref([])
  const inventory = ref([])
  const products = ref([])
  const transactions = ref([])

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const totalStores = computed(() => stores.value.length)
  const totalProducts = computed(() => products.value.length)
  const lowStockAlerts = computed(() =>
    inventory.value.filter(item => item.quantity <= item.minStock)
  )

  const getProductById = (id) => products.value.find(p => p.id === id)
  const getStoreById = (id) => stores.value.find(s => s.id === id)

  const getInventoryByStore = (storeId) => {
    return inventory.value
      .filter(item => item.id_storein === storeId)
      .map(item => ({
        ...item,
        product: getProductById(item.id_productin),
        store: getStoreById(item.id_storein)
      }))
  }

  // 🔹 Cargar productos desde el store de productos
  const fetchProductsFromStore = async () => {
    try {
      const productStore = useProductStore()
      await productStore.fetchProducts()
      products.value = productStore.products
    } catch (err) {
      console.error('Error cargando productos desde ProductStore:', err)
    }
  }

  const fetchInventoryByUser = async () => {
    try {

      const { useAuthStore } = await import('./auth')
      const authStore = useAuthStore()
      const user = authStore.user

      if (!user.storeU_id) {
        console.warn('⚠️ Usuario sin storeU_id')
        return
      }
      const res = await api.get(`/inventory/store/${user.storeU_id}`)
      inventory.value = res.data
    } catch (err) {
      console.error('Error cargando inventario:', err)
    }
  }

  const persistUpdateStock = async (inventoryItem) => {
    try {
      await api.put('/inventory/update', inventoryItem)
      const item = inventory.value.find(i =>
        i.id_storein === inventoryItem.id_storein &&
        i.id_productin === inventoryItem.id_productin
      )
      if (item) {
        item.quantity = inventoryItem.quantity
        item.minStock = inventoryItem.minStock
      }
    } catch (err) {
      console.error('Error actualizando inventario:', err)
    }
  }

  return {
    stores,
    inventory,
    products,
    transactions,
    totalStores,
    totalProducts,
    lowStockAlerts,
    getProductById,
    getStoreById,
    getInventoryByStore,
    fetchProductsFromStore,
    fetchInventoryByUser,
    persistUpdateStock
  }
})
