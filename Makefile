.PHONY: prepare run test down setup

COMPOSE = docker-compose

default: run

dependencies:
	@echo "\e[32;1mSetup production dependencies...`tput sgr0`"
	$(COMPOSE) up -d db phpmyadmin

proxy:
	@touch acme.json && chmod 0600 acme.json

prepare: proxy dependencies
	@echo "\e[32;1mSetup OAuth configurations...`tput sgr0`"
	@echo $(shell ln -s  ../../../config/config.json components/oauth/config/config.json)

rebuild: prepare
	@echo "\e[32;1mRebuild Eauth app in production mode...`tput sgr0`"
	docker tag pelith/node-eauth-server pelith/node-eauth-server-old
	$(COMPOSE) up -d --no-deps --build app
	docker image rm pelith/node-eauth-server-old

run: prepare
	@echo "\e[32;1mRun Eauth app in production mode...`tput sgr0`"
	$(COMPOSE) up -d app proxy

down:
	@echo "\e[32;1mEauth stopping...`tput sgr0`"
	$(COMPOSE) down
