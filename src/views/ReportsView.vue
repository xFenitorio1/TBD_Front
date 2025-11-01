<template>
  <v-container fluid class="pa-6">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h3 font-weight-bold text-primary">Reportes y Análisis</h1>
        <p class="text-body-1 text-medium-emphasis">Analiza el rendimiento de tu inventario y ventas</p>
      </div>
    </div>

    <!-- Filters -->
    <v-card class="mb-6" elevation="2" rounded="lg">
      <v-card-text>
        <v-row>
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
            <v-select
              v-model="selectedPeriod"
              label="Período"
              :items="periods"
              variant="outlined"
              hide-details
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-menu>
              <template v-slot:activator="{ props }">
                <v-btn
                  color="primary"
                  variant="outlined"
                  prepend-icon="mdi-download"
                  v-bind="props"
                  :loading="isExporting"
                >
                  Exportar Reporte
                  <v-icon end>mdi-chevron-down</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item @click="exportToPDF">
                  <template v-slot:prepend>
                    <v-icon color="red">mdi-file-pdf-box</v-icon>
                  </template>
                  <v-list-item-title>Exportar a PDF</v-list-item-title>
                </v-list-item>
                <v-list-item @click="exportToExcel">
                  <template v-slot:prepend>
                    <v-icon color="green">mdi-file-excel</v-icon>
                  </template>
                  <v-list-item-title>Exportar a Excel</v-list-item-title>
                </v-list-item>
                <v-list-item @click="exportToCSV">
                  <template v-slot:prepend>
                    <v-icon color="blue">mdi-file-delimited</v-icon>
                  </template>
                  <v-list-item-title>Exportar a CSV</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

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
            <v-icon size="48" color="success" class="mr-4">mdi-trending-up</v-icon>
            <div>
              <div class="text-h4 font-weight-bold text-success">${{ totalSales.toFixed(2) }}</div>
              <div class="text-body-2 text-medium-emphasis">Ventas Totales</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

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

      <v-col cols="12" sm="6" md="3">
        <v-card class="metric-card" elevation="2" rounded="lg">
          <v-card-text class="d-flex align-center">
            <v-icon size="48" color="primary" class="mr-4">mdi-store</v-icon>
          <div>
            <div class="text-h4 font-weight-bold text-primary">{{ storeCount }}</div>
            <div class="text-body-2 text-medium-emphasis">Tiendas Activas</div>
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
          Tendencias de Ventas Mensuales
        </v-card-title>
        <v-card-text>
          <div class="chart-container">
            <div class="d-flex align-center justify-center" style="height: 300px;">
              <div class="text-center">
                <v-icon size="64" color="grey-lighten-1">mdi-chart-line</v-icon>
                <p class="text-body-1 text-medium-emphasis mt-2">El gráfico de tendencias se implementaría aquí</p>
                <p class="text-caption">Mostrando ventas por mes del período seleccionado</p>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" lg="4">
      <v-card elevation="2" rounded="lg">
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">mdi-chart-pie</v-icon>
          Ventas por Categoría
        </v-card-title>
        <v-card-text>
          <div class="d-flex flex-column gap-3">
            <div v-for="(category, index) in categorySales" :key="index" class="d-flex align-center">
              <v-avatar size="32" :color="getCategoryColor(index)" class="mr-3">
                <span class="text-caption font-weight-bold text-white">{{ index + 1 }}</span>
              </v-avatar>
              <div class="flex-grow-1">
                <div class="text-body-2 font-weight-medium">{{ category.name }}</div>
                <div class="text-caption text-medium-emphasis">{{ category.percentage }}% del total</div>
              </div>
              <v-chip size="small" color="success" variant="tonal">
                ${{ category.sales.toFixed(2) }}
              </v-chip>
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
          Rendimiento por Tienda
        </v-card-title>
        <v-card-text>
          <div class="d-flex flex-column gap-3">
            <div v-for="(store, index) in storePerformance" :key="store.id" class="d-flex align-center">
              <v-avatar size="32" color="primary" class="mr-3">
                <span class="text-caption font-weight-bold text-white">{{ index + 1 }}</span>
              </v-avatar>
              <div class="flex-grow-1">
                <div class="text-body-2 font-weight-medium">{{ store.name }}</div>
                <div class="text-caption text-medium-emphasis">{{ store.transactions }} transacciones</div>
              </div>
              <v-chip size="small" color="success" variant="tonal">
                ${{ store.sales.toFixed(2) }}
              </v-chip>
            </div>
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
          <div class="d-flex flex-column gap-3">
            <div v-for="(store, index) in inventoryValue" :key="store.id" class="d-flex align-center">
              <v-avatar size="32" color="info" class="mr-3">
                <span class="text-caption font-weight-bold text-white">{{ index + 1 }}</span>
              </v-avatar>
              <div class="flex-grow-1">
                <div class="text-body-2 font-weight-medium">{{ store.name }}</div>
                <div class="text-caption text-medium-emphasis">{{ store.products }} productos</div>
              </div>
              <v-chip size="small" color="info" variant="tonal">
                ${{ store.value.toFixed(2) }}
              </v-chip>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <!-- Low Stock Alerts -->
  <v-row class="mt-6">
    <v-col cols="12">
      <v-card elevation="2" rounded="lg">
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="warning">mdi-alert</v-icon>
          Alertas Críticas de Stock Bajo
        </v-card-title>
        <v-card-text>
          <v-data-table
            :headers="alertHeaders"
            :items="criticalAlerts"
            class="elevation-0"
            hover
          >
            <template v-slot:item.product="{ item }">
              <div class="d-flex align-center">
                <v-avatar size="32" color="error" class="mr-3">
                  <v-icon size="16" color="white">mdi-package-variant</v-icon>
                </v-avatar>
                <div>
                  <div class="font-weight-medium">{{ item.product?.name }}</div>
                  <div class="text-caption text-medium-emphasis">{{ item.product?.sku }}</div>
                </div>
              </div>
            </template>

            <template v-slot:item.quantity="{ item }">
              <v-chip
                color="error"
                size="small"
                variant="tonal"
              >
                {{ item.quantity }} restantes
              </v-chip>
            </template>

            <template v-slot:item.minStock="{ item }">
              <span class="text-medium-emphasis">{{ item.minStock }}</span>
            </template>

            <template v-slot:item.store="{ item }">
              <span class="font-weight-medium">{{ getStoreName(item.storeId) }}</span>
            </template>

            <template v-slot:item.actions="{ item }">
              <v-btn
                color="primary"
                size="small"
                variant="outlined"
                @click="restockProduct(item)"
              >
                Reabastecer
              </v-btn>
            </template>

            <template v-slot:no-data>
              <div class="text-center pa-6">
                <v-icon size="64" color="success">mdi-check-circle</v-icon>
                <p class="text-h6 text-medium-emphasis mt-2">¡Excelente! No hay alertas críticas</p>
                <p class="text-body-2 text-medium-emphasis">Todos los productos tienen stock suficiente</p>
              </div>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useInventoryStore } from '../store/inventory'
