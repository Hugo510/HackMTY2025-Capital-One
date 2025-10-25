import express from 'express';
import request from 'supertest';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Ensure env present for config loader
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 't';
process.env.REFRESH_SECRET = process.env.REFRESH_SECRET ?? 'r';
process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'file:dev.db';

// We mock the auth.service module with a factory that creates vi.fn() fns
vi.mock('../auth.service', () => {
  const registerUser = vi.fn();
  const validateUser = vi.fn();
  const signTokens = vi.fn();
  return {
    createAuthService: () => ({ registerUser, validateUser, signTokens }),
    // export mock fns so tests can access and change implementations
    __mocks: { registerUser, validateUser, signTokens }
  };
});

import authRouter from '../auth.controller';

describe('Auth Controller (router)', () => {
  let app: any;
  let mocks: any;

  beforeEach(async () => {
    // get access to the mocked fns
    const mod = (await import('../auth.service')) as any;
    mocks = mod.__mocks;
    mocks.registerUser.mockReset();
    mocks.validateUser.mockReset();
    mocks.signTokens.mockReset();

    app = express();
    app.use(express.json());
    app.use('/auth', authRouter);
  });

  it('POST /auth/register -> 201 on success', async () => {
  mocks.registerUser.mockResolvedValue({ id: '10', email: 'a@b.com' });
  const res = await request(app).post('/auth/register').send({ email: 'a@b.com', password: 'password123', nombre_completo: 'N', pin: '1234' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(mocks.registerUser).toHaveBeenCalled();
  });

  it('POST /auth/login -> 200 and tokens on valid credentials', async () => {
    mocks.validateUser.mockResolvedValue({ id: '20', email: 'x@y.com' });
    mocks.signTokens.mockReturnValue({ access: 'a', refresh: 'r' });
    const res = await request(app).post('/auth/login').send({ email: 'x@y.com', password: 'pw' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('tokens');
  });

  it('POST /auth/login -> 401 when invalid credentials', async () => {
    mocks.validateUser.mockResolvedValue(null);
    const res = await request(app).post('/auth/login').send({ email: 'no@no.com', password: 'bad' });
    expect(res.status).toBe(401);
  });
});
