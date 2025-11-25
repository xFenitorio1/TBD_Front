<template>
  <v-dialog 
    :model-value="modelValue" 
    @update:model-value="$emit('update:modelValue', $event)" 
    max-width="700px" 
    persistent
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">{{ isEditing ? 'mdi-pencil' : 'mdi-plus' }}</v-icon>
        <span class="text-h6 ml-2">{{ isEditing ? 'Editar Transacción' : 'Nueva Transacción' }}</span>
      </v-card-title>
      
      <v-card-text>
        <v-form ref="transactionForm" v-model="isFormValid">
          <v-row>
            <v-col cols="12" md="6">
              <v-select
                v-model="localTransaction.type"
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
                v-model="localTransaction.date"
                label="Fecha"
                type="date"
                variant="outlined"
                required
                :rules="[v => !!v || 'La fecha es requerida']"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="localTransaction.productId"
                label="Producto"
                :items="products"
                :item-title="getProductTitle"
                :item-value="getProductValue"
                variant="outlined"
                required
                :rules="[v => !!v || 'El producto es requerido']"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="localTransaction.quantity"
                label="Cantidad"
                type="number"
                variant="outlined"
                required
                :rules="[v => v > 0 || 'La cantidad debe ser mayor que 0']"
                min="1"
              />
            </v-col>
            
            <!-- Store fields based on transaction type -->
            <v-col cols="12" md="6" v-if="localTransaction.type === 'Sale'">
              <v-select
                v-model="localTransaction.storeId"
                label="Tienda"
                :items="stores"
                :item-title="getStoreTitle"
                :item-value="getStoreValue"
                variant="outlined"
                required
                :rules="[v => !!v || 'La tienda es requerida']"
              />
            </v-col>
            
            <v-col cols="12" md="6" v-if="localTransaction.type === 'Sale'">
              <v-text-field
                v-model.number="localTransaction.amount"
                label="Monto Total"
                type="number"
                variant="outlined"
                required
                :rules="[v => v > 0 || 'El monto debe ser mayor que 0']"
                prefix="$"
                step="0.01"
              />
            </v-col>
            
            <v-col cols="12" md="6" v-if="localTransaction.type === 'Transfer'">
              <v-select
                v-model="localTransaction.fromStoreId"
                label="Desde Tienda"
                :items="stores"
                :item-title="getStoreTitle"
                :item-value="getStoreValue"
                variant="outlined"
                required
                :rules="[v => !!v || 'La tienda de origen es requerida']"
              />
            </v-col>
            
            <v-col cols="12" md="6" v-if="localTransaction.type === 'Transfer'">
              <v-select
                v-model="localTransaction.toStoreId"
                label="Hacia Tienda"
                :items="stores"
                :item-title="getStoreTitle"
                :item-value="getStoreValue"
                variant="outlined"
                required
                :rules="[v => !!v || 'La tienda de destino es requerida']"
              />
            </v-col>
            
            <v-col cols="12" md="6" v-if="localTransaction.type === 'Receipt'">
              <v-select
                v-model="localTransaction.storeId"
                label="Tienda"
                :items="stores"
                :item-title="getStoreTitle"
                :item-value="getStoreValue"
                variant="outlined"
                required
                :rules="[v => !!v || 'La tienda es requerida']"
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
          @click="$emit('close')"
        >
          Cancelar
        </v-btn>
        <v-btn 
          color="primary" 
          @click="handleSave" 
          :loading="isSaving" 
          :disabled="!isFormValid"
        >
          {{ 'Crear' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { useStoreStore } from '../../store/stores'
import { useAuthStore } from '../../store/auth'

const authStore = useAuthStore()
const storeStore = useStoreStore()

const id_store = authStore.user?.storeU_id

const stores = computed(() => storeStore.stores)

const props = defineProps({
  modelValue: Boolean,
  transaction: Object,
  products: Array,
  isSaving: Boolean
})

const emit = defineEmits(['update:modelValue', 'close', 'save'])

const transactionForm = ref(null)
const isFormValid = ref(false)
const isEditing = computed(() => !!props.transaction?.id_transaction)

const transactionTypes = [
  { title: 'Venta', value: 'Sale' },
  { title: 'Transferencia', value: 'Transfer' },
  { title: 'Recepción', value: 'Receipt' }
]

const localTransaction = ref({
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

// Helper functions to get item titles and values
const getProductTitle = (item) => {
  return item.name_product || item.name || 'Producto Desconocido'
}

const getProductValue = (item) => {
  return item.id || item.id_product || null
}

const getStoreTitle = (item) => {
  return item.name_store || item.name || 'Tienda Desconocida'
}

const getStoreValue = (item) => {
  return item.id || item.id_store || null
}

watch(() => props.transaction, (newTransaction) => {
  if (newTransaction) {
    
    localTransaction.value = {
      type: newTransaction.type_transaction || newTransaction.type || '',
      date: newTransaction.date_transaction 
        ? new Date(newTransaction.date_transaction).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      productId: newTransaction.id_product || newTransaction.productId || null,
      quantity: newTransaction.amount_product || newTransaction.quantity || 1,
      storeId: newTransaction.id_storeDE || newTransaction.id_storeOR || newTransaction.storeId || null,
      amount: newTransaction.amount || null,
      fromStoreId: newTransaction.id_storeOR || newTransaction.fromStoreId || null,
      toStoreId: newTransaction.id_storeDE || newTransaction.toStoreId || null,
      supplier: newTransaction.supplier || ''
    }
  } else {
    localTransaction.value = {
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
  }
}, { immediate: true })

const onTypeChange = () => {
  // Reset fields when type changes
  localTransaction.value.storeId = null
  localTransaction.value.fromStoreId = null
  localTransaction.value.toStoreId = null
  localTransaction.value.amount = null
  localTransaction.value.supplier = ''
}

const handleSave = async () => {
  const valid = await transactionForm.value?.validate()
  if (!valid) return

  // Map local form fields to backend API format
  const payload = {
    type_transaction: localTransaction.value.type,
    date_transaction: localTransaction.value.date,
    amount_product: Number(localTransaction.value.quantity),
    id_product: localTransaction.value.productId
  }

  // Add store fields based on transaction type
  if (localTransaction.value.type === 'Sale'){
    payload.id_storeOR = id_store
    if (localTransaction.value.amount) {
      payload.amount = Number(localTransaction.value.amount)
      payload.id_storeDE = localTransaction.value.toStoreId
    }
  } else if (localTransaction.value.type === 'Transfer') {
    payload.id_storeOR = localTransaction.value.fromStoreId
    payload.id_storeDE = localTransaction.value.toStoreId
  } else if (localTransaction.value.type === 'Receipt') {
    payload.id_storeDE = id_store
  }

  console.log('Saving transaction with payload:', payload)
  emit('save', payload, props.transaction?.id_transaction)
}

// Load stores when component mounts
onMounted(async () => {
  if (stores.value.length === 0) {
    await storeStore.fetchStores()
  }
})

// Also load stores when dialog opens
watch(() => props.modelValue, async (isOpen) => {
  if (isOpen && stores.value.length === 0) {
    await storeStore.fetchStores()
  }
})
</script>

