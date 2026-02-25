// api/score.js
// Vercel KV (Redis) — connect ได้ที่ Vercel Dashboard > Storage > KV
// Vercel จะ inject env vars ให้อัตโนมัติเมื่อ connect KV กับ project แล้ว

const KV_URL   = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

async function kvGet(key) {
  const r = await fetch(`${KV_URL}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
  });
  const j = await r.json();
  if (!j.result) return null;
  try { return JSON.parse(j.result); } catch { return j.result; }
}

async function kvSet(key, value) {
  await fetch(`${KV_URL}/set/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(JSON.stringify(value)),
  });
}

async function kvDel(key) {
  await fetch(`${KV_URL}/del/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
  });
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // ── GET /api/score — ดึงคะแนนทุกกลุ่ม ────────────────────────────────
    if (req.method === 'GET') {
      const groups = {};
      await Promise.all(
        [1, 2, 3, 4, 5, 6].map(async (g) => {
          const d = await kvGet('cjq_g' + g);
          groups[g] = d || { score: 0, answered: [], count: 0 };
        })
      );
      return res.status(200).json({ ok: true, groups });
    }

    // ── POST /api/score — บันทึกคะแนน / รีเซ็ต ──────────────────────────
    if (req.method === 'POST') {
      const body = req.body || {};

      // รีเซ็ตกลุ่ม { reset: true, group: 1-6 }
      if (body.reset) {
        const g = parseInt(body.group);
        if (g >= 1 && g <= 6) await kvDel('cjq_g' + g);
        return res.status(200).json({ ok: true, reset: true });
      }

      // บันทึกคำตอบ { group, qnum, correct }
      const group   = parseInt(body.group);
      const qnum    = parseInt(body.qnum);
      const correct = !!body.correct;

      if (!group || group < 1 || group > 6)
        return res.status(400).json({ ok: false, error: 'invalid group' });
      if (!qnum || qnum < 1 || qnum > 20)
        return res.status(400).json({ ok: false, error: 'invalid qnum' });

      const key = 'cjq_g' + group;
      let d = (await kvGet(key)) || { score: 0, answered: [], count: 0 };

      // ป้องกันส่งข้อเดิมซ้ำ
      if (d.answered.includes(qnum)) {
        return res.status(200).json({ ok: true, duplicate: true, data: d });
      }

      if (correct) d.score += 1;
      d.answered.push(qnum);
      d.count = (d.count || 0) + 1;
      await kvSet(key, d);

      return res.status(200).json({ ok: true, duplicate: false, data: d });
    }

    return res.status(405).json({ ok: false, error: 'method not allowed' });
  } catch (err) {
    console.error('[score API]', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
