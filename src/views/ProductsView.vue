<template>
  <v-container fluid class="pa-6">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h3 font-weight-bold text-primary">Productos</h1>
        <p class="text-body-1 text-medium-emphasis">Administra tu catálogo de productos</p>
      </div>
      <v-btn
        color="primary"
        variant="outlined"
        size="large"
        rounded="pill"
        prepend-icon="mdi-plus"
        class="text-none font-weight-bold px-6"
        @click="openProductDialog()"
      >
        Agregar Producto
      </v-btn>
    </div>

    <!-- Search and Filters -->
    <v-card class="mb-6" elevation="2" rounded="lg">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="searchQuery"
              label="Buscar productos"
              placeholder="Buscar por nombre o SKU..."
              prepend-icon="mdi-magnify"
              variant="outlined"
              clearable
              hide-details
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-btn
              color="secondary"
              variant="outlined"
              prepend-icon="mdi-filter-variant"
              @click="resetFilters"
            >
              Restablecer Filtros
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Products Table -->
    <v-card elevation="2" rounded="lg">
      <v-data-table
        :headers="headers"
        :items="filteredProducts"
        :search="searchQuery"
        class="elevation-0"
        hover
      >
        <template v-slot:item.price="{ item }">
          <span class="font-weight-bold">${{ Number(item.price).toFixed(2) }}</span>
        </template>

        <template v-slot:item.sku="{ item }">
          <span>{{ item.sku || item.sku || '-' }}</span>
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="d-flex gap-2">
            <v-btn icon size="small" color="info" variant="text" @click="editProduct(item)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon size="small" color="error" variant="text" @click="confirmDelete(item)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </div>
        </template>

        <template v-slot:no-data>
          <div class="text-center pa-6">
            <v-icon size="64" color="grey-lighten-1">mdi-package-variant</v-icon>
            <p class="text-h6 text-medium-emphasis mt-2">No se encontraron productos</p>
            <p class="text-body-2 text-medium-emphasis">Agrega tu primer producto para comenzar.</p>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Product Dialog -->
    <ProductFormDialog
      v-model="productDialog"
      :product="editingProduct"
      :is-saving="isSaving"
      @close="closeProductDialog"
      @save="saveProduct"
    />

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h6">Confirmar Eliminación</v-card-title>
        <v-card-text>
          ¿Estás seguro de que quieres eliminar "<strong>{{ productToDelete?.name_product }}</strong>"? Esta acción no se puede deshacer.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" variant="text" @click="deleteDialog = false">Cancelar</v-btn>
          <v-btn color="error" @click="deleteProduct" :loading="isDeleting">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProductStore } from '../store/product'
import { useAuthStore } from '../store/auth'
import { useInventoryStore } from '../store/inventory'
import { useUiStore } from '../store/ui'
import ProductFormDialog from '../components/products/ProductFormDialog.vue'
import api from '../api/axios'

const productStore = useProductStore()
const authStore = useAuthStore()
const inventoryStore = useInventoryStore()
const uiStore = useUiStore()

// UI state
const searchQuery = ref('')
const productDialog = ref(false)
const deleteDialog = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)
const productToDelete = ref(null)

// editing model
const editingProduct = ref(null)

// table headers (keys should match your product object)
const headers = [
  { title: 'Nombre', key: 'name_product', sortable: true },
  { title: 'Descripción', key: 'description_product', sortable: false },
  { title: 'Precio', key: 'price', sortable: true },
  { title: 'SKU', key: 'sku', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, width: '120px' }
]

// computed list from store
const products = computed(() => productStore.products || [])

// filtered by search query (name_product or SKU)
const filteredProducts = computed(() => {
  if (!searchQuery.value) return products.value
  const q = searchQuery.value.toLowerCase()
  return products.value.filter(p =>
    (p.name_product || '').toString().toLowerCase().includes(q) ||
    (p.sku || p.sku || '').toString().toLowerCase().includes(q)
  )
})

// lifecycle: fetch products
onMounted(async () => {
  await inventoryStore.fetchProductsFromStore()
})

// open add dialog
const openProductDialog = () => {
  editingProduct.value = null
  productDialog.value = true
}

// open edit dialog
const editProduct = (product) => {
  editingProduct.value = { ...product }
  productDialog.value = true
}

// close dialog
const closeProductDialog = () => {
  productDialog.value = false
  editingProduct.value = null
}

// save (create or update)
const saveProduct = async (payload, productId, stockInventory) => {
  isSaving.value = true
  try {
    let createdProduct = null

    if (productId != null) {
      // Update existing product
      await productStore.updateProduct(productId, payload)
      
      // Update inventory stock if provided and user has a store
      if (stockInventory !== null && stockInventory !== undefined && authStore.user?.storeU_id) {
        try {
          // Check if inventory entry exists
          const existingInventory = await inventoryStore.fetchInventoryByIds(
            authStore.user.storeU_id,
            productId
          )
          
          if (existingInventory) {
            // Update existing inventory
            await inventoryStore.updateInventoryStock(
              authStore.user.storeU_id,
              productId,
              stockInventory
            )

          } else {
            // Create new inventory entry if it doesn't exist
            const inventoryPayload = {
              id_storein: authStore.user.storeU_id,
              id_productin: productId,
              stock_inventory: Number(stockInventory)
            }
            await api.post('/inventory/create', inventoryPayload)

          }
        } catch (inventoryErr) {
          console.error('Error actualizando inventario:', inventoryErr)
        }
      }
    } else {
      // Create product
      createdProduct = await productStore.createProduct(payload)


      // ❗ SIEMPRE volver a cargar productos porque backend no devuelve ID
      await productStore.fetchProducts()

      // Buscar el producto recién creado usando el SKU (único)
      const newProduct = productStore.products.find(
        p => p.sku === payload.sku
      )

      if (!newProduct) {
        console.error("❌ No fue posible determinar el ID del producto creado")
      } else {


        // Crear inventario
        if (stockInventory !== null && authStore.user?.storeU_id) {
          const inventoryPayload = {
            id_storein: authStore.user.storeU_id,
            id_productin: newProduct.id,   // ahora sí existe
            stock_inventory: Number(stockInventory)
          }

          await api.post('/inventory/create', inventoryPayload)

        }
      }
    }

    await productStore.fetchProducts()
    
    uiStore.showSnackbar(
      productId != null ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente',
      'success'
    )
    
    closeProductDialog()
  } catch (err) {
    console.error("Error guardando producto:", err)
  } finally {
    isSaving.value = false
  }
}

const confirmDelete = (product) => {
  productToDelete.value = product
  deleteDialog.value = true
}

const deleteProduct = async () => {
  if (!productToDelete.value) return
  isDeleting.value = true
  try {
    const productId = productToDelete.value.id
    
    // Delete inventory entry for this product in user's store (if user has a store)
    if (authStore.user?.storeU_id) {
      try {
        // Try to delete inventory entry (will fail silently if it doesn't exist)
        await inventoryStore.deleteInventory(
          authStore.user.storeU_id,
          productId
        )

      } catch (inventoryErr) {
      
        console.warn('Inventario no encontrado o ya eliminado (continuando):', inventoryErr.message)
      }
    }
    
    // Delete the product
    await productStore.fetchProducts()
    deleteDialog.value = false
    productToDelete.value = null
  } catch (err) {
    console.error('Error eliminando producto:', err)
  } finally {
    isDeleting.value = false
  }
}

const resetFilters = () => {
  searchQuery.value = ''
}
</script>

<style scoped>
</style>

