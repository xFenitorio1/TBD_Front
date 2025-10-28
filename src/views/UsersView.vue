<template>
  <v-container fluid class="pa-6">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h3 font-weight-bold text-primary">Gestión de Usuarios</h1>
        <p class="text-body-1 text-medium-emphasis">Administra usuarios del sistema y permisos</p>
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        size="large"
        @click="openUserDialog()"
      >
        Agregar Usuario
      </v-btn>
    </div>

    <!-- Search and Filters -->
    <v-card class="mb-6" elevation="2" rounded="lg">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="searchQuery"
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
              v-model="selectedRole"
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
              @click="resetFilters"
            >
              Restablecer Filtros
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Users Table -->
    <v-card elevation="2" rounded="lg">
      <v-data-table
        :headers="headers"
        :items="filteredUsers"
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
              @click="openUserDialog(item)"
            />
            <v-btn
              icon="mdi-eye"
              size="small"
              color="info"
              variant="text"
              @click="viewUserDetails(item)"
            />
            <v-btn
              icon="mdi-lock"
              size="small"
              color="warning"
              variant="text"
              @click="toggleUserStatus(item)"
            />
            <v-btn
              icon="mdi-delete"
              size="small"
              color="error"
              variant="text"
              @click="confirmDelete(item)"
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

    <!-- User Dialog -->
    <v-dialog v-model="userDialog" max-width="600px" persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">{{ isEditing ? 'mdi-pencil' : 'mdi-plus' }}</v-icon>
          {{ isEditing ? 'Editar Usuario' : 'Agregar Nuevo Usuario' }}
        </v-card-title>
        
        <v-card-text>
          <v-form ref="userForm" v-model="isFormValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editingUser.name"
                  label="Nombre Completo"
                  :rules="[v => !!v || 'El nombre es requerido']"
                  required
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editingUser.email"
                  label="Dirección de Email"
                  type="email"
                  :rules="emailRules"
                  required
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6" v-if="!isEditing">
                <v-text-field
                  v-model="editingUser.password"
                  label="Contraseña"
                  type="password"
                  :rules="passwordRules"
                  required
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6" v-if="!isEditing">
                <v-text-field
                  v-model="editingUser.confirmPassword"
                  label="Confirmar Contraseña"
                  type="password"
                  :rules="confirmPasswordRules"
                  required
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="editingUser.role"
                  label="Rol"
                  :items="roles"
                  variant="outlined"
                  required
                  :rules="[v => !!v || 'El rol es requerido']"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="editingUser.storeId"
                  label="Tienda Asignada"
                  :items="stores"
                  item-title="name"
                  item-value="id"
                  variant="outlined"
                  clearable
                />
              </v-col>
              <v-col cols="12">
                <v-switch
                  v-model="editingUser.active"
                  label="Usuario Activo"
                  color="success"
                  hide-details
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
            @click="closeUserDialog"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            @click="saveUser"
            :loading="isSaving"
            :disabled="!isFormValid"
          >
            {{ isEditing ? 'Actualizar' : 'Crear' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- User Details Dialog -->
    <v-dialog v-model="detailsDialog" max-width="600px">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">mdi-information</v-icon>
          Detalles del Usuario
        </v-card-title>
        
        <v-card-text v-if="selectedUser">
          <v-row>
            <v-col cols="12" class="text-center mb-4">
              <v-avatar size="80" color="primary">
                <span class="text-h3 font-weight-bold text-white">
                  {{ selectedUser.name.charAt(0).toUpperCase() }}
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
                  <v-list-item-subtitle>{{ selectedUser.name }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon>mdi-email</v-icon>
                  </template>
                  <v-list-item-title>Email</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedUser.email }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon>mdi-shield-account</v-icon>
                  </template>
                  <v-list-item-title>Rol</v-list-item-title>
                  <v-list-item-subtitle>
                    <v-chip
                      :color="getRoleColor(selectedUser.role)"
                      size="small"
                      variant="tonal"
                    >
                      {{ getRoleLabel(selectedUser.role) }}
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
                  <v-list-item-subtitle>{{ getStoreName(selectedUser.storeId) || 'No asignada' }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon>mdi-calendar</v-icon>
                  </template>
                  <v-list-item-title>Último Acceso</v-list-item-title>
                  <v-list-item-subtitle>{{ formatDate(selectedUser.lastLogin) }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon>mdi-circle</v-icon>
                  </template>
                  <v-list-item-title>Estado</v-list-item-title>
                  <v-list-item-subtitle>
                    <v-chip
                      :color="selectedUser.active ? 'success' : 'error'"
                      size="small"
                      variant="tonal"
                    >
                      {{ selectedUser.active ? 'Activo' : 'Inactivo' }}
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
            @click="detailsDialog = false"
          >
            Cerrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h6">
          Confirmar Eliminación
        </v-card-title>
        <v-card-text>
          ¿Estás seguro de que quieres eliminar "{{ userToDelete?.name }}"? Esta acción no se puede deshacer.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey"
            variant="text"
            @click="deleteDialog = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="error"
            @click="deleteUser"
            :loading="isDeleting"
          >
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useInventoryStore } from '../store/inventory'

const inventoryStore = useInventoryStore()

// Reactive data
const searchQuery = ref('')
const selectedRole = ref(null)
const userDialog = ref(false)
const detailsDialog = ref(false)
const deleteDialog = ref(false)
const isFormValid = ref(false)
const isEditing = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)
const userToDelete = ref(null)
const userForm = ref(null)
const selectedUser = ref(null)

// Form data
const editingUser = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: '',
  storeId: null,
  active: true
})

