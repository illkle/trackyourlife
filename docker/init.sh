#!/bin/sh
set -e

cd packages/db
npm run migrate:deploy 
cd ../..
npm run zero:deploy

exit 0