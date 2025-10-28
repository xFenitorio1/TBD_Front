import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useInventoryStore = defineStore('inventory', () => {
  // Mock data
  const products = ref([
    { id: 1, name: 'Laptop Dell XPS 13', category: 'Electronics', price: 1299.99, description: 'High-performance laptop' },
    { id: 2, name: 'Wireless Mouse', category: 'Accessories', price: 29.99, description: 'Ergonomic wireless mouse' },
    { id: 3, name: 'Mechanical Keyboard', category: 'Accessories', price: 149.99, description: 'RGB mechanical keyboard' },
    { id: 4, name: 'Monitor 27"', category: 'Electronics', price: 399.99, description: '4K Ultra HD monitor' },
    { id: 5, name: 'USB-C Cable', category: 'Accessories', price: 19.99, description: 'High-speed USB-C cable' }
  ])
  
  const stores = ref([
    { id: 1, name: 'Downtown Store', address: '123 Main St, Downtown', phone: '(555) 123-4567' },
    { id: 2, name: 'Mall Location', address: '456 Mall Ave, Shopping Center', phone: '(555) 234-5678' },
    { id: 3, name: 'Airport Store', address: '789 Airport Blvd, Terminal 2', phone: '(555) 345-6789' }
  ])
  
  const inventory = ref([
    { id: 1, productId: 1, storeId: 1, quantity: 15, minStock: 5 },
    { id: 2, productId: 2, storeId: 1, quantity: 50, minStock: 10 },
    { id: 3, productId: 3, storeId: 1, quantity: 8, minStock: 5 },
    { id: 4, productId: 1, storeId: 2, quantity: 12, minStock: 5 },
    { id: 5, productId: 4, storeId: 2, quantity: 6, minStock: 3 },
    { id: 6, productId: 5, storeId: 3, quantity: 25, minStock: 10 },
    { id: 7, productId: 2, storeId: 3, quantity: 3, minStock: 10 }
  ])
  
  const transactions = ref([
    { id: 1, type: 'sale', productId: 1, storeId: 1, quantity: 2, timestamp: '2024-01-15T10:30:00Z', userId: 1 },
    { id: 2, type: 'reception', productId: 2, storeId: 1, quantity: 20, timestamp: '2024-01-15T14:20:00Z', userId: 1 },
    { id: 3, type: 'transfer', productId: 3, storeId: 1, storeIdTo: 2, quantity: 5, timestamp: '2024-01-16T09:15:00Z', userId: 1 }
  ])

  // Computed properties
  const totalProducts = computed(() => products.value.length)
  const totalStores = computed(() => stores.value.length)
  const lowStockAlerts = computed(() => {
    return inventory.value.filter(item => item.quantity <= item.minStock)
  })

  const getProductById = (id) => {
    return products.value.find(p => p.id === id)
  }

  const getStoreById = (id) => {
    return stores.value.find(s => s.id === id)
  }

  const getInventoryByStore = (storeId) => {
    return inventory.value
      .filter(item => item.storeId === storeId)
      .map(item => ({
        ...item,
        product: getProductById(item.productId),
        store: getStoreById(item.storeId)
      }))
  }

  const updateStock = (inventoryId, newQuantity) => {
    const item = inventory.value.find(i => i.id === inventoryId)
    if (item) {
      item.quantity = newQuantity
    }
  }

  // Mock actions (no API calls)
  const fetchProducts = async () => {
    // Mock delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 100))
    return products.value
  }

  const fetchStores = async () => {
    await new Promise(resolve => setTimeout(resolve, 100))
    return stores.value
  }

  const fetchInventory = async () => {
    await new Promise(resolve => setTimeout(resolve, 100))
    return inventory.value
  }

  const fetchTransactions = async () => {
    await new Promise(resolve => setTimeout(resolve, 100))
    return transactions.value
  }

  const refreshAll = async () => {
    await new Promise(resolve => setTimeout(resolve, 200))
    // Data is already loaded, no need to fetch
  }

  const persistUpdateStock = async (inventoryId, newQuantity) => {
    await new Promise(resolve => setTimeout(resolve, 100))
    updateStock(inventoryId, newQuantity)
  }

  return {
    products,
    stores,
    inventory,
    transactions,
    totalProducts,
    totalStores,
    lowStockAlerts,
    getProductById,
    getStoreById,
    getInventoryByStore,
    updateStock,
    // mock actions
    fetchProducts,
    fetchStores,
    fetchInventory,
    fetchTransactions,
    refreshAll,
    persistUpdateStock
  }
})
