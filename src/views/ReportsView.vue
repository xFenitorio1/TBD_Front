<template>
  <v-container fluid class="pa-6">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h3 font-weight-bold text-primary">Reportes y Análisis</h1>
        <p class="text-body-1 text-medium-emphasis">Analiza el rendimiento de tu inventario y ventas</p>
      </div>

      <v-menu transition="scale-transition" origin="top right">
        <template v-slot:activator="{ props }">
          <v-btn
            color="primary"
            variant="outlined"
            size="large"
            rounded="pill"
            prepend-icon="mdi-download"
            v-bind="props"
            :loading="isExporting"
            class="text-none font-weight-bold px-6"
          >
            Exportar Reporte
            <v-icon end class="ml-2">mdi-chevron-down</v-icon>
          </v-btn>
        </template>
        <v-list elevation="3" rounded="lg" class="mt-2">
          <v-list-item @click="exportToPDF" rounded="md" class="mb-1">
            <template v-slot:prepend>
              <v-avatar color="red-lighten-5" size="32" class="mr-2">
                <v-icon color="red" size="20">mdi-file-pdf-box</v-icon>
              </v-avatar>
            </template>
            <v-list-item-title class="font-weight-medium">PDF</v-list-item-title>
          </v-list-item>
          <v-list-item @click="exportToExcel" rounded="md" class="mb-1">
            <template v-slot:prepend>
              <v-avatar color="green-lighten-5" size="32" class="mr-2">
                <v-icon color="green" size="20">mdi-file-excel</v-icon>
              </v-avatar>
            </template>
            <v-list-item-title class="font-weight-medium">Excel</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>

    <!-- Export Progress -->
    <v-alert
      v-if="exportProgress.show"
      :type="exportProgress.type"
      variant="tonal"
      class="mb-4"
      :title="exportProgress.title"
    >
      {{ exportProgress.message }}
      <v-progress-linear
        v-if="exportProgress.type === 'info'"
        :model-value="exportProgress.percentage"
        color="primary"
        class="mt-2"
      />
    </v-alert>

    <!-- Key Metrics -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card class="metric-card" elevation="2" rounded="lg">
          <v-card-text class="d-flex align-center">
            <v-icon size="48" color="info" class="mr-4">mdi-package-variant</v-icon>
            <div>
              <div class="text-h4 font-weight-bold text-info">{{ totalProducts }}</div>
              <div class="text-body-2 text-medium-emphasis">Productos Vendidos</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="metric-card" elevation="2" rounded="lg">
          <v-card-text class="d-flex align-center">
            <v-icon size="48" color="warning" class="mr-4">mdi-alert</v-icon>
            <div>
              <div class="text-h4 font-weight-bold text-warning">{{ lowStockCount }}</div>
              <div class="text-body-2 text-medium-emphasis">Productos con Stock Bajo</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
  </v-row>

  <!-- Charts Row -->
  <v-row class="mb-6">
    <v-col cols="12">
      <v-card elevation="2" rounded="lg">
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">mdi-chart-line</v-icon>
          Tendencias de Ventas Mensuales
        </v-card-title>
        <v-card-text>
          <div class="chart-container">
            <div class="d-flex align-center justify-center" style="height: 300px; width: 100%;">
              <canvas ref="salesChartCanvas"></canvas>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <!-- Store Performance and Inventory Value -->
  <v-row>
    <v-col cols="12" lg="6">
      <v-card elevation="2" rounded="lg">
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">mdi-store</v-icon>
          Mejor proveedor del Último Mes
        </v-card-title>
        <v-card-text>
          <div v-if="productStore.bestSupplier" class="d-flex align-center pa-4">
            <v-avatar size="48" color="primary" class="mr-4">
              <v-icon color="white">mdi-trophy</v-icon>
            </v-avatar>
            <div class="flex-grow-1">
              <div class="text-h6 font-weight-bold">{{ productStore.bestSupplier.name_supplier }}</div>
              <div class="text-body-2 text-medium-emphasis">Mejor Proveedor del Mes</div>
            </div>
            <div class="text-right">
              <div class="text-h5 font-weight-bold text-success">{{ productStore.bestSupplier.total_products_sold_last_month }}</div>
              <div class="text-caption text-medium-emphasis">Productos Vendidos</div>
            </div>
          </div>
          <div v-else class="text-center pa-6">
            <v-icon size="64" color="grey-lighten-1">mdi-package-variant</v-icon>
            <p class="text-body-1 text-medium-emphasis mt-2">Cargando datos del proveedor...</p>
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" lg="6">
      <v-card elevation="2" rounded="lg">
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">mdi-currency-usd</v-icon>
          Valor del Inventario por Tienda
        </v-card-title>
        <v-card-text>
          <div v-if="filteredSummary.length > 0" class="d-flex flex-column gap-3">
            <div v-for="(store, index) in filteredSummary" :key="store.idTienda" class="d-flex align-center">
              <v-avatar size="32" color="info" class="mr-3">
                <span class="text-caption font-weight-bold text-white">{{ index + 1 }}</span>
              </v-avatar>
              <div class="flex-grow-1">
                <div class="text-body-2 font-weight-medium">{{ store.nameStore }}</div>
                <div class="text-caption text-medium-emphasis">{{ store.uniqueProduct }} productos únicos</div>
              </div>
              <v-chip size="small" color="info" variant="tonal">
                ${{ formatCurrency(store.totalPriceInventory) }}
              </v-chip>
            </div>
          </div>
          <div v-else class="text-center pa-6">
            <v-icon size="64" color="grey-lighten-1">mdi-store-off</v-icon>
            <p class="text-body-1 text-medium-emphasis mt-2">No hay datos de inventario disponibles</p>
            <p class="text-caption text-medium-emphasis">para tu tienda</p>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <!-- Average Inventory Days -->
  <v-row class="mt-6">
    <v-col cols="12">
      <v-card elevation="2" rounded="lg">
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="info">mdi-calendar-clock</v-icon>
          Promedio de Días en Inventario
        </v-card-title>
        <v-card-text>
          <div v-if="productStore.avgInventory && productStore.avgInventory.length > 0" class="d-flex flex-column">
            <template v-for="(item, index) in productStore.avgInventory" :key="index">
              <div class="d-flex align-center py-3">
                <v-avatar size="48" color="info" class="mr-4">
                  <v-icon color="white">mdi-package-variant</v-icon>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="text-h6 font-weight-bold">{{ item.name_product }}</div>
                  <div class="text-body-2 text-medium-emphasis">Producto</div>
                </div>
                
                <div class="text-right">
                  <div class="text-h5 font-weight-bold text-info">{{ item.average_days }}</div>
                  <div class="text-caption text-medium-emphasis">Días Promedio</div>
                </div>
              </div>
              <v-divider v-if="index < productStore.avgInventory.length - 1" class="my-2"></v-divider>
            </template>
          </div>
          
          <div v-else class="text-center pa-6">
            <v-icon size="64" color="grey-lighten-1">mdi-calendar-clock</v-icon>
            <p class="text-body-1 text-medium-emphasis mt-2">No hay datos de inventario disponibles</p>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useInventoryStore } from '../store/inventory'
