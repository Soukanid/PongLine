install:
	cd frontend && npm install
	cd services/auth-service && npm install
	cd services/chat-service && npm install
	cd services/game-service && npm install
	cd services/tournament-service && npm install
	cd services/user-management-service && npm install

build:
	docker compose build --parallel

up:
	docker  compose up  -d 

up_foreground:
	docker  compose up

re: down build up

down:
	docker compose down 

migrate: 

	docker compose exec auth-service npm run migrate
	docker compose exec chat-service npm run migrate
	docker compose exec game-service npm run migrate
	docker compose exec tournament-service npm run migrate
	docker compose exec user-management-service npm run migrate

logs:
	docker compose logs -f

fclean: down
	docker system prune -af
	docker volume prune -f

show_database:
	docker compose exec chat-service sqlite3 data/chat.sqlite

push: down
	git add .
	git commit -m "$(ARGS)"
	git push

.PHONY: all push install build up down re migrate fclean logs show_database
