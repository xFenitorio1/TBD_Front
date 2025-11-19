<template>
  <v-container fluid class="pa-6">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h3 font-weight-bold text-primary">Inventario</h1>
        <p class="text-body-1 text-medium-emphasis">Administra el inventario de todas las tiendas</p>
      </div>
    </div>

    <!-- Store Selection and Filters -->
    <v-card class="mb-6" elevation="2" rounded="lg">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="5">
            <v-text-field
              v-model="searchQuery"
              label="Buscar productos"
              placeholder="Buscar por nombre..."
              prepend-icon="mdi-magnify"
              variant="outlined"
              clearable
              hide-details
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="selectedStatus"
              label="Estado del Stock"
              :items="stockStatuses"
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

    <!-- Inventory Table -->
    <v-card v-if="selectedStore" elevation="2" rounded="lg">
      <v-data-table
        :headers="headers"
        :items="filteredInventory"
        class="elevation-0"
        hover
      >
        <template v-slot:item.product="{ item }">
          <div class="d-flex align-center">
            <v-avatar size="40" color="primary" class="mr-3">
              <v-icon size="20" color="white">mdi-package-variant</v-icon>
            </v-avatar>
            <div>
              <div class="font-weight-medium">{{ item.product?.name_product }}</div>
              <div class="text-caption text-medium-emphasis">{{ item.product?.sku }}</div>
            </div>
          </div>
        </template>

        <template v-slot:item.quantity="{ item }">
          <div class="d-flex align-center">
            <span class="font-weight-bold mr-2">{{ item.stock_inventory }}</span>
            <v-chip
              v-if="item.quantity <= item.minStock"
              color="error"
              size="small"
              variant="tonal"
            >
              Stock Bajo
            </v-chip>
          </div>
        </template>

        <template v-slot:item.minStock="{ item }">
          <span class="text-medium-emphasis">{{ item.minStock }}</span>
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="d-flex gap-2">
            <v-btn
              icon="mdi-pencil"
              size="small"
              color="primary"
              variant="text"
              @click="openStockDialog(item)"
            />
            <v-btn
              icon="mdi-eye"
              size="small"
              color="info"
              variant="text"
              @click="viewProductDetails(item)"
            />
          </div>
        </template>

        <template v-slot:no-data>
          <div class="text-center pa-6">
            <v-icon size="64" color="grey-lighten-1">mdi-warehouse</v-icon>
            <p class="text-h6 text-medium-emphasis mt-2">No se encontró inventario</p>
            <p class="text-body-2 text-medium-emphasis">Selecciona una tienda para ver su inventario</p>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- No Store Selected Message -->
    <v-card v-else elevation="2" rounded="lg">
      <v-card-text class="text-center pa-12">
        <v-icon size="64" color="grey-lighten-1">mdi-store</v-icon>
        <p class="text-h6 text-medium-emphasis mt-4">Selecciona una Tienda</p>
        <p class="text-body-1 text-medium-emphasis">Elige una tienda del menú desplegable para ver su inventario</p>
      </v-card-text>
    </v-card>

    <!-- Stock Update Dialog -->
    <v-dialog v-model="stockDialog" max-width="500px" persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">mdi-pencil</v-icon>
          Actualizar Stock
        </v-card-title>
        
        <v-card-text>
          <v-form ref="stockForm" v-model="isFormValid">
            <v-row>
              <v-col cols="12">
                <div class="mb-4">
                  <div class="text-body-1 font-weight-medium">{{ selectedInventoryItem?.product?.name }}</div>
                  <div class="text-caption text-medium-emphasis">{{ selectedInventoryItem?.product?.sku }}</div>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="newQuantity"
                  label="Nueva Cantidad"
                  type="number"
                  :rules="[v => v >= 0 || 'La cantidad no puede ser negativa']"
                  required
                  variant="outlined"
                  min="0"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="newMinStock"
                  label="Stock Mínimo"
                  type="number"
                  :rules="[v => v >= 0 || 'El stock mínimo no puede ser negativo']"
                  required
                  variant="outlined"
                  min="0"
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
            @click="closeStockDialog"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            @click="updateStock"
            :loading="isUpdating"
            :disabled="!isFormValid"
          >
            Actualizar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Product Details Dialog -->
    <v-dialog v-model="detailsDialog" max-width="600px">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">mdi-information</v-icon>
          Detalles del Producto
        </v-card-title>
        
        <v-card-text v-if="selectedInventoryItem">
          <v-row>
            <v-col cols="12" class="text-center mb-4">
              <v-avatar size="80" color="primary">
                <v-icon size="40" color="white">mdi-package-variant</v-icon>
              </v-avatar>
            </v-col>
            <v-col cols="12" md="6">
              <v-list>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon>mdi-package-variant</v-icon>
                  </template>
                  <v-list-item-title>Nombre del Producto</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedInventoryItem.product?.name }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon>mdi-barcode</v-icon>
                  </template>
                  <v-list-item-title>SKU</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedInventoryItem.product?.sku }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon>mdi-currency-usd</v-icon>
                  </template>
                  <v-list-item-title>Precio</v-list-item-title>
                  <v-list-item-subtitle>${{ selectedInventoryItem.product?.price?.toFixed(2) }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
            <v-col cols="12" md="6">
              <v-list>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon>mdi-warehouse</v-icon>
                  </template>
                  <v-list-item-title>Tienda</v-list-item-title>
                  <v-list-item-subtitle>{{ getStoreName(selectedInventoryItem.storeId) }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon>mdi-numeric</v-icon>
                  </template>
                  <v-list-item-title>Cantidad Actual</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedInventoryItem.stock_inventory }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon>mdi-alert</v-icon>
                  </template>
                  <v-list-item-title>Stock Mínimo</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedInventoryItem.minStock }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            variant="text"
            @click="detailsDialog = false"
          >
            Cerrar
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
const selectedStore = ref(null)
const searchQuery = ref('')
const selectedStatus = ref(null)
const stockDialog = ref(false)
const detailsDialog = ref(false)
const isFormValid = ref(false)
const isUpdating = ref(false)
const stockForm = ref(null)
const selectedInventoryItem = ref(null)
const newQuantity = ref(0)
const newMinStock = ref(0)

