#!/bin/sh
set -e

cd packages/db
pnpm run migrate:deploy 
cd ../..
pnpm run zero:deploy

exit 0