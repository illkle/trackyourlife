### TrackYourLife

App to track stuff. It started as a self-hosted habit\mood\stats tracker and I want to evolve it into app aggregating all data about you and your environement to ponder on, analyze and get better. Maybe you can call it OSS self-hosted [Exist](https://exist.io/) alternative.

![TrackYourLife screenshot](tooling/images/image.png)

### Development

```
PS_VITE_DEPLOY_DOMAIN=http://localhost:3000
PS_AUTH_DOMAIN=http://host.docker.internal:3000/api/auth/jwks
VITE_DEPLOY_DOMAIN=http://localhost:3000
VITE_POWERSYNC_DOMAIN=http://localhost:8080
BETTER_AUTH_SECRET=wNln7kaAaeglqPAfthf4YFzuUyqDWTOZL
MIGRATE=DEV
DATABASE_URL=postgres://postgres:password@localhost:5432/postgres
PS_DATABASE_URL=postgres://postgres:password@host.docker.internal:5432/postgres
```

```
docker compose -f docker/docker-compose-dev.yml up -d --build
```

`pnpm run dev`
