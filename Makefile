build:
	docker compose build

up:
	docker  compose up  -d 

up_foreground:
	docker  compose up

re: down
	docker  compose up --build --force-recreate -d 

down:
	docker compose down 

migrate: 

	docker compose exec auth-service npm run migrate
	docker compose exec chat-service npm run migrate
	docker compose exec game-service npm run migrate
	docker compose exec tournament-service npm run migrate
	docker compose exec user-management-service npm run migrate

