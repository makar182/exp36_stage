# Деплой фронтенда exp36_stage

Подготовленные файлы повторяют подход из репозитория `makar/url-shortener`: приложение собирается в Docker-контейнере, статику обслуживает Nginx, а запуск выполняется через `docker compose`.

## Предварительные требования

* Docker 24+ и Docker Compose Plugin на удалённом сервере.
* Доменное имя, которое указывает на сервер (A/AAAA записи).
* Открытые TCP-порты 80 и 443.
* Клонированный репозиторий проекта на сервере.

## Выпуск TLS-сертификата (Let's Encrypt)

1. Установите certbot (пример для Debian/Ubuntu):

   ```bash
   sudo apt update
   sudo apt install certbot
   ```

2. Остановите запущенный Nginx/контейнеры, которые слушают 80 порт, чтобы certbot мог поднять временный веб-сервер:

   ```bash
   docker compose down
   ```

3. Выпустите сертификат для нужных доменов:

   ```bash
   sudo certbot certonly --standalone -d example.com -d www.example.com
   ```

4. Скопируйте файлы сертификата в `deploy/certs` (или настройте bind-монты на реальные файлы):

   ```bash
   sudo cp /etc/letsencrypt/live/example.com/fullchain.pem /path/to/app/deploy/certs/
   sudo cp /etc/letsencrypt/live/example.com/privkey.pem /path/to/app/deploy/certs/
   sudo cp /etc/letsencrypt/options-ssl-nginx.conf /path/to/app/deploy/certs/
   sudo cp /etc/letsencrypt/ssl-dhparams.pem /path/to/app/deploy/certs/
   sudo chown $(id -u):$(id -g) /path/to/app/deploy/certs/*.pem /path/to/app/deploy/certs/options-ssl-nginx.conf
   ```

   > Файлы `.pem` не хранятся в git-репозитории и игнорируются `.gitignore`. В репозитории лежат безопасные заготовки, которые можно заменить полученными файлами.

## Автоматическое продление сертификата

Let's Encrypt выдаёт сертификаты на 90 дней. Certbot по умолчанию устанавливает `systemd`-таймер или cron-задачу, которая выполняет команду:

```bash
sudo certbot renew --quiet
```

После успешного продления перезапустите контейнер, чтобы он подхватил обновлённые файлы:

```bash
cd /path/to/app
sudo docker compose restart frontend
```

Если автоматизация отключена, добавьте cron-задачу вручную:

```bash
sudo crontab -e
# Добавьте строку
0 3 * * * certbot renew --quiet && docker compose -f /path/to/app/docker-compose.yml restart frontend
```

## Сборка и запуск

1. Скопируйте репозиторий на сервер:

   ```bash
   git clone <repo_url> app && cd app
   ```

2. Соберите и поднимите контейнер в режиме демона:

   ```bash
   docker compose up -d --build
   ```

3. Проверьте статус контейнера:

   ```bash
   docker compose ps
   ```

Приложение будет доступно по HTTPS на порту `443` (HTTP-порт 80 выполняет редирект на HTTPS).

## Обновление

1. Обновите код:

   ```bash
   git pull
   ```

2. Пересоберите контейнер и перезапустите сервис:

   ```bash
   docker compose up -d --build
   ```

## Логи и отладка

* Просмотр логов:

  ```bash
  docker compose logs -f
  ```

* Остановка и удаление контейнеров:

  ```bash
  docker compose down
  ```

## Структура деплой-файлов

* `Dockerfile` — multi-stage сборка, которая подготавливает production-бандл Vite и отдаёт его через Nginx.
* `deploy/nginx.conf` — конфигурация Nginx для single-page-приложения (включает HTTPS и редирект с HTTP).
* `deploy/certs/` — каталог для TLS-сертификатов и связанных файлов.
* `docker-compose.yml` — единая точка запуска контейнера.
* `.dockerignore` — исключает лишние файлы при сборке образа.
