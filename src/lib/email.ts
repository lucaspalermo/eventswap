import { Resend } from 'resend';

// ---------------------------------------------------------------------------
// Email Service - Transactional emails via Resend
// All methods are fire-and-forget; errors are logged but never thrown.
// ---------------------------------------------------------------------------

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL =
  process.env.FROM_EMAIL || 'EventSwap <noreply@eventswap.com.br>';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://eventswap.com.br';

// ---------------------------------------------------------------------------
// Shared layout helpers
// ---------------------------------------------------------------------------

function baseLayout(preheader: string, bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>EventSwap</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <!-- Preheader (hidden preview text) -->
  <span style="display:none;font-size:1px;color:#f4f4f5;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</span>

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:24px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color:#6C3CE1;padding:28px 40px;text-align:center;">
              <span style="font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">EventSwap</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              ${bodyContent}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9f9fb;border-top:1px solid #e4e4e7;padding:20px 40px;text-align:center;">
              <p style="margin:0 0 6px 0;font-size:12px;color:#71717a;">
                Este email foi enviado automaticamente. Não responda a esta mensagem.
              </p>
              <p style="margin:0;font-size:12px;color:#71717a;">
                <a href="${APP_URL}/settings/notifications" style="color:#6C3CE1;text-decoration:underline;">Gerenciar preferências de email</a>
                &nbsp;&bull;&nbsp;
                <a href="${APP_URL}" style="color:#6C3CE1;text-decoration:none;">eventswap.com.br</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function ctaButton(text: string, url: string): string {
  return `<table cellpadding="0" cellspacing="0" style="margin:28px auto 0 auto;">
    <tr>
      <td style="background-color:#6C3CE1;border-radius:8px;text-align:center;">
        <a href="${url}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.2px;">${text}</a>
      </td>
    </tr>
  </table>`;
}

function infoRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;">
      <span style="font-size:13px;color:#71717a;">${label}</span>
    </td>
    <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;text-align:right;">
      <span style="font-size:13px;font-weight:600;color:#18181b;">${value}</span>
    </td>
  </tr>`;
}

// ---------------------------------------------------------------------------
// Email templates
// ---------------------------------------------------------------------------

function welcomeHtml(name: string): string {
  const body = `
    <h1 style="margin:0 0 8px 0;font-size:24px;font-weight:700;color:#18181b;">Bem-vindo à EventSwap, ${name}!</h1>
    <p style="margin:0 0 20px 0;font-size:15px;line-height:1.6;color:#52525b;">
      Estamos muito felizes em ter você aqui. A EventSwap é a plataforma segura para comprar e vender ingressos e experiências de eventos entre pessoas.
    </p>

    <table cellpadding="0" cellspacing="0" style="width:100%;background:#f9f7ff;border-radius:10px;padding:20px;margin-bottom:20px;">
      <tr><td>
        <p style="margin:0 0 12px 0;font-size:14px;font-weight:600;color:#18181b;">Como começar:</p>
        <p style="margin:0 0 8px 0;font-size:14px;color:#52525b;">&#10003;&nbsp; <strong>Complete seu perfil</strong> para aumentar a confiança dos compradores</p>
        <p style="margin:0 0 8px 0;font-size:14px;color:#52525b;">&#10003;&nbsp; <strong>Anuncie um ingresso</strong> que você não vai mais usar</p>
        <p style="margin:0 0 8px 0;font-size:14px;color:#52525b;">&#10003;&nbsp; <strong>Explore os anúncios</strong> e encontre o evento que você quer</p>
        <p style="margin:0;font-size:14px;color:#52525b;">&#10003;&nbsp; <strong>Pague com segurança</strong> — seu dinheiro fica protegido até a entrega</p>
      </td></tr>
    </table>

    <p style="margin:0 0 4px 0;font-size:14px;color:#52525b;">
      Qualquer dúvida, estamos à disposição pelo chat da plataforma.
    </p>
    ${ctaButton('Explorar anúncios', `${APP_URL}/listings`)}
  `;
  return baseLayout(`Bem-vindo, ${name}! Comece a usar a EventSwap agora.`, body);
}

function transactionCreatedHtml(data: {
  sellerName: string;
  buyerName: string;
  listingTitle: string;
  transactionCode: string;
  amount: string;
}): string {
  const body = `
    <h1 style="margin:0 0 8px 0;font-size:24px;font-weight:700;color:#18181b;">Nova proposta de compra!</h1>
    <p style="margin:0 0 20px 0;font-size:15px;line-height:1.6;color:#52525b;">
      Olá, <strong>${data.sellerName}</strong>! Um comprador demonstrou interesse no seu anúncio. Acompanhe os detalhes abaixo.
    </p>

    <table cellpadding="0" cellspacing="0" style="width:100%;border:1px solid #e4e4e7;border-radius:10px;overflow:hidden;margin-bottom:24px;">
      ${infoRow('Comprador', data.buyerName)}
      ${infoRow('Anúncio', data.listingTitle)}
      ${infoRow('Código da transação', data.transactionCode)}
      ${infoRow('Valor', data.amount)}
    </table>

    <p style="margin:0 0 4px 0;font-size:14px;line-height:1.6;color:#52525b;">
      O comprador tem <strong>48 horas</strong> para realizar o pagamento. Assim que confirmado, os fundos ficam retidos em escrow e você será notificado.
    </p>
    ${ctaButton('Ver detalhes da transação', `${APP_URL}/transactions/${data.transactionCode}`)}
  `;
  return baseLayout(
    `Nova proposta para "${data.listingTitle}" — ${data.amount}`,
    body
  );
}

function paymentConfirmedHtml(data: {
  name: string;
  transactionCode: string;
  amount: string;
  listingTitle: string;
}): string {
  const body = `
    <h1 style="margin:0 0 8px 0;font-size:24px;font-weight:700;color:#18181b;">Pagamento confirmado!</h1>
    <p style="margin:0 0 20px 0;font-size:15px;line-height:1.6;color:#52525b;">
      Olá, <strong>${data.name}</strong>! O pagamento da sua transação foi confirmado com sucesso.
    </p>

    <table cellpadding="0" cellspacing="0" style="width:100%;border:1px solid #e4e4e7;border-radius:10px;overflow:hidden;margin-bottom:24px;">
      ${infoRow('Anúncio', data.listingTitle)}
      ${infoRow('Código da transação', data.transactionCode)}
      ${infoRow('Valor', data.amount)}
    </table>

    <table cellpadding="0" cellspacing="0" style="width:100%;background:#f0fdf4;border-left:4px solid #22c55e;border-radius:4px;padding:16px;margin-bottom:20px;">
      <tr><td>
        <p style="margin:0 0 4px 0;font-size:14px;font-weight:600;color:#15803d;">Fundos em escrow</p>
        <p style="margin:0;font-size:14px;color:#166534;">
          O valor está retido em escrow pela EventSwap. Ele será liberado ao vendedor somente após a conclusão da transação. Isso garante sua segurança.
        </p>
      </td></tr>
    </table>

    <p style="margin:0 0 4px 0;font-size:14px;line-height:1.6;color:#52525b;">
      Acompanhe o andamento da transação pela plataforma.
    </p>
    ${ctaButton('Acompanhar transação', `${APP_URL}/transactions/${data.transactionCode}`)}
  `;
  return baseLayout(
    `Pagamento de ${data.amount} confirmado — ${data.transactionCode}`,
    body
  );
}

function transactionCompletedHtml(data: {
  name: string;
  transactionCode: string;
  amount: string;
}): string {
  const body = `
    <h1 style="margin:0 0 8px 0;font-size:24px;font-weight:700;color:#18181b;">Transação concluída!</h1>
    <p style="margin:0 0 20px 0;font-size:15px;line-height:1.6;color:#52525b;">
      Olá, <strong>${data.name}</strong>! Sua transação foi concluída com sucesso. Obrigado por usar a EventSwap!
    </p>

    <table cellpadding="0" cellspacing="0" style="width:100%;border:1px solid #e4e4e7;border-radius:10px;overflow:hidden;margin-bottom:24px;">
      ${infoRow('Código da transação', data.transactionCode)}
      ${infoRow('Valor', data.amount)}
    </table>

    <table cellpadding="0" cellspacing="0" style="width:100%;background:#faf5ff;border-left:4px solid #6C3CE1;border-radius:4px;padding:16px;margin-bottom:20px;">
      <tr><td>
        <p style="margin:0 0 4px 0;font-size:14px;font-weight:600;color:#6C3CE1;">Avalie a experiência</p>
        <p style="margin:0;font-size:14px;color:#52525b;">
          Sua opinião é muito importante! Deixe uma avaliação para ajudar outros usuários da comunidade EventSwap.
        </p>
      </td></tr>
    </table>

    ${ctaButton('Avaliar transação', `${APP_URL}/transactions/${data.transactionCode}`)}
  `;
  return baseLayout(
    `Transação ${data.transactionCode} concluída com sucesso!`,
    body
  );
}

function disputeOpenedHtml(data: {
  name: string;
  transactionCode: string;
  reason: string;
}): string {
  const body = `
    <h1 style="margin:0 0 8px 0;font-size:24px;font-weight:700;color:#18181b;">Disputa aberta</h1>
    <p style="margin:0 0 20px 0;font-size:15px;line-height:1.6;color:#52525b;">
      Olá, <strong>${data.name}</strong>. Uma disputa foi aberta para a transação abaixo. Nossa equipe está analisando o caso.
    </p>

    <table cellpadding="0" cellspacing="0" style="width:100%;border:1px solid #e4e4e7;border-radius:10px;overflow:hidden;margin-bottom:24px;">
      ${infoRow('Código da transação', data.transactionCode)}
      ${infoRow('Motivo', data.reason)}
    </table>

    <table cellpadding="0" cellspacing="0" style="width:100%;background:#fff7ed;border-left:4px solid #f97316;border-radius:4px;padding:16px;margin-bottom:20px;">
      <tr><td>
        <p style="margin:0 0 4px 0;font-size:14px;font-weight:600;color:#c2410c;">Prazo de resolução</p>
        <p style="margin:0;font-size:14px;color:#9a3412;">
          Disputas são analisadas em até <strong>5 dias úteis</strong>. Os fundos permanecem em escrow durante todo o processo. Entre em contato pelo chat da transação para mais informações.
        </p>
      </td></tr>
    </table>

    ${ctaButton('Ver detalhes da disputa', `${APP_URL}/transactions/${data.transactionCode}`)}
  `;
  return baseLayout(
    `Disputa aberta na transação ${data.transactionCode}`,
    body
  );
}

// ---------------------------------------------------------------------------
// Public email service
// ---------------------------------------------------------------------------

export const emailService = {
  /**
   * Sends a welcome email to a new user.
   */
  async sendWelcome(
    to: string,
    data: { name: string }
  ): Promise<void> {
    if (!resend) {
      console.warn('[Email] RESEND_API_KEY nao configurado — email de boas-vindas ignorado');
      return;
    }
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject: 'Bem-vindo à EventSwap!',
        html: welcomeHtml(data.name),
      });
      console.log(`[Email] Boas-vindas enviado para ${to}`);
    } catch (err) {
      console.error('[Email] Falha ao enviar boas-vindas:', err);
    }
  },

  /**
   * Notifies the seller that a new purchase proposal has been made.
   */
  async sendTransactionCreated(
    to: string,
    data: {
      buyerName: string;
      sellerName: string;
      listingTitle: string;
      transactionCode: string;
      amount: string;
    }
  ): Promise<void> {
    if (!resend) {
      console.warn('[Email] RESEND_API_KEY nao configurado — email de transacao criada ignorado');
      return;
    }
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject: `Nova proposta de compra — ${data.listingTitle}`,
        html: transactionCreatedHtml(data),
      });
      console.log(`[Email] Transacao criada enviado para ${to}`);
    } catch (err) {
      console.error('[Email] Falha ao enviar transacao criada:', err);
    }
  },

  /**
   * Notifies a user (buyer or seller) that payment has been confirmed.
   */
  async sendPaymentConfirmed(
    to: string,
    data: {
      name: string;
      transactionCode: string;
      amount: string;
      listingTitle: string;
    }
  ): Promise<void> {
    if (!resend) {
      console.warn('[Email] RESEND_API_KEY nao configurado — email de pagamento confirmado ignorado');
      return;
    }
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject: `Pagamento confirmado — ${data.transactionCode}`,
        html: paymentConfirmedHtml(data),
      });
      console.log(`[Email] Pagamento confirmado enviado para ${to}`);
    } catch (err) {
      console.error('[Email] Falha ao enviar pagamento confirmado:', err);
    }
  },

  /**
   * Notifies a user (buyer or seller) that the transaction has been completed.
   */
  async sendTransactionCompleted(
    to: string,
    data: {
      name: string;
      transactionCode: string;
      amount: string;
    }
  ): Promise<void> {
    if (!resend) {
      console.warn('[Email] RESEND_API_KEY nao configurado — email de transacao concluida ignorado');
      return;
    }
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject: `Transação concluída — ${data.transactionCode}`,
        html: transactionCompletedHtml(data),
      });
      console.log(`[Email] Transacao concluida enviado para ${to}`);
    } catch (err) {
      console.error('[Email] Falha ao enviar transacao concluida:', err);
    }
  },

  /**
   * Notifies a user (buyer or seller) that a dispute has been opened.
   */
  async sendDisputeOpened(
    to: string,
    data: {
      name: string;
      transactionCode: string;
      reason: string;
    }
  ): Promise<void> {
    if (!resend) {
      console.warn('[Email] RESEND_API_KEY nao configurado — email de disputa ignorado');
      return;
    }
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject: `Disputa aberta — ${data.transactionCode}`,
        html: disputeOpenedHtml(data),
      });
      console.log(`[Email] Disputa aberta enviado para ${to}`);
    } catch (err) {
      console.error('[Email] Falha ao enviar disputa aberta:', err);
    }
  },
};
