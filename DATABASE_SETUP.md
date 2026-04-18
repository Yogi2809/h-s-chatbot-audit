# Database Setup Guide

## Overview

This guide explains how to set up PostgreSQL and initialize the database for the H&S Chatbot Audit System.

## Prerequisites

- PostgreSQL 12+ installed
- Node.js 18+
- npm or yarn

## Local Development Setup

### 1. Install PostgreSQL

**macOS (using Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
```

**Windows:**
Download from [postgresql.org](https://www.postgresql.org/download/windows/)

### 2. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE h_s_chatbot_audit;

# Create user
CREATE USER chatbot_user WITH PASSWORD 'your-secure-password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE h_s_chatbot_audit TO chatbot_user;

# Exit psql
\q
```

### 3. Setup Environment Variables

```bash
# Copy example env file
cp .env.example .env.local

# Edit .env.local with your database URL
# DATABASE_URL=postgresql://chatbot_user:your-secure-password@localhost:5432/h_s_chatbot_audit
```

### 4. Run Database Migrations

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Seed database with test data
npm run prisma:seed
```

### 5. Verify Setup

```bash
# Test database connection
npm run prisma:validate

# Open Prisma Studio to view database
npm run prisma:studio
```

## Production Setup (Vercel + Neon)

### 1. Create Neon PostgreSQL Database

1. Go to [neon.tech](https://neon.tech)
2. Sign up and create a project
3. Create a database
4. Copy the connection string

### 2. Add to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Settings → Environment Variables
4. Add `DATABASE_URL` with your Neon connection string
5. Redeploy

### 3. Run Migrations

```bash
# Set environment
export DATABASE_URL="postgresql://..."

# Run migrations
npm run prisma:migrate:deploy
```

## Database Schema

### Conversation
- `id`: UUID
- `sessionId`: Session identifier
- `appointmentId`: Appointment reference
- `sessionType`: Type of session
- `content`: Message content
- `createdAt`: Creation timestamp
- `auditResults`: Related audit findings

### AuditResult
- `id`: UUID
- `conversationId`: Reference to conversation
- `issueType`: Type of issue detected
- `severity`: low/medium/high
- `message`: Issue description
- `score`: Quality score (0-100)

### AuditRun
- `id`: UUID
- `fileName`: Original CSV file name
- `totalRecords`: Total records processed
- `status`: processing/completed/failed
- `averageScore`: Average quality score
- `summary`: Issue counts by severity

## Useful Commands

```bash
# Generate Prisma client
npm run prisma:generate

# View database schema
npm run prisma:studio

# Create migration
npm run prisma:migrate -- --name description

# Run pending migrations
npm run prisma:migrate:deploy

# Rollback database
npm run prisma:migrate:resolve

# Seed database
npm run prisma:seed

# Validate schema
npm run prisma:validate

# Format schema
npm run prisma:format
```

## Troubleshooting

### Connection Refused
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
- Ensure PostgreSQL is running: `brew services start postgresql@15`
- Check DATABASE_URL is correct

### Password Authentication Failed
```
FATAL: password authentication failed for user "chatbot_user"
```
- Verify password in DATABASE_URL
- Check user exists in PostgreSQL

### Database Does Not Exist
```
FATAL: database "h_s_chatbot_audit" does not exist
```
- Create database: `createdb -U postgres h_s_chatbot_audit`
- Run migrations: `npm run prisma:migrate:deploy`

## Backups

### Local Backup
```bash
# Backup database
pg_dump h_s_chatbot_audit > backup.sql

# Restore from backup
psql h_s_chatbot_audit < backup.sql
```

### Cloud Backups
- Neon provides automatic backups
- Vercel PostgreSQL integrations also handle backups

## Next Steps

1. ✅ Database schema created
2. ✅ Migrations ready
3. ⏳ Set DATABASE_URL in .env
4. ⏳ Run `npm run prisma:migrate:deploy`
5. ⏳ Start app: `npm run dev`

## Quick Start

```bash
# 1. Setup environment
export DATABASE_URL="postgresql://localhost/h_s_chatbot_audit"

# 2. Run migrations
npm run prisma:migrate:deploy

# 3. Start development server
npm run dev

# 4. Open http://localhost:3000
```

## Support

- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Neon Documentation](https://neon.tech/docs/introduction)
