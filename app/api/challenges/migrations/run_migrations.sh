#!/bin/bash

# Check if environment variables are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "Error: Required environment variables are not set"
  echo "Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
  exit 1
fi

# Function to execute SQL file
execute_sql_file() {
  local file=$1
  echo "Executing $file..."
  curl -X POST \
    "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql" \
    -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"sql\": \"$(cat $file | tr -d '\n' | sed 's/"/\\"/g')\"}"
  echo
}

# Execute migrations in order
echo "Running migrations..."
execute_sql_file "000_setup_challenge_system.sql"

echo "Migrations completed" 