# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy source code
COPY . .
# Copy environment variables (if needed for build)
COPY ../.env .env

# Build the app
RUN npm run build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app

# Copy built frontend
COPY --from=builder /app/dist ./dist

# Install serve globally
RUN npm install -g serve

EXPOSE 4173
CMD ["serve", "-s", "dist", "-l", "4173"]