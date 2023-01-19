build:
		docker-compose build

start:
		docker-compose up -d

run:	start

stop:
		docker-compose down

clean:
		docker-compose down --remove-orphans

fclean:
		docker-compose down --volumes --remove-orphans
		
		# rm -rf frontend/rubenpong/node_modules

re:	clean build run
fre: fclean build run

ps:
		docker-compose ps
