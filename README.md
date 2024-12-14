# Personal Finance Application Backend

[![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh/)
[![TypeScript](https://img.shields.io/badge/TypeScript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Hono](https://img.shields.io/badge/Hono-000000.svg?style=for-the-badge&logo=hono&logoColor=white)](https://hono.dev/)
[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

A robust backend service for personal finance management built with modern technologies and hexagonal architecture.

## Prerequisites

- [Bun](https://bun.sh/) (JavaScript runtime and package manager)
- [Docker](https://www.docker.com/) (for running PostgreSQL database)

## Getting Started

1. Install dependencies:
```bash
bun install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start the PostgreSQL database using Docker:
```bash
docker compose up -d
```

4. Generate and run database migrations:
```bash
bun drizzle-kit generate
bun drizzle-kit migrate
```

5. Start the development server:
```bash
bun run dev
```

## Project Structure

The project follows a hexagonal architecture pattern:

```
src/
├── core/
│   └── infrastructure/
│       ├── database/     # Database configuration
│       ├── env/         # Environment configuration
│       ├── lib/         # Shared libraries
│       ├── middleware/  # Global middleware
│       └── types/       # Global types
├── features/
│   └── [feature]/
│       ├── application/
│       │   ├── dtos/
│       │   ├── services/
│       │   └── use-cases/
│       ├── domain/
│       │   ├── entities/
│       │   └── ports/
│       └── infrastructure/
│           ├── adapters/
│           └── controllers/
└── shared/
    ├── utils/           # Pure utility functions
    └── services/        # Shared services
```

## Technologies

- **Runtime & Package Manager**: [Bun](https://bun.sh/)
- **Framework**: [Hono.js](https://hono.dev/)
- **Database**: PostgreSQL (via Docker)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Validation**: [Zod](https://zod.dev/)
- **Documentation**: OpenAPI
- **Architecture**: Hexagonal (Ports & Adapters)

## Documentation

API documentation is available at `/reference` when the server is running.

## Development

### Available Commands

- `bun run dev`: Start development server
- `bun drizzle-kit generate`: Generate database migrations
- `bun drizzle-kit migrate`: Run database migrations
- `bun drizzle-kit studio`: Launch Drizzle Studio for database management

### Database Management

The project uses Drizzle ORM with PostgreSQL. The database runs in a Docker container, making it easy to set up and manage.

For database schema changes:
1. Modify the schema in `src/core/infrastructure/database/schema.ts`
2. Generate migrations: `bun drizzle-kit generate`
3. Apply migrations: `bun drizzle-kit migrate`

## License

[MIT](LICENSE)