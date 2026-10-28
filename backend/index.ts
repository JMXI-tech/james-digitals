import { router, json, error, requireAuth, requireAdminEmailAllowlist, db, ai } from '@appdeploy/sdk';
import { notifySubscribers, realtimeSubscriptionRoutes } from './realtime-subscribers';

const ADMIN_EMAILS = ['jamesdigitls@gmail.com'];
const PROJECTS_TABLE = 'showcase_projects';
const safeUrl = (value: unknown) => typeof value === 'string' && /^https?:\/\//i.test(value) && value.length <= 2048;
const publicProject = (p: any) => ({ id: p.id, title: p.title, url: p.url, description: p.description, tags: Array.isArray(p.tags) ? p.tags : [], accent: p.accent || '#b6f36b', featured: Boolean(p.featured), visits: Number(p.visits || 0), createdAt: p.createdAt || 0, order: Number(p.order || 0) });
export const handler = router({
 'GET /api/_healthcheck': [async () => json({ message: 'Success' })],
 'POST /api/chat': [async ({ body }) => {
   const payload = body as { messages?: unknown };
   if (!payload || !Array.isArray(payload.messages)) return error('Send a list of chat messages.', 400);
   const messages = payload.messages.slice(-10).filter((item): item is { role: 'user' | 'assistant'; content: string } => {
     if (!item || typeof item !== 'object') return false;
     const message = item as { role?: unknown; content?: unknown };
     return (message.role === 'user' || message.role === 'assistant') && typeof message.content === 'string' && message.content.trim().length > 0 && message.content.length <= 1200;
   }).map((message) => ({ role: message.role, content: message.content.trim() }));
   if (!messages.length || messages[messages.length - 1].role !== 'user') return error('Ask a question to continue.', 400);
   try {
     const projectResult = await db.list(PROJECTS_TABLE, { limit: 30 });
     const portfolio = projectResult.items.map((project: any) => `${project.title}: ${project.description} Tags: ${(project.tags || []).join(', ')} URL: ${project.url}`).join('\n');
     const response = await ai.generate({
       system: `You are the helpful website assistant for James Digitals, a Nigeria-based remote-first digital studio branded JMXI-tech. Answer clearly, warmly, and concisely using only the business facts below. Services: responsive business websites and landing pages; frontend, backend and full-stack applications; AI workflows and process automation; virtual assistance, research and digital operations. Work can be coordinated remotely worldwide. The project planner gives indicative estimates only: Business website starts at ₦120,000, landing page ₦60,000, full-stack application ₦250,000, AI automation ₦100,000, virtual assistance ₦50,000; complexity and page count affect the estimate, and final pricing follows discovery. Contact email: jamesdigitls@gmail.com. WhatsApp: +2348153126056, link https://wa.me/2348153126056. Visitors can browse Selected Work and use the Project Planner on this site. If a detail is not provided, say you don't have that information and invite the visitor to contact James. Never invent client names, testimonials, delivery guarantees, live project details, or credentials. Do not claim to book, send messages, or take actions. Portfolio projects currently listed in the database:
${portfolio || 'No published portfolio projects are currently available; the site may show sample concepts.'}`,
       messages,
       maxTokens: 400,
       temperature: 0.4,
       thinkingMode: 'FAST'
     });
     return json({ reply: response.text || 'I could not prepare an answer just now. Please contact James via WhatsApp.' });
   } catch {
     return error('The assistant is temporarily unavailable. Please try again or contact James on WhatsApp.', 503);
   }
 }],
 'GET /api/projects': [async () => { const result = await db.list(PROJECTS_TABLE, { limit: 100 }); return json({ projects: result.items.map(publicProject).sort((a, b) => Number(b.featured) - Number(a.featured) || a.order - b.order || b.createdAt - a.createdAt) }); }],
 'POST /api/projects': [requireAuth(), requireAdminEmailAllowlist(ADMIN_EMAILS), async ({ body }) => { const p = body as any; if (!p || typeof p.title !== 'string' || !p.title.trim() || !safeUrl(p.url) || typeof p.description !== 'string') return error('A title, valid HTTP(S) URL and description are required.', 400); const record = { title: p.title.trim().slice(0, 120), url: p.url, description: p.description.trim().slice(0, 500), tags: Array.isArray(p.tags) ? p.tags.filter((t: unknown) => typeof t === 'string').slice(0, 12) : [], accent: /^#[0-9a-f]{6}$/i.test(p.accent) ? p.accent : '#b6f36b', featured: Boolean(p.featured), visits: 0, createdAt: Date.now(), order: Date.now() }; const [id] = await db.add(PROJECTS_TABLE, [record]); if (!id) return error('Project could not be saved.', 500); await notifySubscribers('showcase', 'projects', { action: 'created', id }); return json({ project: { id, ...record } }, 201); }],
 'PUT /api/projects/:id': [requireAuth(), requireAdminEmailAllowlist(ADMIN_EMAILS), async ({ params, body }) => { const p = body as any; if (!p || typeof p.title !== 'string' || !safeUrl(p.url) || typeof p.description !== 'string') return error('Invalid project data.', 400); const [old] = await db.get<any>(PROJECTS_TABLE, [params.id]); if (!old) return error('Project not found.', 404); const record = { ...old, title: p.title.trim().slice(0, 120), url: p.url, description: p.description.trim().slice(0, 500), tags: Array.isArray(p.tags) ? p.tags.slice(0, 12) : old.tags, accent: /^#[0-9a-f]{6}$/i.test(p.accent) ? p.accent : old.accent, featured: Boolean(p.featured), order: Number.isFinite(p.order) ? p.order : old.order }; const [ok] = await db.update(PROJECTS_TABLE, [{ id: params.id, record }]); if (!ok) return error('Project could not be updated.', 500); await notifySubscribers('showcase', 'projects', { action: 'updated', id: params.id }); return json({ project: { id: params.id, ...record } }); }],
 'DELETE /api/projects/:id': [requireAuth(), requireAdminEmailAllowlist(ADMIN_EMAILS), async ({ params }) => { const [ok] = await db.delete(PROJECTS_TABLE, [params.id]); if (!ok) return error('Project could not be deleted.', 404); await notifySubscribers('showcase', 'projects', { action: 'deleted', id: params.id }); return json({ deleted: true }); }],
 'POST /api/projects/:id/visit': [async ({ params }) => { const [p] = await db.get<any>(PROJECTS_TABLE, [params.id]); if (!p) return error('Project not found.', 404); await db.update(PROJECTS_TABLE, [{ id: params.id, record: { ...p, visits: Number(p.visits || 0) + 1 } }]); return json({ ok: true }); }],
 ...realtimeSubscriptionRoutes,
});
