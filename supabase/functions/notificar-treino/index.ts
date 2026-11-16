// Jau Training · Edge Function "notificar-treino"
// Avisa o celular do PERSONAL quando um aluno conclui um treino (notificação + número no ícone do app).
// - Chamada pelo banco (gatilho em public.logs) com {id} do treino novo.
// - O app do personal chama com {action: 'key'} (pega a chave pública) e {action: 'test'} (notificação de teste).
// Sem bibliotecas externas: criptografia do Web Push (RFC 8291/8292) feita com WebCrypto.
// As chaves do Web Push são criadas sozinhas na primeira vez e ficam na tabela push_config (só o servidor lê).

const URL_ = Deno.env.get('SUPABASE_URL')!;
const SRV = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SUBJECT = 'https://jautraining-app.pages.dev';
const CORS = {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS'};
const EFF: Record<number, string> = {1: 'muito leve', 2: 'leve', 3: 'normal', 4: 'pesado', 5: 'exaustivo'};

// ---------- utilidades ----------
const enc = new TextEncoder();
export function b64u(buf: ArrayBuffer | Uint8Array): string {
  const b = buf instanceof Uint8Array ? buf : new Uint8Array(buf); let s = '';
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
export function unb64u(s: string): Uint8Array {
  const t = s.replace(/-/g, '+').replace(/_/g, '/'); const p = t + '='.repeat((4 - t.length % 4) % 4);
  const r = atob(p), out = new Uint8Array(r.length); for (let i = 0; i < r.length; i++) out[i] = r.charCodeAt(i); return out;
}
function cat(...a: Uint8Array[]): Uint8Array { const n = a.reduce((x, y) => x + y.length, 0), o = new Uint8Array(n); let k = 0; a.forEach(x => { o.set(x, k); k += x.length; }); return o; }
async function hkdf(salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, len: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({name: 'HKDF', hash: 'SHA-256', salt, info}, key, len * 8));
}

// ---------- chaves VAPID ----------
export async function newVapid(): Promise<{pub: string, priv: string}> {
  const kp = await crypto.subtle.generateKey({name: 'ECDSA', namedCurve: 'P-256'}, true, ['sign', 'verify']) as CryptoKeyPair;
  const raw = await crypto.subtle.exportKey('raw', kp.publicKey), jwk = await crypto.subtle.exportKey('jwk', kp.privateKey) as JsonWebKey;
  return {pub: b64u(raw), priv: jwk.d!};
}
export async function vapidAuth(endpoint: string, pub: string, priv: string): Promise<string> {
  const p = unb64u(pub);
  const key = await crypto.subtle.importKey('jwk', {kty: 'EC', crv: 'P-256', d: priv, x: b64u(p.slice(1, 33)), y: b64u(p.slice(33, 65)), ext: true}, {name: 'ECDSA', namedCurve: 'P-256'}, false, ['sign']);
  const head = b64u(enc.encode(JSON.stringify({typ: 'JWT', alg: 'ES256'})));
  const body = b64u(enc.encode(JSON.stringify({aud: new URL(endpoint).origin, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: SUBJECT})));
  const sig = await crypto.subtle.sign({name: 'ECDSA', hash: 'SHA-256'}, key, enc.encode(head + '.' + body));
  return `vapid t=${head}.${body}.${b64u(sig)}, k=${pub}`;
}

// ---------- criptografia do conteúdo (aes128gcm) ----------
export async function encrypt(payload: string, p256dh: string, auth: string): Promise<Uint8Array> {
  const ua = unb64u(p256dh), secret = unb64u(auth);
  const eph = await crypto.subtle.generateKey({name: 'ECDH', namedCurve: 'P-256'}, true, ['deriveBits']) as CryptoKeyPair;
  const asPub = new Uint8Array(await crypto.subtle.exportKey('raw', eph.publicKey));
  const uaKey = await crypto.subtle.importKey('raw', ua, {name: 'ECDH', namedCurve: 'P-256'}, false, []);
  const shared = new Uint8Array(await crypto.subtle.deriveBits({name: 'ECDH', public: uaKey}, eph.privateKey, 256));
  const ikm = await hkdf(secret, shared, cat(enc.encode('WebPush: info\0'), ua, asPub), 32);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(salt, ikm, enc.encode('Content-Encoding: aes128gcm\0'), 16);
  const nonce = await hkdf(salt, ikm, enc.encode('Content-Encoding: nonce\0'), 12);
  const key = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
  const ct = new Uint8Array(await crypto.subtle.encrypt({name: 'AES-GCM', iv: nonce}, key, cat(enc.encode(payload), new Uint8Array([2]))));
  const rs = new Uint8Array([0, 0, 16, 0]);
  return cat(salt, rs, new Uint8Array([asPub.length]), asPub, ct);
}
export async function sendPush(sub: {endpoint: string, p256dh: string, auth: string}, payload: string, keys: {pub: string, priv: string}): Promise<number> {
  const body = await encrypt(payload, sub.p256dh, sub.auth);
  const r = await fetch(sub.endpoint, {method: 'POST', body, headers: {
    'Content-Encoding': 'aes128gcm', 'Content-Type': 'application/octet-stream', 'TTL': '86400', 'Urgency': 'high',
    'Authorization': await vapidAuth(sub.endpoint, keys.pub, keys.priv)}});
  return r.status;
}

// ---------- banco (REST com a chave de serviço, só aqui no servidor) ----------
async function rest(path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`${URL_}/rest/v1/${path}`, Object.assign({}, init, {headers: Object.assign({apikey: SRV, Authorization: `Bearer ${SRV}`, 'Content-Type': 'application/json'}, init.headers || {})}));
}
async function getKeys(): Promise<{pub: string, priv: string}> {
  let r = await (await rest('push_config?id=eq.1&select=pub,priv')).json();
  if (r[0]) return r[0];
  const k = await newVapid();
  await rest('push_config', {method: 'POST', headers: {Prefer: 'resolution=ignore-duplicates'}, body: JSON.stringify({id: 1, pub: k.pub, priv: k.priv})});
  r = await (await rest('push_config?id=eq.1&select=pub,priv')).json();
  return r[0];
}
async function countOf(path: string): Promise<number> {
  const r = await rest(path, {method: 'HEAD', headers: {Prefer: 'count=exact', Range: '0-0'}});
  const cr = r.headers.get('content-range') || '*/0'; return parseInt(cr.split('/')[1]) || 0;
}
// Número no ícone: treinos que chegaram depois da última vez que o personal abriu a aba Atividade.
async function unread(): Promise<number> {
  const r = (await (await rest('settings?key=eq.feedopen&select=value')).json())[0];
  if (r && typeof r.value === 'string') return countOf(`logs?select=id&created_at=gt.${encodeURIComponent(r.value)}`);
  return Math.max(0, (await countOf('logs?select=id')) - (await countOf('feed_seen?select=log_id')));
}
async function isPersonal(req: Request): Promise<boolean> {
  const auth = req.headers.get('Authorization') || ''; if (!auth.startsWith('Bearer ')) return false;
  const u = await fetch(`${URL_}/auth/v1/user`, {headers: {apikey: SRV, Authorization: auth}}); if (!u.ok) return false;
  const me = await u.json(); if (!me || !me.id) return false;
  const p = await (await rest(`profiles?id=eq.${me.id}&select=role`)).json();
  return !!(p[0] && p[0].role === 'personal');
}
function durTxt(s: number): string { const m = Math.round(s / 60); return m < 60 ? m + ' min' : Math.floor(m / 60) + 'h' + String(m % 60).padStart(2, '0'); }
export function message(name: string, d: any): {title: string, body: string} {
  if (d.cardioOnly) return {title: `${name} concluiu o cardio`, body: [d.title || 'Cardio', d.cardioCmt ? 'deixou uma observação' : ''].filter(Boolean).join(' · ')};
  return {title: `${name} concluiu o treino`, body: [d.title || 'Treino', d.dur ? durTxt(d.dur) : '', d.effort && EFF[d.effort] ? 'esforço ' + EFF[d.effort] : '', d.auto ? 'finalizado automaticamente' : ''].filter(Boolean).join(' · ')};
}
async function broadcast(note: Record<string, unknown>): Promise<number> {
  const keys = await getKeys();
  const subs = await (await rest('push_subs?select=endpoint,p256dh,auth')).json();
  let ok = 0;
  await Promise.all((subs || []).map(async (s: any) => {
    try {
      const st = await sendPush(s, JSON.stringify(note), keys);
      if (st === 404 || st === 410) await rest(`push_subs?endpoint=eq.${encodeURIComponent(s.endpoint)}`, {method: 'DELETE'});
      else if (st < 300) ok++;
    } catch (_) { /* um aparelho com problema não impede os outros */ }
  }));
  return ok;
}
const json = (o: unknown, status = 200) => new Response(JSON.stringify(o), {status, headers: Object.assign({'Content-Type': 'application/json'}, CORS)});

