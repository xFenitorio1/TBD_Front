import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
    const snackbar = ref({
        show: false,
        message: '',
        color: 'success',
        timeout: 3000
    })

    const showSnackbar = (message, color = 'success', timeout = 3000) => {
        snackbar.value = {
            show: true,
            message,
            color,
            timeout
        }
    }

    return {
        snackbar,
        showSnackbar
    }
})
