const json = (statusCode, body) => ({ statusCode, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify(body) });
export default async (request) => {
  if (request.method !== 'POST') return json(405, { error: 'Method not allowed.' });
  if (!process.env.OPENAI_API_KEY) return json(503, { error: 'The AI assistant is not configured yet. Please contact James on WhatsApp.' });
  let payload;
  try { payload = await request.json(); } catch { return json(400, { error: 'Invalid JSON.' }); }
  if (!Array.isArray(payload?.messages)) return json(400, { error: 'Send a list of chat messages.' });
  const messages = payload.messages.slice(-10).filter(m => m && ['user','assistant'].includes(m.role) && typeof m.content === 'string' && m.content.trim() && m.content.length <= 1200).map(m => ({ role: m.role, content: m.content.trim() }));
  if (!messages.length || messages.at(-1).role !== 'user') return json(400, { error: 'Ask a question to continue.' });
  const system = `You are the helpful website assistant for James Digitals, a Nigeria-based remote-first digital studio branded JMXI-tech. Answer clearly, warmly and concisely. Services: responsive business websites and landing pages; frontend, backend and full-stack applications; AI workflows and process automation; virtual assistance, research and digital operations. Indicative prices: business website ₦120,000, landing page ₦60,000, full-stack application ₦250,000, AI automation ₦100,000, virtual assistance ₦50,000. Final pricing depends on scope. Email jamesdigitls@gmail.com. WhatsApp +2348153126056, https://wa.me/2348153126056. Do not invent clients, testimonials, guarantees or project details. If uncertain, invite the visitor to contact James.`;
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { Authorization: 'Bearer ' + process.env.OPENAI_API_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-4o-mini', messages: [{ role: 'system', content: system }, ...messages], max_tokens: 400, temperature: 0.4 }) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) return json(503, { error: 'The assistant is temporarily unavailable. Please contact James on WhatsApp.' });
    return json(200, { reply: result.choices?.[0]?.message?.content || 'I could not prepare an answer. Please contact James on WhatsApp.' });
  } catch { return json(503, { error: 'The assistant is temporarily unavailable. Please contact James on WhatsApp.' }); }
};
