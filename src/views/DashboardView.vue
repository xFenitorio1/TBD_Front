<template>
  <v-container fluid class="pa-6">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h3 font-weight-bold text-primary">Panel de Control</h1>
      </div>
      <v-chip
        :color="getRoleColor(user?.role)"
        variant="tonal"
        size="large"
        class="font-weight-bold"
      >
        <v-icon start>{{ getRoleIcon(user?.role) }}</v-icon>
        {{ getRoleLabel(user?.role) }}
      </v-chip>
    </div>

    <!-- Summary Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card class="summary-card" elevation="2" rounded="lg">
          <v-card-text class="d-flex align-center">
            <v-icon size="48" color="primary" class="mr-4">mdi-package-variant</v-icon>
            <div>
              <div class="text-h4 font-weight-bold">{{ totalProducts }}</div>
              <div class="text-body-2 text-medium-emphasis">Total de Productos</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3" v-if="authStore.isSuperAdmin">
        <v-card class="summary-card" elevation="2" rounded="lg">
          <v-card-text class="d-flex align-center">
            <v-icon size="48" color="success" class="mr-4">mdi-store</v-icon>
            <div>
              <div class="text-h4 font-weight-bold">{{ totalStores }}</div>
              <div class="text-body-2 text-medium-emphasis">Total de Tiendas</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="summary-card" elevation="2" rounded="lg">
          <v-card-text class="d-flex align-center">
            <v-icon size="48" color="warning" class="mr-4">mdi-alert</v-icon>
            <div>
              <div class="text-h4 font-weight-bold">{{ lowStockAlerts.length }}</div>
              <div class="text-body-2 text-medium-emphasis">Alertas de Stock Bajo</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="summary-card" elevation="2" rounded="lg">
          <v-card-text class="d-flex align-center">
            <v-icon size="48" color="info" class="mr-4">mdi-swap-horizontal</v-icon>
            <div>
              <div class="text-h4 font-weight-bold">{{ recentTransactions.length }}</div>
              <div class="text-body-2 text-medium-emphasis">Transacciones totales</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Charts and Recent Activity Row -->
    <v-row class="mb-6" v-if="!authStore.isSuperAdmin">
      <v-col cols="12" lg="6">
        <v-card elevation="2" rounded="lg">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-chart-pie</v-icon>
            Productos Más Vendidos
          </v-card-title>
          <v-card-text>
            <div class="chart-container">
              <canvas ref="topProductsChart" height="300"></canvas>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="6">
        <v-card elevation="2" rounded="lg">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-clock-outline</v-icon>
            Transacciones Recientes
          </v-card-title>
          <v-card-text>
            <v-list lines="two">
              <v-list-item
                v-for="transaction in recentTransactions.slice(0, 5)"
                :key="transaction.id"
                :prepend-icon="getTransactionIcon(transaction.type)"
                :title="getTransactionTitle(transaction)"
                :subtitle="`${transaction.date} - ${transaction.quantity} unidades`"
              >
                <template v-slot:append>
                  <v-chip
                    :color="getTransactionColor(transaction.type)"
                    size="small"
                    variant="tonal"
                  >
                    {{ getTransactionTypeLabel(transaction.type) }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useAuthStore } from '../store/auth'
import { useInventoryStore } from '../store/inventory'
import { useProductStore } from '../store/product'
import { useStoreStore } from '../store/stores'
import { useTransactionStore } from '../store/transactions'
import { useRoleUtils } from '../composables/useRoleUtils'

// Register Chart.js components
Chart.register(...registerables)

const storesStore = useStoreStore()
const productStore = useProductStore()
const authStore = useAuthStore()
const inventoryStore = useInventoryStore()
const transactionStore = useTransactionStore()
const { getRoleColor, getRoleLabel, getRoleIcon } = useRoleUtils()

// Chart references
const topProductsChart = ref(null)

// Chart instances
let topProductsChartInstance = null

const user = authStore.user
const totalProducts = computed(() => inventoryStore.totalProducts)
const totalStores = computed(() => storesStore.stores.length)
const lowStockAlerts = computed(() => productStore.lowStock || [])
const summaryStock = computed(() => storesStore.summaryStock)

// Real data for charts and analytics
const topProducts = computed(() => {
  const allProducts = productStore.top5 || []
  const id_store = authStore.user?.storeU_id
  
  let filtered = []
  
  if (id_store) {
    // Filter by store
    filtered = allProducts.filter(p => p.id_store === id_store)
  } else {
    // If no store (e.g. admin viewing all), we might want to aggregate or show all.
    // For now, let's aggregate by product name to show global top 5
    const aggregation = {}
    allProducts.forEach(p => {
      if (!aggregation[p.top_5_product]) {
        aggregation[p.top_5_product] = 0
      }
      aggregation[p.top_5_product] += p.quantity_sold
    })
    
    filtered = Object.keys(aggregation).map(name => ({
      top_5_product: name,
      quantity_sold: aggregation[name]
    }))
  }

  // Sort by quantity sold desc and take top 5
  return filtered
    .sort((a, b) => b.quantity_sold - a.quantity_sold)
    .slice(0, 5)
    .map((p, index) => ({
      id: index, // No ID in the aggregation/view, using index
      name: p.top_5_product,
      sales: p.quantity_sold
    }))
})

