import type { Activity, ActivityDetail, ActivityRegistrationInput } from '../_schemas/activity.schema'

export interface ActivityWithDetail extends Activity {
  detail: ActivityDetail | null
  registration: ActivityRegistrationInput | null
}
