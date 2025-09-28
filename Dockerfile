# syntax=docker/dockerfile:1

# Build stage: install dependencies and compile the Vite app
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies based on lockfile for reproducible builds
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code and build the production bundle
COPY . .
RUN npm run build

# Production stage: serve the compiled assets with nginx
FROM nginx:1.25-alpine AS runner

# Copy a custom nginx configuration tailored for SPA routing
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf

# Copy the build output from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
