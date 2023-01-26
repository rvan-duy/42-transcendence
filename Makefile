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

re:	 stop build run
fre: fclean build run
restart: stop start

ps:
		docker-compose ps

lint: 
		docker exec -it frontend npm run lint || echo "\033[1;31mCould it be the container is not running?"


# make sure to not have mac node modules and then build and run with the makefile