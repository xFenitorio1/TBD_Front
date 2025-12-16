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
                v-model="localUser.email_user"
                label="Dirección de Email"
                type="email"
                :rules="emailRules"
                required
                variant="outlined"
              />
            </v-col>
            <v-col cols="12" md="6" v-if="!isEditing">
              <v-text-field
                v-model="localUser.password_user"
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
                :items="availableRoles"
                variant="outlined"
                required
                :rules="[v => !!v || 'El rol es requerido']"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="localUser.storeU_id"
                label="Tienda"
                :items="storeItems"
                item-title="name_store"
                item-value="id_store"
                variant="outlined"
                required
                :rules="[v => !!v || 'La tienda es requerida']"
                :disabled="!canEditStore"
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
import { ref, watch, computed, onMounted } from 'vue'
import { useRoleUtils, ROLES } from '../../composables/useRoleUtils'
import { useStoreStore } from '../../store/stores'

const storeStore = useStoreStore()

const props = defineProps({
  modelValue: Boolean,
  user: Object,
  isSaving: Boolean,
  canEditStore: {
    type: Boolean,
    default: true
  },
  defaultStoreId: {
    type: [Number, String],
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'close', 'save'])
const { roles } = useRoleUtils()
const userForm = ref(null)
const isFormValid = ref(false)
const isEditing = computed(() => !!props.user)

const localUser = ref({
  name_user: '',
  email_user: '',
  password_user: '',
  confirmPassword: '',
  role: '',
  storeU_id: null
})

const storeItems = computed(() => storeStore.stores)

const availableRoles = computed(() => {
  if (props.canEditStore) {
    return roles
  }
  return roles.filter(role => role.value !== ROLES.SUPER_ADMIN)
})

onMounted(async () => {
  await storeStore.fetchStores()
})

watch(() => props.user, (newUser) => {
  if (newUser) {
    localUser.value = { 
      ...newUser, 
      password_user: '', 
      confirmPassword: '',
      storeU_id: newUser.storeU_id || null
    }
  } else {
    localUser.value = {
      name_user: '',
      email_user: '',
      password_user: '',
      confirmPassword: '',
      role: '',
      storeU_id: props.defaultStoreId || null
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
  v => v === localUser.value.password_user || 'Las contraseñas no coinciden'
])

const handleSave = () => {
  if (!userForm.value.validate()) return

  const payload = {
    name_user: localUser.value.name_user,
    email: localUser.value.email_user,
    password: localUser.value.password_user,
    role: localUser.value.role,
    storeU_id: localUser.value.storeU_id,
  }

  if (isEditing.value) {
    payload.id_user = props.user.id_user
  }

  emit('save', payload)
}
</script>






