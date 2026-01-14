/**
 * PowerSync client exports.
 *
 * Structure:
 * - Each table has its own file with queries + mutations
 * - Hooks are in the hooks/ folder, organized by table
 * - Types are shared in types.ts
 * - Context is in context.ts
 *
 * Usage:
 * // Import everything for a table
 * import { queryTrackablesList, insertTrackable, ... } from "@tyl/db/client/powersync/trackable";
 *
 * // Import hooks
 * import { useTrackablesList, useTrackablesWithData } from "@tyl/db/client/powersync/hooks/trackable";
 */

// Context
export { PowersyncDrizzleContext, usePowersyncDrizzle } from "./context";

// Types
export type {
  DateRangeParams,
  TrackableFlagsRow,
  TrackableGroupRow,
  TrackableRecordRow,
  TrackableRow,
  TrackableWithData,
  TrackableWithGroups,
  UserFlagsRow,
} from "./types";

// Re-export table modules
export * from "./trackable";
export * from "./trackable-record";
export * from "./trackable-group";
export * from "./trackable-flags";
export * from "./user-flags";

// Re-export hooks
export * from "./hooks";
