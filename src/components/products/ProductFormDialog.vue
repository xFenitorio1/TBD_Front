<template>
  <v-dialog 
    :model-value="modelValue" 
    @update:model-value="$emit('update:modelValue', $event)" 
    max-width="600px" 
    persistent
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">{{ isEditing ? 'mdi-pencil' : 'mdi-plus' }}</v-icon>
        <span class="text-h6 ml-2">{{ isEditing ? 'Editar Producto' : 'Agregar Nuevo Producto' }}</span>
      </v-card-title>

      <v-card-text>
        <v-form ref="productForm" v-model="isFormValid" lazy-validation>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="localProduct.name_product"
                label="Nombre del Producto"
                :rules="[v => !!v || 'El nombre del producto es requerido']"
                required
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="localProduct.sku"
                label="sku"
                :rules="[v => !!v || 'El SKU es requerido']"
                required
                variant="outlined"
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="localProduct.description_product"
                label="Descripción"
                variant="outlined"
                rows="3"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="localProduct.price"
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
              <v-text-field
                v-model.number="localProduct.stock_inventory"
                :label="isEditing ? 'Stock Actual' : 'Stock Inicial'"
                type="number"
                :rules="[v => v >= 0 || 'El stock debe ser mayor o igual a 0']"
                variant="outlined"
                :hint="isEditing ? 'Cantidad actual de stock en la tienda' : 'Cantidad inicial de stock en la tienda (opcional)'"
                persistent-hint
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
          {{ isEditing ? 'Actualizar' : 'Crear' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useInventoryStore } from '../../store/inventory'
import { useAuthStore } from '../../store/auth'

const props = defineProps({
  modelValue: Boolean,
  product: Object,
  isSaving: Boolean
})

const emit = defineEmits(['update:modelValue', 'close', 'save'])

const inventoryStore = useInventoryStore()
const authStore = useAuthStore()

const productForm = ref(null)
const isFormValid = ref(false)
const isEditing = computed(() => !!props.product?.id)

const localProduct = ref({
  id: null,
  name_product: '',
  sku: '',
  description_product: '',
  price: 0,
  stock_inventory: 0
})


watch(() => props.product, async (newProduct) => {
  if (newProduct) {
    localProduct.value = {
      id: newProduct.id || null,
      name_product: newProduct.name_product || '',
      sku: newProduct.sku || newProduct.sku || '',
      description_product: newProduct.description_product || '',
      price: newProduct.price || 0,
      stock_inventory: 0
    }
    
    // Fetch current inventory stock if editing and user has a store
    if (newProduct.id && authStore.user?.storeU_id) {
      try {
        const inventoryItem = await inventoryStore.fetchInventoryByIds(
          authStore.user.storeU_id,
          newProduct.id
        )
        if (inventoryItem) {
          localProduct.value.stock_inventory = inventoryItem.stock_inventory || 0
        }
      } catch (err) {
        console.warn('No se pudo cargar el stock del inventario:', err)
        localProduct.value.stock_inventory = 0
      }
    }
  } else {
    localProduct.value = {
      id: null,
      name_product: '',
      sku: '',
      description_product: '',
      price: 0,
      stock_inventory: 0
    }
  }
}, { immediate: true })

const handleSave = async () => {
  const valid = await productForm.value?.validate()
  if (!valid) return

  const payload = {
    name_product: localProduct.value.name_product,
    sku: localProduct.value.sku,
    description_product: localProduct.value.description_product || '',
    price: Number(localProduct.value.price)
  }

  // Include stock_inventory for both creating and editing
  const stockInventory = localProduct.value.stock_inventory !== null && localProduct.value.stock_inventory !== undefined
    ? Number(localProduct.value.stock_inventory) || 0
    : null

  emit('save', payload, localProduct.value.id, stockInventory)
}
</script>

