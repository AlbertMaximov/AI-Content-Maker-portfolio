# Сборка приложения
FROM node:22-slim AS builder

WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm ci

# Копируем исходный код
COPY . .

# Пробрасываем переменную окружения для Vite (требуется во время сборки для встраивания ключа)
ARG VITE_GEMINI_API_KEY
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY

# Собираем клиентское приложение и бекенд
RUN npm run build

# Финальный легковесный образ
FROM node:22-slim

WORKDIR /app

# Копируем только необходимые файлы для продакшена
COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

# Указываем порт по умолчанию
ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "start"]
