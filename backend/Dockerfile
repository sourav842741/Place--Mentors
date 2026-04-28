# =========================================
# Backend Dockerfile - Node.js + Express
# =========================================
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Install system dependencies (if needed for native modules)
RUN apk add --no-cache python3 make g++

# Copy package files first for better layer caching
COPY package*.json ./

# Install production dependencies only
# Note: nodemon is in dependencies, but we use `node index.js` for production
RUN npm install --omit=dev

# Copy application source code
COPY . .

# Create uploads directory for multer (if used)
RUN mkdir -p uploads

# Expose backend port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Start the server
CMD ["node", "index.js"]

