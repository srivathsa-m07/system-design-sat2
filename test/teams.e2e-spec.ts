import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './test-helper';

describe('Teams (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const fixture = await createTestApp();
    app = fixture.app;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/teams/:id', () => {
    it('should return team details by id', async () => {
      const res = await request(app.getHttpServer()).get('/api/teams/1');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(1);
      expect(res.body.data.name).toBe('India');
      expect(res.body.data.homeMatches).toBeDefined();
      expect(res.body.data.awayMatches).toBeDefined();
    });

    it('should return 404 for non-existent team', async () => {
      const res = await request(app.getHttpServer()).get('/api/teams/9999');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('not found');
    });

    it('should return 400 for invalid team id format', async () => {
      const res = await request(app.getHttpServer()).get('/api/teams/invalid');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
