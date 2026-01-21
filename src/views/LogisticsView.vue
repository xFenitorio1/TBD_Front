<template>
  <v-container fluid class="fill-height pa-0">
    <v-row no-gutters class="fill-height">
      <!-- Sidebar de Controles -->
      <v-col cols="12" md="3" class="d-flex flex-column border-e">
        <v-card flat class="fill-height d-flex flex-column">
          <v-card-title class="text-h6 font-weight-bold bg-primary text-white py-4">
            Gestión Logística
          </v-card-title>
          
          <v-card-text class="flex-grow-1 overflow-y-auto pt-4">
            <v-expansion-panels variant="accordion" multiple v-model="panels">
              
              <!-- 1. Transferencia Óptima -->
              <v-expansion-panel value="transfer">
                <v-expansion-panel-title>
                  <v-icon start color="primary">mdi-truck-fast</v-icon>
                  Transferencia Óptima
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <p class="text-caption text-medium-emphasis mb-4">
                    Busca la tienda más cercana con stock para transferir.
                  </p>
                  <v-form @submit.prevent="handleTransferSuggestion">
                    <v-select
                      v-model="transferParams.expectingStoreId"
                      :items="storeItems"
                      label="Tienda Solicitante"
                      item-title="nombre"
                      item-value="id"
                      variant="outlined"
                      density="compact"
                      required
                    ></v-select>
                    
                    <v-select
                      v-model="transferParams.productId"
                      :items="productItems"
                      label="Seleccionar Producto"
                      item-title="nombre"
                      item-value="id"
                      variant="outlined"
                      density="compact"
                      required
                    ></v-select>

                    <v-text-field
                      v-model.number="transferParams.quantity"
                      label="Cantidad Requerida"
                      type="number"
                      variant="outlined"
                      density="compact"
                      min="1"
                      required
                    ></v-text-field>

                    <v-btn
                      block
                      color="secondary"
                      type="submit"
                      :loading="logisticsStore.loading"
                      class="mt-2"
                    >
                      Buscar Tienda
                    </v-btn>
                  </v-form>

                  <v-alert
                    v-if="logisticsStore.transferSuggestion"
                    type="success"
                    variant="tonal"
                    class="mt-4"
                    density="compact"
                    closable
                  >
                    <div class="text-subtitle-2 font-weight-bold">Mejor opción:</div>
                    <div>{{ logisticsStore.transferSuggestion.name_store || logisticsStore.transferSuggestion.nombre }}</div>
                    <div class="text-caption" v-if="logisticsStore.transferSuggestion.address_store">
                      {{ logisticsStore.transferSuggestion.address_store }}
                    </div>
                  </v-alert>
                </v-expansion-panel-text>
              </v-expansion-panel>

              <!-- 2. Análisis de Cobertura -->
              <v-expansion-panel value="coverage">
                <v-expansion-panel-title>
                  <v-icon start color="info">mdi-map-marker-radius</v-icon>
                  Análisis de Cobertura
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <p class="text-caption text-medium-emphasis mb-4">
                    Visualiza tiendas cercanas (10km) para analizar cobertura.
                  </p>
                  <v-select
                      v-model="coverageStoreId"
                      :items="storeItems"
                      label="Seleccionar Tienda Centrica"
                      item-title="nombre"
                      item-value="id"
                      variant="outlined"
                      density="compact"
                      clearable
                      @update:model-value="handleCoverageChange"
                    ></v-select>

                  <v-switch
                    v-model="showCoverage"
                    label="Mostrar en Mapa"
                    color="info"
                    hide-details
                    inset
                    :disabled="!coverageStoreId"
                  ></v-switch>
                  
                  <v-list v-if="coverageResults.length > 0 && showCoverage" density="compact" class="mt-2 bg-grey-lighten-4 rounded">
                     <v-list-subheader>Tiendas en rango:</v-list-subheader>
                     <v-list-item v-for="store in coverageResults" :key="store.id" :title="store.name_store || store.nombre" :subtitle="store.address_store">
                        <template v-slot:prepend>
                          <v-icon icon="mdi-store" size="small" color="info"></v-icon>
                        </template>
                     </v-list-item>
                  </v-list>
                </v-expansion-panel-text>
              </v-expansion-panel>

              <!-- 3. Asignación CD -->
              <v-expansion-panel value="distribution">
                <v-expansion-panel-title>
                  <v-icon start color="warning">mdi-warehouse</v-icon>
                  Asignar Centro Dist.
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <p class="text-caption text-medium-emphasis mb-4">
                    Asigna el CD más óptimo a una tienda.
                  </p>
                   <v-select
                      v-model="assignDcStoreId"
                      :items="storeItems"
                      label="Tienda a Asignar"
                      item-title="nombre"
                      item-value="id"
                      variant="outlined"
                      density="compact"
                    ></v-select>

                  <v-btn
                    block
                    color="warning"
                    class="mt-2 text-white"
                    @click="handleAssignDC"
                    :loading="logisticsStore.loading"
                    :disabled="!assignDcStoreId"
                  >
                    Asignar CD Óptimo
                  </v-btn>
                  
                  <v-alert
                    v-if="assignedDc"
                    type="success"
                    variant="tonal"
                    class="mt-4"
                    density="compact"
                    closable
                  >
                    <div class="text-subtitle-2 font-weight-bold">Éxito</div>
                    <div>Centro de distribución asignado al más cercano, se asignó al {{ assignedDc.nombre || assignedDc.name || assignedDc.name_store }}</div>
                  </v-alert>
                </v-expansion-panel-text>
              </v-expansion-panel>

              <!-- 4. Cálculo Distancia -->
              <v-expansion-panel value="distance">
                <v-expansion-panel-title>
                  <v-icon start color="success">mdi-map-clock</v-icon>
                  Calcular Distancia
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <p class="text-caption text-medium-emphasis mb-4">
                    Calcula distancia de traslado entre dos tiendas.
                  </p>
                  <v-form @submit.prevent="handleCalculateDistance">
                    <v-select
                      v-model="distanceParams.origin"
                      :items="storeItems"
                      label="Tienda Origen"
                      item-title="nombre"
                      item-value="id"
                      variant="outlined"
                      density="compact"
                      required
                    ></v-select>

                    <v-select
                      v-model="distanceParams.dest"
                      :items="storeItems"
                      label="Tienda Destino"
                      item-title="nombre"
                      item-value="id"
                      variant="outlined"
                      density="compact"
                      required
                    ></v-select>

                    <v-btn
                      block
                      color="success"
                      class="mt-2 text-white"
                      type="submit"
                      :loading="logisticsStore.loading"
                      :disabled="!distanceParams.origin || !distanceParams.dest"
                    >
                      Calcular
                    </v-btn>
                  </v-form>

                  <v-alert
                    v-if="calculatedDistance !== null"
                    type="success"
                    variant="outlined"
                    class="mt-4 text-center"
                    density="compact"
                  >
                    <div class="text-h4 font-weight-bold">{{ calculatedDistance.toFixed(2) }}</div>
                    <div class="text-caption text-uppercase">Kilómetros</div>
                  </v-alert>
                </v-expansion-panel-text>
              </v-expansion-panel>

            </v-expansion-panels>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Mapa -->
      <v-col cols="12" md="9" class="fill-height position-relative">
        <div style="height: 100%; width: 100%; z-index: 1;">
          <l-map
            ref="map"
            v-model:zoom="zoom"
            :center="center"
            :use-global-leaflet="false"
          >
            <l-tile-layer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              layer-type="base"
              name="OpenStreetMap"
            ></l-tile-layer>

            <!-- Marcadores de Tiendas -->
            <l-marker
              v-for="store in logisticsStore.stores"
              :key="'store-' + store.id_store"
              :lat-lng="parseCoordinates(store.address_store)"
            >
              <l-icon
                :icon-url="storeIconUrl"
                :icon-size="[32, 32]"
                :icon-anchor="[16, 32]"
              />
              <l-popup>
                <div class="font-weight-bold">{{ store.name_store }}</div>
                <div>ID: {{ store.id_store }}</div>
                <div>{{ store.address_store }}</div>
              </l-popup>
            </l-marker>

            <!-- Marcadores de CDs -->
            <l-marker
              v-for="dc in logisticsStore.distributionCenters"
              :key="'dc-' + dc.id"
              :lat-lng="parseCoordinates(dc.ubicacion)"
            >
              <l-icon
                :icon-url="dcIconUrl"
                :icon-size="[40, 40]"
                :icon-anchor="[20, 40]"
              />
              <l-popup>
                <div class="font-weight-bold">{{ dc.nombre }}</div>
                <div>Centro Distribución</div>
              </l-popup>
            </l-marker>

            <!-- Buffer Cobertura -->
            <l-circle
               v-if="showCoverage && coverageStoreId && getStoreCoordinates(coverageStoreId)"
               :lat-lng="getStoreCoordinates(coverageStoreId)"
               :radius="10000"
               color="blue"
               :fill="true"
               :fill-opacity="0.15"
            />
            
            <!-- Tiendas en Cobertura (Highlight) -->
             <l-circle-marker
                v-if="showCoverage"
                v-for="store in coverageResults"
                :key="'cov-' + store.id_store"
                :lat-lng="parseCoordinates(store.address_store || store.ubicacion)" 
                :radius="8"
                color="green"
                fill-color="#0f0"
                :fill-opacity="0.8"
             >
                <l-popup>En rango de cobertura</l-popup>
             </l-circle-marker>

             <!-- Linea de Transferencia Sugerida -->
             <l-polyline
                v-if="transferRoute"
                :lat-lngs="transferRoute"
                color="purple"
                dash-array="10, 10"
                weight="4"
             >
               <l-popup>Ruta Sugerida</l-popup>
             </l-polyline>

             <!-- Linea de Distancia Calculada -->
             <l-polyline
                v-if="distanceRoute"
                :lat-lngs="distanceRoute"
                color="green"
                weight="5"
             />

          </l-map>
        </div>
        
        <!-- Loading Overlay -->
        <v-overlay
          :model-value="logisticsStore.loading"
          class="align-center justify-center"
          contained
        >
          <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
        </v-overlay>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useLogisticsStore } from '../store/logistics'
