# Live Sports Score REST & Real-Time API

A high-performance, real-time Live Sports Score API built with **NestJS**, **Prisma ORM**, **PostgreSQL**, and **Socket.IO (WebSockets)**. The service provides RESTful endpoints to query matches, scores, events, and teams, alongside a bidirectional WebSocket gateway enabling real-time score push notifications to subscribed clients with low latency.

---

## Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) (Node.js TypeScript framework)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Real-Time Communication**: [Socket.IO](https://socket.io/) (via `@nestjs/platform-socket.io` & `@nestjs/websockets`)
- **API Documentation**: [Swagger / OpenAPI](https://swagger.io/)
- **Validation & Serialization**: `class-validator`, `class-transformer`
- **Testing**: [Jest](https://jestjs.io/), [Supertest](https://github.com/ladjs/supertest)
- **Containerization**: [Docker](https://www.docker.com/), Docker Compose

---

## Project Structure

```text
SYSTEMDESIGNSAT2/
├── docker-compose.yml
├── nest-cli.json
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── .env.example
├── .env
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── common/
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── interceptors/
│   │   │   └── response.interceptor.ts
│   │   └── pipes/
│   │       └── parse-id.pipe.ts
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── teams/
│   │   ├── dto/
│   │   ├── teams.controller.ts
│   │   ├── teams.service.ts
│   │   └── teams.module.ts
│   ├── matches/
│   │   ├── dto/
│   │   ├── matches.controller.ts
│   │   ├── matches.service.ts
│   │   └── matches.module.ts
│   ├── scores/
│   │   ├── dto/
│   │   │   └── update-score.dto.ts
│   │   ├── scores.controller.ts
│   │   ├── scores.service.ts
│   │   └── scores.module.ts
│   ├── events/
│   │   ├── dto/
│   │   ├── events.controller.ts
│   │   ├── events.service.ts
│   │   └── events.module.ts
│   └── websockets/
│       ├── scores.gateway.ts
│       └── websockets.module.ts
├── test/
│   ├── jest-e2e.json
│   └── app.e2e-spec.ts
└── docs/
    ├── HLD.md
    └── LLD.md
```

---

## Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Docker & Docker Compose**: For launching PostgreSQL container

---

## Getting Started

### 1. Clone & Navigate to Folder
```bash
git clone <repository-url>
cd SYSTEMDESIGNSAT2
```

### 2. Configure Environment Variables
Copy the `.env.example` file to create `.env`:
```bash
cp .env.example .env
```
Ensure your database connection string points to your target PostgreSQL instance:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sports_db?schema=public"
PORT=3000
```

### 3. Start PostgreSQL with Docker
Start the database service in detached mode:
```bash
docker-compose up -d
```

### 4. Install Dependencies
```bash
npm install
```

### 5. Run Database Migrations & Generate Client
Apply Prisma database migrations:
```bash
npx prisma migrate dev --name init
```

### 6. Seed Database
Populate the database with sample teams, matches, scores, and match events:
```bash
npx prisma db seed
```

### 7. Run the Application
Start the development server with hot-reloading:
```bash
npm run start:dev
```
The application will listen on `http://localhost:3000` (or the configured `PORT`).

---

## API Endpoints

All API endpoints are prefixed with `/api`. Responses are standardized using a global response interceptor.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/matches` | Get all matches (supports optional query `?search=teamName`) |
| `GET` | `/api/matches/:id` | Get match details by ID |
| `GET` | `/api/matches/:id/score` | Get score for a specific match |
| `PATCH` | `/api/matches/:id/score` | Update/upsert match score and broadcast via WebSocket |
| `GET` | `/api/matches/:id/events` | Get all timeline events for a match |
| `GET` | `/api/teams/:id` | Get team details by ID |
| `GET` | `/api/docs` | Swagger UI documentation |

---

## API Examples

### 1. Get Matches
**Request:**
```bash
curl -X GET "http://localhost:3000/api/matches?search=India" -H "Accept: application/json"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "status": "LIVE",
      "startTime": "2026-10-12T14:00:00.000Z",
      "homeTeam": {
        "id": 1,
        "name": "India",
        "shortCode": "IND",
        "logoUrl": "https://example.com/ind.png"
      },
      "awayTeam": {
        "id": 2,
        "name": "Australia",
        "shortCode": "AUS",
        "logoUrl": "https://example.com/aus.png"
      },
      "score": {
        "id": 1,
        "matchId": 1,
        "homeScore": 2,
        "awayScore": 1,
        "updatedAt": "2026-10-12T14:35:10.000Z"
      }
    }
  ],
  "timestamp": "2026-10-12T14:35:15.000Z"
}
```

### 2. Get Match by ID
**Request:**
```bash
curl -X GET "http://localhost:3000/api/matches/1" -H "Accept: application/json"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "LIVE",
    "startTime": "2026-10-12T14:00:00.000Z",
    "homeTeam": {
      "id": 1,
      "name": "India",
      "shortCode": "IND",
      "logoUrl": "https://example.com/ind.png"
    },
    "awayTeam": {
      "id": 2,
      "name": "Australia",
      "shortCode": "AUS",
      "logoUrl": "https://example.com/aus.png"
    }
  },
  "timestamp": "2026-10-12T14:35:20.000Z"
}
```

### 3. Get Match Score
**Request:**
```bash
curl -X GET "http://localhost:3000/api/matches/1/score" -H "Accept: application/json"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "matchId": 1,
    "homeScore": 2,
    "awayScore": 1,
    "updatedAt": "2026-10-12T14:30:00.000Z"
  },
  "timestamp": "2026-10-12T14:35:25.000Z"
}
```

### 4. Update / Upsert Score
**Request:**
```bash
curl -X PATCH "http://localhost:3000/api/matches/1/score" \
  -H "Content-Type: application/json" \
  -d '{"homeScore": 3, "awayScore": 2}'
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "matchId": 1,
    "homeScore": 3,
    "awayScore": 2,
    "updatedAt": "2026-10-12T14:35:30.000Z"
  },
  "timestamp": "2026-10-12T14:35:30.000Z"
}
```

### 5. Get Match Events
**Request:**
```bash
curl -X GET "http://localhost:3000/api/matches/1/events" -H "Accept: application/json"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "matchId": 1,
      "type": "GOAL",
      "minute": 15,
      "description": "Goal scored by home team",
      "createdAt": "2026-10-12T14:15:00.000Z"
    },
    {
      "id": 2,
      "matchId": 1,
      "type": "YELLOW_CARD",
      "minute": 32,
      "description": "Yellow card issued to away defender",
      "createdAt": "2026-10-12T14:32:00.000Z"
    }
  ],
  "timestamp": "2026-10-12T14:35:35.000Z"
}
```

### 6. Get Team by ID
**Request:**
```bash
curl -X GET "http://localhost:3000/api/teams/1" -H "Accept: application/json"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "India",
    "shortCode": "IND",
    "logoUrl": "https://example.com/ind.png"
  },
  "timestamp": "2026-10-12T14:35:40.000Z"
}
```

---

## WebSocket Real-Time Updates

The application includes a real-time gateway that broadcasts score changes instantaneously to connected clients.

- **Namespace**: `/scores`
- **Port / Host**: Same as HTTP server (`http://localhost:3000/scores`)
- **Transport**: WebSockets / polling (Socket.IO client protocol)

