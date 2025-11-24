export const useDateUtils = () => {
  const formatDate = (date) => {
    if (!date) return 'Nunca'
    return new Date(date).toLocaleDateString('es-ES')
  }

  return {
    formatDate
  }
}


