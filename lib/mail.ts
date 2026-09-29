import nodemailer, { type Transporter } from "nodemailer";

interface SendPasswordResetEmailParams {
  to: string;
  name: string;
  resetUrl: string;
  language?: "id" | "en";
}

let transporter: Transporter | null = null;

function getMailTransporter(): Transporter {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
  } else {
    // Development fallback transporter: writes to console or uses jsonTransport
    transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: "unix",
      buffer: true,
    });
  }

  return transporter;
}

export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
  language = "id",
}: SendPasswordResetEmailParams): Promise<{ success: boolean; messageId?: string; previewUrl?: string }> {
  const mailer = getMailTransporter();
  const from = process.env.SMTP_FROM || '"Secure Quiz Wrapper" <noreply@securequiz.local>';

  const isId = language === "id";
  const subject = isId
    ? "Atur Ulang Kata Sandi - Secure Quiz Wrapper"
    : "Reset Your Password - Secure Quiz Wrapper";

  const greeting = isId ? `Halo, ${name}` : `Hello, ${name}`;
  const intro = isId
    ? "Kami menerima permintaan untuk mengatur ulang kata sandi akun admin Secure Quiz Wrapper Anda. Klik tombol di bawah ini untuk memasukkan kata sandi baru:"
    : "We received a request to reset the password for your Secure Quiz Wrapper admin account. Click the button below to set a new password:";
  const buttonText = isId ? "Atur Ulang Kata Sandi" : "Reset Password";
  const validityNotice = isId
    ? "Tautan ini hanya berlaku selama 1 jam. Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini."
    : "This link is valid for 1 hour only. If you did not request this, you can safely ignore this email.";
  const fallbackNotice = isId
    ? "Atau salin tautan berikut ke peramban Anda:"
    : "Or copy this link to your browser:";

  const html = `
    <!DOCTYPE html>
    <html lang="${language}">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #18181b;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="min-width: 100%; background-color: #f4f4f5; padding: 40px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" style="max-width: 540px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e4e4e7; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
                <tr>
                  <td style="padding: 32px 32px 24px; border-bottom: 1px solid #f4f4f5;">
                    <div style="font-size: 18px; font-weight: 700; color: #09090b; letter-spacing: -0.02em;">
                      Secure Quiz Wrapper
                    </div>
                    <div style="font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 4px;">
                      ${isId ? "Konsol Pengawas" : "Admin Console"}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 32px;">
                    <h1 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #09090b; line-height: 1.3;">
                      ${greeting}
                    </h1>
                    <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #3f3f46;">
                      ${intro}
                    </p>
                    <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 0 28px;">
                      <tr>
                        <td align="center" style="border-radius: 8px; background-color: #09090b;">
                          <a href="${resetUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 12px 24px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px;">
                            ${buttonText}
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin: 0 0 12px; font-size: 13px; line-height: 1.5; color: #71717a;">
                      ${validityNotice}
                    </p>
                    <p style="margin: 0 0 6px; font-size: 12px; color: #a1a1aa;">
                      ${fallbackNotice}
                    </p>
                    <p style="margin: 0; font-size: 12px; word-break: break-all; color: #2563eb;">
                      <a href="${resetUrl}" style="color: #2563eb; text-decoration: underline;">${resetUrl}</a>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 32px; background-color: #fafafa; border-top: 1px solid #f4f4f5; text-align: center; font-size: 12px; color: #a1a1aa;">
                    &copy; ${new Date().getFullYear()} Secure Quiz Wrapper · Controlled Assessment Environment
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const text = `${greeting}\n\n${intro}\n\n${buttonText}: ${resetUrl}\n\n${validityNotice}\n`;

  try {
    const info = await mailer.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });

    if (info.message) {
      console.log("[SMTP development fallback] Email message preview:\n", info.message.toString());
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    return { success: false };
  }
}

export interface SendFeedbackEmailParams {
  name?: string;
  email?: string;
  category?: string;
  message: string;
}

export async function sendFeedbackEmail({
  name,
  email,
  category = "Saran & Masukan",
  message,
}: SendFeedbackEmailParams): Promise<{ success: boolean; messageId?: string }> {
  const mailer = getMailTransporter();
  const to = process.env.FEEDBACK_RECIPIENT_EMAIL || process.env.SMTP_USER || "admin@securequiz.local";
  const from = process.env.SMTP_FROM || '"Secure Quiz Wrapper" <noreply@securequiz.local>';

  const senderName = name?.trim() || "Pengguna";
  const senderEmail = email?.trim() || "Tidak dicantumkan";
  const cleanCategory = category?.trim() || "Umum";

  const subject = `[Feedback Secure Quiz] ${cleanCategory} - dari ${senderName}`;

  const html = `
    <!DOCTYPE html>
    <html lang="id">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #18181b;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="min-width: 100%; background-color: #f4f4f5; padding: 40px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e4e4e7; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
                <tr>
                  <td style="padding: 24px 32px; background-color: #09090b; color: #ffffff;">
                    <div style="font-size: 18px; font-weight: 700; letter-spacing: -0.02em;">
                      Secure Quiz Wrapper
                    </div>
                    <div style="font-size: 12px; color: #a1a1aa; margin-top: 4px;">
                      Pesan Saran & Masukan Baru
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 32px;">
                    <div style="margin-bottom: 24px; padding: 16px; background-color: #f4f4f5; border-radius: 8px;">
                      <table style="width: 100%; font-size: 13px; line-height: 1.6;">
                        <tr>
                          <td style="width: 130px; color: #71717a; font-weight: 500;">Kategori:</td>
                          <td style="color: #09090b; font-weight: 600;">${cleanCategory}</td>
                        </tr>
                        <tr>
                          <td style="color: #71717a; font-weight: 500;">Pengirim:</td>
                          <td style="color: #09090b;">${senderName}</td>
                        </tr>
                        <tr>
                          <td style="color: #71717a; font-weight: 500;">Email Balasan:</td>
                          <td style="color: #2563eb;">${senderEmail}</td>
                        </tr>
                        <tr>
                          <td style="color: #71717a; font-weight: 500;">Waktu:</td>
                          <td style="color: #71717a;">${new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })} WIB</td>
                        </tr>
                      </table>
                    </div>

                    <h2 style="margin: 0 0 12px; font-size: 15px; font-weight: 600; color: #09090b;">
                      Isi Pesan:
                    </h2>
                    <div style="padding: 16px; background-color: #ffffff; border: 1px solid #e4e4e7; border-left: 4px solid #10b981; border-radius: 6px; font-size: 14px; line-height: 1.7; color: #27272a; white-space: pre-wrap;">${message.trim()}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 32px; background-color: #fafafa; border-top: 1px solid #f4f4f5; text-align: center; font-size: 12px; color: #a1a1aa;">
                    Email dikirimkan secara otomatis oleh sistem Secure Quiz Wrapper.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const text = `Saran & Masukan Baru:\nKategori: ${cleanCategory}\nPengirim: ${senderName}\nEmail: ${senderEmail}\nWaktu: ${new Date().toISOString()}\n\nPesan:\n${message.trim()}\n`;

  try {
    const info = await mailer.sendMail({
      from,
      to,
      replyTo: email?.trim() || undefined,
      subject,
      text,
      html,
    });

    if (info.message) {
      console.log("[SMTP development fallback] Feedback preview:\n", info.message.toString());
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Failed to send feedback email:", error);
    return { success: false };
  }
}

