import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './test-helper';

describe('Events (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const fixture = await createTestApp();
    app = fixture.app;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/matches/:id/events', () => {
    it('should return events for a match', async () => {
      const res = await request(app.getHttpServer()).get('/api/matches/1/events');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0]).toHaveProperty('type');
      expect(res.body.data[0]).toHaveProperty('minute');
    });

    it('should return 404 for non-existent match events', async () => {
      const res = await request(app.getHttpServer()).get('/api/matches/9999/events');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('not found');
    });

    it('should return 400 for invalid match id', async () => {
      const res = await request(app.getHttpServer()).get('/api/matches/xyz/events');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
