import bcrypt from 'bcrypt';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { config } from '../../config/env';
import { AppError } from '../../core/errors';
import type { AuthRepository } from './auth.repository';
import { PrismaAuthRepository } from './auth.repository';

import type { User } from './auth.repository';

export class AuthService {
  private repo: AuthRepository;

  constructor(repo?: AuthRepository) {
    this.repo = repo ?? new PrismaAuthRepository();
  }

  public async registerUser(email: string, password: string, nombreCompleto: string, pin: string): Promise<User> {
    const existing = await this.repo.findByEmail(email);
    if (existing) throw new AppError('Email already in use', 409);

    const hashed = await bcrypt.hash(password, 10);
    const pinHash = await bcrypt.hash(pin, 10);
    return this.repo.createUser(email, hashed, nombreCompleto, pinHash);
  }

  public async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.repo.findByEmail(email);
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return null;
    return user;
  }

  public signTokens(userId: string) {
    const access = jwt.sign(
      { sub: userId },
      config.JWT_SECRET as string,
      { expiresIn: config.JWT_EXPIRES } as SignOptions
    );

    const refresh = jwt.sign(
      { sub: userId },
      config.REFRESH_SECRET as string,
      { expiresIn: config.REFRESH_EXPIRES } as SignOptions
    );

    return { access, refresh };
  }
}

export const createAuthService = (repo?: AuthRepository) => new AuthService(repo);

export default AuthService;
