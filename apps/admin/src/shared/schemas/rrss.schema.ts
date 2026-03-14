import z from 'zod'

export const rrssSchema = z
  .record(
    z.string().min(1, {
      message: 'Debes ingresar el nombre de la página web'
    }),
    z.array(z.url('Debes ingresar una URL válida'))
  )
  .nullable()
