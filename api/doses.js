// Serverless function: shared storage for the eye drop tracker.
// Reads/writes one JSON blob (doses + dose-time settings) to Vercel KV,
// so every family member's browser sees the same data.
import { kv } from '@vercel/kv';

const DOSES_KEY = 'eyeDropTracker:doses';
const SETTINGS_KEY = 'eyeDropTracker:settings';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const [doses, settings] = await Promise.all([
        kv.get(DOSES_KEY),
        kv.get(SETTINGS_KEY),
      ]);
      res.status(200).json({ doses: doses || {}, settings: settings || null });
      return;
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const tasks = [];
      if (body && body.doses !== undefined) tasks.push(kv.set(DOSES_KEY, body.doses));
      if (body && body.settings !== undefined) tasks.push(kv.set(SETTINGS_KEY, body.settings));
      await Promise.all(tasks);
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: 'Storage not connected yet', detail: String(err) });
  }
}