### Client Connection & Subscription Flow
1. Connect to namespace `http://localhost:3000/scores`.
2. Emit event `joinMatch` with `{ "matchId": 1 }` to subscribe to room `match_1`.
3. Listen for event `scoreUpdate` to receive real-time updates when scores change.
4. Optionally emit `leaveMatch` with `{ "matchId": 1 }` to unsubscribe.

### JavaScript Client Example
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/scores', {
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log('Connected to /scores namespace:', socket.id);

  // Subscribe to updates for match ID 1
  socket.emit('joinMatch', { matchId: 1 });
});

// Receive live score updates
socket.on('scoreUpdate', (payload) => {
  console.log('Live score received:', payload);
  // Example payload:
  // {
  //   matchId: 1,
  //   homeScore: 3,
  //   awayScore: 2,
  //   updatedAt: "2026-10-12T14:35:30.000Z"
  // }
});

socket.on('disconnect', () => {
  console.log('Disconnected from WebSocket');
});
```

---

## Swagger API Documentation

Interactive OpenAPI/Swagger documentation is served directly from the NestJS application:

- **URL**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- Features schema definitions, request DTOs, response representations, and in-browser request execution.

---

## Testing

Run the End-to-End (E2E) test suite using Jest and Supertest.

> **Note**: E2E tests run against the live PostgreSQL database configured in `DATABASE_URL`. Ensure Docker and database migrations/seeds are executed prior to running tests.

```bash
# Run E2E tests
npm run test:e2e

# Run unit tests
npm run test
```

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/sports_db?schema=public` |
| `PORT` | HTTP & WebSocket server port | `3000` |
| `NODE_ENV` | Application environment (`development`, `production`, `test`) | `development` |

---

## Docker

A `docker-compose.yml` file is provided to start PostgreSQL locally.

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: sports_score_postgres
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: sports_db
    ports:
      - '5432:5432'
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

### Docker Commands
- **Start database**: `docker-compose up -d`
- **Stop database**: `docker-compose down`
- **Stop database and clear data volume**: `docker-compose down -v`
