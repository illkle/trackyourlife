/**
 * PowerSync type definitions for trackable entities.
 * Used by both web and mobile applications.
 */

import type {
  trackable,
  trackableFlags,
  trackableGroup,
  trackableRecord,
  userFlags,
} from "../schema-powersync";

/** Trackable entity from PowerSync */
export type TrackableRow = typeof trackable.$inferSelect;

/** Trackable record entity from PowerSync */
export type TrackableRecordRow = typeof trackableRecord.$inferSelect;

/** Trackable flags entity from PowerSync */
export type TrackableFlagsRow = typeof trackableFlags.$inferSelect;

/** Trackable group entity from PowerSync */
export type TrackableGroupRow = typeof trackableGroup.$inferSelect;

/** User flags entity from PowerSync */
export type UserFlagsRow = typeof userFlags.$inferSelect;

/** Trackable with its groups (for list views) */
export interface TrackableWithGroups extends TrackableRow {
  trackableGroup: TrackableGroupRow[];
}

/** Trackable with groups and records (for data views) */
export interface TrackableWithData extends TrackableWithGroups {
  trackableRecord: TrackableRecordRow[];
}

/** Date range parameters for queries */
export interface DateRangeParams {
  /** Start date as ISO string (inclusive) */
  startDate: string;
  /** End date as ISO string (inclusive) */
  endDate: string;
}
