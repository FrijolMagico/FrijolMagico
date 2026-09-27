import type { Activity, ActivityDetail, ActivityRegistrationInput, ActivityOccurrenceInput } from '../_schemas/activity.schema'

export interface ActivityWithDetail extends Activity {
  detail: ActivityDetail | null
  registration: ActivityRegistrationInput | null
  occurrences: ActivityOccurrenceInput[]
}
