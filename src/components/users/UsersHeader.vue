<template>
  <div class="d-flex align-center justify-space-between mb-6">
    <div>
      <h1 class="text-h3 font-weight-bold text-primary">Gestión de Usuarios</h1>
      <p class="text-body-1 text-medium-emphasis">Administra usuarios del sistema y permisos</p>
    </div>
    <v-btn
      color="primary"
      prepend-icon="mdi-plus"
      size="large"
      @click="$emit('add-user')"
    >
      Agregar Usuario
    </v-btn>
  </div>
</template>

<script setup>
defineEmits(['add-user'])
</script>

