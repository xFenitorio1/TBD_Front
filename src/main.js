import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Íconos MDI
import '@mdi/font/css/materialdesignicons.css'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#1976D2',
          secondary: '#424242',
          accent: '#82B1FF',
          error: '#D32F2F',
          info: '#1976D2',
          success: '#388E3C',
          warning: '#F57C00',
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: '#2196F3',
          secondary: '#B0BEC5',
          accent: '#82B1FF',
          error: '#EF5350',
          info: '#2196F3',
          success: '#66BB6A',
          warning: '#FFA726',
          background: '#121212',
          surface: '#1E1E1E',
        },
      },
    },
  },
})

const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(pinia)
app.use(vuetify)

// Initialize auth store
import { useAuthStore } from './store/auth'
const authStore = useAuthStore(pinia)
authStore.initializeAuth()

app.mount('#app')
