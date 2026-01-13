/**
 * Template Base de E-mail - Themixa
 * 
 * Template HTML profissional, responsivo, compatível com Gmail/Outlook.
 * Usa apenas inline CSS (email-safe).
 */

export type EmailTemplateProps = {
  title: string
  preheader?: string
  body: string
  ctaLabel?: string
  ctaUrl?: string
  severity?: 'info' | 'warning' | 'danger'
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function getAppUrl(): string {
  const url = (process.env.NEXT_PUBLIC_APP_URL || '').trim()
  if (!url) return 'http://localhost:3000'
  return url.replace(/\/$/, '')
}

function getColorBySeverity(severity?: 'info' | 'warning' | 'danger'): string {
  if (severity === 'danger') return '#dc2626'
  if (severity === 'warning') return '#d97706'
  return '#2563eb'
}

/**
 * Renderiza template base de e-mail profissional.
 * 
 * HTML completo, responsivo, compatível com clientes de e-mail modernos.
 * Usa apenas inline CSS (email-safe).
 */
export function renderBaseEmail(props: EmailTemplateProps): string {
  const appUrl = getAppUrl()
  const accentColor = getColorBySeverity(props.severity)
  const preheader = props.preheader || props.title

  return `<!DOCTYPE html>
<html lang="pt-BR" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>${escapeHtml(props.title)}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; max-width: 100% !important; }
      .content { padding: 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6fb; font-family: Arial, Helvetica, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  <!-- Preheader (texto oculto) -->
  <div style="display: none; font-size: 1px; color: #f4f6fb; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${escapeHtml(preheader)}
  </div>

  <!-- Wrapper -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0; padding: 0; background-color: #f4f6fb;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <!-- Container -->
        <table role="presentation" class="container" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); padding: 32px 40px; text-align: center;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <div style="font-size: 28px; font-weight: bold; color: #ffffff; letter-spacing: -0.5px; margin: 0;">
                      Themixa
                    </div>
                    <div style="font-size: 13px; color: rgba(255, 255, 255, 0.9); margin-top: 4px; letter-spacing: 0.5px;">
                      PLATAFORMA JURÍDICA
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td class="content" style="padding: 40px;">
              <!-- Title -->
              <h1 style="margin: 0 0 24px 0; font-size: 24px; font-weight: bold; color: #0f172a; line-height: 1.3;">
                ${escapeHtml(props.title)}
              </h1>

              <!-- Body -->
              <div style="font-size: 16px; line-height: 1.6; color: #334155; margin-bottom: ${props.ctaLabel ? '32px' : '0'};">
                ${props.body}
              </div>

              ${props.ctaLabel && props.ctaUrl ? `
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 32px 0 0 0;">
                <tr>
                  <td align="left">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="background-color: ${accentColor}; border-radius: 6px;">
                          <a href="${escapeHtml(props.ctaUrl)}" style="display: inline-block; padding: 14px 28px; font-size: 16px; font-weight: bold; color: #ffffff; text-decoration: none; border-radius: 6px; background-color: ${accentColor};">
                            ${escapeHtml(props.ctaLabel)}
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              ` : ''}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 32px 40px; border-top: 1px solid #e2e8f0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="font-size: 13px; line-height: 1.6; color: #64748b;">
                    <p style="margin: 0 0 16px 0;">
                      <strong>⚠️ Aviso Legal:</strong> Este e-mail é um lembrete automático. O Themixa não substitui a conferência processual oficial.
                    </p>
                    <p style="margin: 0;">
                      <a href="${appUrl}/dashboard/settings/notifications" style="color: #2563eb; text-decoration: underline;">Gerenciar preferências de e-mail</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}


