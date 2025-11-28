export const useRoleUtils = () => {
  const getRoleColor = (role) => {
    const colors = {
      admin: 'error',
      manager: 'warning',
      employee: 'info'
    }
    return colors[role] || 'default'
  }

  const getRoleIcon = (role) => {
    const icons = {
      admin: 'mdi-shield-crown',
      manager: 'mdi-account-tie',
      employee: 'mdi-account'
    }
    return icons[role] || 'mdi-help'
  }

  const getRoleLabel = (role) => {
    const labels = {
      admin: 'Administrador',
      manager: 'Gerente',
      employee: 'Empleado'
    }
    return labels[role] || role
  }

  const roles = [
    { title: 'Administrador', value: 'SUPERADMINISTRATOR' },
    { title: 'Empleado', value: 'EMPLOYEE' }
  ]

  return {
    getRoleColor,
    getRoleIcon,
    getRoleLabel,
    roles
  }
}





