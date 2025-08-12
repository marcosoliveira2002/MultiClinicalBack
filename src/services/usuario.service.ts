import { UsuarioRepository } from '../repositories/usuario.repository';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { signToken } from '../config/jwt';

const idSchema = z.string().uuid('ID de usuário inválido');

const usuarioSchema = z.object({
  nome_usuario: z.string().min(1),
  login: z.string().min(3),
  senha: z.string().min(6),
  email: z.string().email(),
  ativo: z.boolean().default(true),
});

const loginSchema = z.object({
  login: z.string().min(1, "Login obrigatório"),
  senha: z.string().min(1, "Senha obrigatória")
});

const atualizarSchema = z.object({
  nome_usuario: z.string().min(1).optional(),
  login: z.string().min(3).optional(),
  email: z.string().email().optional(),
  ativo: z.boolean().optional(),
  senha: z.string().min(6).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'É necessário enviar ao menos um campo para atualizar'
});

export class UsuarioService {
  private repo = new UsuarioRepository();

  async criar(data: any) {
    const parsed = usuarioSchema.safeParse(data);
    if (!parsed.success) {
      throw { status: 400, message: "Dados inválidos", issues: parsed.error.format() };
    }


    parsed.data.login = parsed.data.login.trim().toLowerCase();
    parsed.data.email = parsed.data.email.trim().toLowerCase();

    const { login, senha, email, ...resto } = parsed.data;

    const jaExisteLogin = await this.repo.buscarPorLogin(login);
    if (jaExisteLogin) {
      throw { status: 400, message: "Login já está em uso" };
    }

    const jaExisteEmail = await this.repo.buscarPorEmail(email);
    if (jaExisteEmail) {
      throw { status: 400, message: "E-mail já está em uso" };
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const criado = await this.repo.criar({
      ...resto,
      login,
      email,
      senha: senhaCriptografada
    });


    return {
      message: "Cadastro realizado com sucesso",
      usuario: {
        id: criado.id_usuario,
        nome: criado.nome_usuario
      }
    };
  }

  async login(data: any) {
    const parsed = loginSchema.safeParse(data);
    if (!parsed.success) {
      throw { status: 400, message: "Login ou senha inválido", issues: parsed.error.format() };
    }

    const login = parsed.data.login.trim().toLowerCase();
    const { senha } = parsed.data;

    const usuario = await this.repo.buscarPorLogin(login);
    if (!usuario) {
      throw { status: 401, message: "Credenciais inválidas" };
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      throw { status: 401, message: "Credenciais inválidas" };
    }

    const token = signToken({
      sub: usuario.id_usuario,
      login: usuario.login
    });

    return {
      message: "Login realizado com sucesso",
      usuario: {
        id: usuario.id_usuario,
        nome: usuario.nome_usuario
      },
      token
    };
  }
  async me(id: string) {
    return this.repo.buscarPorId(id);
  }
  async listar() {
    return this.repo.listarTodos();
  }
  async obterPorId(id: string) {
    const parsed = idSchema.safeParse(id);
    if (!parsed.success) {
      throw { status: 400, message: "Dados inválidos", issues: parsed.error.format() };
    }

    const usuario = await this.repo.buscarPublicoPorId(parsed.data);
    if (!usuario) throw { status: 404, message: 'Usuário não encontrado' };

    return usuario;
  }
    async atualizar(id: string, data: any) {
    const idParsed = idSchema.safeParse(id);
    if (!idParsed.success) {
      throw { status: 400, message: "Dados inválidos", issues: idParsed.error.format() };
    }

    const parsed = atualizarSchema.safeParse(data);
    if (!parsed.success) {
      throw { status: 400, message: "Dados inválidos", issues: parsed.error.format() };
    }

    const payload = { ...parsed.data };

    // normalizações
    if (payload.login) payload.login = payload.login.trim().toLowerCase();
    if (payload.email) payload.email = payload.email.trim().toLowerCase();

    // checar conflitos
    if (payload.login) {
      const conflitoLogin = await this.repo.buscarPorLoginExcetoId(payload.login, idParsed.data);
      if (conflitoLogin) throw { status: 400, message: "Login já está em uso" };
    }
    if (payload.email) {
      const conflitoEmail = await this.repo.buscarPorEmailExcetoId(payload.email, idParsed.data);
      if (conflitoEmail) throw { status: 400, message: "E-mail já está em uso" };
    }

    // hash de senha se enviada
    if (payload.senha) {
      payload.senha = await bcrypt.hash(payload.senha, 10);
    }

    // garante que o usuário existe (opcional, mas bom para 404 claro)
    const existe = await this.repo.buscarPorId(idParsed.data);
    if (!existe) throw { status: 404, message: 'Usuário não encontrado' };

    const atualizado = await this.repo.atualizar(idParsed.data, payload);

    // retorna sem senha
    return {
      message: "Usuário atualizado com sucesso",
      usuario: {
        id_usuario: atualizado.id_usuario,
        nome_usuario: atualizado.nome_usuario,
        login: atualizado.login,
        email: atualizado.email,
        ativo: atualizado.ativo
      }
    };
  }
}
