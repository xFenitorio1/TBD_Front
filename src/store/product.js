import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api/axios'

export const useProductStore = defineStore('product', () => {
  const products = ref([])

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

  return {
    products,
    fetchProducts,
    fetchProductById,
    searchProductsByName,
    createProduct,
    updateProduct,
    deleteProduct
  }
})