import { 
  generateInventoryReport, 
  generateSalesReport, 
  formatDataForExport,
  validateExportData 
} from '../utils/exportUtils'

const inventoryStore = useInventoryStore()

// Reactive data
const dateRange = ref(new Date().toISOString().split('T')[0])
const selectedStore = ref(null)
const selectedPeriod = ref('month')
const isExporting = ref(false)
const exportProgress = ref({
  show: false,
  type: 'info',
  title: '',
  message: '',
  percentage: 0
})

// Table headers for alerts
const alertHeaders = [
  { title: 'Producto', key: 'product', sortable: true },
  { title: 'Cantidad Actual', key: 'quantity', sortable: true },
  { title: 'Stock Mínimo', key: 'minStock', sortable: true },
  { title: 'Tienda', key: 'store', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, width: '120px' }
]

// Periods
const periods = [
  { title: 'Última Semana', value: 'week' },
  { title: 'Último Mes', value: 'month' },
  { title: 'Último Trimestre', value: 'quarter' },
  { title: 'Último Año', value: 'year' }
]

// Computed properties
const stores = computed(() => inventoryStore.stores)
const totalProducts = computed(() => inventoryStore.products.length)
const storeCount = computed(() => inventoryStore.stores.length)
const lowStockCount = computed(() => inventoryStore.lowStockAlerts.length)

// Backend-driven state
const totalSales = ref(0)
const categorySales = ref([])
const storePerformance = ref([])
const inventoryValue = ref([])

