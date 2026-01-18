#!/bin/sh
set -e

echo "Starting OOTD Backend..."

# Wait for database to be ready
echo "Waiting for database..."
sleep 5

# Run Prisma migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Generate Prisma client (in case of updates)
echo "Generating Prisma client..."
npx prisma generate

# Start the application
echo "Starting server..."
exec npm start
