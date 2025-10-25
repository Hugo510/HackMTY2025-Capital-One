// Establece variables de entorno requeridas por src/config/env.ts antes de que se ejecute
process.env.NODE_ENV = process.env.NODE_ENV ?? 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test_jwt_secret';
process.env.REFRESH_SECRET = process.env.REFRESH_SECRET ?? 'test_refresh_secret';
process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'file:dev.db';

// opcional: reducir logs ruidosos en tests
process.env.PORT = process.env.PORT ?? '0';
