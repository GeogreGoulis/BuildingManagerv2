#!/bin/sh
set -e

# Wait for database to be ready
echo "Waiting for database..."
until node -e "
const { PrismaPg } = require('@prisma/adapter-pg');
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
adapter.provider.pool.query('SELECT 1').then(() => { console.log('DB ready'); process.exit(0); }).catch(() => process.exit(1));
" 2>/dev/null; do
  sleep 1
done

# Run migrations
echo "Running migrations..."
npx prisma migrate deploy

# Run seed if SEED=true
if [ "$SEED" = "true" ]; then
  echo "Seeding database..."
  npx tsx prisma/seed.ts
fi

# Start the app
echo "Starting app..."
exec node server.js