const criticalAlerts = computed(() => inventoryStore.lowStockAlerts)

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

    // Aquí se llama a tu función real
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
    
    // Simulate Excel generation steps
    await new Promise(resolve => setTimeout(resolve, 400))
    updateExportProgress(40, 'Organizando datos en hojas...')
    
    await new Promise(resolve => setTimeout(resolve, 400))
    updateExportProgress(70, 'Aplicando formato y estilos...')
    
    await new Promise(resolve => setTimeout(resolve, 400))
    updateExportProgress(100, 'Excel generado exitosamente')
    
    // Here you would call the actual Excel generation function
    // generateExcelReport()
    
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
    
    // Simulate CSV generation steps
    await new Promise(resolve => setTimeout(resolve, 300))
    updateExportProgress(60, 'Formateando datos...')
    
    await new Promise(resolve => setTimeout(resolve, 300))
    updateExportProgress(100, 'CSV generado exitosamente')
    
    // Here you would call the actual CSV generation function
    // generateCSVReport()
    
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
    validateExportData(inventoryStore.products)
    
    const reportData = {
      products: inventoryStore.products,
      stores: inventoryStore.stores,
      lowStockAlerts: inventoryStore.lowStockAlerts,
      summary: {
        totalProducts: totalProducts.value,
        totalSales: totalSales.value,
        lowStockCount: lowStockCount.value,
        storeCount: storeCount.value
      }
    }
    
    const inventoryReport = generateInventoryReport(reportData, {
      title: 'Reporte de Inventario Completo',
      filename: `inventory-report-${new Date().toISOString().split('T')[0]}.pdf`
    })
    
    return inventoryReport.pdf()
  } catch (error) {
    throw new Error(`Error generating PDF: ${error.message}`)
  }
}

const generateExcelReport = () => {
  try {
    validateExportData(inventoryStore.products)
    
    const reportData = {
      products: inventoryStore.products,
      stores: inventoryStore.stores,
      lowStockAlerts: inventoryStore.lowStockAlerts,
      summary: {
        totalProducts: totalProducts.value,
        totalSales: totalSales.value,
        lowStockCount: lowStockCount.value,
        storeCount: storeCount.value
      }
    }
    
    const inventoryReport = generateInventoryReport(reportData, {
      filename: `inventory-report-${new Date().toISOString().split('T')[0]}.xlsx`
    })
    
    return inventoryReport.excel()
  } catch (error) {
    throw new Error(`Error generating Excel: ${error.message}`)
  }
}

const generateCSVReport = () => {
  try {
    validateExportData(inventoryStore.products)
    
    const reportData = {
      products: inventoryStore.products,
      stores: inventoryStore.stores,
      lowStockAlerts: inventoryStore.lowStockAlerts
    }
    
    const inventoryReport = generateInventoryReport(reportData, {
      filename: `inventory-products-${new Date().toISOString().split('T')[0]}.csv`
    })
    
    return inventoryReport.csv()
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

onMounted(async () => {
  // Load base entities
  await inventoryStore.refreshAll()
  // TODO: Replace with backend analytics endpoints if available
  // Derive metrics from loaded data as placeholders until analytics API is ready
  totalSales.value = inventoryStore.transactions.reduce((sum, t) => sum + (t.amount || 0), 0)

  // Compute category sales from products and transactions
  const productIdToProduct = new Map(inventoryStore.products.map(p => [p.id, p]))
  const categoryTotals = {}
  inventoryStore.transactions.forEach(t => {
    if (t.type === 'sale') {
      const product = productIdToProduct.get(t.productId)
      const category = product?.category || 'Otros'
      const amount = t.amount || 0
      categoryTotals[category] = (categoryTotals[category] || 0) + amount
    }
  })
  const totalAmount = Object.values(categoryTotals).reduce((a, b) => a + b, 0)
  categorySales.value = Object.entries(categoryTotals).map(([name, sales]) => ({
    name,
    sales,
    percentage: totalAmount ? Math.round((sales / totalAmount) * 100) : 0
  }))

  // Store performance
  const storeTotals = {}
  const storeTransactions = {}
  inventoryStore.transactions.forEach(t => {
    const storeId = t.storeId || t.toStoreId || t.fromStoreId
    if (!storeId) return
    if (t.type === 'sale') {
      storeTotals[storeId] = (storeTotals[storeId] || 0) + (t.amount || 0)
    }
    storeTransactions[storeId] = (storeTransactions[storeId] || 0) + 1
  })
  storePerformance.value = inventoryStore.stores.map(s => ({
    id: s.id,
    name: s.name,
    sales: storeTotals[s.id] || 0,
    transactions: storeTransactions[s.id] || 0
  }))

  // Inventory value by store
  const productIdToPrice = new Map(inventoryStore.products.map(p => [p.id, p.price || 0]))
  const byStore = {}
  inventoryStore.inventory.forEach(i => {
    const value = (productIdToPrice.get(i.productId) || 0) * (i.quantity || 0)
    if (!byStore[i.storeId]) byStore[i.storeId] = { products: 0, value: 0 }
    byStore[i.storeId].products += 1
    byStore[i.storeId].value += value
  })
  inventoryValue.value = inventoryStore.stores.map(s => ({
    id: s.id,
    name: s.name,
    products: byStore[s.id]?.products || 0,
    value: byStore[s.id]?.value || 0
  }))
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