const recentTransactions = ref([])

const getProductById = (id) => inventoryStore.getProductById(id)

const getTransactionIcon = (type) => {
  const icons = {
    'Sale': 'mdi-cart',
    'Transfer': 'mdi-swap-horizontal',
    'Receipt': 'mdi-truck-delivery',
    'sale': 'mdi-cart',
    'transfer': 'mdi-swap-horizontal',
    'reception': 'mdi-truck-delivery'
  }
  return icons[type] || 'mdi-help'
}

const getTransactionTitle = (transaction) => {
  if (transaction.productName) return transaction.productName
  
  // The backend returns id_product, so we use that to look up the product
  const product = getProductById(transaction.id_product || transaction.productId)
  return `${product?.name || 'Producto Desconocido'}`
}

const getTransactionTypeLabel = (type) => {
  const labels = {
    'Sale': 'Venta',
    'Transfer': 'Transferencia',
    'Receipt': 'Recepción',
    'sale': 'Venta',
    'transfer': 'Transferencia',
    'reception': 'Recepción'
  }
  return labels[type] || type
}

const getTransactionColor = (type) => {
  const colors = {
    'Sale': 'success',
    'Transfer': 'info',
    'Receipt': 'warning',
    'sale': 'success',
    'transfer': 'info',
    'reception': 'warning'
  }
  return colors[type] || 'default'
}

// Chart initialization methods
const initTopProductsChart = () => {
  if (topProductsChartInstance) {
    topProductsChartInstance.destroy()
  }

  const ctx = topProductsChart.value.getContext('2d')
  
  const chartData = {
    labels: topProducts.value.map(p => p.name.substring(0, 15) + (p.name.length > 15 ? '...' : '')),
    datasets: [{
      data: topProducts.value.map(p => p.sales),
      backgroundColor: [
        '#1976D2',
        '#388E3C',
        '#F57C00',
        '#D32F2F',
        '#7B1FA2'
      ],
      borderColor: [
        '#1565C0',
        '#2E7D32',
        '#EF6C00',
        '#C62828',
        '#6A1B9A'
      ],
      borderWidth: 2,
      hoverOffset: 4
    }]
  }

  topProductsChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true,
            font: {
              size: 11
            },
            color: '#666666'
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: '#1976D2',
          borderWidth: 1,
          cornerRadius: 8,
          callbacks: {
            label: function(context) {
              const label = context.label || ''
              const value = context.parsed
              const total = context.dataset.data.reduce((a, b) => a + b, 0)
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
              return `${label}: ${value} vendidos (${percentage}%)`
            }
          }
        }
      },
      cutout: '60%'
    }
  })
}

// Initialize charts when component is mounted
onMounted(async () => {
  const id_store = authStore.user?.storeU_id
  await nextTick()
  
  // Load data first
  await inventoryStore.fetchProductsFromStore()
  if (authStore.isSuperAdmin) {
    await storesStore.fetchStores()
  }
  await productStore.fetchTop5()
  await productStore.fetchLowStock()
  await productStore.fetchAverageSales()
  await storesStore.fetchSummaryStockStore(id_store)
  await transactionStore.recentTransactions()
  await productStore.fetchAverageInventory()
  await productStore.fetchNoMovements()
  await productStore.fetchBestSupplier()
  
  // Then init charts with the loaded data
  initTopProductsChart()
  
  
  // Fetch recent transactions and map them
  try {
    let transactions = []
    if (id_store) {
      transactions = await transactionStore.fetchStoreTransactions(id_store)
    } else {
      transactions = await transactionStore.recentTransactions()
    }

    if (Array.isArray(transactions)) {
      // Sort by date descending (newest first)
      transactions.sort((a, b) => {
        const dateA = new Date(a.date_transaction || a.dateTransaction)
        const dateB = new Date(b.date_transaction || b.dateTransaction)
        return dateB - dateA
      })

      recentTransactions.value = transactions.map(t => ({
        id: t.id_transaction || t.idTransaction,
        type: t.type_transaction || t.typeTransaction,
        date: t.date_transaction || t.dateTransaction,
        quantity: t.amount_product || t.amountProduct,
        productId: t.id_product || t.idProduct,
        productName: t.nameProduct, // Some endpoints might return the name directly
        ...t
      }))
    }
  } catch (error) {
    console.error("Error fetching recent transactions:", error)
  }
})

// Clean up charts when component is unmounted
onUnmounted(() => {
  if (topProductsChartInstance) {
    topProductsChartInstance.destroy()
  }
})
</script>

<style scoped>
.summary-card {
  transition: transform 0.2s ease-in-out;
}

.summary-card:hover {
  transform: translateY(-4px);
}

.chart-container {
  position: relative;
  height: 300px;
  width: 100%;
}
</style>
