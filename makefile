up-full-nb:
	docker compose -f ./docker/docker-compose-coolify-v2.yml -f ./docker/docker-compose-from-coolify.local.yml  --env-file .env up
up-full-b:
	docker compose -f ./docker/docker-compose-coolify-v2.yml -f ./docker/docker-compose-from-coolify.local.yml  --env-file .env up --build