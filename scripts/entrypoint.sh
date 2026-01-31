#!/bin/sh
set -e

echo "🚀 Starting Crowlee Art Application..."

# Wait for database to be ready
echo "⏳ Waiting for database..."
until echo "SELECT 1" | npx prisma db execute --stdin > /dev/null 2>&1; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "✅ Database is ready!"

# Push database schema (db push)
echo "📦 Pushing database schema..."
npx prisma db push

# Generate Prisma Client (just in case)
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Start the application
echo "🎉 Starting Next.js application..."
exec node server.js

