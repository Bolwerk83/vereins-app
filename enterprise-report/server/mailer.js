// =========================================================================
//  MAILER — Versand via nodemailer (optionalDependency). Ohne SMTP-Konfig
//  läuft alles als „dry-run" (kein realer Versand), damit nichts blockiert.
// =========================================================================
export function mailKonfiguriert() {
  return !!(process.env.SMTP_HOST && process.env.MAIL_FROM)
}

export async function sendeMail({ an = [], betreff, text, html, anhaenge = [] }) {
  if (!an.length) return { status: 'uebersprungen', grund: 'keine Empfänger' }
  if (!mailKonfiguriert()) return { status: 'dry-run', grund: 'SMTP nicht konfiguriert (server/.env)' }
  let nodemailer
  try { nodemailer = (await import('nodemailer')).default } catch {
    return { status: 'fehler', grund: 'nodemailer nicht installiert — im Ordner server: npm install nodemailer' }
  }
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false') === 'true',
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
  })
  const info = await transport.sendMail({
    from: process.env.MAIL_FROM, to: an.join(', '), subject: betreff, text, html,
    attachments: anhaenge.map((a) => ({ filename: a.filename, content: a.content }))
  })
  return { status: 'gesendet', id: info.messageId }
}
