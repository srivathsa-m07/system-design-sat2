import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';

import { createTestApp } from './test-helper';

describe('Live Sports Score API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const fixture = await createTestApp();
    app = fixture.app;
  });

  afterAll(async () => {
    await app.close();
  });

  // ============= MATCHES =============
  describe('GET /api/matches', () => {
    it('should return all matches', async () => {
      const res = await request(app.getHttpServer()).get('/api/matches');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
    });

    it('should filter matches by search query', async () => {
      const res = await request(app.getHttpServer()).get('/api/matches?search=India');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      // Verify the match involves India
      const match = res.body.data[0];
      const involvesIndia = match.homeTeam.name === 'India' || match.awayTeam.name === 'India';
      expect(involvesIndia).toBe(true);
    });

    it('should return empty array for non-matching search', async () => {
      const res = await request(app.getHttpServer()).get('/api/matches?search=NonExistentTeam');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });
  });

  describe('GET /api/matches/:id', () => {
    it('should return a match by id', async () => {
      const res = await request(app.getHttpServer()).get('/api/matches/1');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(1);
      expect(res.body.data.homeTeam).toBeDefined();
      expect(res.body.data.awayTeam).toBeDefined();
    });

    it('should return 404 for non-existent match', async () => {
      const res = await request(app.getHttpServer()).get('/api/matches/9999');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid match id', async () => {
      const res = await request(app.getHttpServer()).get('/api/matches/abc');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ============= SCORES =============
  describe('GET /api/matches/:id/score', () => {
    it('should return the score for a match', async () => {
      const res = await request(app.getHttpServer()).get('/api/matches/1/score');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.matchId).toBe(1);
      expect(typeof res.body.data.homeScore).toBe('number');
      expect(typeof res.body.data.awayScore).toBe('number');
    });

    it('should return 404 for non-existent match score', async () => {
      const res = await request(app.getHttpServer()).get('/api/matches/9999/score');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PATCH /api/matches/:id/score', () => {
    it('should update the score for a match', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/matches/1/score')
        .send({ homeScore: 3, awayScore: 2 });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.homeScore).toBe(3);
      expect(res.body.data.awayScore).toBe(2);
    });

    it('should return 400 for invalid score data', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/matches/1/score')
        .send({ homeScore: -1, awayScore: 2 });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 for non-existent match', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/matches/9999/score')
        .send({ homeScore: 1, awayScore: 0 });
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should create score if it does not exist (upsert)', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/matches/2/score')
        .send({ homeScore: 1, awayScore: 0 });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.homeScore).toBe(1);
      expect(res.body.data.awayScore).toBe(0);
    });
  });

  // ============= EVENTS =============
  describe('GET /api/matches/:id/events', () => {
    it('should return events for a match', async () => {
      const res = await request(app.getHttpServer()).get('/api/matches/1/events');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should return 404 for non-existent match events', async () => {
      const res = await request(app.getHttpServer()).get('/api/matches/9999/events');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // ============= TEAMS =============
  describe('GET /api/teams/:id', () => {
    it('should return a team by id', async () => {
      const res = await request(app.getHttpServer()).get('/api/teams/1');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(1);
      expect(res.body.data.name).toBeDefined();
    });

    it('should return 404 for non-existent team', async () => {
      const res = await request(app.getHttpServer()).get('/api/teams/9999');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid team id', async () => {
      const res = await request(app.getHttpServer()).get('/api/teams/abc');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
