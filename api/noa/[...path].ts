export default async function handler(req: any, res: any) {
  const path = Array.isArray(req.query.path) ? req.query.path.join('/') : req.query.path || '';
  if (!process.env.NOA_SERVER_URL || !process.env.NOA_API_KEY) return res.status(503).json({ offline: true });
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const upstream = await fetch(`${process.env.NOA_SERVER_URL.replace(/\/$/, '')}/api/studio/${path}`, { method: req.method, headers: { 'content-type': 'application/json', 'x-api-key': process.env.NOA_API_KEY }, body: ['GET', 'HEAD'].includes(req.method || '') ? undefined : JSON.stringify(req.body), signal: controller.signal });
    const text = await upstream.text(); res.status(upstream.status).send(text);
  } catch { res.status(503).json({ offline: true }); } finally { clearTimeout(timer); }
}
