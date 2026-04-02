import { Activity, ActivityDetail } from '../_schemas/activity.schema'

export interface ActivityWithDetail extends Activity {
  detail: ActivityDetail | null
}