// Table headers
const headers = [
  { title: 'Avatar', key: 'avatar', sortable: false, width: '80px' },
  { title: 'Usuario', key: 'name', sortable: true },
  { title: 'Rol', key: 'role', sortable: true },
  { title: 'Estado', key: 'status', sortable: true },
  { title: 'Último Acceso', key: 'lastLogin', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, width: '160px' }
]

// Roles and stores
const roles = [
  { title: 'Administrador', value: 'admin' },
  { title: 'Gerente', value: 'manager' },
  { title: 'Empleado', value: 'employee' }
]

// Mock users data
const users = ref([
  { id: 1, name: 'Usuario Administrador', email: 'admin@store.com', role: 'admin', storeId: null, active: true, lastLogin: '2024-01-15T10:30:00' },
  { id: 2, name: 'Juan Gerente', email: 'juan@store.com', role: 'manager', storeId: 1, active: true, lastLogin: '2024-01-14T15:45:00' },
  { id: 3, name: 'Sara Empleada', email: 'sara@store.com', role: 'employee', storeId: 1, active: true, lastLogin: '2024-01-13T09:20:00' },
  { id: 4, name: 'Miguel Empleado', email: 'miguel@store.com', role: 'employee', storeId: 2, active: false, lastLogin: '2024-01-10T14:15:00' }
])

// Computed properties
const stores = computed(() => inventoryStore.stores)

const filteredUsers = computed(() => {
  let filtered = users.value
  
  if (selectedRole.value) {
    filtered = filtered.filter(u => u.role === selectedRole.value)
  }
  
  return filtered
})

// Form validation rules
const emailRules = [
  v => !!v || 'El email es requerido',
  v => /.+@.+\..+/.test(v) || 'El email debe ser válido'
]

const passwordRules = [
  v => !!v || 'La contraseña es requerida',
  v => v.length >= 6 || 'La contraseña debe tener al menos 6 caracteres'
]

const confirmPasswordRules = [
  v => !!v || 'Por favor confirma tu contraseña',
  v => v === editingUser.value.password || 'Las contraseñas no coinciden'
]

// Methods
const openUserDialog = (user = null) => {
  if (user) {
    editingUser.value = { ...user }
    isEditing.value = true
  } else {
    editingUser.value = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
      storeId: null,
      active: true
    }
    isEditing.value = false
  }
  userDialog.value = true
}

const closeUserDialog = () => {
  userDialog.value = false
  editingUser.value = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    storeId: null,
    active: true
  }
  isEditing.value = false
}

const saveUser = async () => {
  if (!userForm.value.validate()) return
  
  isSaving.value = true
  
  try {
    if (isEditing.value) {
      // Update existing user
      const index = users.value.findIndex(u => u.id === editingUser.value.id)
      if (index !== -1) {
        users.value[index] = { ...editingUser.value }
      }
    } else {
      // Create new user
      const newId = Math.max(...users.value.map(u => u.id)) + 1
      users.value.push({
        ...editingUser.value,
        id: newId,
        lastLogin: null
      })
    }
    
    closeUserDialog()
  } catch (error) {
    console.error('Error saving user:', error)
  } finally {
    isSaving.value = false
  }
}

const viewUserDetails = (user) => {
  selectedUser.value = user
  detailsDialog.value = true
}

const toggleUserStatus = (user) => {
  user.active = !user.active
}

const confirmDelete = (user) => {
  userToDelete.value = user
  deleteDialog.value = true
}

const deleteUser = async () => {
  if (!userToDelete.value) return
  
  isDeleting.value = true
  
  try {
    const index = users.value.findIndex(u => u.id === userToDelete.value.id)
    if (index !== -1) {
      users.value.splice(index, 1)
    }
    deleteDialog.value = false
    userToDelete.value = null
  } catch (error) {
    console.error('Error deleting user:', error)
  } finally {
    isDeleting.value = false
  }
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedRole.value = null
}

const getRoleColor = (role) => {
  const colors = {
    admin: 'error',
    manager: 'warning',
    employee: 'info'
  }
  return colors[role] || 'default'
}

const getRoleIcon = (role) => {
  const icons = {
    admin: 'mdi-shield-crown',
    manager: 'mdi-account-tie',
    employee: 'mdi-account'
  }
  return icons[role] || 'mdi-help'
}

const getRoleLabel = (role) => {
  const labels = {
    admin: 'Administrador',
    manager: 'Gerente',
    employee: 'Empleado'
  }
  return labels[role] || role
}

const formatDate = (date) => {
  if (!date) return 'Nunca'
  return new Date(date).toLocaleDateString('es-ES')
}

const getStoreName = (storeId) => {
  if (!storeId) return null
  const store = stores.value.find(s => s.id === storeId)
  return store?.name || 'Tienda Desconocida'
}

onMounted(() => {
  // Initialize any component-specific data
})
</script>

<style scoped>
/* No custom CSS needed - using Vuetify's built-in styling */
</style>
