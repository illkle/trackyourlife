import fs from "fs";

import { executeRaw, migrateDb } from "@tyl/db";

const migrator = async () => {
  if (!process.env.MIGRARATE) {
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
