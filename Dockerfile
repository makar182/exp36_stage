# syntax=docker/dockerfile:1

FROM node:20-alpine AS builder
WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build

FROM nginx:1.25-alpine AS production
WORKDIR /usr/share/nginx/html

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist ./

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
