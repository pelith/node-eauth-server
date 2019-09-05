.PHONY: prepare run test down setup

COMPOSE = docker-compose

default: run

dependencies:
	@echo "Setup production dependencies..."
	$(COMPOSE) up -d db phpmyadmin

proxy:
	@touch acme.json && chmod 0600 acme.json

prepare: proxy dependencies
	@echo "Setup OAuth configurations..."
	@echo $(shell rm components/oauth/config/config.json & ln -s  ../../../config/config.json components/oauth/config/config.json)

rebuild: prepare
	@echo "Rebuild Eauth app in production mode..."
	docker tag pelith/node-eauth-server pelith/node-eauth-server-old
	$(COMPOSE) up -d --no-deps --build app
	docker image rm pelith/node-eauth-server-old

run: prepare
	@echo "Build Eauth app in production mode..."
	$(COMPOSE) up -d app proxy

down:
	@echo "Eauth stopped..."
	$(COMPOSE) down
