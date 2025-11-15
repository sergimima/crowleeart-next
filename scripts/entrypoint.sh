#!/bin/sh
set -e

echo "🚀 Starting Crowlee Art Application..."

# Wait for database to be ready
echo "⏳ Waiting for database..."
until npx prisma db execute --command "SELECT 1" > /dev/null 2>&1; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "✅ Database is ready!"

# Run migrations in production (use migrate deploy)
echo "📦 Running database migrations..."
npx prisma migrate deploy

# Or if you prefer db push (not recommended for production):
# echo "📦 Pushing database schema..."
# npx prisma db push --accept-data-loss

# Start the application
echo "🎉 Starting Next.js application..."
exec node server.js

