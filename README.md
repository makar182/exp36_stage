# Telegram Mini App Greeting

Простое одностраничное приложение на React и TypeScript для Telegram Mini App. Страница содержит форму ввода ФИО, по кнопке выводится приветствие.

## Скрипты

- `npm install` — установка зависимостей.
- `npm run dev` — запуск в режиме разработки.
- `npm run build` — сборка production-версии.
- `npm run preview` — предпросмотр собранного приложения.

## Структура

- `src/App.tsx` — основная страница с формой.
- `src/App.css` — стили компонента.
- `src/index.css` — глобальные стили приложения.

## Деплой в Telegram Mini App

1. Соберите проект командой `npm run build`.
2. Загрузите содержимое папки `dist` на хостинг, доступный по HTTPS.
3. Укажите URL в настройках Telegram Mini App.
