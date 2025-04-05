# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Remove husky prepare script
RUN npm pkg delete scripts.prepare

# Install dependencies with legacy peer deps to resolve conflicts
# Skip husky installation in Docker
ENV HUSKY=0
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Remove husky prepare script
RUN npm pkg delete scripts.prepare

# Install production dependencies only with legacy peer deps
# Skip husky installation in Docker
ENV HUSKY=0
RUN npm install --omit=dev --legacy-peer-deps

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy .env file if it exists
COPY .env* ./

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:prod"] 