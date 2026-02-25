import fs from 'fs';
import path from 'path';

import { migrateDb } from '@tyl/db/server/index';

const dir =
  process.env.MIGRATE === 'DEV' ? '../../packages/db/drizzle' : './drizzle';

const replaceName =
  '$POWERSYNC_PASSWORD_TO_BE_REPLACED_WITH_ENV_BEFORE_APPLYING';

const applyPsyncPassFromEnv = () => {
  const powersyncPassword = process.env.POWERSYNC_PASSWORD ?? 'ERR';

  const sqlContent = fs
    .readFileSync(path.join(dir, '/0037_powersync.sql'))
    .toString()
    .replaceAll(replaceName, powersyncPassword);

  fs.writeFileSync(path.join(dir, '/0037_powersync.sql'), sqlContent);
};

const migrator = async () => {
  console.log('---', process.env.MIGRATE, dir);
  if (!process.env.MIGRATE) {
    console.log(process.env);
    console.log('X: process.env.MIGRATE is not set, skipping migrations');

    const drizzleDir = fs.existsSync(dir);

    console.log(
      drizzleDir ? '+: Drizzle dir found' : 'X: Drizzle dir not found'
    );
    return;
  }

  applyPsyncPassFromEnv();

  console.log('+: Migrating database');

  await migrateDb(dir);
};

migrator().then(() => {
  console.log('Migrations done');
});
