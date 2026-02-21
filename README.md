### TrackYourLife

App to track stuff. I rewrite it once a year to experiment with new tech, but I hope that after current rewrite I will actually develop features 😎🤙
![TrackYourLife screenshot](tooling/images/image.png)

Deployed version: https://tyl.illkle.com (unstable, no guarantees)

---

### Development

1. Copy the env template and update secrets:

```
cp .env.example .env
```

2. Start docker compose:

```
pnpm infra:up
```

3. Start development:

```
pnpm dev
```
