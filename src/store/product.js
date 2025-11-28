import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api/axios'

export const useProductStore = defineStore('product', () => {
  const products = ref([])
  const noMovements = ref([])
  const lowStock = ref([])
  const top5 = ref([])
  const bestSupplier = ref(null)
  const avgInventory = ref([])
  const avgSales = ref([])

  // 🟢 Obtener todos los productos
  const fetchProducts = async () => {
    try {
      const res = await api.get('/products')
      products.value = res.data
    } catch (err) {
      console.error('❌ Error cargando productos:', err)
    }
  }

  // 🟢 Obtener un producto por ID
  const fetchProductById = async (id) => {
    try {
      const res = await api.get(`/products/${id}`)
      return res.data
    } catch (err) {
      console.error(`❌ Error cargando producto con ID ${id}:`, err)
      return null
    }
  }

  // 🟢 Buscar por nombre
  const searchProductsByName = async (name) => {
    try {
      const res = await api.get(`/products/search?name=${name}`)
      return res.data
    } catch (err) {
      console.error('❌ Error buscando productos:', err)
      return []
    }
  }

  // 🟢 Crear producto
  const createProduct = async (product) => {
    try {
      const res = await api.post('/products', product)
      await fetchProducts()
      return res.data
    } catch (err) {
      console.error('❌ Error creando producto:', err)
    }
  }

  // 🟢 Actualizar producto
  const updateProduct = async (id, product) => {
    try {
      const res = await api.put(`/products/${id}`, product)
      await fetchProducts()
      return res.data
    } catch (err) {
      console.error('❌ Error actualizando producto:', err)
    }
  }

  // 🟢 Eliminar producto
  const deleteProduct = async (id) => {
    try {
      await api.delete(`/products/${id}`)
      products.value = products.value.filter(p => p.id !== id)
    } catch (err) {
      console.error('❌ Error eliminando producto:', err)
    }
  }

  // 🟢 Verificar si un producto existe
  const productExists = async (id) => {
    try {
      const res = await api.get(`/products/exists/${id}`)
      return res.data
    } catch (err) {
      console.error('❌ Error verificando existencia:', err)
      return false
    }
  }

  // 🟡 Productos sin movimientos en 90 días
  const fetchNoMovements = async () => {
    try {
      const res = await api.get('/products/NoMovements')
      console.log("🚫 NoMovements products fetched:", res.data)
      noMovements.value = res.data
    } catch (err) {
      console.error('❌ Error obteniendo NoMovements:', err)
    }
  }

  // 🟡 Productos con stock bajo
  const fetchLowStock = async () => {
    try {
      const res = await api.get('/products/LowStock')
      lowStock.value = res.data
      console.log("⚠️ LowStock products fetched:", res.data)
    } catch (err) {
      console.error('❌ Error obteniendo LowStock:', err)
    }
  }

  // 🟡 Top 5 ventas por tienda
  const fetchTop5 = async () => {
    try {
      const res = await api.get('/products/Top5')
      top5.value = res.data
      console.log("🏆 Top5 products fetched:", res.data)
    } catch (err) {
      console.error('❌ Error obteniendo Top5:', err)
    }
  }

  // 🟡 Mejor proveedor del mes pasado
  const fetchBestSupplier = async () => {
    try {
      const res = await api.get('/products/BestSupplierLastMonth')
      console.log("🏅 BestSupplier fetched:", res.data)
      bestSupplier.value = res.data
    } catch (err) {
      console.error('❌ Error obteniendo BestSupplier:', err)
    }
  }

  // 🟡 Promedio días inventario último trimestre
  const fetchAverageInventory = async () => {
    try {
      const res = await api.get('/products/AverageDaysInventory')
      console.log("📦 AverageDaysInventory fetched:", res.data)
      avgInventory.value = res.data
    } catch (err) {
      console.error('❌ Error obteniendo AverageDaysInventory:', err)
    }
  }

  // 🟡 Promedio ventas diarias por mes
  const fetchAverageSales = async () => {
    try {
      const res = await api.get('/products/AverageDaySalesPerMonth')
      avgSales.value = res.data
      console.log("📊 AverageDaySales fetched:", res.data)
    } catch (err) {
      console.error('❌ Error obteniendo AverageDaySales:', err)
    }
  }

  return {
    products,
    noMovements,
    lowStock,
    top5,
    bestSupplier,
    avgInventory,
    avgSales,

    fetchProducts,
    fetchProductById,
    searchProductsByName,
    createProduct,
    updateProduct,
    deleteProduct,
    productExists,

    fetchNoMovements,
    fetchLowStock,
    fetchTop5,
    fetchBestSupplier,
    fetchAverageInventory,
    fetchAverageSales
  }
})
