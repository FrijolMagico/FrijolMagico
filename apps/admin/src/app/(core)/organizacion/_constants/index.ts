export const ORGANIZATION_ID = 1
export const ORGANIZATION_CACHE_TAG = `general:organization:${ORGANIZATION_ID}`
export const TEAM_CACHE_TAG = `general:organization-${ORGANIZATION_ID}:team`
export const ORGANIZATION_FORM_ID = 'org-form'
export const UPDATE_TEAM_FORM_ID = 'team-member-update-form'
export const ADD_TEAM_FORM_ID = 'team-member-insert-form'

export enum ORGANIZATION_FIELDS {
  NAME = 'nombre',
  DESCRIPTION = 'descripcion',
  MISSION = 'mision',
  VISION = 'vision'
}
