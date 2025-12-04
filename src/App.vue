<template>
  <v-app>
    <NavigationSidebar v-if="authStore.isAuthenticated" />

    <v-main>
      <router-view />
    </v-main>
    <AppSnackbar />
  </v-app>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './store/auth'
import NavigationSidebar from './components/NavigationSidebar.vue'
import AppSnackbar from './components/common/AppSnackbar.vue'
import { useTheme } from 'vuetify'

const authStore = useAuthStore()
const theme = useTheme()

onMounted(() => {
  authStore.initializeAuth()
  
  // Initialize theme
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    theme.global.name.value = savedTheme
  }
})
</script>

<style>
#app {
  font-family: 'Roboto', sans-serif;
}
</style>
