import type { AboutData } from '../../types/about'

export function getAboutDataMock(): AboutData {
  return {
    id: 1,
    nombre: 'Asociación Cultural Frijol Mágico',
    descripcion: 'Espacio que reúne a ilustradores de la Región de Coquimbo',
    mision:
      'Fomentar, difundir y profesionalizar la ilustración en la Región de Coquimbo, creando espacios de encuentro, formación y visibilización para artistas locales.',
    vision:
      'Ser el principal referente de la ilustración en la Región de Coquimbo, consolidando una comunidad activa de ilustradores reconocidos a nivel nacional.',
  }
}