import { useAuthStore } from '../store/auth'
import { 
  generateComprehensiveReport,
  validateExportData 
} from '../utils/exportUtils'
import { useStoreStore } from '../store/stores'
import { useProductStore } from '../store/product'
import { useTransactionStore } from '../store/transactions'
import Chart from 'chart.js/auto'

const inventoryStore = useInventoryStore()
const productStore = useProductStore()
const storeStore = useStoreStore()
const transactionStore = useTransactionStore()
const authStore = useAuthStore()

const isExporting = ref(false)
const exportProgress = ref({
  show: false,
  type: 'info',
  title: '',
  message: '',
  percentage: 0
})

// Chart refs
const salesChartCanvas = ref(null)
let salesChart = null

// Table headers for alerts
const alertHeaders = [
  { title: 'Producto', key: 'product', sortable: true },
  { title: 'Cantidad Actual', key: 'quantity', sortable: true },
  { title: 'Stock Mínimo', key: 'minStock', sortable: true },
  { title: 'Tienda', key: 'store', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, width: '120px' }
]



// Computed properties
const summaryStockStore = computed(() => storeStore.summaryStockStore || [])

// Filter summary by logged-in user's id_tienda
const filteredSummary = computed(() => {
  const userStoreId = authStore.user?.storeU_id
  if (!userStoreId) return []
  
  return summaryStockStore.value.filter(
    (item) => Number(item.idTienda) === Number(userStoreId)
  )
})

