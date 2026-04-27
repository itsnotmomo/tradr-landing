export default async function handler(req, res) {
  try {
    const response = await fetch(
      'https://api.resend.com/audiences/22a95347-d78e-4d71-9115-b64e21dcf11e/contacts?limit=1000',
      {
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        },
      }
    );
    const data = await response.json();
    const total = data.total ?? data.data?.length ?? 0;
    const count = 743 + total;
    return res.status(200).json({ count });
  } catch (err) {
    return res.status(200).json({ count: 743 });
  }
}
