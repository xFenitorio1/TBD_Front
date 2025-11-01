<template>
  <v-container fluid class="pa-6">
    <UsersHeader @add-user="openUserDialog()" />

    <UsersFilters
      v-model:searchQuery="searchQuery"
      v-model:selectedRole="selectedRole"
      @reset-filters="resetFilters"
    />

    <UsersTable
      :users="filteredUsers"
      :searchQuery="searchQuery"
      @edit-user="openUserDialog"
      @view-details="viewUserDetails"
      @toggle-status="toggleUserStatus"
      @delete-user="confirmDelete"
    />

    <UserFormDialog
      v-model="userDialog"
      :user="editingUser"
      :stores="stores"
      :is-saving="isSaving"
      @close="closeUserDialog"
      @save="saveUser"
    />

    <UserDetailsDialog
      v-model="detailsDialog"
      :user="selectedUser"
      :stores="stores"
    />

    <DeleteConfirmationDialog
      v-model="deleteDialog"
      :user="userToDelete"
      :is-deleting="isDeleting"
      @confirm="deleteUser"
    />
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useInventoryStore } from '../store/inventory'
import { useAuthStore } from '../store/auth'
import UsersHeader from '../components/users/UsersHeader.vue'
import UsersFilters from '../components/users/UsersFilters.vue'
import UsersTable from '../components/users/UsersTable.vue'
import UserFormDialog from '../components/users/UserFormDialog.vue'
import UserDetailsDialog from '../components/users/UserDetailsDialog.vue'
import DeleteConfirmationDialog from '../components/users/DeleteConfirmationDialog.vue'

const inventoryStore = useInventoryStore()

const authStore = useAuthStore()

// Reactive data
const searchQuery = ref('')
const selectedRole = ref(null)
const userDialog = ref(false)
const detailsDialog = ref(false)
const deleteDialog = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)
const userToDelete = ref(null)
const selectedUser = ref(null)
const editingUser = ref(null)

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

// Methods
const openUserDialog = (user = null) => {
  editingUser.value = user ? { ...user } : null
  userDialog.value = true
}

const closeUserDialog = () => {
  userDialog.value = false
  editingUser.value = null
}

const saveUser = async (userData) => {
  isSaving.value = true

  try {
    const response = await fetch('http://localhost:8020/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify(userData)
    })

    if (!response.ok) {
      const text = await response.text()
      console.error('Error del backend:', text)
      throw new Error(text || `Error ${response.status}`)
    }

    let savedUser
    const text = await response.text()
    try {
      savedUser = JSON.parse(text)
    } catch {
      savedUser = { ...userData, id: Date.now(), lastLogin: null }
    }

    users.value.push(savedUser)
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
</script>

<style scoped>
/* No custom CSS needed - using Vuetify's built-in styling */
</style>
