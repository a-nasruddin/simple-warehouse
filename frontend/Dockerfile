# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies separately to leverage caching
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Production Image
FROM node:18-alpine
WORKDIR /app

# Set environment
ENV NODE_ENV=production

# Copy necessary files from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Expose port and run Next.js
EXPOSE 3000
CMD ["npm", "run", "start", "--", "--hostname", "0.0.0.0"]
