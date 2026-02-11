export default async function handler(req, res) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;

  const targetURL = SUPABASE_URL + req.url.replace("/supa", "");

  const result = await fetch(targetURL, {
    method: req.method,
    headers: {
      ...req.headers,
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
    body: req.method !== "GET" ? req.body : null,
  });

  const data = await result.text();

  res.status(result.status).send(data);
}
