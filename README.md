### TrackYourLife

App to track stuff. It started as a self-hosted habit\mood\stats tracker and I want to evolve it into app aggregating all data about you and your environement to ponder on, analyze and get better. Maybe you can call it OSS self-hosted [Exist](https://exist.io/) alternative.

![TrackYourLife screenshot](tooling/images/image.png)

### Current state

updated: 1 February 2025

I use it personally to track my stuff, however it's not stable or production ready. It's available at [tyl.illkle.com](https://tyl.illkle.com/) (use at your own risk: data loss may happen)

Current goals:

1. Data improvements: new data types with multiple entries per day and custom attributes.
2. Data import\export, receive push push public API, make pull via cron.
3. UI\UX improvements: rethink and unify design.


### Development

- Run Postgres somewhere. Create `.env` similar to `.env.example`
- `pnpm i` `pnpm run dev`
- Migrations are applied automatically on startup. To generate migrations after updating schema use `pnpm run db:generate`
- Run Drizzle Studio to inspect database with `db:studio`
- To add something from `shadcn/ui` first do `cd app/server` and then run the command.