export async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response('ok', {headers: CORS});
  let b: any = {}; try { b = await req.json(); } catch (_) { b = {}; }
  if (b.action === 'key') return json({key: (await getKeys()).pub});
  if (b.action === 'test'){
    if (!(await isPersonal(req))) return json({error: 'only personal'}, 403);
    const n = await broadcast({title: 'Notificações ativadas', body: 'É assim que você vai saber quando um aluno concluir um treino.', badge: await unread(), tag: 'teste'});
    return json({sent: n});
  }
  if (typeof b.id === 'string' && b.id){
    const log = (await (await rest(`logs?id=eq.${encodeURIComponent(b.id)}&select=id,student_id,data,created_at`)).json())[0];
    if (!log || Date.now() - new Date(log.created_at).getTime() > 15 * 60 * 1000) return json({skip: 'old'});
    const ins = await rest('push_sent', {method: 'POST', headers: {Prefer: 'resolution=ignore-duplicates,return=representation'}, body: JSON.stringify({log_id: log.id})});
    const done = ins.ok ? await ins.json() : []; if (!done.length) return json({skip: 'dup'});
    const st = (await (await rest(`students?id=eq.${encodeURIComponent(log.student_id)}&select=data`)).json())[0];
    const m = message(((st && st.data && st.data.name) || 'Um aluno').trim(), log.data || {});
    const n = await broadcast({title: m.title, body: m.body, badge: await unread(), tag: 'log-' + log.id});
    return json({sent: n});
  }
  return json({error: 'bad request'}, 400);
}

if (typeof Deno !== 'undefined' && Deno.serve) Deno.serve(handler);
