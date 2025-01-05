.PHONY: start-e
start-e: 
	docker compose --env-file .env -f docker-compose-external-pg.yml up -d --build

.PHONY: stop-e
stop-e:
	docker compose --env-file .env -f docker-compose-external-pg.yml down

.PHONY: start-wpg
start-wpg: 
	docker compose --env-file .env -f docker/docker-compose-with-pg.yml up -d --build

.PHONY: stop-wpg
stop-wpg:
	docker compose --env-file .env -f docker/docker-compose-with-pg.yml down

