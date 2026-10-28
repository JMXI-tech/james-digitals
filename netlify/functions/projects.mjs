const json = (statusCode, body) => new Response(JSON.stringify(body), { status: statusCode, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
const config = () => ({ url: process.env.SUPABASE_URL?.replace(/\/$/, ''), anon: process.env.SUPABASE_ANON_KEY, service: process.env.SUPABASE_SERVICE_ROLE_KEY });
async function ownerFromRequest(request, cfg) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\\s+/i, '');
  if (!token) return null;
  const r = await fetch(cfg.url + '/auth/v1/user', { headers: { apikey: cfg.anon, Authorization: 'Bearer ' + token } });
  if (!r.ok) return null;
  const user = await r.json();
  return user?.email?.trim().toLowerCase() === 'jamesdigitls@gmail.com' ? user : null;
}
async function dbRequest(cfg, path, options={}) {
  return fetch(cfg.url + '/rest/v1/' + path, { ...options, headers: { apikey: cfg.service, Authorization: 'Bearer ' + cfg.service, 'Content-Type': 'application/json', ...options.headers } });
}
export default async (request) => {
  const cfg = config();
  if (!cfg.url || !cfg.anon || !cfg.service) return json(503, { error: 'Database is not configured. Add the Supabase environment variables in Netlify.' });
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (request.method === 'GET') {
    const r = await dbRequest(cfg, 'showcase_projects?select=id,title,url,description,tags,accent,featured,created_at,order_index&order=order_index.asc,created_at.desc');
    const data = await r.json().catch(() => []);
    if (!r.ok) return json(503, { error: 'Could not load projects. Run supabase/schema.sql in your Supabase SQL editor.' });
    return json(200, { projects: data.map(p => ({ id:p.id,title:p.title,url:p.url,description:p.description,tags:p.tags||[],accent:p.accent||'#3791ff',featured:Boolean(p.featured),createdAt:p.created_at,order:p.order_index||0 })) });
  }
  const owner = await ownerFromRequest(request, cfg);
  if (!owner) return json(401, { error: 'Owner sign-in required. Use the secure sign-in link sent to jamesdigitls@gmail.com.' });
  if (request.method === 'POST' && !id) {
    let body; try { body = await request.json(); } catch { return json(400, { error: 'Invalid JSON.' }); }
    if (typeof body.title !== 'string' || !body.title.trim() || typeof body.description !== 'string' || !/^https?:\/\//i.test(body.url || '') || body.url.length > 2048) return json(400, { error: 'Provide a title, description, and valid http(s) URL.' });
    const payload = { title:body.title.trim().slice(0,160), url:body.url, description:body.description.trim().slice(0,2000), tags:Array.isArray(body.tags)?body.tags.filter(x=>typeof x==='string').slice(0,12):[], accent:/^#[0-9a-f]{6}$/i.test(body.accent||'')?body.accent:'#3791ff', featured:Boolean(body.featured) };
    const r = await dbRequest(cfg, 'showcase_projects', { method:'POST', headers:{ Prefer:'return=representation' }, body:JSON.stringify(payload) });
    const data = await r.json().catch(()=>[]); if(!r.ok) return json(400,{error:data.message||'Could not save project.'}); return json(201,{project:data[0]});
  }
  if (id && request.method === 'PUT') {
    let body; try { body = await request.json(); } catch { return json(400,{error:'Invalid JSON.'}); }
    const patch = {}; if(typeof body.title==='string') patch.title=body.title.trim().slice(0,160); if(typeof body.description==='string') patch.description=body.description.trim().slice(0,2000); if(typeof body.url==='string' && /^https?:\/\//i.test(body.url)) patch.url=body.url; if(Array.isArray(body.tags)) patch.tags=body.tags.filter(x=>typeof x==='string').slice(0,12); if(typeof body.featured==='boolean') patch.featured=body.featured; if(/^#[0-9a-f]{6}$/i.test(body.accent||'')) patch.accent=body.accent;
    const r=await dbRequest(cfg,'showcase_projects?id=eq.'+encodeURIComponent(id),{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify(patch)}); const data=await r.json().catch(()=>[]); if(!r.ok) return json(400,{error:'Could not update project.'}); if(!data.length) return json(404,{error:'Project not found.'}); return json(200,{project:data[0]});
  }
  if (id && request.method === 'DELETE') {
    const r=await dbRequest(cfg,'showcase_projects?id=eq.'+encodeURIComponent(id),{method:'DELETE',headers:{Prefer:'return=representation'}}); if(!r.ok) return json(400,{error:'Could not delete project.'}); return json(200,{ok:true});
  }
  return json(405,{error:'Method not allowed.'});
};
