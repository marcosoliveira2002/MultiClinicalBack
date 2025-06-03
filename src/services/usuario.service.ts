import { UsuarioRepository } from '../repositories/usuario.repository';
import { z } from 'zod';
import bcrypt from 'bcrypt';

const usuarioSchema = z.object({
  nome_usuario: z.string().min(1),
  login: z.string().min(3),
  senha: z.string().min(6),
  tipo_usuario: z.enum(['A', 'B', 'C']),
  ativo: z.boolean()
});

const loginSchema = z.object({
  login: z.string().min(1, "Login obrigatório"),
  senha: z.string().min(1, "Senha obrigatória")
});

export class UsuarioService {
  private repo = new UsuarioRepository();

  async criar(data: any) {
    const parsed = usuarioSchema.safeParse(data);
    if (!parsed.success) {
      throw { status: 400, message: "Dados inválidos", issues: parsed.error.format() };
    }

    const { login, senha, ...resto } = parsed.data;

    const jaExiste = await this.repo.buscarPorLogin(login);
    if (jaExiste) {
      throw { status: 400, message: "Login já está em uso" };
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    return this.repo.criar({
      ...resto,
      login,
      senha: senhaCriptografada
    });
  }

  async login(data: any) {
    const parsed = loginSchema.safeParse(data);
    if (!parsed.success) {
      throw { status: 400, message: "Login ou senha inválido", issues: parsed.error.format() };
    }

    const { login, senha } = parsed.data;

    const usuario = await this.repo.buscarPorLogin(login);
    if (!usuario) {
      throw { status: 401, message: "Credenciais inválidas" };
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      throw { status: 401, message: "Credenciais inválidas" };
    }


    return { message: "Login realizado com sucesso", usuario: { id: usuario.id_usuario, nome: usuario.nome_usuario } };
  }
}
