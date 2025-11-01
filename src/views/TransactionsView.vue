<template>
  <v-container fluid class="pa-6">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h3 font-weight-bold text-primary">Transacciones</h1>
        <p class="text-body-1 text-medium-emphasis">Registra y rastrea todos los movimientos de inventario</p>
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        size="large"
        @click="openTransactionDialog()"
      >
        Nueva Transacción
      </v-btn>
    </div>

    <!-- Filters -->
    <v-card class="mb-6" elevation="2" rounded="lg">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedType"
              label="Tipo de Transacción"
              :items="transactionTypes"
              variant="outlined"
              hide-details
              clearable
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedStore"
              label="Tienda"
              :items="stores"
              item-title="name"
              item-value="id"
              variant="outlined"
              hide-details
              clearable
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="dateRange"
              label="Rango de Fechas"
              type="date"
              variant="outlined"
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

    <!-- Transactions Table -->
    <v-card elevation="2" rounded="lg">
      <v-data-table
        :headers="headers"
        :items="filteredTransactions"
        class="elevation-0"
        hover
      >
        <template v-slot:item.type="{ item }">
          <v-chip
            :color="getTransactionColor(item.type)"
            size="small"
            variant="tonal"
          >
            <v-icon start size="16">{{ getTransactionIcon(item.type) }}</v-icon>
            {{ getTransactionTypeLabel(item.type) }}
          </v-chip>
        </template>

        <template v-slot:item.date="{ item }">
          <span class="font-weight-medium">{{ formatDate(item.date) }}</span>
        </template>

        <template v-slot:item.product="{ item }">
          <div class="d-flex align-center">
            <v-avatar size="24" color="primary" class="mr-2">
              <v-icon size="14" color="white">mdi-package-variant</v-icon>
            </v-avatar>
            <span class="font-weight-medium">{{ getProductName(item.productId) }}</span>
          </div>
        </template>

        <template v-slot:item.quantity="{ item }">
          <span class="font-weight-bold">{{ item.quantity }}</span>
        </template>

        <template v-slot:item.amount="{ item }">
          <span v-if="item.amount" class="font-weight-bold text-success">
            ${{ item.amount.toFixed(2) }}
          </span>
          <span v-else class="text-medium-emphasis">-</span>
        </template>

        <template v-slot:item.store="{ item }">
          <div class="d-flex flex-column">
            <span v-if="item.storeId" class="font-weight-medium">
              {{ getStoreName(item.storeId) }}
            </span>
            <span v-if="item.fromStoreId && item.toStoreId" class="text-caption text-medium-emphasis">
              {{ getStoreName(item.fromStoreId) }} → {{ getStoreName(item.toStoreId) }}
            </span>
          </div>
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="d-flex gap-2">
            <v-btn
              icon="mdi-eye"
              size="small"
              color="info"
              variant="text"
              @click="viewTransactionDetails(item)"
            />
            <v-btn
              icon="mdi-pencil"
              size="small"
              color="primary"
              variant="text"
              @click="editTransaction(item)"
            />
          </div>
        </template>

        <template v-slot:no-data>
          <div class="text-center pa-6">
            <v-icon size="64" color="grey-lighten-1">mdi-swap-horizontal</v-icon>
            <p class="text-h6 text-medium-emphasis mt-2">No se encontraron transacciones</p>
            <p class="text-body-2 text-medium-emphasis">Crea tu primera transacción para comenzar</p>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Transaction Dialog -->
    <v-dialog v-model="transactionDialog" max-width="700px" persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">{{ isEditing ? 'mdi-pencil' : 'mdi-plus' }}</v-icon>
          {{ isEditing ? 'Editar Transacción' : 'Nueva Transacción' }}
        </v-card-title>
        
        <v-card-text>
          <v-form ref="transactionForm" v-model="isFormValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="editingTransaction.type"
                  label="Tipo de Transacción"
                  :items="transactionTypes"
                  variant="outlined"
                  required
                  :rules="[v => !!v || 'El tipo de transacción es requerido']"
                  @update:model-value="onTypeChange"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editingTransaction.date"
                  label="Fecha"
                  type="date"
                  variant="outlined"
                  required
                  :rules="[v => !!v || 'La fecha es requerida']"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="editingTransaction.productId"
                  label="Producto"
                  :items="products"
                  item-title="name"
                  item-value="id"
                  variant="outlined"
                  required
                  :rules="[v => !!v || 'El producto es requerido']"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="editingTransaction.quantity"
                  label="Cantidad"
                  type="number"
                  variant="outlined"
                  required
                  :rules="[v => v > 0 || 'La cantidad debe ser mayor que 0']"
                  min="1"
                />
              </v-col>
              
              <!-- Store fields based on transaction type -->
              <v-col cols="12" md="6" v-if="editingTransaction.type === 'sale'">
                <v-select
                  v-model="editingTransaction.storeId"
                  label="Tienda"
                  :items="stores"
                  item-title="name"
                  item-value="id"
                  variant="outlined"
                  required
                  :rules="[v => !!v || 'La tienda es requerida']"
                />
              </v-col>
              
              <v-col cols="12" md="6" v-if="editingTransaction.type === 'sale'">
                <v-text-field
                  v-model.number="editingTransaction.amount"
                  label="Monto Total"
                  type="number"
                  variant="outlined"
                  required
                  :rules="[v => v > 0 || 'El monto debe ser mayor que 0']"
                  prefix="$"
                  step="0.01"
                />
              </v-col>
              
              <v-col cols="12" md="6" v-if="editingTransaction.type === 'transfer'">
                <v-select
                  v-model="editingTransaction.fromStoreId"
                  label="Desde Tienda"
                  :items="stores"
                  item-title="name"
                  item-value="id"
                  variant="outlined"
                  required
                  :rules="[v => !!v || 'La tienda de origen es requerida']"
                />
              </v-col>
              
              <v-col cols="12" md="6" v-if="editingTransaction.type === 'transfer'">
                <v-select
                  v-model="editingTransaction.toStoreId"
                  label="Hacia Tienda"
                  :items="stores"
                  item-title="name"
                  item-value="id"
                  variant="outlined"
                  required
                  :rules="[v => !!v || 'La tienda de destino es requerida']"
                />
              </v-col>
              
              <v-col cols="12" md="6" v-if="editingTransaction.type === 'reception'">
                <v-select
                  v-model="editingTransaction.storeId"
                  label="Tienda"
                  :items="stores"
                  item-title="name"
                  item-value="id"
                  variant="outlined"
                  required
                  :rules="[v => !!v || 'La tienda es requerida']"
                />
              </v-col>
              
              <v-col cols="12" md="6" v-if="editingTransaction.type === 'reception'">
                <v-text-field
                  v-model="editingTransaction.supplier"
                  label="Proveedor"
                  variant="outlined"
                  required
                  :rules="[v => !!v || 'El proveedor es requerido']"
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
            @click="closeTransactionDialog"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            @click="saveTransaction"
            :loading="isSaving"
            :disabled="!isFormValid"
          >
            {{ isEditing ? 'Actualizar' : 'Crear' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Transaction Details Dialog -->
    <v-dialog v-model="detailsDialog" max-width="600px">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">mdi-information</v-icon>
          Detalles de la Transacción
        </v-card-title>
        
        <v-card-text v-if="selectedTransaction">
          <v-list>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-swap-horizontal</v-icon>
              </template>
              <v-list-item-title>Tipo</v-list-item-title>
              <v-list-item-subtitle>
                <v-chip
                  :color="getTransactionColor(selectedTransaction.type)"
                  size="small"
                  variant="tonal"
                >
                  {{ getTransactionTypeLabel(selectedTransaction.type) }}
                </v-chip>
              </v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-calendar</v-icon>
              </template>
              <v-list-item-title>Fecha</v-list-item-title>
              <v-list-item-subtitle>{{ formatDate(selectedTransaction.date) }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-package-variant</v-icon>
              </template>
              <v-list-item-title>Producto</v-list-item-title>
              <v-list-item-subtitle>{{ getProductName(selectedTransaction.productId) }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-numeric</v-icon>
              </template>
              <v-list-item-title>Cantidad</v-list-item-title>
              <v-list-item-subtitle>{{ selectedTransaction.quantity }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item v-if="selectedTransaction.amount">
              <template v-slot:prepend>
                <v-icon>mdi-currency-usd</v-icon>
              </template>
              <v-list-item-title>Monto</v-list-item-title>
              <v-list-item-subtitle>${{ selectedTransaction.amount.toFixed(2) }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item v-if="selectedTransaction.supplier">
              <template v-slot:prepend>
                <v-icon>mdi-truck-delivery</v-icon>
              </template>
              <v-list-item-title>Proveedor</v-list-item-title>
              <v-list-item-subtitle>{{ selectedTransaction.supplier }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
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
const selectedType = ref(null)
const selectedStore = ref(null)
const dateRange = ref('')
const transactionDialog = ref(false)
const detailsDialog = ref(false)
const isFormValid = ref(false)
const isEditing = ref(false)
const isSaving = ref(false)
const transactionForm = ref(null)
const selectedTransaction = ref(null)

// Form data
const editingTransaction = ref({
  type: '',
  date: new Date().toISOString().split('T')[0],
  productId: null,
  quantity: 1,
  storeId: null,
  amount: null,
  fromStoreId: null,
  toStoreId: null,
  supplier: ''
})

// Table headers
const headers = [
  { title: 'Tipo', key: 'type', sortable: true },
  { title: 'Fecha', key: 'date', sortable: true },
  { title: 'Producto', key: 'product', sortable: true },
  { title: 'Cantidad', key: 'quantity', sortable: true },
  { title: 'Monto', key: 'amount', sortable: true },
  { title: 'Tienda', key: 'store', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, width: '120px' }
]

// Transaction types
const transactionTypes = [
  { title: 'Venta', value: 'sale' },
  { title: 'Transferencia', value: 'transfer' },
  { title: 'Recepción', value: 'reception' }
]

// Computed properties
const stores = computed(() => inventoryStore.stores)
const products = computed(() => inventoryStore.products)
const transactions = computed(() => inventoryStore.transactions)

const filteredTransactions = computed(() => {
  let filtered = transactions.value
  
  if (selectedType.value) {
    filtered = filtered.filter(t => t.type === selectedType.value)
  }
  
  if (selectedStore.value) {
    filtered = filtered.filter(t => 
      t.storeId === selectedStore.value || 
      t.fromStoreId === selectedStore.value || 
      t.toStoreId === selectedStore.value
    )
  }
  
  return filtered
})

// Methods
const openTransactionDialog = (transaction = null) => {
  if (transaction) {
    editingTransaction.value = { ...transaction }
    isEditing.value = true
  } else {
    editingTransaction.value = {
      type: '',
      date: new Date().toISOString().split('T')[0],
      productId: null,
      quantity: 1,
      storeId: null,
      amount: null,
      fromStoreId: null,
      toStoreId: null,
      supplier: ''
    }
    isEditing.value = false
  }
  transactionDialog.value = true
}

const closeTransactionDialog = () => {
  transactionDialog.value = false
  editingTransaction.value = {
    type: '',
    date: new Date().toISOString().split('T')[0],
    productId: null,
    quantity: 1,
    storeId: null,
    amount: null,
    fromStoreId: null,
    toStoreId: null,
    supplier: ''
  }
  isEditing.value = false
}

const onTypeChange = () => {
  // Reset store-related fields when type changes
  editingTransaction.value.storeId = null
  editingTransaction.value.fromStoreId = null
  editingTransaction.value.toStoreId = null
  editingTransaction.value.amount = null
  editingTransaction.value.supplier = ''
}

const saveTransaction = async () => {
  if (!transactionForm.value.validate()) return
  
  isSaving.value = true
  
  try {
    if (isEditing.value) {
      // Update existing transaction
    } else {
      // Create new transaction
      inventoryStore.addTransaction(editingTransaction.value)
    }
    
    closeTransactionDialog()
  } catch (error) {
    console.error('Error saving transaction:', error)
  } finally {
    isSaving.value = false
  }
}

const viewTransactionDetails = (transaction) => {
  selectedTransaction.value = transaction
  detailsDialog.value = true
}

const editTransaction = (transaction) => {
  openTransactionDialog(transaction)
}

const resetFilters = () => {
  selectedType.value = null
  selectedStore.value = null
  dateRange.value = ''
}

const getTransactionColor = (type) => {
  const colors = {
    sale: 'success',
    transfer: 'info',
    reception: 'warning'
  }
  return colors[type] || 'default'
}

const getTransactionIcon = (type) => {
  const icons = {
    sale: 'mdi-cart',
    transfer: 'mdi-swap-horizontal',
    reception: 'mdi-truck-delivery'
  }
  return icons[type] || 'mdi-help'
}

const getTransactionTypeLabel = (type) => {
  const labels = {
    sale: 'Venta',
    transfer: 'Transferencia',
    reception: 'Recepción'
  }
  return labels[type] || type
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-ES')
}

const getProductName = (productId) => {
  const product = inventoryStore.getProductById(productId)
  return product?.name || 'Producto Desconocido'
}

const getStoreName = (storeId) => {
  const store = inventoryStore.getStoreById(storeId)
  return store?.name || 'Tienda Desconocida'
}

onMounted(() => {
  // Initialize any component-specific data
})
</script>

<style scoped>
/* No custom CSS needed - using Vuetify's built-in styling */
</style>