// Table headers
const headers = [
  { title: 'Producto', key: 'product', sortable: true },
  { title: 'Cantidad', key: 'quantity', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, width: '120px' }
]

// Stock statuses
const stockStatuses = [
  { title: 'Stock Bajo', value: 'low' },
  { title: 'Stock Normal', value: 'normal' },
  { title: 'Stock Alto', value: 'high' }
]

// Computed
const stores = computed(() => inventoryStore.stores)

const filteredInventory = computed(() => {
  if (!selectedStore.value) return []
  
  let inventory = inventoryStore.getInventoryByStore(selectedStore.value)
  
  if (searchQuery.value) {
    inventory = inventory.filter(item => 
      item.product?.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.product?.sku?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  
  if (selectedStatus.value) {
    inventory = inventory.filter(item => {
      if (selectedStatus.value === 'low') return item.quantity <= item.minStock
      if (selectedStatus.value === 'normal') return item.quantity > item.minStock && item.quantity <= item.minStock * 2
      if (selectedStatus.value === 'high') return item.quantity > item.minStock * 2
      return true
    })
  }
  
  return inventory
})

// Methods
const openStockDialog = (item) => {
  selectedInventoryItem.value = item
  newQuantity.value = item.quantity
  newMinStock.value = item.minStock
  stockDialog.value = true
}

const closeStockDialog = () => {
  stockDialog.value = false
  selectedInventoryItem.value = null
  newQuantity.value = 0
  newMinStock.value = 0
}

const updateStock = async () => {
  if (!stockForm.value.validate()) return
  isUpdating.value = true
  try {
    if (selectedInventoryItem.value) {
      inventoryStore.updateInventoryStock(selectedInventoryItem.value.id, newQuantity.value)
      if (newMinStock.value !== selectedInventoryItem.value.minStock) {
        selectedInventoryItem.value.minStock = newMinStock.value
      }
    }
    closeStockDialog()
  } catch (error) {
    console.error('Error updating stock:', error)
  } finally {
    isUpdating.value = false
  }
}

const viewProductDetails = (item) => {
  selectedInventoryItem.value = item
  detailsDialog.value = true
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedStatus.value = null
}

const getStoreName = (storeId) => {
  const store = stores.value.find(s => s.id === storeId)
  return store?.name || 'Tienda Desconocida'
}

// 🔹 Cargar inventario de la tienda asociada al usuario
onMounted(async () => {
  await inventoryStore.fetchProductsFromStore()
  await inventoryStore.fetchInventoryByUser()
  

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  selectedStore.value = user.storeU_id
})
</script>
