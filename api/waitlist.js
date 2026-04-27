export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  try {
    const response = await fetch(
      'https://api.resend.com/audiences/22a95347-d78e-4d71-9115-b64e21dcf11e/contacts',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          unsubscribed: false,
          data: {
            source: 'waitlist',
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return res.status(500).json({ error });
    }

    try {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Tradr <hello@tradr.me>',
          to: [email],
          subject: "You're on the Tradr waitlist 🔑",
          html: `<div style="background-color:#0D0D0D;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:480px;margin:0 auto;background-color:#111111;border:1px solid #1f1f1f;border-radius:12px;overflow:hidden;">
    <div style="background-color:#111111;padding:32px 40px 24px;border-bottom:1px solid #1f1f1f;">
      <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Tradr</p>
    </div>
    <div style="padding:40px;">
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#ffffff;">You're on the list 🔑</h1>
      <p style="margin:0 0 32px;font-size:15px;color:#888888;line-height:1.6;">You've been added to the Tradr private beta waitlist. We're launching June 2026 — a small group of traders will get access before anyone else.</p>
      <div style="background-color:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:24px;text-align:center;margin-bottom:32px;">
        <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#888888;letter-spacing:1px;text-transform:uppercase;">Your status</p>
        <p style="margin:0;font-size:24px;font-weight:700;color:#22A386;letter-spacing:2px;">WAITLIST ✓</p>
      </div>
      <p style="margin:0;font-size:13px;color:#555555;text-align:center;">We'll reach out personally when it's your turn. No spam — one email when we launch.</p>
    </div>
    <div style="padding:24px 40px;border-top:1px solid #1f1f1f;">
      <p style="margin:0;font-size:12px;color:#444444;text-align:center;">© 2026 Tradr LTD · <a href="https://tradr.me" style="color:#444444;text-decoration:none;">tradr.me</a></p>
    </div>
  </div>
</div>`,
        }),
      });

      if (!emailResponse.ok) {
        const error = await emailResponse.text();
        console.error('Resend confirmation email failed:', error);
      }
    } catch (err) {
      console.error('Resend confirmation email error:', err?.message || err);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
