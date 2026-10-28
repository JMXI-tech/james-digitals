# James Digitals — Netlify deployment + owner management

## 1. Deploy the site
Push this folder to GitHub, then import the repository in Netlify. Build command: `npm run build`; publish directory: `dist`.

## 2. Create the database and auth project
1. Create a free project at https://supabase.com/dashboard.
2. Open SQL Editor and run `supabase/schema.sql` from this package.
3. In Supabase → Project Settings → API, copy the Project URL, anon/public key, and service_role key.
4. In Supabase → Authentication → URL Configuration, set Site URL to your Netlify site URL and add that same URL to Redirect URLs. Add your custom domain later if you use one.
5. In Authentication settings, enable email OTP/magic links. For security, only the hard-coded owner email `jamesdigitls@gmail.com` is permitted to manage projects by the server.

## 3. Add Netlify environment variables
Site configuration → Environment variables:
- `VITE_SUPABASE_URL` = Supabase project URL (used by the browser auth client)
- `VITE_SUPABASE_ANON_KEY` = Supabase anon/public key (used by the browser auth client)
- `SUPABASE_URL` = same Supabase project URL (server functions)
- `SUPABASE_ANON_KEY` = same anon/public key (server validates login tokens)
- `SUPABASE_SERVICE_ROLE_KEY` = service_role key (server-only; NEVER prefix with VITE_ or expose it in client code)
- `OPENAI_API_KEY` = optional, to enable the AI assistant function
- `OPENAI_MODEL` = optional, defaults to `gpt-4o-mini`
After adding variables, trigger a new deploy so Vite rebuilds with the public VITE_ values.

## Owner console
Click Owner sign in. Supabase emails a magic link to `jamesdigitls@gmail.com`. Open it on the same browser/device; then click Owner sign in to open the console. Project creation, feature toggling and deletion are handled by Netlify Functions, which validate the Supabase user token and enforce the owner email server-side.

## Notes
- `public/resources/james-digitals-logo.jpg` is included.
- AI chat needs a valid OpenAI API key and API billing; ChatGPT subscription alone is not the same as API access.
- If magic links fail, check Supabase email settings, Site URL, Redirect URLs, and your email provider's delivery limits.
