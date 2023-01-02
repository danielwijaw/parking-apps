SELECT 'CREATE DATABASE parking'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'parking')\gexec