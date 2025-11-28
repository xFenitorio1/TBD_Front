<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="600px" persistent>
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">{{ isEditing ? 'mdi-pencil' : 'mdi-plus' }}</v-icon>
        {{ isEditing ? 'Editar Usuario' : 'Agregar Nuevo Usuario' }}
      </v-card-title>
      
      <v-card-text>
        <v-form ref="userForm" v-model="isFormValid">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="localUser.name_user"
                label="Nombre Completo"
                :rules="[v => !!v || 'El nombre es requerido']"
                required
                variant="outlined"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="localUser.email"
                label="Dirección de Email"
                type="email"
                :rules="emailRules"
                required
                variant="outlined"
              />
            </v-col>
            <v-col cols="12" md="6" v-if="!isEditing">
              <v-text-field
                v-model="localUser.password"
                label="Contraseña"
                type="password"
                :rules="passwordRules"
                required
                variant="outlined"
              />
            </v-col>
            <v-col cols="12" md="6" v-if="!isEditing">
              <v-text-field
                v-model="localUser.confirmPassword"
                label="Confirmar Contraseña"
                type="password"
                :rules="confirmPasswordRules"
                required
                variant="outlined"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="localUser.role"
                label="Rol"
                :items="roles"
                variant="outlined"
                required
                :rules="[v => !!v || 'El rol es requerido']"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-6">
        <v-spacer />
        <v-btn
          color="grey"
          variant="text"
          @click="$emit('close')"
        >
          Cancelar
        </v-btn>
        <v-btn
          color="primary"
          @click="handleSave"
          :loading="isSaving"
          :disabled="!isFormValid"
        >
          {{ isEditing ? 'Actualizar' : 'Crear' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useRoleUtils } from '../../composables/useRoleUtils'
import { useAuthStore } from '../../store/auth'

const authStore = useAuthStore()

const props = defineProps({
  modelValue: Boolean,
  user: Object,
  stores: Array,
  isSaving: Boolean
})

const emit = defineEmits(['update:modelValue', 'close', 'save'])
const { roles } = useRoleUtils()
const userForm = ref(null)
const isFormValid = ref(false)
const isEditing = computed(() => !!props.user)

const localUser = ref({
  name_user: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: ''
})

watch(() => props.user, (newUser) => {
  if (newUser) {
    localUser.value = { ...newUser, password: '', confirmPassword: '' }
  } else {
    localUser.value = {
      name_user: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: ''
    }
  }
}, { immediate: true })

const emailRules = [
  v => !!v || 'El email es requerido',
  v => /.+@.+\..+/.test(v) || 'El email debe ser válido'
]

const passwordRules = [
  v => !!v || 'La contraseña es requerida',
  v => v.length >= 6 || 'La contraseña debe tener al menos 6 caracteres'
]

const confirmPasswordRules = computed(() => [
  v => !!v || 'Por favor confirma tu contraseña',
  v => v === localUser.value.password || 'Las contraseñas no coinciden'
])

const handleSave = () => {
  if (!userForm.value.validate()) return

  const payload = {
    name_user: localUser.value.name_user,
    email: localUser.value.email,
    password: localUser.value.password,
    role: localUser.value.role,
    storeU_id: authStore.user?.storeU_id,
  }



  emit('save', payload)
}
</script>






