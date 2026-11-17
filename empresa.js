// POST /api/empresa  { empresa }  → linhas JSON com as falhas corrigidas por hackers éticos.
import { SYSTEM, fail, limited, promptEmpresa, readBody, streamClaude } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return fail(res, 405, 'Use POST.');
  if (limited(req, 30)) return fail(res, 429, 'Muitas pesquisas. Tente daqui a pouco.');
  const { empresa } = await readBody(req);
  const q = String(empresa || '').replace(/[\u0000-\u001f<>`"]/g, '').trim().slice(0, 80);
  if (q.length < 2) return fail(res, 400, 'Informe o nome da empresa.');
  await streamClaude(req, res, {
    system: SYSTEM,
    messages: [{ role: 'user', content: promptEmpresa(q) }],
    tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: 4 }],
    output_config: { effort: 'low' },
  });
}
