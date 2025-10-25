import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../db/prisma';
import { config } from '../../config/env';

export const registerUser = async (email: string, password: string) => {
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, password: hashed } });
  return user;
};

export const validateUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return null;
  return user;
};

export const signTokens = (userId: string) => {
  const access = jwt.sign({ sub: userId }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES });
  const refresh = jwt.sign({ sub: userId }, config.REFRESH_SECRET, { expiresIn: config.REFRESH_EXPIRES });
  return { access, refresh };
};
