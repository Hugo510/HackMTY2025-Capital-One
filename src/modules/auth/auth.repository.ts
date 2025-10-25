import prisma from '../../db/prisma';

// Modelo de usuario en la capa de dominio (mapea el modelo Prisma `Usuario`).
export interface User {
  id: string; // mapeamos id_usuario (Int) a string para la aplicación
  email: string;
  password: string; // mapeamos password_hash
}

export interface AuthRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  // Recibe password y pin ya hasheados
  createUser(email: string, hashedPassword: string, nombreCompleto: string, pinHash: string): Promise<User>;
}

export class PrismaAuthRepository implements AuthRepository {
  private mapUsuario(u: any): User {
    if (!u) return null as any;
    return {
      id: String(u.id_usuario),
      email: u.email,
      password: u.password_hash,
    };
  }

  async findByEmail(email: string) {
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    return this.mapUsuario(usuario);
  }

  async findById(id: string) {
    const usuario = await prisma.usuario.findUnique({ where: { id_usuario: Number(id) } });
    return this.mapUsuario(usuario);
  }

  async createUser(email: string, hashedPassword: string, nombreCompleto: string, pinHash: string) {
    // Crear Usuario con los campos obligatorios del schema.
    const usuario = await prisma.usuario.create({
      data: { email, password_hash: hashedPassword, nombre_completo: nombreCompleto, pin_hash: pinHash },
    });
    return this.mapUsuario(usuario);
  }
}

export default PrismaAuthRepository;
