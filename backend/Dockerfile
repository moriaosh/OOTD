# OOTD Backend Dockerfile
# Node.js + Express + Prisma

# Use Node.js LTS version
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies needed for Prisma
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy the rest of the application
COPY . .

# Expose port 5000
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/auth || exit 1

# Start: wait for DB, run migrations, then start server
CMD sh -c "echo 'Waiting for database...' && sleep 5 && npx prisma migrate deploy && npx prisma generate && npm start"
