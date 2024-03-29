subject: 
		@docker compose up --build -d
re:	 			build stop run
restart: 	stop start

# build the broject
build:
		@bash IP
		@docker compose build || echo "\033[1;31mDid you start docker?"

address:
		@bash IP

start:
		docker compose up -d
run: start

stop:
		docker compose down

clean:
		docker compose down --remove-orphans

# danger, removes database volume!
fclean:
		docker compose down --volumes --remove-orphans
fre: 			fclean build run

# show container status
ps:
		docker compose ps

# linting
lint:
		@bash .github/scripts/eslint.sh
lfix:
		@bash .github/scripts/eslint.sh --fix
flint: lfix

# add object from seed file to DB
seed:
		@docker exec -it backend npx prisma db seed \
			|| echo "\033[1;31mCould it be the container is not running?"

# view DB online
studio:
		export DATABASE_URL='postgres://dbuser:dbpassword@localhost:5432/ruubdb' && \
		cd backend/volume/ && npx prisma studio
