export const useRoleUtils = () => {
  const getRoleColor = (role) => {
    const colors = {
      SUPERADMINISTRATOR: 'purple-darken-2',
      ADMINISTRATOR: 'primary',
      EMPLOYEE: 'warning'
    }
    return colors[role] || 'default'
  }

  const getRoleIcon = (role) => {
    const icons = {
      SUPERADMINISTRATOR: 'mdi-shield-crown',
      ADMINISTRATOR: 'mdi-shield-account',
      EMPLOYEE: 'mdi-account'
    }
    return icons[role] || 'mdi-help'
  }

  const getRoleLabel = (role) => {
    const labels = {
      SUPERADMINISTRATOR: 'Super Admin',
      ADMINISTRATOR: 'Administrador',
      EMPLOYEE: 'Empleado'
    }
    return labels[role] || role
  }

  const roles = [
    { title: 'Super Admin', value: 'SUPERADMINISTRATOR' },
    { title: 'Administrador', value: 'ADMINISTRATOR' },
    { title: 'Empleado', value: 'EMPLOYEE' }
  ]

  return {
    getRoleColor,
    getRoleIcon,
    getRoleLabel,
    roles
  }
}





