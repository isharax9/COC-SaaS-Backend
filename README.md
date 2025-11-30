# COC-SaaS Backend

> NestJS backend for COC-SaaS - Clash of Clans Clan Management Platform

## Features

- 🔐 **JWT Authentication** - Secure user authentication with refresh tokens
- 🏘️ **Multi-Tenancy** - Row-level security for clan data isolation
- 🎮 **CoC API Integration** - Real-time data sync with Clash of Clans API
- ⚙️ **RBAC** - Role-based access control (Member, Elder, Co-Leader, Leader, Super Admin)
- 📦 **TypeORM** - PostgreSQL with migrations support
- 🔄 **BullMQ** - Background job processing for API polling
- 📊 **Swagger** - Auto-generated API documentation

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Clash of Clans API Token ([Get one here](https://developer.clashofclans.com/))

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npm run migration:run

# Start development server
npm run start:dev
```

### Using Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

## Project Structure

```
src/
├── modules/
│   ├── auth/           # Authentication & JWT
│   ├── user/           # User management
│   ├── tenant/         # Clan (tenant) management
│   ├── ingestion/      # CoC API integration
│   ├── war/            # War tracking (Phase 2)
│   ├── chat/           # Real-time chat (Phase 3)
│   └── analytics/      # Statistics (Phase 4)
├── common/
│   ├── decorators/     # Custom decorators
│   ├── dto/            # Shared DTOs
│   ├── entities/       # Base entities
│   └── enums/          # Role enums
├── config/          # Configuration files
└── main.ts          # Application entry point
```

## API Endpoints

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login

### Users

- `GET /users/me` - Get current user profile
- `POST /users/link-player` - Link CoC player to account
- `GET /users/players` - Get linked players

### Tenants (Clans)

- `POST /tenants` - Register new clan
- `GET /tenants/my-clans` - Get user's clans

## Environment Variables

See `.env.example` for all available configuration options.

Key variables:
```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/coc_saas
JWT_SECRET=your-secret-key
COC_API_TOKEN=your-coc-api-token
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Database Migrations

```bash
# Generate migration
npm run migration:generate -- src/database/migrations/MigrationName

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## API Documentation

Swagger documentation is available at:
```
http://localhost:3001/api
```

## License

MIT © Ishara "mac_knight141" Lakshitha