# Задачи по комментированию кода

Для каждого файла с кодом необходимо создать комментарии к каждой строке. Ниже приведён список индивидуальных задач.

## Как запустить задачи

Чтобы зафиксировать запуск работ и получить консольный список всех задач, выполните скрипт `./scripts/run-commenting-tasks.sh`. Он считывает текущий перечень из этого файла и выводит нумерованный список задач, подтверждая, что каждая из них поставлена в работу.

## Директория `src`

### Корневые файлы
- [ ] `src/main.tsx` — прокомментировать каждую строку кода в файле.
- [ ] `src/index.css` — прокомментировать каждую строку в файле стилей.
- [ ] `src/vite-env.d.ts` — прокомментировать каждую строку объявления типов.

### Директория `app`
- [ ] `src/app/App.tsx` — прокомментировать каждую строку компонента.
- [ ] `src/app/index.ts` — прокомментировать каждую строку экспортов.
- [ ] `src/app/styles/app.css` — прокомментировать каждую строку стилей.

### Директория `pages`
- [ ] `src/pages/home/index.ts` — прокомментировать каждую строку модуля.
- [ ] `src/pages/home/ui/home-page.tsx` — прокомментировать каждую строку компонента страницы.

### Директория `features/short-links`
- [ ] `src/features/short-links/index.ts` — прокомментировать каждую строку экспортов.
- [ ] `src/features/short-links/model/use-short-links.ts` — прокомментировать каждую строку хука.
- [ ] `src/features/short-links/model/create-short-link-schema.ts` — прокомментировать каждую строку схемы валидации.
- [ ] `src/features/short-links/ui/short-link-form.tsx` — прокомментировать каждую строку компонента формы.

### Директория `entities/short-link`
- [ ] `src/entities/short-link/index.ts` — прокомментировать каждую строку экспортов.
- [ ] `src/entities/short-link/model/types.ts` — прокомментировать каждую строку объявлений типов.
- [ ] `src/entities/short-link/lib/format.ts` — прокомментировать каждую строку утилиты форматирования.

### Директория `widgets/short-links-dashboard`
- [ ] `src/widgets/short-links-dashboard/index.ts` — прокомментировать каждую строку экспортов.
- [ ] `src/widgets/short-links-dashboard/ui/short-links-dashboard.tsx` — прокомментировать каждую строку компонента дашборда.
- [ ] `src/widgets/short-links-dashboard/ui/short-links-header.tsx` — прокомментировать каждую строку компонента шапки.
- [ ] `src/widgets/short-links-dashboard/ui/short-links-list.tsx` — прокомментировать каждую строку компонента списка.
- [ ] `src/widgets/short-links-dashboard/ui/short-links-skeleton.tsx` — прокомментировать каждую строку компонента skeleton.
- [ ] `src/widgets/short-links-dashboard/ui/short-link-row.tsx` — прокомментировать каждую строку компонента строки списка.

### Директория `shared`
- [ ] `src/shared/api/url-shortener.ts` — прокомментировать каждую строку API-клиента.
- [ ] `src/shared/lib/clipboard.ts` — прокомментировать каждую строку утилиты буфера обмена.
- [ ] `src/shared/lib/use-telegram-theme.ts` — прокомментировать каждую строку хука темы Telegram.
- [ ] `src/shared/notifications/index.ts` — прокомментировать каждую строку экспортов.
- [ ] `src/shared/notifications/types.ts` — прокомментировать каждую строку объявлений типов.
- [ ] `src/shared/notifications/use-notifications.ts` — прокомментировать каждую строку хука уведомлений.
- [ ] `src/shared/notifications/notification-provider.tsx` — прокомментировать каждую строку провайдера уведомлений.
- [ ] `src/shared/notifications/ui/notification-center.tsx` — прокомментировать каждую строку компонента центра уведомлений.

## Файлы конфигурации и инфраструктуры
- [ ] `vite.config.ts` — прокомментировать каждую строку конфигурации Vite.
- [ ] `tsconfig.json` — прокомментировать каждую строку настроек TypeScript.
- [ ] `tsconfig.node.json` — прокомментировать каждую строку настроек TypeScript для Node.
- [ ] `docker-compose.yml` — прокомментировать каждую строку конфигурации Docker Compose.
- [ ] `Dockerfile` — прокомментировать каждую строку Dockerfile.
- [ ] `.eslintrc.cjs` — прокомментировать каждую строку конфигурации ESLint.
- [ ] `package.json` — прокомментировать каждую строку зависимостей и скриптов.
- [ ] `package-lock.json` — прокомментировать каждую строку блокировки зависимостей.
- [ ] `index.html` — прокомментировать каждую строку HTML-шаблона.
- [ ] `.github/workflows/deploy.yml` — прокомментировать каждую строку workflow.
- [ ] `deploy/README.md` — прокомментировать каждую строку инструкции по деплою.
- [ ] `deploy/certs/README.md` — прокомментировать каждую строку инструкции по сертификатам.
- [ ] `docs/refactoring-notes.md` — прокомментировать каждую строку заметок по рефакторингу.

