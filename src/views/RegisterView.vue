<template>
  <div class="register-container d-flex align-center justify-center">
    <v-container fluid class="pa-0">
      <v-row no-gutters class="fill-height">
        <!-- Left Side - Branding -->
        <v-col cols="12" md="6" class="d-none d-md-flex align-center justify-center pa-12">
          <div class="text-center">
            <v-icon size="120" color="white" class="mb-6">mdi-warehouse</v-icon>
            <h1 class="text-h2 font-weight-bold text-white mb-4">Nombre mamalon</h1>
            <p class="text-h6 text-white text-opacity-80">Eslogan mamalo</p>
          </div>
        </v-col>

        <!-- Right Side - Registration Form -->
        <v-col cols="12" md="6" class="d-flex align-center justify-center pa-12">
          <v-card class="register-card pa-8" max-width="500" elevation="8">
            <div class="text-center mb-8">
              <h2 class="text-h4 font-weight-bold text-primary mb-2">Crear cuenta</h2>
              <p class="text-body-1 text-medium-emphasis">Algo de algo</p>
            </div>

            <v-form ref="registerForm" v-model="isFormValid" @submit.prevent="handleRegister">
              <v-text-field
                v-model="fullName"
                label="Nombre completo"
                :rules="nameRules"
                required
                prepend-icon="mdi-account"
                variant="outlined"
                class="mb-4"
              />

              <v-text-field
                v-model="email"
                label="Email"
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
                type="password"
                :rules="passwordRules"
                required
                prepend-icon="mdi-lock"
                variant="outlined"
                class="mb-4"
              />

              <v-text-field
                v-model="confirmPassword"
                label="Confirmar contraseña"
                type="password"
                :rules="confirmPasswordRules"
                required
                prepend-icon="mdi-lock-check"
                variant="outlined"
                class="mb-6"
              />

              <v-btn
                type="submit"
                color="primary"
                size="large"
                block
                :loading="isLoading"
                :disabled="!isFormValid"
                class="mb-4"
              >
                Crear cuenta
              </v-btn>

              <v-alert
                v-if="error"
                type="error"
                variant="tonal"
                class="mb-4"
              >
                {{ error }}
              </v-alert>

              <v-alert
                v-if="success"
                type="success"
                variant="tonal"
                class="mb-4"
              >
                {{ success }}
              </v-alert>

              <!-- Login Link -->
              <v-divider class="my-6" />
              <div class="text-center">
                <p class="text-body-2 text-medium-emphasis">
                  Ya tienes una cuenta?
                  <router-link to="/login" class="text-primary text-decoration-none">
                    Inicia sesión aca.
                  </router-link>
                </p>
              </div>
            </v-form>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const fullName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const isFormValid = ref(false)
const isLoading = ref(false)
const error = ref('')
const success = ref('')

const nameRules = [
  v => !!v || 'El nombre completo es obligatorio',
  v => v.length >= 2 || 'El nombre debe tener al menos 2 caracteres'
]

const emailRules = [
  v => !!v || 'El email es obligatorio',
  v => /.+@.+\..+/.test(v) || 'El email debe ser válido'
]

const passwordRules = [
  v => !!v || 'La contraseña es requerida',
  v => v.length >= 6 || 'La contraseña debe tener al menos 6 caracteres',
  v => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(v) || 'La contraseña debe incluir al menos una mayúscula, una minúscula y un número'
]

const confirmPasswordRules = [
  v => !!v || 'Por favor confirma tu contraseña',
  v => v === password.value || 'Las contraseñas no coinciden'
]

const handleRegister = async () => {
  if (!isFormValid.value) return

  isLoading.value = true
  error.value = ''
  success.value = ''

  try {
    const payload = {
      name_user: fullName.value,
      email: email.value,
      password: password.value,
      role: 'ADMINISTRATOR'
    }

    console.log("Register payload:", payload)

    const res = await fetch('http://localhost:8020/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    let data = {}
    try { data = await res.json() } catch (e) {}

    if (!res.ok) {
      error.value = data.message || data.error || `Error ${res.status}`
      return
    }

    success.value = 'Cuenta creada correctamente. Redirigiendo al login...'
    // setTimeout(() => router.push('/login'), 1500)
  } catch (err) {
    error.value = 'Error de conexión con el servidor'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.register-card {
  border-radius: 16px;
  width: 500px;
  max-width: 100%;
}
</style>