import { useProductStore } from '../store/product'
import { LMap, LTileLayer, LMarker, LPopup, LIcon, LCircle, LPolyline, LCircleMarker } from '@vue-leaflet/vue-leaflet'
import 'leaflet/dist/leaflet.css'

const storeIconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png'
const dcIconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png'

const logisticsStore = useLogisticsStore()
const productStore = useProductStore()

const zoom = ref(12)
const center = ref([-33.4489, -70.6693])
const panels = ref(['transfer'])

// 1. Transferencia
const transferParams = ref({
  expectingStoreId: null,
  productId: null,
  quantity: 1
})
const transferRoute = ref(null)

// 2. Cobertura
const coverageStoreId = ref(null)
const showCoverage = ref(false)
const coverageResults = ref([])

// 3. Asignación CD
const assignDcStoreId = ref(null)
const assignedDc = ref(null)

// 4. Distancia
const distanceParams = ref({
  origin: null,
  dest: null
})
const calculatedDistance = ref(null)
const distanceRoute = ref(null)


// Computed Stores para Dropdowns
const storeItems = computed(() => {
  return logisticsStore.stores.map(s => ({
    id: s.id_store,
    nombre: s.name_store || `Tienda ${s.id_store}`
  }))
})

// Computed Products para Dropdown
const productItems = computed(() => {
  return productStore.products.map(p => ({
    id: p.id,
    nombre: p.name_product || p.name || p.nombre || `Producto ${p.id}`
  }))
})


