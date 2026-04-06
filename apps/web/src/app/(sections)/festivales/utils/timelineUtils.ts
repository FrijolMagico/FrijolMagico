import type { FestivalEvento } from '../types/festival'

/**
 * Genera el texto de visualización para los días del evento
 * - Un día: "3 de octubre de 2025"
 * - Múltiples días: "3, 4 y 5 de octubre de 2025"
 */
export const getDaysDisplay = (dias: FestivalEvento['dias']) => {
  if (dias.length === 0) return null

  // Obtener mes y año del primer día (asumiendo todos son del mismo mes)
  const lastDate = new Date(dias[dias.length - 1].fecha + 'T00:00:00')
  const month = lastDate.toLocaleDateString('es-CL', { month: 'long' })
  const year = lastDate.getFullYear()

  if (dias.length === 1) {
    const day = new Date(dias[0].fecha + 'T00:00:00').getDate()
    return `${day} de ${month} de ${year}`
  }

  // Múltiples días: extraer números de día
  const dayNumbers = dias.map((d) => new Date(d.fecha + 'T00:00:00').getDate())
  const allButLast = dayNumbers.slice(0, -1).join(', ')
  const lastDay = dayNumbers[dayNumbers.length - 1]

  return `${allButLast} y ${lastDay} de ${month} de ${year}`
}

/**
 * Obtiene la ubicación principal o estado online del evento
 */
export const getLocation = (dias: FestivalEvento['dias']) => {
  const firstDayWithLocation = dias.find((d) => d.lugar !== null)
  if (firstDayWithLocation?.lugar) {
    return firstDayWithLocation.lugar.nombre
  }
  // Si es online
  const isOnline = dias.some((d) => d.modalidad === 'online')
  return isOnline ? 'Online' : null
}
