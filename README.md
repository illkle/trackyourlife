### TrackYourLife

App to track stuff. It started as a self-hosted habit\mood\stats tracker and I want to evolve it into app aggregating all data about you and your environement to ponder on, analyze and get better. Maybe you can call it OSS self-hosted [Exist](https://exist.io/) alternative.

![TrackYourLife screenshot](tooling/images/image.png)

### Current state

updated: 2 December 2024

I use it personally to track my stuff, however it's not stable or production ready. Publically hosted version available at [tyl.illkle.com](https://tyl.illkle.com/) (use at your own risk)

Current goals:

1. Polish the overall experince, refactor ugly stuff, improve design.
2. Data impromenets: grouped trackables, multiple entries for one day, agregated trackables, data conversions.
3. System for API integrations running on CRON or using public api.
4. Develop mobile app

### Development

- Run Postgres somewhere. Create `.env` similar to `.env.example`
- `pnpm i` `pnpm run dev`
- Migrations are applied automatically on startup. To generate migrations after updating schema use `pnpm run db:generate`
- Run Drizzle Studio to inspect database with `db:studio`
- To add something from `shadcn/ui` first do `cd app/server` and then run the command.