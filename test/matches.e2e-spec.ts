import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './test-helper';

describe('Matches (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const fixture = await createTestApp();
    app = fixture.app;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/matches', () => {
    it('should list all matches successfully', async () => {
      const res = await request(app.getHttpServer()).get('/api/matches');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(3);
    });

    it('should filter matches by search query', async () => {
      const res = await request(app.getHttpServer()).get('/api/matches?search=India');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      const match = res.body.data[0];
      const involvesIndia = match.homeTeam.name === 'India' || match.awayTeam.name === 'India';
      expect(involvesIndia).toBe(true);
    });
  });

  describe('GET /api/matches/:id', () => {
    it('should return match details by id', async () => {
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
      expect(res.body.message).toContain('not found');
    });
  });

  describe('PATCH /api/matches/:id/score', () => {
    it('should update score successfully', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/matches/1/score')
        .send({ homeScore: 3, awayScore: 2 });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.homeScore).toBe(3);
      expect(res.body.data.awayScore).toBe(2);
    });

    it('should return 400 for validation error (negative score)', async () => {
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
  });
});
