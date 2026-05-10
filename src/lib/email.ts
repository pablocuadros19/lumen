import { Resend } from 'resend'

const resendKey = process.env.RESEND_API_KEY
const resend = resendKey ? new Resend(resendKey) : null

const FROM = process.env.EMAIL_FROM || 'LUMEN <notificaciones@lumen.ar>'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lumen-sand-zeta.vercel.app'

interface RecursoEmail {
  id: string
  titulo: string
  areas: string[]
  grados: string[]
  tipo: string
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function primerNombre(nombre: string): string {
  return escapeHtml((nombre || '').split(' ')[0] || 'docente')
}

function layoutHtml(opts: {
  saludo: string
  mensaje: string
  comentario?: string
  recurso: RecursoEmail
  ctaTexto: string
}): string {
  const { saludo, mensaje, comentario, recurso, ctaTexto } = opts
  const url = `${SITE_URL}/recurso/${recurso.id}`
  const meta = [
    recurso.areas.join(' · '),
    recurso.grados.length > 0 ? recurso.grados.join(', ') : '',
    recurso.tipo,
  ].filter(Boolean).join(' · ')

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;background:#f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
        <tr>
          <td style="background:linear-gradient(135deg,#1A3A5C,#2E6EA6);padding:24px 32px;color:white;">
            <div style="font-size:18px;font-weight:700;letter-spacing:-0.5px;">LUMEN</div>
            <div style="font-size:12px;opacity:0.8;margin-top:2px;">Plataforma pedagógica · Newman</div>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <h1 style="margin:0 0 8px;font-size:20px;color:#1A3A5C;font-weight:700;">${saludo}</h1>
            <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#374151;">${mensaje}</p>
            ${comentario ? `
            <div style="background:#FEF3C7;border-left:4px solid #F59E0B;padding:14px 16px;border-radius:8px;margin-bottom:24px;">
              <div style="font-size:11px;font-weight:700;color:#92400E;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Devolución</div>
              <div style="font-size:14px;color:#78350F;line-height:1.5;">${escapeHtml(comentario).replace(/\n/g, '<br>')}</div>
            </div>` : ''}
            <div style="background:#f7f9fc;border:1px solid #e0e5ec;border-radius:12px;padding:16px 18px;margin-bottom:24px;">
              <div style="font-size:16px;font-weight:700;color:#1A3A5C;margin-bottom:6px;">${escapeHtml(recurso.titulo)}</div>
              <div style="font-size:13px;color:#6b7280;">${escapeHtml(meta)}</div>
            </div>
            <a href="${url}" style="display:inline-block;background:#8B2252;color:white;padding:12px 28px;border-radius:10px;font-weight:600;font-size:14px;text-decoration:none;">${ctaTexto}</a>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:16px 32px;border-top:1px solid #f3f4f6;">
            <div style="font-size:11px;color:#9ca3af;text-align:center;">
              LUMEN · Plataforma pedagógica del Colegio Cardenal Newman
            </div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function emailNuevoRecurso(opts: {
  destinatarios: { email: string; nombre: string }[]
  autor: string
  recurso: RecursoEmail
}) {
  if (!resend || opts.destinatarios.length === 0) return
  const autorEsc = escapeHtml(opts.autor)

  await Promise.allSettled(
    opts.destinatarios.map(dest =>
      resend!.emails.send({
        from: FROM,
        to: dest.email,
        subject: `Nuevo recurso para revisar — ${opts.recurso.titulo}`,
        html: layoutHtml({
          saludo: `Hola ${primerNombre(dest.nombre)}`,
          mensaje: `<strong>${autorEsc}</strong> subió un recurso a LUMEN y está esperando tu revisión.`,
          recurso: opts.recurso,
          ctaTexto: 'Revisar recurso',
        }),
      }).catch(err => console.error('[email] nuevo recurso:', err))
    )
  )
}

export async function emailRecursoAprobado(opts: {
  destinatario: { email: string; nombre: string }
  aprobador: string
  recurso: RecursoEmail
}) {
  if (!resend) return
  try {
    await resend.emails.send({
      from: FROM,
      to: opts.destinatario.email,
      subject: `Tu recurso fue aprobado — ${opts.recurso.titulo}`,
      html: layoutHtml({
        saludo: `¡Hola ${primerNombre(opts.destinatario.nombre)}!`,
        mensaje: `<strong>${escapeHtml(opts.aprobador)}</strong> aprobó tu recurso. Ya está visible para todo el equipo en la biblioteca.`,
        recurso: opts.recurso,
        ctaTexto: 'Ver en LUMEN',
      }),
    })
  } catch (err) {
    console.error('[email] aprobado:', err)
  }
}

export async function emailRecursoObservado(opts: {
  destinatario: { email: string; nombre: string }
  revisor: string
  comentario: string
  recurso: RecursoEmail
}) {
  if (!resend) return
  try {
    await resend.emails.send({
      from: FROM,
      to: opts.destinatario.email,
      subject: `Tu recurso necesita correcciones — ${opts.recurso.titulo}`,
      html: layoutHtml({
        saludo: `Hola ${primerNombre(opts.destinatario.nombre)}`,
        mensaje: `<strong>${escapeHtml(opts.revisor)}</strong> revisó tu recurso y dejó una devolución. Lo pausamos hasta que apliques los ajustes y lo reenvíes desde la plataforma.`,
        comentario: opts.comentario,
        recurso: opts.recurso,
        ctaTexto: 'Ir al recurso',
      }),
    })
  } catch (err) {
    console.error('[email] observado:', err)
  }
}
