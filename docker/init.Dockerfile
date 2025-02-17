FROM node:22-alpine AS base
 
FROM base AS builder
WORKDIR /app

COPY . .

RUN cd packages/db
RUN npm run migrate:deploy
RUN cd ../..
RUN npm run zero:deploy