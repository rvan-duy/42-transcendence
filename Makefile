start:
	docker-compose up -d

stop:
	docker-compose down

build:
	docker-compose build

clean:
	docker-compose down --remove-orphans

fclean:
	docker-compose down --volumes --remove-orphans


