import { Router } from 'express';

const router = Router();

const SYSTEM_PROMPT = `You are a financial portfolio analysis agent.

Return ONLY valid JSON:

{
  "documentsAnalyzed": number,
  "holdingsIdentified": number,
  "assetClassesDetected": number,
  "diversificationScore": number,
  "riskFlags": [],
  "summary": string
}

Rules:
- Output MUST be valid JSON only
- No markdown, no explanations
- diversificationScore: 0–100
- riskFlags: short risk strings only`;

const MOCK_RESPONSE = {
  documentsAnalyzed:    1,
  holdingsIdentified:   10,
  assetClassesDetected: 5,
  diversificationScore: 72,
  riskFlags:            [],
  summary:              'Mock portfolio analysis: well-diversified across 5 asset classes with moderate risk exposure.',
};

router.post('/portfolio-analysis', async (req, res) => {
  const { notes = '', filesText = '' } = req.body;
  const mode = req.query.mode || process.env.ANALYSIS_MODE || 'mock';

  // ── MOCK branch ────────────────────────────────────────────────────────────
  if (mode === 'mock') {
    console.log('[portfolio-analysis] Mode: MOCK');
    return res.json({ success: true, source: 'MOCK', data: MOCK_RESPONSE });
  }

  // ── LLM branch ─────────────────────────────────────────────────────────────
  console.log('[portfolio-analysis] Mode: LLM');

  if (!process.env.OPENAI_API_KEY) {
    console.warn('[portfolio-analysis] OPENAI_API_KEY not set — returning failure for fallback');
    return res.json({ success: false, error: 'OPENAI_API_KEY not configured' });
  }

  const userMessage = `Analyze the following client portfolio data:

Notes: ${notes || '(none)'}
Files: ${filesText || '(none)'}

Return ONLY valid JSON as specified.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user',   content: userMessage   },
        ],
        temperature: 0.2,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[portfolio-analysis] OpenAI API error:', response.status, errText);
      return res.json({ success: false, error: `OpenAI API error: ${response.status}` });
    }

    const completion = await response.json();
    const raw = completion.choices?.[0]?.message?.content ?? '';

    console.log('[portfolio-analysis] Raw LLM response:', raw);

    const parsed = JSON.parse(raw);

    console.log('[portfolio-analysis] Parsed result:', JSON.stringify(parsed, null, 2));

    return res.json({ success: true, source: 'LLM', data: parsed });
  } catch (err) {
    console.error('[portfolio-analysis] LLM failed → fallback to MOCK', err.message);
    return res.json({ success: true, source: 'MOCK_FALLBACK', data: MOCK_RESPONSE });
  }
});

export default router;
