build:
		@docker-compose build || echo "\033[1;31mDid you start docker?"

start:
		docker-compose up -d

run:	start

stop:
		docker-compose down

clean:
		docker-compose down --remove-orphans

fclean:
		docker-compose down --volumes --remove-orphans

re:	 			stop build run
fre: 			fclean build run
br:				build run
restart: 	stop start

ps:
		docker-compose ps

lint: 
		@bash .github/scripts/eslint.sh

# make sure to not have mac node modules and then build and run with the makefile