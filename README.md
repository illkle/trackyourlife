### TrackYourLife

App to track stuff. It started as a self-hosted habit\mood\stats tracker and I want to evolve it into app aggregating all data about you and your environement to ponder on, analyze and get better. Maybe you can call it OSS self-hosted [Exist](https://exist.io/) alternative.

![TrackYourLife screenshot](tooling/images/image.png)

### Current state

updated: 30 August 2025

No interest in developing this project currently. Though it's usable and available at [tyl.illkle.com](https://tyl.illkle.com/) (use at your own risk: data loss may happen)

### Development

1. Start postgres

```
docker run -d --name zero-postgres \
  -e POSTGRES_PASSWORD="password" \
  -p 5432:5432 \
  postgres:16-alpine \
  postgres -c wal_level=logical
```

2. Copy `.env.example` to `.env`
3. Create 'zeroTemp' folder(right here)
4. Start zero `pnpm run dev:zero-cache`
   (if you are getting `Error: Could not locate the bindings file` run `pnpm approve-builds` and approve all)
5. Start dev `pnpm run dev`
