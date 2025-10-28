<template>
  <v-container fluid class="pa-6">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h3 font-weight-bold text-primary">Panel de Control</h1>
        <p class="text-body-1 text-medium-emphasis">¡Bienvenido de vuelta, {{ user?.name }}!</p>
      </div>
      <v-chip
        :color="user?.role === 'admin' ? 'success' : 'info'"
        variant="tonal"
        size="large"
      >
        {{ user?.role === 'admin' ? 'ADMINISTRADOR' : 'EMPLEADO' }}
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

      <v-col cols="12" sm="6" md="3">
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
              <div class="text-body-2 text-medium-emphasis">Transacciones de Hoy</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Charts Row -->
    <v-row class="mb-6">
      <v-col cols="12" lg="8">
        <v-card elevation="2" rounded="lg">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-chart-line</v-icon>
            Tendencias de Ventas (Últimos 7 Días)
          </v-card-title>
          <v-card-text>
            <div class="chart-container">
              <canvas ref="salesChart" height="300"></canvas>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
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
    </v-row>

    <!-- Recent Activity and Low Stock -->
    <v-row>
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

      <v-col cols="12" lg="6">
        <v-card elevation="2" rounded="lg">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2" color="warning">mdi-alert</v-icon>
            Alertas de Stock Bajo
          </v-card-title>
          <v-card-text>
            <v-list lines="two">
              <v-list-item
                v-for="alert in lowStockAlerts.slice(0, 5)"
                :key="alert.id"
                :prepend-icon="'mdi-package-variant'"
                :title="getProductById(alert.productId)?.name"
                :subtitle="`${alert.quantity} restantes (Mín: ${alert.minStock})`"
              >
                <template v-slot:append>
                  <v-chip
                    color="error"
                    size="small"
                    variant="tonal"
                  >
                    Stock Bajo
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

// Register Chart.js components
Chart.register(...registerables)

const authStore = useAuthStore()
const inventoryStore = useInventoryStore()

// Chart references
const salesChart = ref(null)
const topProductsChart = ref(null)

// Chart instances
let salesChartInstance = null
let topProductsChartInstance = null

const user = authStore.user
const totalProducts = inventoryStore.totalProducts
const totalStores = inventoryStore.totalStores
const lowStockAlerts = inventoryStore.lowStockAlerts

// Mock data for charts and analytics
const topProducts = computed(() => [
  { id: 1, name: 'Laptop Dell XPS 13', sku: 'LAP001', sales: 15 },
  { id: 2, name: 'Mouse Inalámbrico', sku: 'MOU001', sales: 12 },
  { id: 3, name: 'Teclado Mecánico', sku: 'KEY001', sales: 8 },
  { id: 4, name: 'Monitor 27"', sku: 'MON001', sales: 6 },
  { id: 5, name: 'Cable USB-C', sku: 'CAB001', sales: 25 }
])

const recentTransactions = computed(() => inventoryStore.transactions)

const getProductById = (id) => inventoryStore.getProductById(id)

const getTransactionIcon = (type) => {
  const icons = {
    sale: 'mdi-cart',
    transfer: 'mdi-swap-horizontal',
    reception: 'mdi-truck-delivery'
  }
  return icons[type] || 'mdi-help'
}

const getTransactionTitle = (transaction) => {
  const product = getProductById(transaction.productId)
  return `${product?.name || 'Producto Desconocido'}`
}

const getTransactionTypeLabel = (type) => {
  const labels = {
    sale: 'Venta',
    transfer: 'Transferencia',
    reception: 'Recepción'
  }
  return labels[type] || type
}

const getTransactionColor = (type) => {
  const colors = {
    sale: 'success',
    transfer: 'info',
    reception: 'warning'
  }
  return colors[type] || 'default'
}

// Chart initialization methods
const initSalesChart = () => {
  if (salesChartInstance) {
    salesChartInstance.destroy()
  }

  const ctx = salesChart.value.getContext('2d')
  
  // Mock sales data for the last 7 days
  const salesData = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [{
      label: 'Ventas ($)',
      data: [1250, 1890, 2100, 1680, 2340, 1890, 1560],
      borderColor: '#1976D2',
      backgroundColor: 'rgba(25, 118, 210, 0.1)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#1976D2',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8
    }]
  }

  salesChartInstance = new Chart(ctx, {
    type: 'line',
    data: salesData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: '#1976D2',
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
            drawBorder: false
          },
          ticks: {
            color: '#666666',
            font: {
              size: 12
            },
            callback: function(value) {
              return '$' + value.toLocaleString()
            }
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#666666',
            font: {
              size: 12
            }
          }
        }
      },
      elements: {
        point: {
          hoverBackgroundColor: '#1976D2'
        }
      }
    }
  })
}

const initTopProductsChart = () => {
  if (topProductsChartInstance) {
    topProductsChartInstance.destroy()
  }

  const ctx = topProductsChart.value.getContext('2d')
  
  const chartData = {
    labels: topProducts.value.map(p => p.name.substring(0, 15) + '...'),
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
              const percentage = ((value / total) * 100).toFixed(1)
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
  await nextTick()
  initSalesChart()
  initTopProductsChart()
})

// Clean up charts when component is unmounted
onUnmounted(() => {
  if (salesChartInstance) {
    salesChartInstance.destroy()
  }
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
