/**
 * In remote(postgres) some tables have complex primary keys.
 * However in powersync's sqlite each row must have ID.
 * Those ID's are generated in a similar fashion.
 * ID generation is defined in docker/powersync.yaml
 *
 * Those functions allow to generate those keys on client for seamless updates.
 */

import {
  DbTrackableFlagsInsert,
  DbTrackableGroupInsert,
  DbUserFlagsInsert,
} from "./schema-powersync";

export const withUserFlagsPowersyncID = (v: Omit<DbUserFlagsInsert, "id">) => {
  return {
    ...v,
    id: `${v.user_id}|${v.key}`,
  };
};

export const withTrackableFlagsPowersyncID = (v: Omit<DbTrackableFlagsInsert, "id">) => {
  return {
    ...v,
    id: `${v.user_id}|${v.trackable_id}|${v.key}`,
  };
};

export const withTrackableGroupPowersyncID = (v: Omit<DbTrackableGroupInsert, "id">) => {
  return {
    ...v,
    id: `${v.user_id}|${v.trackable_id}|${v.group}`,
  };
};
