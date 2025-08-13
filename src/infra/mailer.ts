import nodemailer from 'nodemailer';

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_SECURE,
  MAIL_FROM
} = process.env;

if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !MAIL_FROM) {
  console.warn('[Mailer] Variáveis SMTP não configuradas. E-mails não serão enviados.');
}

export const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT || 587),
  secure: String(SMTP_SECURE || 'false') === 'true', // true = 465
  auth: { user: SMTP_USER, pass: SMTP_PASS }
});

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  if (!SMTP_HOST) {
    // Fallback pra desenvolvimento: loga no console
    console.log(`[DEV] Reset URL para ${to}: ${resetUrl}`);
    return;
  }

  const info = await transporter.sendMail({
    from: MAIL_FROM,
    to,
    subject: 'Redefinição de senha',
    text: `Você solicitou a redefinição de senha. Acesse: ${resetUrl}`,
    html: `
      <p>Você solicitou a redefinição de senha.</p>
      <p><a href="${resetUrl}">Clique aqui para redefinir</a></p>
      <p>Se você não solicitou, ignore este e-mail.</p>
    `
  });

  // Útil pra depurar
  console.log('[Mailer] Mensagem enviada:', info.messageId);
}
