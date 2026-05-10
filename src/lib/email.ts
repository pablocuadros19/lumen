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
}

function primerNombre(nombre: string): string {
  return escapeHtml((nombre || '').split(' ')[0] || 'docente')
}

function layoutHtml(opts: {
  saludo: string
  mensaje: string
  submensaje?: string
  comentario?: string
  recurso: RecursoEmail
  ctaTexto: string
}): string {
  const { saludo, mensaje, submensaje, comentario, recurso, ctaTexto } = opts
  const url = `${SITE_URL}/recurso/${recurso.id}`
  const logoUrl = `${SITE_URL}/logo.png`

  const meta = [
    recurso.areas.join(' · '),
    recurso.grados.length > 0 ? recurso.grados.join(', ') : '',
    recurso.tipo,
  ].filter(Boolean).join('  ·  ')

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#EBF0F7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding:32px 16px;">
<tr><td align="center">
<table width="580" cellpadding="0" cellspacing="0" role="presentation" style="max-width:580px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 16px rgba(26,58,92,0.10);">

  <!-- HEADER -->
  <tr>
    <td style="background:linear-gradient(135deg,#1A3A5C 0%,#2E6EA6 55%,#8B2252 100%);padding:26px 36px;">
      <table cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td style="vertical-align:middle;">
            <img src="${logoUrl}" alt="LUMEN" width="44" height="44"
              style="border-radius:12px;display:block;border:2px solid rgba(255,255,255,0.25);" />
          </td>
          <td style="vertical-align:middle;padding-left:14px;">
            <div style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;line-height:1;">LUMEN</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.65);margin-top:3px;letter-spacing:0.8px;text-transform:uppercase;">Plataforma pedagógica · Newman</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- BODY -->
  <tr>
    <td style="padding:36px 36px 28px;">

      <h1 style="margin:0 0 14px;font-size:22px;font-weight:700;color:#1A3A5C;line-height:1.25;">${saludo}</h1>

      <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#374151;">${mensaje}</p>

      ${comentario ? `
      <div style="background:#FFFBEB;border-left:4px solid #F59E0B;border-radius:0 12px 12px 0;padding:16px 20px;margin-bottom:24px;">
        <p style="margin:0 0 6px;font-size:10px;font-weight:700;color:#92400E;text-transform:uppercase;letter-spacing:1.5px;">Devolución</p>
        <p style="margin:0;font-size:14px;color:#78350F;line-height:1.65;">${escapeHtml(comentario).replace(/\n/g, '<br>')}</p>
      </div>` : ''}

      ${submensaje ? `<p style="margin:-12px 0 24px;font-size:14px;line-height:1.65;color:#6b7280;">${submensaje}</p>` : ''}

      <!-- Card recurso -->
      <div style="background:#f7f9fc;border:1px solid #e0e5ec;border-left:4px solid #8B2252;border-radius:0 14px 14px 0;padding:18px 22px;margin-bottom:30px;">
        <p style="margin:0 0 6px;font-size:16px;font-weight:700;color:#1A3A5C;line-height:1.35;">${escapeHtml(recurso.titulo)}</p>
        <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5;">${escapeHtml(meta)}</p>
      </div>

      <!-- CTA -->
      <table cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td style="border-radius:10px;background:linear-gradient(135deg,#8B2252,#6d1b41);box-shadow:0 4px 12px rgba(139,34,82,0.25);">
            <a href="${url}"
               style="display:block;padding:13px 30px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.3px;white-space:nowrap;">
              ${ctaTexto} →
            </a>
          </td>
        </tr>
      </table>

    </td>
  </tr>

  <!-- DIVISOR -->
  <tr>
    <td style="padding:0 36px;">
      <div style="height:3px;background:linear-gradient(90deg,#1A3A5C,#2E6EA6,#8B2252);border-radius:2px;opacity:0.15;"></div>
    </td>
  </tr>

  <!-- FOOTER -->
  <tr>
    <td style="padding:20px 36px 24px;">
      <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;text-align:center;">
        Mensaje automático de LUMEN · Colegio Cardenal Newman<br>
        <a href="${SITE_URL}" style="color:#2E6EA6;text-decoration:none;font-weight:500;">Ir a la plataforma</a>
      </p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

// ─── Email 1: Nuevo recurso → coordinadora ───────────────────────────────────

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
        subject: `Nuevo material para revisar — ${opts.recurso.titulo}`,
        html: layoutHtml({
          saludo: `Hola ${primerNombre(dest.nombre)},`,
          mensaje: `<strong>${autorEsc}</strong> subió material nuevo a LUMEN. Podés revisarlo y decidir si lo publicamos o pedimos algún ajuste.`,
          recurso: opts.recurso,
          ctaTexto: 'Ver el recurso',
        }),
      }).catch(err => console.error('[email] nuevo recurso:', err))
    )
  )
}

// ─── Email 2: Recurso aprobado → docente ─────────────────────────────────────

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
      subject: `Tu material fue aprobado — ${opts.recurso.titulo}`,
      html: layoutHtml({
        saludo: `¡Hola ${primerNombre(opts.destinatario.nombre)}!`,
        mensaje: `<strong>${escapeHtml(opts.aprobador)}</strong> revisó tu material y lo aprobó. Ya está publicado en la biblioteca, disponible para todo el equipo.`,
        recurso: opts.recurso,
        ctaTexto: 'Verlo en LUMEN',
      }),
    })
  } catch (err) {
    console.error('[email] aprobado:', err)
  }
}

// ─── Email 3: Recurso observado → docente ────────────────────────────────────

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
      subject: `Ajustes antes de publicar — ${opts.recurso.titulo}`,
      html: layoutHtml({
        saludo: `Hola ${primerNombre(opts.destinatario.nombre)},`,
        mensaje: `<strong>${escapeHtml(opts.revisor)}</strong> revisó tu material y sugirió algunos cambios antes de publicarlo. Cuando los tengas listos, podés reenviarlo desde la página del recurso.`,
        comentario: opts.comentario,
        recurso: opts.recurso,
        ctaTexto: 'Ir a hacer los ajustes',
      }),
    })
  } catch (err) {
    console.error('[email] observado:', err)
  }
}
