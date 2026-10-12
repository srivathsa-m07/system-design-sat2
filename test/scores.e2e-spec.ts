import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './test-helper';

describe('Scores (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const fixture = await createTestApp();
    app = fixture.app;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/matches/:id/score', () => {
    it('should return score for a match', async () => {
      const res = await request(app.getHttpServer()).get('/api/matches/1/score');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.matchId).toBe(1);
      expect(res.body.data.homeScore).toBe(2);
      expect(res.body.data.awayScore).toBe(1);
    });

    it('should return 404 for non-existent match score', async () => {
      const res = await request(app.getHttpServer()).get('/api/matches/9999/score');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('not found');
    });

    it('should return 400 for invalid match id', async () => {
      const res = await request(app.getHttpServer()).get('/api/matches/invalid/score');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
