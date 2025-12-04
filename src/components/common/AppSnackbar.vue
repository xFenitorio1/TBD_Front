<template>
  <v-snackbar
    v-model="uiStore.snackbar.show"
    :color="uiStore.snackbar.color"
    :timeout="uiStore.snackbar.timeout"
    location="top right"
  >
    {{ uiStore.snackbar.message }}

    <template v-slot:actions>
      <v-btn
        color="white"
        variant="text"
        @click="uiStore.snackbar.show = false"
      >
        Cerrar
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { useUiStore } from '../../store/ui'

const uiStore = useUiStore()
</script>
