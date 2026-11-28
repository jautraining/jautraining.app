// Jau Training · Edge Function "lembrete-falta"
// Manda um e-mail para o aluno que passou 3 dias de treino seguidos sem treinar.
// - Dias de descanso da ficha não contam. Na ficha em sequência (A, B, C), conta pela meta de treinos por semana.
// - Vai uma vez só por sumiço: só volta a valer depois que o aluno treinar de novo.
// - Não manda para: aluno sem e-mail, que nunca treinou, com plano vencido ou marcado "não enviar".
// - Chamada todo dia às 10h pelo banco (pg_cron) com {action: 'run'}.
// - O app do personal chama {action: 'test'} para mandar um e-mail de teste para ele mesmo.
// O e-mail sai do Gmail do personal (porta 465). Segredos no Supabase: GMAIL_USER e GMAIL_APP_PASSWORD.
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts';

const URL_ = Deno.env.get('SUPABASE_URL')!;
const SRV = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const GUSER = (Deno.env.get('GMAIL_USER') || '').trim();
const GPASS = (Deno.env.get('GMAIL_APP_PASSWORD') || '').replace(/\s+/g, '');
const APP = 'https://jautraining-app.pages.dev';
const SUBJECT = 'Senti sua falta nos treinos';
const DEF = 'Oi, {nome}! Senti sua falta nos treinos dos últimos dias. Aconteceu alguma coisa? Se a rotina apertou, me conta que a gente ajusta o treino para caber na sua semana. Bora voltar? 💪';
const CORS = {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS'};
const WK = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];

const json = (o: unknown, status = 200) => new Response(JSON.stringify(o), {status, headers: Object.assign({'Content-Type': 'application/json'}, CORS)});
async function rest(path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`${URL_}/rest/v1/${path}`, Object.assign({}, init, {headers: Object.assign({apikey: SRV, Authorization: `Bearer ${SRV}`, 'Content-Type': 'application/json'}, init.headers || {})}));
}
async function allRows(path: string): Promise<any[]> {
  const out: any[] = [];
  for (let from = 0; from < 100000; from += 1000){
    const r = await rest(path, {headers: {Range: `${from}-${from + 999}`}}); const rows = r.ok ? await r.json() : [];
    out.push(...rows); if (rows.length < 1000) break;
  }
  return out;
}
async function personalEmail(req: Request): Promise<string | null> {
  const auth = req.headers.get('Authorization') || ''; if (!auth.startsWith('Bearer ')) return null;
  const u = await fetch(`${URL_}/auth/v1/user`, {headers: {apikey: SRV, Authorization: auth}}); if (!u.ok) return null;
  const me = await u.json(); if (!me || !me.id) return null;
  const p = await (await rest(`profiles?id=eq.${me.id}&select=role`)).json();
  return p[0] && p[0].role === 'personal' ? (me.email || null) : null;
}

