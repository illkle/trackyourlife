# TODO: optimize this, becuase we for sure don't need all the dependencies of the server
FROM node:22-alpine AS base
 
FROM base AS worker

COPY . .

RUN npm install -g pnpm
RUN pnpm install

CMD ["./docker/init.sh"]