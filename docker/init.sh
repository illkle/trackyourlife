#!/bin/sh
set -e

node dist/index.cjs
#cd packages/db
#pnpm run migrate:deploy 
#cd ../..
#pnpm run zero:deploy

exit 0