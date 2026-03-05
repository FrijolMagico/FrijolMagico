import { type InferSelectModel, type InferInsertModel } from 'drizzle-orm'

import {
  discipline,
  place,
  organization,
  organizationMember
} from './schema/core'

import {
  event,
  eventEdition,
  eventEditionMetric,
  eventEditionApplication,
  eventEditionSnapshot,
  eventEditionDay
} from './schema/events'

import {
  activity,
  eventEditionParticipant,
  admissionMode,
  participantActivity,
  participantExhibition,
  activityType
} from './schema/participations'

import {
  collective,
  artist,
  artistStatus,
  artistHistory,
  artistImage,
  catalogArtist
} from './schema/artist'

import { account, session, user, verification } from './schema/auth'

// ============================================
// Core Types
// ============================================

export type Organization = InferSelectModel<typeof organization>
export type NewOrganization = InferInsertModel<typeof organization>

export type OrganizationMember = InferSelectModel<typeof organizationMember>
export type NewOrganizationMember = InferInsertModel<typeof organizationMember>

export type Place = InferSelectModel<typeof place>
export type NewPlace = InferInsertModel<typeof place>

export type Discipline = InferSelectModel<typeof discipline>
export type NewDiscipline = InferInsertModel<typeof discipline>

// ============================================
// Artist Types
// ============================================

export type ArtistStatus = InferSelectModel<typeof artistStatus>
export type NewArtistStatus = InferInsertModel<typeof artistStatus>

export type Artist = InferSelectModel<typeof artist>
export type NewArtist = InferInsertModel<typeof artist>

export type ArtistImage = InferSelectModel<typeof artistImage>
export type NewArtistImage = InferInsertModel<typeof artistImage>

export type ArtistHistory = InferSelectModel<typeof artistHistory>
export type NewArtistHistory = InferInsertModel<typeof artistHistory>

export type CatalogArtist = InferSelectModel<typeof catalogArtist>
export type NewCatalogArtist = InferInsertModel<typeof catalogArtist>

export type Collective = InferSelectModel<typeof collective>
export type NewCollective = InferInsertModel<typeof collective>

// ============================================
// Event Types
// ============================================

export type Event = InferSelectModel<typeof event>
export type NewEvent = InferInsertModel<typeof event>

export type EventEdition = InferSelectModel<typeof eventEdition>
export type NewEventEdition = InferInsertModel<typeof eventEdition>

export type EventEditionDay = InferSelectModel<typeof eventEditionDay>
export type NewEventEditionDay = InferInsertModel<typeof eventEditionDay>

export type EventEditionMetric = InferSelectModel<typeof eventEditionMetric>
export type NewEventEditionMetric = InferInsertModel<
  typeof eventEditionMetric
>

export type EventEditionSnapshot = InferSelectModel<
  typeof eventEditionSnapshot
>
export type NewEventEditionSnapshot = InferInsertModel<
  typeof eventEditionSnapshot
>

export type EventEditionApplication = InferSelectModel<
  typeof eventEditionApplication
>
export type NewEventEditionApplication = InferInsertModel<
  typeof eventEditionApplication
>

// ============================================
// Participant Types
// ============================================

export type ActivityType = InferSelectModel<typeof activityType>
export type NewActivityType = InferInsertModel<typeof activityType>

export type AdmissionMode = InferSelectModel<typeof admissionMode>
export type NewAdmissionMode = InferInsertModel<typeof admissionMode>

export type EventEditionParticipant = InferSelectModel<
  typeof eventEditionParticipant
>
export type NewEventEditionParticipant = InferInsertModel<
  typeof eventEditionParticipant
>

export type ParticipantExhibition = InferSelectModel<
  typeof participantExhibition
>
export type NewParticipantExhibition = InferInsertModel<
  typeof participantExhibition
>

export type ParticipantActivity = InferSelectModel<
  typeof participantActivity
>
export type NewParticipantActivity = InferInsertModel<
  typeof participantActivity
>

export type Activity = InferSelectModel<typeof activity>
export type NewActivity = InferInsertModel<typeof activity>

// ============================================
// Auth Types
// ============================================

export type User = InferSelectModel<typeof user>
export type Session = InferSelectModel<typeof session>
export type Account = InferSelectModel<typeof account>
export type Verification = InferSelectModel<typeof verification>
