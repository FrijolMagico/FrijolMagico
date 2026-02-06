import { User } from '@frijolmagico/database/orm'

// SQLite doest not allow to save dates, so we need to convert string to Date objects that match the type expect by the frontend.
// This is only needed for the AuthUser type, since it's used in the admin frontend, while the User type is used in the database and can have string dates.
// Also add undefined to the image field, since it can be null or undefined depending on the database and the frontend requirements.
// TODO: In the future, we should consider using a more robust solution for date handling in the database, such as storing timestamps as integers and converting them to Date objects in the application layer.

export interface AuthUser extends Omit<
  User,
  'createdAt' | 'updatedAt' | 'image'
> {
  createdAt: Date
  updatedAt: Date
  image?: string | null | undefined
}
