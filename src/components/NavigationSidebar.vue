<template>
  <v-navigation-drawer
    v-model="drawer"
    :rail="rail"
    permanent
    @click="rail = false"
    class="sidebar"
    :class="{ 'sidebar-dark': theme.global.name.value === 'dark' }"
  >
    <v-list-item
      prepend-avatar="https://randomuser.me/api/portraits/men/85.jpg"
      :title="user?.name || 'Usuario'"
      :subtitle="canManageUsers ? 'Administrador' : 'Empleado'"
      nav
    >
      <template v-slot:append>
        <v-btn
          variant="text"
          icon="mdi-chevron-left"
          @click.stop="rail = !rail"
        />
      </template>
    </v-list-item>

    <v-divider />

    <v-list density="compact" nav>
      <v-list-item
        prepend-icon="mdi-view-dashboard"
        title="Panel de Control"
        value="dashboard"
        @click="navigateTo('/dashboard')"
        :active="$route.path === '/dashboard'"
      />

      <v-list-item
        v-if="!isSuperAdmin"
        prepend-icon="mdi-package-variant"
        title="Productos"
        value="products"
        @click="navigateTo('/products')"
        :active="$route.path === '/products'"
      />

      <v-list-item
        v-if="!isSuperAdmin"
        prepend-icon="mdi-warehouse"
        title="Inventario"
        value="inventory"
        @click="navigateTo('/inventory')"
        :active="$route.path === '/inventory'"
      />

      <v-list-item
        v-if="!isSuperAdmin"
        prepend-icon="mdi-swap-horizontal"
        title="Transacciones"
        value="transactions"
        @click="navigateTo('/transactions')"
        :active="$route.path === '/transactions'"
      />

      <v-list-item
        v-if="!isSuperAdmin"
        prepend-icon="mdi-chart-line"
        title="Reportes"
        value="reports"
        @click="navigateTo('/reports')"
        :active="$route.path === '/reports'"
      />

      <v-list-item
        v-if="canManageUsers"
        prepend-icon="mdi-account-group"
        title="Usuarios"
        value="users"
        @click="() => { console.log('👆 Click en Usuarios'); navigateTo('/users') }"
        :active="$route.path === '/users'"
      />
    </v-list>

    <template v-slot:append>

      <div class="pa-2">
        <v-btn
          block
          :prepend-icon="theme.global.name.value === 'light' ? 'mdi-weather-night' : 'mdi-weather-sunny'"
          @click="toggleTheme"
          variant="text"
          class="mb-2"
        >
          {{ theme.global.name.value === 'light' ? 'Modo Oscuro' : 'Modo Claro' }}
        </v-btn>
        <v-btn
          block
          color="error"
          prepend-icon="mdi-logout"
          @click="logout"
        >
          Cerrar Sesión
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import { useTheme } from 'vuetify'

const router = useRouter()
const authStore = useAuthStore()
const theme = useTheme()

const drawer = ref(true)
const rail = ref(false)

const user = computed(() => authStore.user)
const canManageUsers = computed(() => authStore.canManageUsers)
const isSuperAdmin = computed(() => authStore.isSuperAdmin)


const navigateTo = (path) => {
  router.push(path).catch(err => {
    console.error('Error al navegar:', err)
  })
}

const logout = () => {
  authStore.logout()
}

const toggleTheme = () => {
  theme.global.name.value = theme.global.name.value === 'light' ? 'dark' : 'light'
  localStorage.setItem('theme', theme.global.name.value)
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    theme.global.name.value = savedTheme
  }
})
</script>
<style scoped>
.sidebar {
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
}

.sidebar.sidebar-dark {
  background: linear-gradient(180deg, #03001C 0%, #301E67 100%);
}

.sidebar :deep(.v-list-item) {
  color: white;
}

.sidebar :deep(.v-list-item:hover) {
  background-color: rgba(255, 255, 255, 0.1);
}

.sidebar :deep(.v-list-item--active) {
  background-color: rgba(255, 255, 255, 0.2);
}

.sidebar :deep(.v-list-item__title) {
  color: white;
}

.sidebar :deep(.v-list-item__subtitle) {
  color: rgba(255, 255, 255, 0.7);
}

.sidebar :deep(.v-icon) {
  color: white;
}

.sidebar :deep(.v-divider) {
  border-color: rgba(255, 255, 255, 0.2);
}
</style>
