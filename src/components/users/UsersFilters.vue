<template>
  <v-card class="mb-6" elevation="2" rounded="lg">
    <v-card-text>
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            :model-value="searchQuery"
            @update:model-value="$emit('update:searchQuery', $event)"
            label="Buscar usuarios"
            placeholder="Buscar por nombre o email..."
            prepend-icon="mdi-magnify"
            variant="outlined"
            clearable
            hide-details
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            :model-value="selectedRole"
            @update:model-value="$emit('update:selectedRole', $event)"
            label="Rol"
            :items="roles"
            variant="outlined"
            hide-details
            clearable
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-btn
            color="secondary"
            variant="outlined"
            prepend-icon="mdi-filter-variant"
            @click="$emit('reset-filters')"
          >
            Restablecer Filtros
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { useRoleUtils } from '../../composables/useRoleUtils'

defineProps({
  searchQuery: {
    type: String,
    default: ''
  },
  selectedRole: {
    type: String,
    default: null
  }
})

defineEmits(['update:searchQuery', 'update:selectedRole', 'reset-filters'])

const { roles } = useRoleUtils()
</script>


