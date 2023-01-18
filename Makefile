build:
		docker-compose build

start:
		docker-compose up -d

stop:
		docker-compose down

clean:
		docker-compose down --remove-orphans

fclean:
		docker-compose down --volumes --remove-orphans

re:	fclean build

ps:
		docker-compose ps

