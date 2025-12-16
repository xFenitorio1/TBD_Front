export const ROLES = {
  SUPER_ADMIN: 'ROLE_SUPERADMINISTRATOR',
  ADMIN: 'ROLE_ADMINISTRATOR',
  EMPLOYEE: 'ROLE_EMPLOYEE'
}

export const useRoleUtils = () => {
  const getRoleColor = (role) => {
    const colors = {
      ROLE_SUPERADMINISTRATOR: 'purple-darken-2',
      ROLE_ADMINISTRATOR: 'primary',
      ROLE_EMPLOYEE: 'warning'
    }
    return colors[role] || 'default'
  }

  const getRoleIcon = (role) => {
    const icons = {
      ROLE_SUPERADMINISTRATOR: 'mdi-shield-crown',
      ROLE_ADMINISTRATOR: 'mdi-shield-account',
      ROLE_EMPLOYEE: 'mdi-account'
    }
    return icons[role] || 'mdi-help'
  }

  const getRoleLabel = (role) => {
    const labels = {
      ROLE_SUPERADMINISTRATOR: 'Super Admin',
      ROLE_ADMINISTRATOR: 'Administrador',
      ROLE_EMPLOYEE: 'Empleado'
    }
    return labels[role] || role
  }

  const roles = [
    { title: 'Super Admin', value: 'ROLE_SUPERADMINISTRATOR' },
    { title: 'Administrador', value: 'ROLE_ADMINISTRATOR' },
    { title: 'Empleado', value: 'ROLE_EMPLOYEE' }
  ]

  return {
    getRoleColor,
    getRoleIcon,
    getRoleLabel,
    roles
  }
}





