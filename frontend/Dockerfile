# =========================================
# Stage 1: Build React App with Vite
# =========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install deps
RUN npm install

# Copy source
COPY . .

# Build args from docker-compose
ARG VITE_SERVER_URL
ARG VITE_SENTRY_DSN

ENV VITE_SERVER_URL=$VITE_SERVER_URL
ENV VITE_SENTRY_DSN=$VITE_SENTRY_DSN

# Build frontend
RUN npm run build

# =========================================
# Stage 2: Serve with Nginx
# =========================================
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]