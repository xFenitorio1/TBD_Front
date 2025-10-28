<template>
  <div class="register-container d-flex align-center justify-center">
    <v-container fluid class="pa-0">
      <v-row no-gutters class="fill-height">
        <!-- Left Side - Branding -->
        <v-col cols="12" md="6" class="d-none d-md-flex align-center justify-center pa-12">
          <div class="text-center">
            <v-icon size="120" color="white" class="mb-6">mdi-warehouse</v-icon>
            <h1 class="text-h2 font-weight-bold text-white mb-4">Inventory Pro</h1>
            <p class="text-h6 text-white text-opacity-80">Professional Inventory Management System</p>
          </div>
        </v-col>

        <!-- Right Side - Registration Form -->
        <v-col cols="12" md="6" class="d-flex align-center justify-center pa-12">
          <v-card class="register-card pa-8" max-width="500" elevation="8">
            <div class="text-center mb-8">
              <h2 class="text-h4 font-weight-bold text-primary mb-2">Create Account</h2>
              <p class="text-body-1 text-medium-emphasis">Join our inventory management system</p>
            </div>

            <v-form ref="registerForm" v-model="isFormValid" @submit.prevent="handleRegister">
              <v-text-field
                v-model="fullName"
                label="Full Name"
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
                label="Password"
                type="password"
                :rules="passwordRules"
                required
                prepend-icon="mdi-lock"
                variant="outlined"
                class="mb-4"
              />

              <v-text-field
                v-model="confirmPassword"
                label="Confirm Password"
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
                Create Account
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
                  Already have an account?
                  <router-link to="/login" class="text-primary text-decoration-none">
                    Sign in here
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'

const router = useRouter()
const authStore = useAuthStore()

const fullName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const isFormValid = ref(false)
const isLoading = ref(false)
const error = ref('')
const success = ref('')

const nameRules = [
  v => !!v || 'Full name is required',
  v => v.length >= 2 || 'Name must be at least 2 characters'
]

const emailRules = [
  v => !!v || 'Email is required',
  v => /.+@.+\..+/.test(v) || 'Email must be valid'
]

const passwordRules = [
  v => !!v || 'Password is required',
  v => v.length >= 6 || 'Password must be at least 6 characters',
  v => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(v) || 'Password must contain at least one lowercase letter, one uppercase letter, and one number'
]

const confirmPasswordRules = [
  v => !!v || 'Please confirm your password',
  v => v === password.value || 'Passwords do not match'
]

const handleRegister = async () => {
  if (!isFormValid.value) return
  
  isLoading.value = true
  error.value = ''
  success.value = ''
  
  try {
    // Here you would typically call your registration API
    // For now, we'll simulate a successful registration
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
    
    // Simulate successful registration
    success.value = 'Account created successfully! Redirecting to login...'
    
    // Redirect to login after a short delay
    setTimeout(() => {
      router.push('/login')
    }, 2000)
    
  } catch (err) {
    error.value = 'An unexpected error occurred during registration'
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
}
</style>