// 1. Transferencia Sugerida
const handleTransferSuggestion = async () => {
  if(!transferParams.value.expectingStoreId || !transferParams.value.productId) return;
  
  try {
    const result = await logisticsStore.getTransferSuggestion(
      transferParams.value.expectingStoreId, 
      transferParams.value.productId, 
      transferParams.value.quantity
    )
    
    if(result) {
      const origin = getStoreCoordinates(transferParams.value.expectingStoreId)
      
      // Intentar obtener coords del resultado
      let targetCoords = null;
      if(result.address_store) {
          targetCoords = parseCoordinates(result.address_store);
      } else {
         // Fallback por ID si no viene address
         const local = logisticsStore.stores.find(s => s.id_store === result.id_store);
         if(local) targetCoords = parseCoordinates(local.address_store);
      }

      if(origin && targetCoords) {
         transferRoute.value = [origin, targetCoords]
         // Ajustar vista
         center.value = origin
         zoom.value = 11
      }
    }
  } catch(e) {
    console.error(e)
  }
}

// 2. Cobertura
const handleCoverageChange = async () => {
    if(!coverageStoreId.value) {
        coverageResults.value = []
        showCoverage.value = false
        return
    }
    
    if(showCoverage.value) {
        await fetchCoverage()
    }
}

watch(showCoverage, async (val) => {
    if(val && coverageStoreId.value) {
        await fetchCoverage()
    }
})

