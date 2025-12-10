# Frontend

## Требования

- Node.js 22 LTS
- Yarn (рекомендуется)

## Быстрый старт

```bash
# создайте .env и пропишите VITE_API_URL (+ VITE_DEFAULT_PROJECT_ID по желанию)
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
- VITE_DEFAULT_PROJECT_ID — id проекта по умолчанию (если не передан query-параметр `projectId` на странице доски)

Пример `.env` (создайте рядом с package.json):

```
VITE_API_URL=http://localhost:3000
VITE_DEFAULT_PROJECT_ID=123e4567-e89b-12d3-a456-426614174000 # замените на реальный id проекта из вашего бэкенда
```

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
