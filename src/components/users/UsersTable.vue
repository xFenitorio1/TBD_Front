<template>
  <v-card elevation="2" rounded="lg">
    <v-data-table
      :headers="headers"
      :items="users"
      :search="searchQuery"
      class="elevation-0"
      hover
    >
      <template v-slot:item.avatar="{ item }">
        <v-avatar size="40" color="primary">
          <span class="text-h6 font-weight-bold text-white">
            {{ item.name.charAt(0).toUpperCase() }}
          </span>
        </v-avatar>
      </template>

      <template v-slot:item.name="{ item }">
        <div class="d-flex flex-column">
          <span class="font-weight-medium">{{ item.name }}</span>
          <span class="text-caption text-medium-emphasis">{{ item.email }}</span>
        </div>
      </template>

      <template v-slot:item.role="{ item }">
        <v-chip
          :color="getRoleColor(item.role)"
          size="small"
          variant="tonal"
        >
          <v-icon start size="16">{{ getRoleIcon(item.role) }}</v-icon>
          {{ getRoleLabel(item.role) }}
        </v-chip>
      </template>

      <template v-slot:item.status="{ item }">
        <v-chip
          :color="item.active ? 'success' : 'error'"
          size="small"
          variant="tonal"
        >
          {{ item.active ? 'Activo' : 'Inactivo' }}
        </v-chip>
      </template>

      <template v-slot:item.lastLogin="{ item }">
        <span class="text-medium-emphasis">{{ formatDate(item.lastLogin) }}</span>
      </template>

      <template v-slot:item.actions="{ item }">
        <div class="d-flex gap-2">
          <v-btn
            icon="mdi-pencil"
            size="small"
            color="primary"
            variant="text"
            @click="$emit('edit-user', item)"
          />
          <v-btn
            icon="mdi-eye"
            size="small"
            color="info"
            variant="text"
            @click="$emit('view-details', item)"
          />
          <v-btn
            icon="mdi-lock"
            size="small"
            color="warning"
            variant="text"
            @click="$emit('toggle-status', item)"
          />
          <v-btn
            icon="mdi-delete"
            size="small"
            color="error"
            variant="text"
            @click="$emit('delete-user', item)"
            :disabled="item.role === 'admin'"
          />
        </div>
      </template>

      <template v-slot:no-data>
        <div class="text-center pa-6">
          <v-icon size="64" color="grey-lighten-1">mdi-account-group</v-icon>
          <p class="text-h6 text-medium-emphasis mt-2">No se encontraron usuarios</p>
          <p class="text-body-2 text-medium-emphasis">Agrega tu primer usuario para comenzar</p>
        </div>
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup>
import { useRoleUtils } from '../../composables/useRoleUtils'
import { useDateUtils } from '../../composables/useDateUtils'

const props = defineProps({
  users: {
    type: Array,
    required: true
  },
  searchQuery: {
    type: String,
    default: ''
  }
})

defineEmits(['edit-user', 'view-details', 'toggle-status', 'delete-user'])

const { getRoleColor, getRoleIcon, getRoleLabel } = useRoleUtils()
const { formatDate } = useDateUtils()

const headers = [
  { title: 'Avatar', key: 'avatar', sortable: false, width: '80px' },
  { title: 'Usuario', key: 'name', sortable: true },
  { title: 'Rol', key: 'role', sortable: true },
  { title: 'Estado', key: 'status', sortable: true },
  { title: 'Último Acceso', key: 'lastLogin', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, width: '160px' }
]
</script>
