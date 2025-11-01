<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="600px">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">mdi-information</v-icon>
        Detalles del Usuario
      </v-card-title>
      
      <v-card-text v-if="user">
        <v-row>
          <v-col cols="12" class="text-center mb-4">
            <v-avatar size="80" color="primary">
              <span class="text-h3 font-weight-bold text-white">
                {{ user.name.charAt(0).toUpperCase() }}
              </span>
            </v-avatar>
          </v-col>
          <v-col cols="12" md="6">
            <v-list>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-account</v-icon>
                </template>
                <v-list-item-title>Nombre Completo</v-list-item-title>
                <v-list-item-subtitle>{{ user.name }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-email</v-icon>
                </template>
                <v-list-item-title>Email</v-list-item-title>
                <v-list-item-subtitle>{{ user.email }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-shield-account</v-icon>
                </template>
                <v-list-item-title>Rol</v-list-item-title>
                <v-list-item-subtitle>
                  <v-chip
                    :color="getRoleColor(user.role)"
                    size="small"
                    variant="tonal"
                  >
                    {{ getRoleLabel(user.role) }}
                  </v-chip>
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-col>
          <v-col cols="12" md="6">
            <v-list>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-store</v-icon>
                </template>
                <v-list-item-title>Tienda Asignada</v-list-item-title>
                <v-list-item-subtitle>{{ getStoreName(user.storeId) || 'No asignada' }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-calendar</v-icon>
                </template>
                <v-list-item-title>Último Acceso</v-list-item-title>
                <v-list-item-subtitle>{{ formatDate(user.lastLogin) }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-circle</v-icon>
                </template>
                <v-list-item-title>Estado</v-list-item-title>
                <v-list-item-subtitle>
                  <v-chip
                    :color="user.active ? 'success' : 'error'"
                    size="small"
                    variant="tonal"
                  >
                    {{ user.active ? 'Activo' : 'Inactivo' }}
                  </v-chip>
                </v-list-item-subtitle>
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
          @click="$emit('update:modelValue', false)"
        >
          Cerrar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { useRoleUtils } from '../../composables/useRoleUtils'
import { useDateUtils } from '../../composables/useDateUtils'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  user: {
    type: Object,
    default: null
  },
  stores: {
    type: Array,
    default: () => []
  }
})

defineEmits(['update:modelValue'])

const { getRoleColor, getRoleLabel } = useRoleUtils()
const { formatDate } = useDateUtils()

const getStoreName = (storeId) => {
  if (!storeId) return null
  const store = props.stores.find(s => s.id === storeId)
  return store?.name || 'Tienda Desconocida'
}
</script>
