// src/repositories/usuario.repository.ts
import { prisma } from '../config/prismaClient';
import type { Usuario } from '@prisma/client';

export type CreateUsuarioDTO = {
  nome_usuario: string;
  login: string;
  email: string;
  senha: string;     // já deve vir com bcrypt hash do service
  ativo?: boolean;   // default true no banco; opcional aqui
};

export type UpdateUsuarioDTO = Partial<CreateUsuarioDTO>;

export class UsuarioRepository {
  async criar(data: CreateUsuarioDTO): Promise<Usuario> {
    return prisma.usuario.create({ data });
  }

  async buscarPorLogin(login: string): Promise<Usuario | null> {
    return prisma.usuario.findUnique({ where: { login } });
  }

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    return prisma.usuario.findUnique({ where: { email } });
  }
  async buscarPorId(id: string): Promise<Usuario | null> {
    return prisma.usuario.findUnique({ where: { id_usuario: id } });
  }

  async buscarPorLoginExcetoId(login: string, id: string): Promise<Usuario | null> {
    return prisma.usuario.findFirst({
      where: { login, NOT: { id_usuario: id } }
    });
  }

  async buscarPorEmailExcetoId(email: string, id: string): Promise<Usuario | null> {
    return prisma.usuario.findFirst({
      where: { email, NOT: { id_usuario: id } }
    });
  }
  async atualizar(id: string, data: UpdateUsuarioDTO): Promise<Usuario> {
    return prisma.usuario.update({
      where: { id_usuario: id },
      data
    });
  }

  async listarTodos() {
    return prisma.usuario.findMany({
      select: {
        id_usuario: true,
        nome_usuario: true,
        login: true,
        email: true,       // inclua se quiser mostrar
        ativo: true
      }
    });
  }
  async buscarPublicoPorId(id: string) {
    return prisma.usuario.findUnique({
      where: { id_usuario: id },
      select: {
        id_usuario: true,
        nome_usuario: true,
        login: true,
        email: true,
        ativo: true
      }
    });
  }

}
