<template>
  <v-navigation-drawer
    v-model="drawer"
    :rail="rail"
    permanent
    @click="rail = false"
    class="sidebar"
  >
    <v-list-item
      prepend-avatar="https://randomuser.me/api/portraits/men/85.jpg"
      :title="user?.name || 'Usuario'"
      :subtitle="isAdmin ? 'Administrador' : 'Empleado'"
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
        prepend-icon="mdi-package-variant"
        title="Productos"
        value="products"
        @click="navigateTo('/products')"
        :active="$route.path === '/products'"
      />

      <v-list-item
        prepend-icon="mdi-warehouse"
        title="Inventario"
        value="inventory"
        @click="navigateTo('/inventory')"
        :active="$route.path === '/inventory'"
      />

      <v-list-item
        prepend-icon="mdi-swap-horizontal"
        title="Transacciones"
        value="transactions"
        @click="navigateTo('/transactions')"
        :active="$route.path === '/transactions'"
      />

      <v-list-item
        prepend-icon="mdi-chart-line"
        title="Reportes"
        value="reports"
        @click="navigateTo('/reports')"
        :active="$route.path === '/reports'"
      />

      <v-list-item
        v-if="isAdmin"
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
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'

const router = useRouter()
const authStore = useAuthStore()

const drawer = ref(true)
const rail = ref(false)

const user = computed(() => authStore.user)
const isAdmin = computed(() => authStore.isAdmin)


const navigateTo = (path) => {
  router.push(path).catch(err => {
    console.error('Error al navegar:', err)
  })
}

const logout = () => {
  authStore.logout()
}
</script>
<style scoped>
.sidebar {
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
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
