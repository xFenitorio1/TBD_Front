<template>
  <v-row class="fill-height" no-gutters>
    <!-- Left side: Logo and branding -->
    <v-col
      cols="12"
      md="6"
      class="d-flex flex-column align-start justify-start left-bg pa-8"
    >
      <div class="d-flex align-center mb-8">
        <v-icon size="48" color="white" class="mr-4">mdi-warehouse</v-icon>
        <span class="text-h4 font-weight-bold text-white">StockOverflowed</span>
      </div>
      <div class="text-h6 text-white font-weight-light mt-8">
        Algo mamalon
      </div>
      <div class="text-body-1 text-white mt-4 opacity-75">
        Algo mamalon x2
      </div>
    </v-col>

    <!-- Right side: Login form -->
    <v-col cols="12" md="6" class="d-flex align-center justify-center">
      <v-card
        class="login-card pa-8"
        elevation="8"
        max-width="450"
        width="100%"
        rounded="lg"
      >
        <v-card-title
          class="text-h4 font-weight-bold text-center mb-6 text-primary"
        >
          Bienvenido
        </v-card-title>

        <v-card-text>
          <v-form @submit.prevent="handleLogin" v-model="isFormValid">
            <v-text-field
              v-model="email"
              label="Correo Electrónico"
              placeholder="nombre@correo.com"
              type="email"
              :rules="emailRules"
              required
              prepend-icon="mdi-email"
              variant="outlined"
              class="mb-4"
            />
            <v-text-field
              v-model="password"
              label="Contraseña"
              placeholder="Ingresa tu contraseña"
              type="password"
              :rules="passwordRules"
              required
              prepend-icon="mdi-lock"
              variant="outlined"
              class="mb-6"
            />

            <v-alert
              v-if="error"
              type="error"
              class="mb-4"
              variant="tonal"
              closable
            >
              {{ error }}
            </v-alert>

            <!-- Botón de iniciar sesión -->
            <v-btn
              type="submit"
              color="primary"
              block
              size="large"
              class="mb-3"
              :loading="isLoading"
              :disabled="!isFormValid"
            >
              Iniciar Sesión
            </v-btn>

            <!-- Botón de registro -->
            <v-btn
              color="secondary"
              block
              size="large"
              variant="outlined"
              @click="goToRegister"
            >
              Crear Cuenta
            </v-btn>

            <v-divider class="my-4" />

            <div class="text-center">
              <p class="text-body-2 text-medium-emphasis mb-2">
                Credenciales de prueba:
              </p>
              <div class="d-flex flex-column gap-1">
                <div class="text-caption">
                  <strong>Admin:</strong> admin@store.com / admin123
                </div>
                <div class="text-caption">
                  <strong>Empleado:</strong> employee@store.com / emp123
                </div>
              </div>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../store/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const isFormValid = ref(false)
const isLoading = ref(false)
const error = ref('')

const emailRules = [
  v => !!v || 'Email is required',
  v => /.+@.+\..+/.test(v) || 'Email must be valid'
]

const passwordRules = [
  v => !!v || 'Password is required',
  v => v.length >= 6 || 'Password must be at least 6 characters'
]

const handleLogin = async () => {
  if (!isFormValid.value) return

  isLoading.value = true
  error.value = ''

  try {
    const result = await authStore.login(email.value, password.value)
    if (!result.success) {
      error.value = result.error
    }
  } catch (err) {
    error.value = 'An unexpected error occurred'
  } finally {
    isLoading.value = false
  }
}

const goToRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
.left-bg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.login-card {
  border-radius: 16px;
}
</style>
