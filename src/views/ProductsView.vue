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
        prepend-icon="mdi-plus"
        size="large"
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
            <v-select
              v-model="selectedCategory"
              label="Categoría"
              :items="categories"
              variant="outlined"
              hide-details
              clearable
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
          <span class="font-weight-bold">${{ item.price.toFixed(2) }}</span>
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="d-flex gap-2">
            <v-btn
              icon="mdi-pencil"
              size="small"
              color="primary"
              variant="text"
              @click="openProductDialog(item)"
            />
            <v-btn
              icon="mdi-delete"
              size="small"
              color="error"
              variant="text"
              @click="confirmDelete(item)"
            />
          </div>
        </template>

        <template v-slot:no-data>
          <div class="text-center pa-6">
            <v-icon size="64" color="grey-lighten-1">mdi-package-variant</v-icon>
            <p class="text-h6 text-medium-emphasis mt-2">No se encontraron productos</p>
            <p class="text-body-2 text-medium-emphasis">Ajusta tu búsqueda o agrega un nuevo producto</p>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Product Dialog -->
    <v-dialog v-model="productDialog" max-width="600px" persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">{{ isEditing ? 'mdi-pencil' : 'mdi-plus' }}</v-icon>
          {{ isEditing ? 'Editar Producto' : 'Agregar Nuevo Producto' }}
        </v-card-title>
        
        <v-card-text>
          <v-form ref="productForm" v-model="isFormValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editingProduct.name"
                  label="Nombre del Producto"
                  :rules="[v => !!v || 'El nombre del producto es requerido']"
                  required
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editingProduct.sku"
                  label="SKU"
                  :rules="[v => !!v || 'El SKU es requerido']"
                  required
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="editingProduct.description"
                  label="Descripción"
                  variant="outlined"
                  rows="3"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="editingProduct.price"
                  label="Precio"
                  type="number"
                  :rules="[v => v > 0 || 'El precio debe ser mayor que 0']"
                  required
                  variant="outlined"
                  prefix="$"
                  step="0.01"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="editingProduct.category"
                  label="Categoría"
                  :items="categories"
                  variant="outlined"
                  required
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-6">
          <v-spacer />
          <v-btn
            color="grey"
            variant="text"
            @click="closeProductDialog"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            @click="saveProduct"
            :loading="isSaving"
            :disabled="!isFormValid"
          >
            {{ isEditing ? 'Actualizar' : 'Crear' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h6">
          Confirmar Eliminación
        </v-card-title>
        <v-card-text>
          ¿Estás seguro de que quieres eliminar "{{ productToDelete?.name }}"? Esta acción no se puede deshacer.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey"
            variant="text"
            @click="deleteDialog = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="error"
            @click="deleteProduct"
            :loading="isDeleting"
          >
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useInventoryStore } from '../store/inventory'

const inventoryStore = useInventoryStore()

// Reactive data
const searchQuery = ref('')
const selectedCategory = ref(null)
const productDialog = ref(false)
const deleteDialog = ref(false)
const isFormValid = ref(false)
const isEditing = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)
const productToDelete = ref(null)
const productForm = ref(null)

// Form data
const editingProduct = ref({
  name: '',
  description: '',
  price: 0,
  sku: '',
  category: ''
})

// Table headers
const headers = [
  { title: 'ID', key: 'id', sortable: true },
  { title: 'Nombre', key: 'name', sortable: true },
  { title: 'Descripción', key: 'description', sortable: false },
  { title: 'Precio', key: 'price', sortable: true },
  { title: 'SKU', key: 'sku', sortable: true },
  { title: 'Categoría', key: 'category', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, width: '120px' }
]

// Categories
const categories = ['Electrónicos', 'Accesorios', 'Suministros de Oficina', 'Muebles', 'Ropa']

// Computed properties
const filteredProducts = computed(() => {
  let products = inventoryStore.products
  
  if (selectedCategory.value) {
    products = products.filter(p => p.category === selectedCategory.value)
  }
  
  return products
})

// Methods
const openProductDialog = (product = null) => {
  if (product) {
    editingProduct.value = { ...product }
    isEditing.value = true
  } else {
    editingProduct.value = {
      name: '',
      description: '',
      price: 0,
      sku: '',
      category: ''
    }
    isEditing.value = false
  }
  productDialog.value = true
}

const closeProductDialog = () => {
  productDialog.value = false
  editingProduct.value = {
    name: '',
    description: '',
    price: 0,
    sku: '',
    category: ''
  }
  isEditing.value = false
}

const saveProduct = async () => {
  if (!productForm.value.validate()) return
  
  isSaving.value = true
  
  try {
    if (isEditing.value) {
      inventoryStore.updateProduct(editingProduct.value.id, editingProduct.value)
    } else {
      inventoryStore.addProduct(editingProduct.value)
    }
    
    closeProductDialog()
  } catch (error) {
    console.error('Error saving product:', error)
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
    inventoryStore.deleteProduct(productToDelete.value.id)
    deleteDialog.value = false
    productToDelete.value = null
  } catch (error) {
    console.error('Error deleting product:', error)
  } finally {
    isDeleting.value = false
  }
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = null
}

onMounted(() => {
  // Initialize any component-specific data
})
</script>

<style scoped>
/* No custom CSS needed - using Vuetify's built-in styling */
</style>
