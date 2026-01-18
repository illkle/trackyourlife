### TrackYourLife

App to track stuff. I rewrite it once a year to experiment with new tech, but I hope that after current rewrite I will actually develop features 😎🤙
![TrackYourLife screenshot](tooling/images/image.png)

Deployed version: https://tyl.illkle.com (unstable, no guarantees)

---

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
