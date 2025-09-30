# Требуется: Node.js 22 LTS (или 20 LTS) и Yarn.
SHELL := /bin/bash

PKG ?= yarn

.PHONY: help
help:
	@echo "Возможные таргеты:"
	@echo "  make install        - установка зависимостей"
	@echo "  make dev            - запуск dev сервера (Vite)"
	@echo "  make build          - сборка в ./dist"
	@echo "  make preview        - превью билда локально"
	@echo "  make clean          - убрать node_modules и dist"
	@echo "  make env            - скопировать .env.example в .env (если не существует)"

.PHONY: install
install:
	$(PKG) install

.PHONY: dev
dev:
	$(PKG) run dev

.PHONY: build
build:
	$(PKG) run build

.PHONY: preview
preview:
	$(PKG) run preview

.PHONY: clean
clean:
	rm -rf node_modules dist

.PHONY: env
env:
	@test -f .env || cp .env.example .env
	@echo ".env ready"
