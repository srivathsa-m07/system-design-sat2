import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';
import { PrismaService } from '../src/prisma/prisma.service';

export function createMockPrismaService() {
  const teams = [
    { id: 1, name: 'India', country: 'India', logoUrl: 'https://example.com/india.png', homeMatches: [], awayMatches: [] },
    { id: 2, name: 'Australia', country: 'Australia', logoUrl: 'https://example.com/australia.png', homeMatches: [], awayMatches: [] },
    { id: 3, name: 'Brazil', country: 'Brazil', logoUrl: 'https://example.com/brazil.png', homeMatches: [], awayMatches: [] },
    { id: 4, name: 'Germany', country: 'Germany', logoUrl: 'https://example.com/germany.png', homeMatches: [], awayMatches: [] },
    { id: 5, name: 'Argentina', country: 'Argentina', logoUrl: 'https://example.com/argentina.png', homeMatches: [], awayMatches: [] },
    { id: 6, name: 'England', country: 'England', logoUrl: 'https://example.com/england.png', homeMatches: [], awayMatches: [] },
  ];

  const scores: Record<number, { id: number; matchId: number; homeScore: number; awayScore: number }> = {
    1: { id: 1, matchId: 1, homeScore: 2, awayScore: 1 },
    3: { id: 2, matchId: 3, homeScore: 3, awayScore: 2 },
  };

  const events: Record<number, any[]> = {
    1: [
      { id: 1, matchId: 1, type: 'GOAL', minute: 15, player: 'Virat Kohli', detail: 'Header from corner' },
      { id: 2, matchId: 1, type: 'YELLOW_CARD', minute: 22, player: 'David Warner', detail: 'Rough tackle' },
      { id: 3, matchId: 1, type: 'GOAL', minute: 32, player: 'Rohit Sharma', detail: 'Penalty kick' },
      { id: 4, matchId: 1, type: 'GOAL', minute: 40, player: 'Steve Smith', detail: 'Long range shot' },
      { id: 5, matchId: 1, type: 'HALF_TIME', minute: 45, player: null, detail: 'Half time whistle' },
    ],
  };

  const matches = [
    {
      id: 1,
      homeTeamId: 1,
      awayTeamId: 2,
      venue: 'Wankhede Stadium, Mumbai',
      startTime: new Date(),
      status: 'LIVE',
      homeTeam: teams[0],
      awayTeam: teams[1],
      score: scores[1],
      events: events[1],
    },
    {
      id: 2,
      homeTeamId: 3,
      awayTeamId: 4,
      venue: 'Maracanã Stadium, Rio de Janeiro',
      startTime: new Date(Date.now() + 86400000),
      status: 'SCHEDULED',
      homeTeam: teams[2],
      awayTeam: teams[3],
      score: null,
      events: [],
    },
    {
      id: 3,
      homeTeamId: 5,
      awayTeamId: 6,
      venue: 'Estadio Monumental, Buenos Aires',
      startTime: new Date(Date.now() - 10800000),
      status: 'COMPLETED',
      homeTeam: teams[4],
      awayTeam: teams[5],
      score: scores[3],
      events: [],
    },
  ];

  return {
    team: {
      findUnique: jest.fn().mockImplementation(({ where }: { where: { id: number } }) => {
        const team = teams.find((t) => t.id === where.id);
        if (!team) return Promise.resolve(null);
        return Promise.resolve({
          ...team,
          homeMatches: matches.filter((m) => m.homeTeamId === team.id),
          awayMatches: matches.filter((m) => m.awayTeamId === team.id),
        });
      }),
      findMany: jest.fn().mockResolvedValue(teams),
    },
    match: {
      findMany: jest.fn().mockImplementation(({ where }: { where?: any } = {}) => {
        let result = [...matches];
        if (where?.OR) {
          const searchVal = where.OR[0]?.homeTeam?.name?.contains?.toLowerCase();
          if (searchVal) {
            result = result.filter(
              (m) =>
                m.homeTeam.name.toLowerCase().includes(searchVal) ||
                m.awayTeam.name.toLowerCase().includes(searchVal),
            );
          }
        }
        return Promise.resolve(result);
      }),
      findUnique: jest.fn().mockImplementation(({ where }: { where: { id: number } }) => {
        const match = matches.find((m) => m.id === where.id);
        return Promise.resolve(match || null);
      }),
    },
    score: {
      findUnique: jest.fn().mockImplementation(({ where }: { where: { matchId: number } }) => {
        const score = scores[where.matchId];
        return Promise.resolve(score || null);
      }),
      upsert: jest.fn().mockImplementation(({ where, update, create }: any) => {
        const matchId = where.matchId;
        const existing = scores[matchId];
        if (existing) {
          scores[matchId] = { ...existing, ...update };
        } else {
          scores[matchId] = { id: Object.keys(scores).length + 1, ...create };
        }
        return Promise.resolve(scores[matchId]);
      }),
    },
    matchEvent: {
      findMany: jest.fn().mockImplementation(({ where }: { where: { matchId: number } }) => {
        return Promise.resolve(events[where.matchId] || []);
      }),
    },
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
  };
}

export async function createTestApp(): Promise<{ app: INestApplication; mockPrisma: any }> {
  const mockPrisma = createMockPrismaService();

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(PrismaService)
    .useValue(mockPrisma)
    .compile();

  const app = moduleFixture.createNestApplication();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  await app.init();

  return { app, mockPrisma };
}
