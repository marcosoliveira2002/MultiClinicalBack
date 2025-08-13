import { UsuarioRepository } from '../repositories/usuario.repository';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { signToken } from '../config/jwt';
import { PasswordResetRepository } from '@/repositories/passwordReset.repository';
import { sendPasswordResetEmail } from '@/infra/mailer';

const idSchema = z.string().uuid('ID de usuário inválido');

const usuarioSchema = z.object({
  nome_usuario: z.string().min(1),
  login: z.string().min(3),
  senha: z.string().min(6),
  email: z.string().email(),
  ativo: z.boolean().default(true),
});

const forgotSchema = z.object({
  login: z.string().min(1).optional(),
  email: z.string().email().optional()
}).refine(d => !!d.login || !!d.email, { message: 'Envie login ou email' });

const resetSchema = z.object({
  token: z.string().min(1),
  novaSenha: z.string().min(6)
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
  private resetRepo = new PasswordResetRepository();
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
  async forgotPassword(data: any) {
    const parsed = forgotSchema.safeParse(data);
    if (!parsed.success) {
      // ainda assim, retornaremos 200 no controller para não vazar info; mas aqui deixo consistente
      throw { status: 400, message: 'Dados inválidos', issues: parsed.error.format() };
    }

    const { login, email } = parsed.data;

    // Tenta achar o usuário (se não achar, NÃO falamos isso pra fora)
    let usuario = null;
    if (email) {
      usuario = await this.repo.buscarPorEmail(email.trim().toLowerCase());
    } else if (login) {
      usuario = await this.repo.buscarPorLogin(login.trim().toLowerCase());
    }

    if (usuario) {
      // Invalida tokens antigos
      await this.resetRepo.invalidarTokensAtivosDoUsuario(usuario.id_usuario);

      // Gera token aleatório e guarda HASH no banco
      const tokenRaw = crypto.randomBytes(32).toString('hex'); // token que vai por e-mail
      const tokenHash = crypto.createHash('sha256').update(tokenRaw).digest('hex');
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

      await this.resetRepo.criarToken(usuario.id_usuario, tokenHash, expiresAt);

      // Envie o e-mail com o tokenRaw (não o hash)
      // Exemplo de link: https://seuapp.com/reset?token=<tokenRaw>
      // Aqui você pode usar nodemailer; vou deixar um stub:
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset?token=${tokenRaw}`;
      try {
        await sendPasswordResetEmail(usuario.email, resetUrl);
      } catch (e) {
        // Não vaza erro pro cliente (para não revelar existência de conta)
        console.error('[ForgotPassword] Falha ao enviar e-mail:', e);
      }
    }

    // Resposta genérica SEMPRE
    return {
      message: 'Se existir uma conta com esses dados, você receberá instruções no e-mail em instantes.'
    };
  }

  async resetPassword(data: any) {
    const parsed = resetSchema.safeParse(data);
    if (!parsed.success) {
      throw { status: 400, message: 'Dados inválidos', issues: parsed.error.format() };
    }

    const { token, novaSenha } = parsed.data;

    // Compara por HASH (nunca salve token em plain text)
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const registro = await this.resetRepo.obterTokenValidoPorHash(tokenHash);
    if (!registro) {
      // Mensagem genérica (token inválido ou expirado)
      throw { status: 400, message: 'Token inválido ou expirado' };
    }

    // Atualiza a senha do usuário
    const senhaHash = await bcrypt.hash(novaSenha, 10);
    await this.repo.atualizarSenha(registro.user_id, senhaHash);

    // Invalida esse token e quaisquer outros ativos
    await this.resetRepo.marcarComoUsado(registro.id);
    await this.resetRepo.marcarTodosDoUsuarioComoUsados(registro.user_id);

    return { message: 'Senha redefinida com sucesso' };
  }
}
