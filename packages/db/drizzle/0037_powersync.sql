-- Create a role/user with replication privileges for PowerSync
CREATE ROLE powersync_role
WITH
    REPLICATION BYPASSRLS LOGIN PASSWORD 'LOL';

-- Set up permissions for powersync role(it's created in docker)
-- Read-only (SELECT) access is required
GRANT
SELECT
    ON "TYL_user",
    "TYL_userFlags",
    "TYL_trackable",
    "TYL_trackableFlags",
    "TYL_trackableRecord",
    "TYL_trackableRecordAttributes",
    "TYL_trackableGroup" TO powersync_role;

-- Optionally, grant SELECT on all future tables (to cater for schema additions)
--ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT
--SELECT
--    ON TABLES TO powersync_role;
--
-- Create a publication to replicate tables. The publication must be named "powersync"
CREATE PUBLICATION powersync FOR TABLE "TYL_user",
"TYL_userFlags",
"TYL_trackable",
"TYL_trackableFlags",
"TYL_trackableRecord",
"TYL_trackableRecordAttributes",
"TYL_trackableGroup";

CREATE USER powersync_storage_user
WITH
    PASSWORD 'LOL';

-- The user should only have access to the schema it created
GRANT CREATE ON DATABASE postgres TO powersync_storage_user;