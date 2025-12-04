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
      :can-edit-store="authStore.isSuperAdmin"
      :default-store-id="authStore.user?.storeU_id"
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
import { ref, computed, onMounted } from 'vue'
import { useInventoryStore } from '../store/inventory'
import { useAuthStore } from '../store/auth'
import { useUserStore } from '../store/users'
import { useUiStore } from '../store/ui'
import UsersHeader from '../components/users/UsersHeader.vue'
import UsersFilters from '../components/users/UsersFilters.vue'
import UsersTable from '../components/users/UsersTable.vue'
import UserFormDialog from '../components/users/UserFormDialog.vue'
import UserDetailsDialog from '../components/users/UserDetailsDialog.vue'
import DeleteConfirmationDialog from '../components/users/DeleteConfirmationDialog.vue'

const inventoryStore = useInventoryStore()
const userStore = useUserStore()
const authStore = useAuthStore()
const uiStore = useUiStore()

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
// Users data from store
const users = computed(() => userStore.users)

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
    const result = await authStore.register(userData)

    if (!result.success) {
      throw new Error(result.error)
    }

    // Refresh users list
    if (authStore.isSuperAdmin) {
      await userStore.fetchUsers()
    } else {
      const id_store = authStore.user?.storeU_id
      if (id_store) {
        await userStore.fetchUserByStoreId(id_store)
      }
    }
    
    uiStore.showSnackbar(
      editingUser.value ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente',
      'success'
    )
    
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

onMounted(async () => {
  if (authStore.isSuperAdmin) {
    await userStore.fetchUsers()
  } else {
    const id_store = authStore.user?.storeU_id
    if (id_store) {
      await userStore.fetchUserByStoreId(id_store)
    }
  }
})
</script>

<style scoped>
/* No custom CSS needed - using Vuetify's built-in styling */
</style>
