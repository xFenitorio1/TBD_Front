import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../api/axios'
import { useProductStore } from './product'

export const useInventoryStore = defineStore('inventory', () => {
  const stores = ref([])
  const inventory = ref([])
  const products = ref([])
  const transactions = ref([])


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

  // ----------------------------------------
  // ⚡ NUEVOS ENDPOINTS AÑADIDOS
  // ----------------------------------------

  // 🟦 1. Obtener TODO el inventario
  const fetchAllInventory = async () => {
    try {
      const res = await api.get('/inventory')
      inventory.value = res.data
    } catch (err) {
      console.error('Error obteniendo inventario global:', err)
    }
  }

  // 🟦 2. Obtener inventario por producto
  const fetchInventoryByProduct = async (productId) => {
    try {
      const res = await api.get(`/inventory/product/${productId}`)
      return res.data
    } catch (err) {
      console.error('Error obteniendo inventario por producto:', err)
    }
  }

  // 🟦 3. Obtener inventario por IDs compuestos
  const fetchInventoryByIds = async (storeId, productId) => {
    try {
      const res = await api.get(`/inventory/${storeId}/${productId}`)
      return res.data
    } catch (err) {
      console.error('Error obteniendo inventario por IDs:', err)
    }
  }

  // 🟦 4. Crear inventario
  const createInventory = async (inventoryItem) => {
    try {
      const res = await api.post('/inventory/create', inventoryItem)
      await fetchInventoryByUser()
      return res.data
    } catch (err) {
      console.error('Error creando inventario:', err)
    }
  }

  // 🟦 5. Eliminar inventario
  const deleteInventory = async (storeId, productId) => {
    try {
      await api.delete(`/inventory/delete/${storeId}/${productId}`)
      inventory.value = inventory.value.filter(
        i => !(i.id_storein === storeId && i.id_productin === productId)
      )
    } catch (err) {
      console.error('Error eliminando inventario:', err)
    }
  }

  // ----------------------------------------
  // 🔵 FUNCIONES QUE YA EXISTÍAN
  // ----------------------------------------

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

  const fetchInventoryByStore = async () => {
    try {
      const { useAuthStore } = await import('./auth')
      const authStore = useAuthStore()
      const user = authStore.user

      const res = await api.get(`/inventory/store/${user.storeU_id}/products`)
      products.value = res.data
      console.log("🛒 Productos de la tienda:", products.value)
    } catch (err) {
      console.error("Error cargando productos por tienda:", err)
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

  // 🟦 6. Actualizar stock de inventario
  const updateInventoryStock = async (storeId, productId, stock) => {
    try {
      const inventoryPayload = {
        id_storein: storeId,
        id_productin: productId,
        stock_inventory: Number(stock)
      }
      const res = await api.put('/inventory/update', inventoryPayload)
      await fetchInventoryByUser()
      return res.data
    } catch (err) {
      console.error('Error actualizando stock de inventario:', err)
      throw err
    }
  }

  // ----------------------------------------

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
    fetchAllInventory,
    fetchInventoryByProduct,
    fetchInventoryByIds,
    createInventory,
    updateInventoryStock,
    deleteInventory,
    fetchProductsFromStore,
    fetchInventoryByStore,
    fetchInventoryByUser,
    persistUpdateStock
  }
})
