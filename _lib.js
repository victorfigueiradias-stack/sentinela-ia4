/**
 * Sentinela IA — funções do servidor (Vercel).
 * A chave da Anthropic fica SOMENTE aqui (variável de ambiente ANTHROPIC_API_KEY).
 * Enquadramento defensivo: só dados públicos; nada de exploits ou passos de invasão.
 */
import Anthropic from '@anthropic-ai/sdk';

export const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';
let client;
const anthropic = () => (client ??= new Anthropic());

export const SYSTEM = `Você é a SENTINELA, IA de voz educativa sobre hacking ético, para um público leigo, em português do Brasil.
Regras inegociáveis:
- Use apenas informação pública. Nunca acesse, teste ou descreva como atacar sistemas.
- Enquadramento estritamente defensivo: nunca dê exploits, payloads, comandos de ataque nem passos de invasão.
- Fale de falhas só em nível conceitual: o que era, quem reportou, como foi corrigida, como se proteger.
- Não invente casos. Se não tiver certeza, diga que não há informação pública confiável.
- Não diga o seu próprio nome nas respostas.`;

export function promptEmpresa(q) {
  return `Tarefa: liste falhas de segurança REAIS e PUBLICAMENTE DIVULGADAS em sistemas, sites, apps ou produtos da empresa "${q}" que foram REPORTADAS POR HACKERS ÉTICOS ou pesquisadores de segurança (bug bounty, divulgação coordenada, equipes de pesquisa) e que JÁ FORAM CORRIGIDAS.
Use a busca na web para confirmar os casos (HackerOne Hacktivity, Bugcrowd, NVD/CVE, boletins oficiais e páginas de agradecimento).

Regras:
- Só casos confirmados. Se não souber o número CVE exato, use null. Se o nome do pesquisador não foi divulgado, escreva "não divulgado".
- Nada de exploits, payloads, comandos ou passos para reproduzir. Explique cada falha em uma frase simples e diga como foi corrigida.
- Até 8 casos, do mais marcante para o menos.

Responda SOMENTE com linhas JSON (um objeto JSON por linha), sem markdown, sem texto antes ou depois:
1ª linha: {"tipo":"empresa","nome":"nome oficial","setor":"setor curto","sede":"Cidade, País","lat":0.0,"lon":0.0,"bugBounty":"programa ou plataforma de bug bounty, ou null","bugBountyUrl":"URL oficial do programa, ou null"}
Uma linha por falha: {"tipo":"falha","id":"CVE-AAAA-NNNN ou null","titulo":"título curto","ano":2024,"severidade":"Crítica|Alta|Média|Baixa","cvss":9.8,"componente":"produto/sistema afetado","pesquisador":"nome ou handle","canal":"HackerOne, Bugcrowd, programa próprio, divulgação coordenada…","exploradaAntes":false,"resumo":"uma frase simples: o que era e como foi corrigida"}
Última linha: {"tipo":"resumo","texto":"2 ou 3 frases sobre o que esses casos mostram e o valor do hacking ético"}
Se não encontrar casos confiáveis, devolva só a linha "empresa" e a linha "resumo" explicando isso.`;
}

export const CONVERSA = `Responda a qualquer pergunta de forma direta e simpática, como num chat de voz. Se pedirem algo ofensivo, recuse com gentileza e ofereça a versão defensiva. Se a pessoa quiser pesquisar uma empresa, diga para ela falar só o nome da empresa.
Responda em até 90 palavras, em frases curtas e naturais para serem faladas em voz alta: texto simples, sem markdown, sem listas, sem links.`;

// Limite simples por visitante (protege a sua chave). Em produção, defina também
// um limite de gasto mensal no painel da Anthropic.
const hits = new Map();
export function limited(req, max) {
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || 'anon';
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 60 * 60 * 1000);
  if (list.length >= max) return true;
  list.push(now);
  hits.set(ip, list);
  return false;
}

export async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  let raw = '';
  for await (const chunk of req) raw += chunk;
  try {
    return JSON.parse(raw || '{}');
  } catch {
    return {};
  }
}

export function fail(res, status, message) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({ error: message }));
}

/** Chama o Claude e repassa o texto ao navegador conforme ele é escrito. */
export async function streamClaude(req, res, params) {
  const ctrl = new AbortController();
  res.on('close', () => ctrl.abort());
  let messages = params.messages;
  try {
    for (let round = 0; round < 4; round++) {
      const stream = anthropic().messages.stream({ model: MODEL, max_tokens: 8000, ...params, messages }, { signal: ctrl.signal });
      stream.on('text', (delta) => {
        if (!res.headersSent) {
          res.statusCode = 200;
          res.setHeader('content-type', 'text/plain; charset=utf-8');
          res.setHeader('cache-control', 'no-store');
          res.setHeader('x-accel-buffering', 'no');
        }
        res.write(delta);
      });
      const final = await stream.finalMessage();
      if (final.stop_reason === 'refusal') {
        if (!res.headersSent) res.setHeader('content-type', 'text/plain; charset=utf-8');
        res.write('Não posso ajudar com isso. Posso explicar como se proteger, se quiser.');
        break;
      }
      if (final.stop_reason !== 'pause_turn') break;      // busca na web longa: continua de onde parou
      messages = [...params.messages, { role: 'assistant', content: final.content }];
    }
    res.end();
  } catch (err) {
    if (ctrl.signal.aborted) return;
    console.error('[sentinela] erro na IA:', err?.status ?? '', err?.message);
    if (!res.headersSent) fail(res, err?.status === 429 ? 429 : 502, 'A IA não respondeu. Tente de novo.');
    else res.end();
  }
}
