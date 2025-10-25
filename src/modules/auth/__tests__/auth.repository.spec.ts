import { describe, it, expect, vi, beforeEach } from 'vitest';

// prevent env parser exit
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 't';
process.env.REFRESH_SECRET = process.env.REFRESH_SECRET ?? 'r';
process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'file:dev.db';

// Mock prisma client used by repository. We create the mocked fns inside the factory
vi.mock('../../../db/prisma', () => {
  const findUnique = vi.fn();
  const create = vi.fn();
  // export the mocks so tests can access them
  return { default: { usuario: { findUnique, create } }, __mocks: { findUnique, create } };
});

import { PrismaAuthRepository } from '../auth.repository';

describe('PrismaAuthRepository', () => {
  let prismaMock: any;

  beforeEach(async () => {
    // import mocked prisma to get access to its mock fns
    prismaMock = (await import('../../../db/prisma')) as any;
    prismaMock.default.usuario.findUnique.mockReset();
    prismaMock.default.usuario.create.mockReset();
  });

  it('findByEmail maps prisma output to User', async () => {
    prismaMock.default.usuario.findUnique.mockResolvedValue({ id_usuario: 5, email: 'u@e.com', password_hash: 'h' });
    const repo = new PrismaAuthRepository();
    const user = await repo.findByEmail('u@e.com');
    expect(user).toEqual({ id: '5', email: 'u@e.com', password: 'h' });
  });

  it('createUser calls prisma.create with expected data', async () => {
    prismaMock.default.usuario.create.mockResolvedValue({ id_usuario: 7, email: 'c@c.com', password_hash: 'hp' });
    const repo = new PrismaAuthRepository();
    const out = await repo.createUser('c@c.com', 'hashed', 'Nombre', 'pinh');
    expect(prismaMock.default.usuario.create).toHaveBeenCalled();
    const args = prismaMock.default.usuario.create.mock.calls[0][0];
    expect(args).toHaveProperty('data');
    expect(args.data.email).toBe('c@c.com');
    expect(args.data.password_hash).toBe('hashed');
    expect(out).toEqual({ id: '7', email: 'c@c.com', password: 'hp' });
  });
});
