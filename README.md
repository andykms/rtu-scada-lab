# Программа конструктор SCADA/киберфизических систем

## Технологии

- Angular
- TypeScript
- Node.js
- Electron

## Установка зависимостей

```bash
# Корневые зависимости (Electron, electron-builder, tsc и т.д.)
npm install

# Зависимости Angular-приложения
cd src/rtu-scada-frontend && npm install
```

## Скрипты

### Разработка

```bash
# Запустить Angular dev server (http://localhost:4200)
npm start

# Собрать Electron-часть и открыть окно приложения,
# подключившись к уже запущенному dev server'у
npm run electron:dev

# Автопересборка main/preload при изменениях в src/electron
npm run electron:watch
```

### Продакшен-сборка

```bash
# Собрать Angular в продакшен-режиме и собрать установщик приложения
npm run electron:prod
```

Собранные установщики попадают в папку `release/`.

## Структура

- `src/electron/` — Electron main/preload процессы (TypeScript)
- `src/rtu-scada-frontend/` — Angular-приложение
- `dist/electron/` — скомпилированная Electron-часть
- `dist/rtu-scada-frontend/` — продакшен-билд Angular