const fetchCoverage = async () => {
    try {
        const results = await logisticsStore.calculateCoverage(coverageStoreId.value)
        coverageResults.value = results || []
        // Centrar en la tienda seleccionada
        const coords = getStoreCoordinates(coverageStoreId.value)
        if(coords) center.value = coords
    } catch(e) {
        console.error(e)
    }
}

// 3. Asignar CD
const handleAssignDC = async () => {
    console.log("Selected Store for DC Assignment:", assignDcStoreId.value)
    if(!assignDcStoreId.value) return;
    try {
        const result = await logisticsStore.assignDistributionCenters(assignDcStoreId.value)
        console.log("Full DC Result:", JSON.stringify(result, null, 2))
        assignedDc.value = result
        const dcName = result.name_center || result.nameCenter || result.name || result.nombre || "Desconocido"
        console.log(`Centro de distribución asignado al más cercano, se asignó al ${dcName}`)
    } catch(e) {
        console.error(e)
    }
}

// 4. Distancia
const handleCalculateDistance = async () => {
    if(!distanceParams.value.origin || !distanceParams.value.dest) return;
    
    try {
        const dist = await logisticsStore.calculateTransferDistance(distanceParams.value.origin, distanceParams.value.dest)
        calculatedDistance.value = dist
        
        // Dibujar linea
        const c1 = getStoreCoordinates(distanceParams.value.origin)
        const c2 = getStoreCoordinates(distanceParams.value.dest)
        
        if(c1 && c2) {
            distanceRoute.value = [c1, c2]
             center.value = [(c1[0]+c2[0])/2, (c1[1]+c2[1])/2]
        }
    } catch(e) {
      console.error(e) 
    }
}

const getStoreCoordinates = (id) => {
    const s = logisticsStore.stores.find(x => x.id_store === id || x.id === id) // Try both ID formats
    if(s) {
        const addr = s.address_store || s.addressStore
        console.log(`Getting coords for store ${id}:`, addr)
        return parseCoordinates(addr)
    } 
    return null
}

const parseCoordinates = (ubicacion) => {
  if (!ubicacion) return [-33.4489, -70.6693] // Santiago

  if (Array.isArray(ubicacion)) return ubicacion

  if (typeof ubicacion === 'object') {
     if (ubicacion.lat && ubicacion.lng) return [ubicacion.lat, ubicacion.lng]
     if (ubicacion.x && ubicacion.y) return [ubicacion.y, ubicacion.x]
     if (ubicacion.coordinates) return [ubicacion.coordinates[1], ubicacion.coordinates[0]] 
  }
  
  if (typeof ubicacion === 'string') {
      const val = ubicacion.trim().toUpperCase()
      if (/^[0-9A-F]+$/.test(val) && val.length >= 50) {
          try {
             const parseHexDouble = (hex, start, littleEndian) => {
                 const part = hex.substring(start, start + 16)
                 
                 const buffer = new ArrayBuffer(8)
                 const view = new DataView(buffer)
                 
                 for (let i = 0; i < 8; i++) {
                     const byteVal = parseInt(part.substring(i*2, i*2+2), 16)
                     view.setUint8(i, byteVal)
                 }
                 
                 return view.getFloat64(0, littleEndian)
             }
             
             const littleEndian = val.substring(0, 2) === '01'
             let offset = 18
             const lng = parseHexDouble(val, 18, littleEndian)
             const lat = parseHexDouble(val, 18 + 16, littleEndian)
             
             console.log(`Parsed WKB: ${lat}, ${lng}`)
             return [lat, lng]
          } catch(e) {
             console.error("Error parsing WKB", e)
          }
      }

      const pointIndex = val.indexOf('POINT')
      if (pointIndex !== -1) {
           const coordsPart = val.substring(pointIndex)
           const matches = coordsPart.match(/POINT.*?\(\s*([-\d.]+)[,\s]+([-\d.]+)/)
           if (matches) {
              return [parseFloat(matches[2]), parseFloat(matches[1])]
           }
      }
  }

  return [-33.4489, -70.6693]
}

onMounted(async () => {
  await Promise.all([
    logisticsStore.fetchStores(),
    logisticsStore.fetchDistributionCenters(),
    productStore.fetchProducts()
  ])
  
  // Centrar mapa si hay tiendas
  if (logisticsStore.stores.length > 0) {
      const first = parseCoordinates(logisticsStore.stores[0].address_store)
      center.value = first
  }
})

</script>

<style scoped>
.fill-height {
  height: 100%;
}
</style>
