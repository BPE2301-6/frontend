# Frontend

## Требования
- Node.js 22 LTS (или 20 LTS)
- Yarn (рекомендуется)

## Быстрый старт

```bash
cp .env.example .env     # задать VITE_API_URL при необходимости
yarn install             # установить зависимости
yarn dev                 # запустить дев-сервер
```
Альтернативно через make:
```bash
make env
make install
make dev
```

## Скрипты
- yarn dev — запуск дев-сервера Vite
- yarn build — сборка прод-бандла в dist/
- yarn preview — локальный сервер предпросмотра собранного

То же самое есть в Makefile:

- make install - установка зависимостей
- make dev - запуск dev сервера
- make build - сборка в ./dist
- make preview - просмотр билда в ./dist
- make clean - удаление node_modules и ./dist
- make env - копирование .env.example в .env

## Переменные окружения

- VITE_API_URL — базовый URL бэкенда

## Структура каталогов

```bash
src/
├─ app/          — каркас приложения (вход, роутинг, общие макеты)
├─ pages/        — страницы по роутам
├─ widgets/      — крупные блоки UI (борд, навбар)
├─ features/     — маленькие действия пользователя (формы/кнопки)
├─ entities/     — основные домены (пользователь, проект, задача)
└─ shared/       — общее: UI-кнопки/инпуты, API клиент, стили, хуки, утилиты
```

## Назначение ключевых файлов

- index.html — HTML-шаблон, куда монтируется React (#root)
- vite.config.js — плагин React, алиас @/ → src/
- tailwind.config.js / postcss.config.js — стили через Tailwind
- .env — адрес бэкенда для запросов
- package.json — зависимости и скрипты
- Makefile — удобные команды для новичка

## Деплой без Docker (рекомендуется для статики)

1. Собирать артефакты в CI (или локально): yarn build → папка dist/
2. Копировать dist/ на сервер, например, в /var/www/task-tracker/dist/
3. Настроить nginx на раздачу статики из этой папки

### Пример location (фрагмент конфигурации):
```
server {
    listen 80;
    server_name tracker.example.com;

    root /var/www/task-tracker/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # если бэкенд на другом домене:
    # location /api/ { proxy_pass https://api.example.com/; }
}
```