// ---------- datas no horário de Brasília ----------
export const brDate = (d: Date) => new Intl.DateTimeFormat('en-CA', {timeZone: 'America/Sao_Paulo'}).format(d);
export const addDays = (iso: string, n: number) => { const d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
export const wk = (iso: string) => WK[new Date(iso + 'T12:00:00Z').getUTCDay()];
const diffDays = (a: string, b: string) => Math.round((new Date(a + 'T12:00:00Z').getTime() - new Date(b + 'T12:00:00Z').getTime()) / 864e5);

// Quantos dias de treino seguidos o aluno perdeu desde o último treino (até ontem). null = não vale.
export function missedDays(data: any, trained: string[], today: string): {missed: number, last: string} | null {
  if (!trained.length) return null;
  const last = trained.slice().sort().pop()!;
  const days = (data && data.days) || {};
  const planned = Object.keys(days).filter(k => days[k] && Array.isArray(days[k].ex) && days[k].ex.length);
  if (!planned.length) return null;
  if (data.schedule === 'seq'){
    const per = Math.max(1, Math.min(7, parseInt(data.perWeek) || planned.length || 1));
    const gap = diffDays(today, last) - 1; // dias inteiros sem treinar, sem contar hoje
    const need = Math.ceil(3 * 7 / per);
    return gap >= need ? {missed: Math.floor(gap * per / 7), last} : null;
  }
  const set = new Set(planned); let missed = 0;
  for (let i = 1; i <= 35; i++){ const day = addDays(today, -i); if (day <= last) break; if (set.has(wk(day))) missed++; }
  return missed >= 3 ? {missed, last} : null;
}

function render(msg: string, name: string): {text: string, html: string} {
  const first = (name || '').trim().split(/\s+/)[0] || '';
  const body = (msg || DEF).replace(/\{nome\}/g, first);
  const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const text = `${body}\n\nAbrir o app: ${APP}\n\nJau Training`;
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.55;color:#1f1414;max-width:520px">
    ${esc(body).split(/\n+/).map(p => `<p style="margin:0 0 14px">${p}</p>`).join('')}
    <p style="margin:22px 0"><a href="${APP}" style="background:#C8141B;color:#fff;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:999px;display:inline-block">Abrir o app de treino</a></p>
    <p style="margin:0;color:#8a7c7c;font-size:13px">Jau Training</p></div>`;
  return {text, html};
}
async function mailer(): Promise<SMTPClient> {
  if (!GUSER || !GPASS) throw new Error('faltam os segredos GMAIL_USER e GMAIL_APP_PASSWORD');
  return new SMTPClient({connection: {hostname: 'smtp.gmail.com', port: 465, tls: true, auth: {username: GUSER, password: GPASS}}});
}
async function send(c: SMTPClient, to: string, msg: string, name: string){
  const m = render(msg, name);
  await c.send({from: `Jau Training <${GUSER}>`, to, subject: SUBJECT, content: m.text, html: m.html});
}

async function run(): Promise<Record<string, unknown>> {
  const cfgRow = (await (await rest('settings?key=eq.faltamail&select=value')).json())[0];
  const cfg = Object.assign({on: true, msg: DEF}, (cfgRow && cfgRow.value) || {});
  if (!cfg.on) return {skip: 'off'};
  const today = brDate(new Date()), since = addDays(today, -60);
  const students = await allRows('students?select=id,email,data&order=id');
  const logs = await allRows(`logs?select=student_id,date&date=gte.${since}&order=id`);
  const by: Record<string, Set<string>> = {};
  (logs || []).forEach((l: any) => { const d = brDate(new Date(l.date)); (by[l.student_id] = by[l.student_id] || new Set()).add(d); });
  const due: any[] = [];
  (students || []).forEach((s: any) => {
    const d = s.data || {}, email = String(s.email || d.email || '').trim();
    if (!email || !/@/.test(email) || d.noFaltaMail) return;
    if (d.planDue && d.planDue < today) return; // plano vencido: não cobra
    const r = missedDays(d, [...(by[s.id] || [])], today);
    if (r) due.push({s, email, r});
  });
  if (!due.length) return {checked: (students || []).length, sent: 0};
  let c: SMTPClient | null = null, sent = 0; const errors: string[] = [];
  for (const x of due){
    const ins = await rest('falta_sent', {method: 'POST', headers: {Prefer: 'resolution=ignore-duplicates,return=representation'}, body: JSON.stringify({student_id: x.s.id, last_log: x.r.last, missed: x.r.missed, email: x.email})});
    const got = ins.ok ? await ins.json() : []; if (!got.length) continue; // já avisado neste sumiço
    try {
      if (!c) c = await mailer();
      await send(c, x.email, cfg.msg, (x.s.data && x.s.data.name) || '');
      sent++;
    } catch(e){
      errors.push(String((e as Error).message || e));
      await rest(`falta_sent?student_id=eq.${encodeURIComponent(x.s.id)}&last_log=eq.${encodeURIComponent(x.r.last)}`, {method: 'DELETE'}); // tenta de novo amanhã
    }
  }
  try { if (c) await c.close(); } catch(_){}
  return {checked: (students || []).length, due: due.length, sent, errors};
}

export async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response('ok', {headers: CORS});
  let b: any = {}; try { b = await req.json(); } catch(_){ b = {}; }
  if (b.action === 'test'){
    const to = await personalEmail(req); if (!to) return json({error: 'só a conta de personal pode testar'}, 403);
    try { const c = await mailer(); await send(c, to, typeof b.msg === 'string' && b.msg.trim() ? b.msg : DEF, 'Fulano'); await c.close(); return json({sent: 1, to}); }
    catch(e){ return json({error: String((e as Error).message || e)}, 500); }
  }
  if (b.action === 'run') return json(await run());
  return json({error: 'bad request'}, 400);
}

if (typeof Deno !== 'undefined' && Deno.serve) Deno.serve(handler);
