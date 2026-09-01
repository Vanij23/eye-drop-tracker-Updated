// Serverless function: shared storage for the eye drop tracker.
// Reads/writes one JSON blob (doses + dose-time settings) using Upstash
// Redis (the database Vercel now provisions via Storage -> Upstash),
// so every family member's browser sees the same data.
import { Redis } from '@upstash/redis';

// Different Vercel/Upstash integration versions have named these env vars
// slightly differently over time, so we accept either pair.
const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = url && token ? new Redis({ url, token }) : null;

const DOSES_KEY = 'eyeDropTracker:doses';
const SETTINGS_KEY = 'eyeDropTracker:settings';

export default async function handler(req, res) {
  if (!redis) {
    res.status(500).json({ error: 'No database connected yet. Add Upstash Redis in Storage and redeploy.' });
    return;
  }

  try {
    if (req.method === 'GET') {
      const [doses, settings] = await Promise.all([
        redis.get(DOSES_KEY),
        redis.get(SETTINGS_KEY),
      ]);
      res.status(200).json({ doses: doses || {}, settings: settings || null });
      return;
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const tasks = [];
      if (body && body.doses !== undefined) tasks.push(redis.set(DOSES_KEY, body.doses));
      if (body && body.settings !== undefined) tasks.push(redis.set(SETTINGS_KEY, body.settings));
      await Promise.all(tasks);
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: 'Storage error', detail: String(err) });
  }
}
