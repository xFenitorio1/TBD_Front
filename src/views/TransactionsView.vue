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
          <v-col cols="6">
            <v-select
              v-model="selectedType"
              label="Tipo de Transacción"
              :items="transactionTypes"
              variant="outlined"
              hide-details
              clearable
            />
          </v-col>
          <v-col cols="3">
            <v-text-field
              v-model="dateRange"
              label="Rango de Fechas"
              type="date"
              variant="outlined"
              hide-details
            />
          </v-col>
          <v-col cols="3">
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
        <template v-slot:item.typeTransaction="{ item }">
          <v-chip
            :color="getTransactionColor(item.typeTransaction)"
            size="small"
            variant="tonal"
          >
            <v-icon start size="16">{{ getTransactionIcon(item.typeTransaction) }}</v-icon>
            {{ getTransactionTypeLabel(item.typeTransaction) }}
          </v-chip>
        </template>

        <template v-slot:item.dateTransaction="{ item }">
          <span class="font-weight-medium">{{ formatDate(item.dateTransaction || item.date) }}</span>
        </template>

        <template v-slot:item.nameProduct="{ item }">
          <div class="d-flex align-center">
            <v-avatar size="24" color="primary" class="mr-2">
              <v-icon size="14" color="white">mdi-package-variant</v-icon>
            </v-avatar>
            <span class="font-weight-medium">{{ item.nameProduct }}</span>
          </div>
        </template>

        <template v-slot:item.amountProduct="{ item }">
          <span class="font-weight-bold">{{ item.amountProduct }}</span>
        </template>

        <template v-slot:item.nameStoreOR="{ item }">
          <div class="d-flex flex-column">
            <span class="font-weight-medium">
              {{ item.nameStoreOR }}
            </span>
          </div>
        </template>

        <template v-slot:item.nameStoreDE="{ item }">
          <div class="d-flex flex-column">
            <span class="font-weight-medium">
              {{ item.nameStoreDE }}
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
    <TransactionFormDialog
      v-model="transactionDialog"
      :transaction="editingTransaction"
      :products="products"
      :is-saving="isSaving"
      @close="closeTransactionDialog"
      @save="saveTransaction"
    />

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
                <v-chip :color="getTransactionColor(selectedTransaction.typeTransaction)">
                  {{ getTransactionTypeLabel(selectedTransaction.typeTransaction) }}
                </v-chip>
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-calendar</v-icon>
              </template>
              <v-list-item-title>Fecha</v-list-item-title>
              <v-list-item-subtitle>
                {{ formatDate(selectedTransaction.dateTransaction) }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-package-variant</v-icon>
              </template>
              <v-list-item-title>Producto</v-list-item-title>
              <v-list-item-subtitle>
                {{ selectedTransaction.nameProduct }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-numeric</v-icon>
              </template>
              <v-list-item-title>Cantidad</v-list-item-title>
              <v-list-item-subtitle>
                {{ selectedTransaction.amountProduct }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <template v-slot:prepend>
                <v-icon>mdi-store</v-icon>
              </template>
              <v-list-item-title>Tiendas</v-list-item-title>
              <v-list-item-subtitle>
                {{ selectedTransaction.nameStoreOR }} → {{ selectedTransaction.nameStoreDE }}
              </v-list-item-subtitle>
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
import { useTransactionStore } from '../store/transactions'
import { useAuthStore } from '../store/auth'
import TransactionFormDialog from '../components/transactions/TransactionFormDialog.vue'

const inventoryStore = useInventoryStore()
const transactionStore = useTransactionStore()
const authStore = useAuthStore()

// Reactive data
const selectedType = ref(null)
const selectedStore = ref(null)
const dateRange = ref('')
const transactionDialog = ref(false)
const detailsDialog = ref(false)
const isSaving = ref(false)
const selectedTransaction = ref(null)

// Form data
const editingTransaction = ref(null)

// Table headers
const headers = [
  { title: 'Tipo', key: 'typeTransaction', sortable: true },
  { title: 'Fecha', key: 'dateTransaction', sortable: true },
  { title: 'Producto', key: 'nameProduct', sortable: true },
  { title: 'Cantidad', key: 'amountProduct', sortable: true },
  { title: 'Viene de', key: 'nameStoreOR', sortable: false },
  { title: 'Va a', key: 'nameStoreDE', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false, width: '120px' }
]

// Transaction types
const transactionTypes = [
  { title: 'Venta', value: 'Sale' },
  { title: 'Transferencia', value: 'Transfer' },
  { title: 'Recepción', value: 'Receipt' }
]

// Computed properties: usa transactionStore.transactions
const products = computed(() => inventoryStore.products)
const transactions = computed(() => transactionStore.transactions) // <-- usa transactionStore

const filteredTransactions = computed(() => {
  let filtered = transactions.value || []

  if (selectedType.value) {
    filtered = filtered.filter(t => t.typeTransaction === selectedType.value)
  }

  if (selectedStore.value) {
    filtered = filtered.filter(t =>
      t.nameStoreOR === selectedStore.value ||
      t.nameStoreDE === selectedStore.value
    )
  }

  return filtered
})

// Methods
const openTransactionDialog = (transaction = null) => {
  editingTransaction.value = transaction ? { ...transaction } : null
  transactionDialog.value = true
}

const closeTransactionDialog = () => {
  transactionDialog.value = false
  editingTransaction.value = null
}

const saveTransaction = async (payload, transactionId) => {
  isSaving.value = true
  
  try {
    if (transactionId != null) {
      // TODO: implementar update si tu backend lo soporta
      console.warn('Update transaction not yet implemented')
    } else {
      // Create transaction using the store
      console.log("Saving transaction with payload:", payload)
      await transactionStore.createTransaction(payload)
    }
    
    // Refresh transactions
    await transactionStore.fetchStoreTransactions(authStore.user.storeU_id)
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
    Sale: 'success',
    Transfer: 'info',
    Receipt: 'warning',
    sale: 'success',
    transfer: 'info',
    reception: 'warning'
  }
  return colors[type] || 'default'
}

const getTransactionIcon = (type) => {
  const icons = {
    Sale: 'mdi-cart',
    Transfer: 'mdi-swap-horizontal',
    Receipt: 'mdi-truck-delivery',
    sale: 'mdi-cart',
    transfer: 'mdi-swap-horizontal',
    reception: 'mdi-truck-delivery'
  }
  return icons[type] || 'mdi-help'
}

const getTransactionTypeLabel = (type) => {
  const labels = {
    Sale: 'Venta',
    Transfer: 'Transferencia',
    Receipt: 'Recepción',
    sale: 'Venta',
    transfer: 'Transferencia',
    reception: 'Recepción'
  }
  return labels[type] || type
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-ES')
}

// Cargar datos al montar
onMounted(async () => {
  const id_store = authStore.user?.storeU_id
  console.log("Fetching transactions for store ID:", id_store)
  await transactionStore.fetchStoreTransactions(id_store)
  await inventoryStore.fetchProductsFromStore()
})
</script>
