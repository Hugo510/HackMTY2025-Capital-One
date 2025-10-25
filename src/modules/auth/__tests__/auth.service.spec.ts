import { describe, it, expect, beforeEach, vi } from 'vitest';
import bcrypt from 'bcrypt';

// NOTA: vitest cargará el setupFiles configurado en vitest.config.ts que fija las env vars
import { createAuthService } from '../auth.service';
import { AppError } from '../../../core/errors';

describe('AuthService', () => {
  let mockRepo: any;

  beforeEach(() => {
    mockRepo = {
      findByEmail: vi.fn(),
      createUser: vi.fn(),
      findById: vi.fn()
    } as any;
  });

  it('registerUser - success', async () => {
    mockRepo.findByEmail.mockResolvedValue(null);
    mockRepo.createUser.mockResolvedValue({ id: '1', email: 'a@b.com', password: 'hashed' });

    const svc = createAuthService(mockRepo);
    const user = await svc.registerUser('a@b.com', 'password123', 'Nombre', '1234');

    expect(mockRepo.createUser).toHaveBeenCalled();
    const args = mockRepo.createUser.mock.calls[0];
    // email, hashedPassword, nombreCompleto, pinHash
    expect(args[0]).toBe('a@b.com');
    expect(args[2]).toBe('Nombre');
    expect(typeof args[1]).toBe('string');
    expect(typeof args[3]).toBe('string');
    expect(user).toEqual({ id: '1', email: 'a@b.com', password: 'hashed' });
  });

  it('registerUser - email exists -> throw 409', async () => {
    mockRepo.findByEmail.mockResolvedValue({ id: '1', email: 'a@b.com', password: 'hashed' });
    const svc = createAuthService(mockRepo);
    await expect(svc.registerUser('a@b.com', 'password123', 'Nombre', '1234')).rejects.toBeInstanceOf(AppError);
  });

  it('validateUser - success', async () => {
    const hashed = await bcrypt.hash('mypassword', 10);
    mockRepo.findByEmail.mockResolvedValue({ id: '2', email: 'x@y.com', password: hashed });
    const svc = createAuthService(mockRepo);
    const user = await svc.validateUser('x@y.com', 'mypassword');
    expect(user).not.toBeNull();
    expect(user?.email).toBe('x@y.com');
  });

  it('validateUser - wrong password returns null', async () => {
    const hashed = await bcrypt.hash('other', 10);
    mockRepo.findByEmail.mockResolvedValue({ id: '3', email: 'n@n.com', password: hashed });
    const svc = createAuthService(mockRepo);
    const user = await svc.validateUser('n@n.com', 'badpass');
    expect(user).toBeNull();
  });

  it('signTokens returns access and refresh', () => {
    const svc = createAuthService();
    const tokens = svc.signTokens('user-1');
    expect(tokens).toHaveProperty('access');
    expect(tokens).toHaveProperty('refresh');
    expect(typeof tokens.access).toBe('string');
    expect(typeof tokens.refresh).toBe('string');
  });
});