// Legacy computed for backward compatibility (shows all stores)
const summary = computed(() => summaryStockStore.value)

// Methods
const showExportProgress = (type, title, message, percentage = 0) => {
  exportProgress.value = {
    show: true,
    type,
    title,
    message,
    percentage
  }
}

const hideExportProgress = () => {
  exportProgress.value.show = false
}

const updateExportProgress = (percentage, message) => {
  exportProgress.value.percentage = percentage
  exportProgress.value.message = message
}

const exportToPDF = async () => {
  try {
    isExporting.value = true
    showExportProgress('info', 'Generando PDF', 'Preparando datos del reporte...', 10)

    // Generar el PDF real
    await new Promise(resolve => setTimeout(resolve, 500))
    updateExportProgress(60, 'Generando documento...')

    generatePDFReport()

    updateExportProgress(100, 'PDF generado exitosamente')
    showExportProgress('success', '¡Éxito!', 'Reporte PDF generado y descargado', 100)

    setTimeout(() => {
      hideExportProgress()
    }, 3000)
  } catch (error) {
    showExportProgress('error', 'Error', 'No se pudo generar el PDF: ' + error.message)
    setTimeout(() => {
      hideExportProgress()
    }, 5000)
  } finally {
    isExporting.value = false
  }
}


const exportToExcel = async () => {
  try {
    isExporting.value = true
    showExportProgress('info', 'Generando Excel', 'Preparando datos del reporte...', 10)
    
    // Generate Excel
    updateExportProgress(50, 'Generando archivo Excel...')
    generateExcelReport()
    
    showExportProgress('success', '¡Éxito!', 'Reporte Excel generado y descargado', 100)
    
    setTimeout(() => {
      hideExportProgress()
    }, 3000)
    
    } catch (error) {
    showExportProgress('error', 'Error', 'No se pudo generar el Excel: ' + error.message)
    setTimeout(() => {
      hideExportProgress()
    }, 5000)
  } finally {
    isExporting.value = false
  }
}

const exportToCSV = async () => {
  try {
    isExporting.value = true
    showExportProgress('info', 'Generando CSV', 'Preparando datos del reporte...', 20)
    
    // Generate CSV
    updateExportProgress(50, 'Generando archivo CSV...')
    generateCSVReport()
    
    showExportProgress('success', '¡Éxito!', 'Reporte CSV generado y descargado', 100)
    
    setTimeout(() => {
      hideExportProgress()
    }, 3000)
    
  } catch (error) {
    showExportProgress('error', 'Error', 'No se pudo generar el CSV: ' + error.message)
    setTimeout(() => {
      hideExportProgress()
    }, 5000)
  } finally {
    isExporting.value = false
  }
}

const generatePDFReport = () => {
  try {
    const reportData = {
      summary: {
        totalSales: totalSales.value,
        totalProducts: totalProducts.value,
        lowStockCount: lowStockCount.value,
        storeCount: storeCount.value
      },
      monthlySales: productStore.avgSales || [],
      bestSupplier: productStore.bestSupplier,
      inventoryValue: filteredSummary.value || [],
      avgInventory: productStore.avgInventory || []
    }
    
    const report = generateComprehensiveReport(reportData, {
      title: 'Reporte Completo de Análisis',
      filename: `reporte-completo-${new Date().toISOString().split('T')[0]}`
    })
    
    return report.pdf()
  } catch (error) {
    throw new Error(`Error generating PDF: ${error.message}`)
  }
}

const generateExcelReport = () => {
  try {
    const reportData = {
      summary: {
        totalSales: totalSales.value,
        totalProducts: totalProducts.value,
        lowStockCount: lowStockCount.value,
        storeCount: storeCount.value
      },
      monthlySales: productStore.avgSales || [],
      bestSupplier: productStore.bestSupplier,
      inventoryValue: filteredSummary.value || [],
      avgInventory: productStore.avgInventory || []
    }
    
    const report = generateComprehensiveReport(reportData, {
      filename: `reporte-completo-${new Date().toISOString().split('T')[0]}`
    })
    
    return report.excel()
  } catch (error) {
    throw new Error(`Error generating Excel: ${error.message}`)
  }
}

