<template>
  <v-app>
    <NavigationSidebar v-if="authStore.isAuthenticated" />

    <v-main class="bg-grey-lighten-4">
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './store/auth'
import NavigationSidebar from './components/NavigationSidebar.vue'

const authStore = useAuthStore()

onMounted(() => {
  authStore.initializeAuth()
})
</script>

<style>
#app {
  font-family: 'Roboto', sans-serif;
}
</style>
