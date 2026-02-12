build:
	docker compose build --parallel

up:
	docker  compose up  -d 

up_foreground:
	docker  compose up

re: down build up

down:
	docker compose down 

logs:
	docker compose logs -f

fclean: down
	docker system prune -af
	docker volume prune -f

push: down
	git add .
	git commit -m "$(ARGS)"
	git push

.PHONY: all push install build up down re  fclean logs 