const generateCSVReport = () => {
  try {
    const reportData = {
      summary: {
        totalSales: totalSales.value,
        totalProducts: totalProducts.value,
        lowStockCount: lowStockCount.value,
        storeCount: storeCount.value
      },
      monthlySales: productStore.avgSales || [],
      bestSupplier: productStore.bestSupplier,
      inventoryValue: filteredSummary.value || [],
      avgInventory: productStore.avgInventory || []
    }
    
    const report = generateComprehensiveReport(reportData, {
      filename: `reporte-completo-${new Date().toISOString().split('T')[0]}`
    })
    
    return report.csv()
  } catch (error) {
    throw new Error(`Error generating CSV: ${error.message}`)
  }
}

const restockProduct = (item) => {
  // Implementation for restocking products
}

const getStoreName = (storeId) => {
  const store = inventoryStore.getStoreById(storeId)
  return store?.name || 'Tienda Desconocida'
}

const getCategoryColor = (index) => {
  const colors = ['primary', 'success', 'warning', 'error', 'info']
  return colors[index % colors.length]
}

const formatCurrency = (value) => {
  if (!value) return '0'
  return new Intl.NumberFormat('es-CL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

// Mock data for demonstration (remove when real data is available)
const totalSales = computed(() => {
  const transactions = transactionStore.transactions || []
  const products = productStore.products || []
  
  // Filter for sales
  const sales = transactions.filter(t => {
    const type = t.type_transaction || t.typeTransaction
    return ['Sale', 'sale', 'Venta'].includes(type)
  })

  // Calculate total
  return sales.reduce((total, t) => {
    const quantity = Number(t.amount_product || t.amountProduct || 0)
    const productId = t.id_product || t.idProduct
    
    // Find product to get price
    const product = products.find(p => p.id === productId)
    const price = Number(product?.price || 0)
    
    return total + (quantity * price)
  }, 0)
})

const totalProducts = computed(() => {
  return inventoryStore.products?.length || 0
})

const lowStockCount = computed(() => {
  return productStore.lowStock?.length || 0
})

const storeCount = computed(() => {
  return inventoryStore.stores?.length || 0
})



const categorySales = computed(() => {
  return []
})

const storePerformance = computed(() => {
  return []
})

const criticalAlerts = computed(() => {
  return inventoryStore.lowStockAlerts || []
})

const initChart = () => {
  if (salesChart) {
    salesChart.destroy()
  }

  if (!salesChartCanvas.value) return

  const data = productStore.avgSales || []
  
  const labels = data.map(item => `${item.month_name.trim()} ${item.year}`)
  const values = data.map(item => item.average_daily_sales)

  const ctx = salesChartCanvas.value.getContext('2d')
  
  salesChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Ventas Promedio Diarias',
        data: values,
        borderColor: '#1867C0', // Primary color
        backgroundColor: 'rgba(24, 103, 192, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#1867C0',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += context.parsed.y;
              }
              return label;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            callback: function(value) {
              return value;
            },
            font: {
              size: 11
            }
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              size: 11
            }
          }
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      }
    }
  })
}

// Watch for data changes to update chart
watch(() => productStore.avgSales, () => {
  nextTick(() => {
    initChart()
  })
}, { deep: true })

onMounted(async () => {
  const userStoreId = authStore.user?.storeU_id
  await storeStore.fetchSummaryStockStore(userStoreId)
  await productStore.fetchAverageSales()
  await productStore.fetchBestSupplier()
  await productStore.fetchAverageInventory()
  await productStore.fetchNoMovements()
  await productStore.fetchProducts() // Ensure we have products for prices
  await productStore.fetchLowStock()
  await transactionStore.fetchStoreTransactions(userStoreId) // Fetch transactions
  initChart()
})
</script>

<style scoped>
.metric-card {
  transition: transform 0.2s ease-in-out;
}

.metric-card:hover {
  transform: translateY(-4px);
}
</style>
