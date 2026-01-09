import fs from "fs";

import { executeRaw, migrateDb } from "@tyl/db";

const replaceName =
  "$POWERSYNC_PASSWORD_TO_BE_REPLACED_WITH_ENV_BEFORE_APPLYING";

const applyPsyncPassFromEnv = () => {
  if (!process.env.POWERSYNC_PASSWORD) {
    throw new Error("POWERSYNC_PASSWORD is not set");
  }

  const powersyncPassword = process.env.POWERSYNC_PASSWORD;

  const sqlContent = fs
    .readFileSync("./drizzle/0037_powersync.sql")
    .toString()
    .replaceAll(replaceName, powersyncPassword);

  fs.writeFileSync("./drizzle/0037_powersync.sql", sqlContent);
};

const migrator = async () => {
  if (!process.env.MIGRATE) {
    console.log("X: process.env.MIGRATE is not set, skipping migrations");
    const zeroPermissions = fs.existsSync("./zero-permissions.sql");

    const drizzleDir = fs.existsSync("./drizzle");

    console.log(
      zeroPermissions
        ? "+: Zero Permissions found"
        : "X: Zero Permissions not found",
    );
    console.log(
      drizzleDir ? "+: Drizzle dir found" : "X: Drizzle dir not found",
    );
    return;
  }

  applyPsyncPassFromEnv();

  console.log("+: Migrating database and zero");

  await migrateDb("./drizzle");
  const zeroPermissions = fs.readFileSync("./zero-permissions.sql").toString();

  if (!zeroPermissions.length) {
    throw new Error("No zero-permissions.sql found");
  }

  await executeRaw(zeroPermissions);
};

migrator().then(() => {
  console.log("Migrations done");
});
