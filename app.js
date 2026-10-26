(function(){
const LOGO = 'img/logo.webp';
const LOGO_HI = 'img/logo-hi.webp';
const CHEETAH = 'img/cheetah.webp';
const DAYS = [
  {k:'seg', l:'Seg', f:'Segunda-feira', n:1}, {k:'ter', l:'Ter', f:'Terça-feira', n:2}, {k:'qua', l:'Qua', f:'Quarta-feira', n:3},
  {k:'qui', l:'Qui', f:'Quinta-feira', n:4}, {k:'sex', l:'Sex', f:'Sexta-feira', n:5}, {k:'sab', l:'Sáb', f:'Sábado', n:6}, {k:'dom', l:'Dom', f:'Domingo', n:0}
];
const todayKey = ['dom','seg','ter','qua','qui','sex','sab'][new Date().getDay()];
const MUSCLES = [
  ['peitoral','Peitoral'], ['delt_ant','Deltoide anterior'], ['delt_med','Deltoide medial'], ['delt_post','Deltoide posterior'], ['trapezio','Trapézio'], ['costas','Costas'], ['lombar','Lombar'],
  ['biceps','Bíceps'], ['triceps','Tríceps'], ['antebraco','Antebraço'], ['abdomen','Abdômen'], ['obliquos','Oblíquos'],
  ['gluteos','Glúteos'], ['abdutores','Glúteo médio'], ['quadriceps','Quadríceps'], ['adutores','Adutores'],
  ['posteriores','Posteriores de coxa'], ['panturrilha','Panturrilha']
];
const MNAME = Object.fromEntries(MUSCLES);
const uid = () => Date.now().toString(36).slice(-5) + Math.random().toString(36).slice(2, 9);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const fmtKg = n => Number(n).toLocaleString('pt-BR', {maximumFractionDigits: 1});

/* ---------- seed data ---------- */
const N_ABD = 'Manter o abdômen sempre ativo, explorar a amplitude e controlar a cadência.';
const N_AGACH = 'Manter o abdômen sempre ativo e explorar o máximo de amplitude que conseguir, sem gerar desconforto. Fique atenta à cadência do movimento.';
const N_PELV = 'Manter o abdômen sempre ativo, explore a amplitude na hora da descida e contraia bem o glúteo ao subir. Fique atenta à cadência do movimento.';
const N_FLEX = 'Manter o abdômen sempre ativo, tronco estável e focar em flexionar o joelho, contraindo os posteriores ao fazer a força.';
const N_EXTQ = 'Manter o abdômen sempre ativo, tronco estável e contrair o glúteo ao final do movimento.';
const N_OMB = 'Manter o abdômen sempre ativo, tronco estável e elevar os braços na linha do ombro.';
const N_TRI = 'Manter o abdômen sempre ativo e o tronco estável, alongando bem o tríceps ao descer e contraindo bem ao subir.';
const N_COST = 'Iniciar o movimento com a retração das escápulas e contrair bem as costas ao final. Mantenha o abdômen ativo e evite balançar o tronco.';

function L(id, name, primary, secondary, instructions){ return {id, name, primary, secondary, instructions, video: '', custom: false}; }
function seedLibrary(){ return withDefaults([
  L('agach-livre','Agachamento livre',['quadriceps','gluteos'],['adutores','lombar','abdomen'],N_AGACH),
  L('agach-hack','Agachamento hack',['quadriceps','gluteos'],['adutores'],N_AGACH),
  L('leg-press','Leg press horizontal',['quadriceps','gluteos'],['adutores'],'Ajustar o banco para que tenha uma boa amplitude, sem que gere dor ou desconforto na execução.'),
  L('elev-pelvica','Elevação pélvica máquina',['gluteos'],['posteriores'],N_PELV),
  L('rdl-belt','RDL no belt squat',['posteriores','gluteos'],['lombar'],'Manter o abdômen sempre ativo e focar no movimento de jogar o quadril para trás, alongando os posteriores.'),
  L('abdutora','Cadeira abdutora',['abdutores'],['gluteos'],N_ABD),
  L('extensora','Cadeira extensora',['quadriceps'],[],N_ABD),
  L('flexora','Cadeira flexora',['posteriores'],['panturrilha'],N_FLEX),
  L('flexora-vert','Flexora vertical',['posteriores'],['panturrilha'],N_FLEX),
  L('terra-sumo','Levantamento terra sumô',['gluteos','posteriores'],['adutores','quadriceps','lombar','trapezio'],'Manter o abdômen sempre ativo e direcionar a força para empurrar o chão, focando nos membros inferiores.'),
  L('bulgaro','Búlgaro com halteres',['quadriceps','gluteos'],['adutores'],'Manter o abdômen sempre ativo, explorar a amplitude ao máximo e direcionar o movimento numa diagonal ao subir e descer.'),
  L('abd-polia','Abdução de quadril na polia',['abdutores'],['gluteos'],'Manter o abdômen sempre ativo, tronco estável e levemente à frente. Fazer força para que o glúteo puxe a polia e manter a atenção na cadência.'),
  L('ext-quadril','Extensão de quadril na polia',['gluteos'],['posteriores'],N_EXTQ),
  L('desenv-neutro','Desenvolvimento neutro em pé com halteres',['delt_ant'],['delt_med','triceps','trapezio'],'Manter o abdômen sempre ativo, tronco estável e cotovelos levemente à frente.'),
  L('elev-lateral','Elevação lateral com halteres',['delt_med'],['trapezio'],N_OMB),
  L('remada-alta','Remada alta unilateral na polia',['delt_med','trapezio'],['biceps'],N_OMB),
  L('supino-halter','Supino reto com halteres',['peitoral'],['delt_ant','triceps'],'Manter o abdômen sempre ativo, cotovelos estáveis e explorar a amplitude ao descer.'),
  L('triceps-frances','Tríceps francês na polia com corda',['triceps'],[],N_TRI),
  L('triceps-testa','Tríceps testa com halteres',['triceps'],[],N_TRI),
  L('abd-polia-flex','Abdominal na polia',['abdomen'],['obliquos'],'Ajoelhada de frente para a polia, flexione o tronco contraindo o abdômen. Os braços só seguram a corda, não puxam.'),
  L('abd-infra','Abdominal infra no solo',['abdomen'],[],'Lombar apoiada no chão o tempo todo. Eleve o quadril usando o abdômen, sem dar impulso com as pernas.'),
  L('remada-curvada','Remada curvada pronada com barra',['costas'],['delt_post','biceps','lombar','trapezio'],N_COST),
  L('remada-maq','Remada máquina pegada neutra',['costas'],['biceps'],N_COST),
  L('puxada-media','Puxada média anatômica',['costas'],['biceps'],N_COST),
  L('pulldown','Pulldown',['costas'],['triceps'],'Iniciar o movimento sempre pela extensão dos ombros, contraindo as costas ao final. Mantenha o abdômen ativo e evite balançar o tronco.'),
  L('rosca-direta','Rosca direta com halteres',['biceps'],['antebraco'],'Cotovelos fixos ao lado do corpo. Suba contraindo o bíceps e desça controlando, sem balançar o tronco.'),
  L('facepull','Facepull',['delt_post','trapezio'],['costas'],N_COST),
  L('rosca-martelo','Rosca martelo na polia',['biceps','antebraco'],[],'Pegada neutra, cotovelos fixos ao lado do corpo e descida controlada.'),
  L('rotacao-tronco','Rotação de tronco semiajoelhado com anilha',['obliquos'],['abdomen'],'Manter o abdômen sempre ativo e focar a força na rotação do tronco, sem perder a estabilização.'),
  L('panturrilha-pe','Panturrilha em pé',['panturrilha'],[],'Desça até alongar bem a panturrilha, segure 1 segundo e suba o máximo que conseguir.'),
  L('prancha','Prancha',['abdomen'],['obliquos','delt_ant'],'Cotovelos abaixo dos ombros, quadril alinhado e glúteo contraído. Respire sem perder a posição.'),
  L('puxada-frente','Puxada frontal',['costas'],['biceps'],N_COST),
  L('afundo','Afundo com halteres',['quadriceps','gluteos'],['adutores'],'Passo largo, tronco estável e desça até o joelho de trás quase tocar o chão.'),
  L('stiff','Stiff com barra',['posteriores','gluteos'],['lombar'],'Joelhos levemente flexionados, barra rente às pernas e quadril indo para trás até alongar os posteriores. Coluna neutra o tempo todo.')
]);}
function withDefaults(list){ const p = list.find(l => l.id === 'prancha'); if (p) p.defMeas = 'tempo'; return list; }
function seedMethods(){ return [
  {id:'normal', name:'Normal', desc:'Séries tradicionais: faça as repetições, descanse o intervalo indicado e repita.'},
  {id:'conjugado', name:'Conjugado (bi-set)', desc:'Dois exercícios em sequência, sem descanso entre eles. Faça a série do A, vá direto para o B e só então descanse o intervalo indicado.'},
  {id:'dropset', name:'Drop-set', desc:'Na última série, ao chegar perto da falha, reduza a carga de 20 a 30% e continue sem descanso até a falha de novo.'},
  {id:'restpause', name:'Rest-pause', desc:'Vá até perto da falha, descanse de 10 a 15 segundos e faça mais algumas repetições com a mesma carga. Repita 2 ou 3 vezes.'},
  {id:'piramide', name:'Pirâmide crescente', desc:'Aumente a carga a cada série e diminua as repetições, seguindo a faixa indicada para cada série.'},
  {id:'isometria', name:'Isometria no pico', desc:'Segure 2 a 3 segundos na posição de maior contração em todas as repetições.'}
];}
const STYPES = {aq:{l:'Aquecimento'}, prep:{l:'Preparatória'}, trab:{l:'Trabalho'}};
function buildSeries(sets, reps, o){
  o = o || {}; const out = [];
  if (o.warmup) out.push({type:'aq', reps:'12'});
  if (o.prep) out.push({type:'prep', reps:o.prep});
  const work = [];
  String(reps || '').split('\n').map(s => s.trim()).filter(Boolean).forEach(l => {
    const m = l.match(/^(\d+)\s*x\s+(.+)$/i);
    if (m) for (let i = 0; i < +m[1]; i++) work.push(m[2]); else work.push(l);
  });
  const n = Math.max(1, parseInt(sets) || 1);
  while (work.length < n) work.push(work[work.length - 1] || '10 a 12');
  work.slice(0, n).forEach(r => out.push({type:'trab', reps:r}));
  return out;
}
function P(items, sets, reps, rest, o){ o = o || {}; return {id: uid(), items, method: o.method || (items.length > 1 ? 'conjugado' : 'normal'), series: buildSeries(sets, reps, o), rest, notes: o.notes || '', alt: o.alt || []}; }

const BASE = {'agach-livre':30,'leg-press':80,'elev-pelvica':50,'rdl-belt':40,'abdutora':45,'extensora':35,'desenv-neutro':8,'elev-lateral':5,'remada-alta':7,'supino-halter':12,'triceps-frances':15,'abd-polia-flex':20,'triceps-testa':6,'abd-infra':0,'terra-sumo':40,'flexora':30,'bulgaro':8,'abd-polia':7,'ext-quadril':10,'remada-curvada':25,'remada-maq':35,'puxada-media':35,'pulldown':20,'rosca-direta':7,'facepull':15,'rosca-martelo':12,'rotacao-tronco':5,'agach-hack':40,'flexora-vert':20,'stiff':35};
const CMTS = {
  'seg|2|agach-livre':'Senti um leve incômodo no joelho esquerdo na última série, diminuí a amplitude.',
  'qua|1|bulgaro':'Usei halteres de 10 kg porque os de 12 estavam ocupados.',
  'qui|1|remada-maq':'Trocaram a máquina, a pegada neutra agora é mais aberta.',
  'ter|3|elev-lateral':'Cansei muito na última série, só saíram 10.'
};
function sessionDate(n, w){
  const d = new Date(); d.setHours(18, 30, 0, 0);
  let diff = (d.getDay() - n + 7) % 7; if (diff === 0) diff = 7;
  d.setDate(d.getDate() - diff - 7 * (w - 1)); return d.toISOString();
}
function rangeNums(t){ const m = String(t).match(/(\d+)\D+(\d+)/); if (m) return [+m[1], +m[2]]; const k = parseInt(t); return [k || 10, k || 10]; }
const SKIP = ['seg|7','sex|10','qua|9','qui|8','sex|7','seg|6','ter|6','qui|6','sex|5','ter|4','qua|3','sex|2','ter|1'];
function seedSeen(students){
  const seen = {};
  students.forEach(st => st.logs.slice().sort((a, b) => a.date < b.date ? -1 : 1).slice(0, -4).forEach(l => seen[l.id] = true));
  return seen;
}
function seedHistory(st, o){
  o = o || {}; const logs = [], WEEKS = o.weeks || 10, cutoff = new Date(Date.now() - (o.cutoffDays || 0) * 864e5);
  for (let w = WEEKS; w >= 1; w--){
    DAYS.forEach(dd => {
      const day = st.days[dd.k]; if (!day.ex.length || SKIP.includes(dd.k + '|' + w)) return;
      if (new Date(sessionDate(dd.n, w)) > new Date() || new Date(sessionDate(dd.n, w)) > cutoff) return;
      const prog = Math.round((WEEKS - w) * 0.4);
      const entries = day.ex.map(ex => {
        let wi = -1;
        const sets = ex.series.map(sr => { const type = sr.type, t = sr.reps; if (type === 'trab') wi++;
          return {done: true, type, parts: ex.items.map((lid, pi) => {
          const base = BASE[lid] || 10;
          const step = base >= 40 ? 5 : base >= 20 ? 2.5 : 1;
          const tp = t.split(/\s*\+\s*/)[pi] || t;
          const [lo, hi] = rangeNums(tp);
          const top = base + step * prog;
          if (type !== 'trab'){ const kg = Math.max(step, Math.round(top * (type === 'aq' ? 0.5 : 0.75) / step) * step); return {kg: base ? String(kg) : '', reps: String(hi)}; }
          const extra = wi === 0 ? 0 : ((wi + w + pi) % 3 === 0 ? 0 : step);
          const reps = Math.max(lo, hi - ((wi + w) % 3) - (extra ? 1 : 0));
          return {kg: base ? String(top + extra) : '', reps: String(reps)};
        })}; });
        const old = o.oldProto && w >= 7 && ex.items[0] === 'rdl-belt';
        return {exId: old ? 'old-' + ex.id : ex.id, items: old ? ['stiff'] : ex.items.slice(), method: ex.method, sets, comment: CMTS[dd.k + '|' + w + '|' + ex.items[0]] || ''};
      });
      logs.push({id: uid(), date: sessionDate(dd.n, w), day: dd.k, title: day.title, protocol: o.oldProto && w >= 7 ? o.oldProto : st.protocol, entries, sample: true});
    });
  }
  logs.sort((a, b) => a.date < b.date ? -1 : 1);
  st.logs = logs; st.last = logs.length ? logs[logs.length - 1].date : null;
}
function seed(){
  const st = {
    id: 'caroline', name: 'Caroline Monteiro', protocol: 'Protocolo 11',
    focus: 'Manutenção de volume e hipertrofia muscular geral',
    cardio: 'A aluna relatou que faz remo aos sábados.',
    privNotes: 'Exemplo: relatou desconforto leve no joelho esquerdo em agachamento profundo. Prefere treinar à noite.',
    days: {
      seg: {title:'Inferiores Completo', cardio:[{mod:'Esteira inclinada', dur:'20 min', int:'Moderada, dá pra conversar', when:'depois', obs:'Inclinação entre 8 e 10%, sem segurar no apoio.'}], ex:[
        P(['agach-livre'],3,'1x 10 a 12\n2x 8 a 10','2:00 a 2:30',{warmup:true, prep:'6 a 8'}),
        P(['leg-press'],3,'10 a 12','2:00 a 2:30',{alt:['agach-hack']}),
        P(['elev-pelvica'],3,'8 a 10','2:00 a 2:30'),
        P(['rdl-belt'],4,'10 a 12','2:00 a 2:30'),
        P(['abdutora'],3,'12 a 15','1:30 a 2:00'),
        P(['extensora'],3,'10 a 12','1:30 a 2:00')]},
      ter: {title:'Ombros, Peitoral e Tríceps', ex:[
        P(['desenv-neutro'],3,'12 a 15','1:30 a 2:00',{warmup:true}),
        P(['elev-lateral'],4,'12 a 15','1:30 a 2:00'),
        P(['remada-alta'],3,'10 a 12','1:00 a 1:30'),
        P(['supino-halter'],3,'8 a 10','2:00 a 2:30'),
        P(['triceps-frances','abd-polia-flex'],3,'12 a 15 + 12 a 15','1:00 a 1:30'),
        P(['triceps-testa','abd-infra'],3,'10 a 12 + 12 a 15','1:00 a 1:30')]},
      qua: {title:'Inferiores Completo', ex:[
        P(['terra-sumo'],3,'1x 10 a 12\n2x 8 a 10','2:00 a 2:30',{warmup:true}),
        P(['flexora'],3,'10 a 12','1:30 a 2:00'),
        P(['bulgaro'],3,'10 a 12','2:00 a 2:30',{alt:['afundo']}),
        P(['abd-polia'],3,'10 a 12','1:30 a 2:00'),
        P(['ext-quadril'],3,'10 a 12','1:30 a 2:00')]},
      qui: {title:'Costas e Bíceps', ex:[
        P(['remada-curvada'],3,'10 a 12','2:00 a 2:30',{warmup:true}),
        P(['remada-maq'],4,'2x 12 a 15\n2x 10 a 12','1:30 a 2:00'),
        P(['puxada-media'],3,'10 a 12','1:30 a 2:00',{alt:['puxada-frente']}),
        P(['pulldown','rosca-direta'],3,'10 a 12 + 12 a 15','1:30 a 2:00'),
        P(['facepull','rosca-martelo'],3,'10 a 12 + 10 a 12','1:00 a 1:30'),
        P(['rotacao-tronco'],3,'10 a 12','1:00 a 1:30')]},
      sex: {title:'Inferiores Completo', ex:[
        P(['agach-hack'],3,'10 a 12','2:00 a 2:30',{warmup:true}),
        P(['elev-pelvica'],3,'8 a 10','2:00 a 2:30'),
        P(['rdl-belt'],4,'10 a 12','2:00 a 2:30'),
        P(['flexora-vert'],3,'10 a 12','1:30 a 2:00'),
        P(['abdutora'],3,'12 a 15','1:30 a 2:00'),
        P(['ext-quadril'],3,'10 a 12','1:30 a 2:00')]},
      sab: {title:'Barquinho', ex:[], cardio:[{mod:'Remo', dur:'', int:'Confortável', when:'livre', obs:'O remo que você já faz aos sábados vale como cardio da semana.'}]},
      dom: {title:'Descanso', ex:[]}
    },
    logs: [], last: null
  };
  seedHistory(st, {oldProto: 'Protocolo 10'});
  const rf = JSON.parse(JSON.stringify(st));
  Object.assign(rf, {id:'rafael', name:'Rafael Souza (exemplo)', protocol:'Protocolo 3', focus:'Hipertrofia', cardio:'', privNotes:''});
  Object.values(rf.days).forEach(d => d.ex.forEach(e => e.id = uid()));
  seedHistory(rf, {weeks: 6, cutoffDays: 9});
  return {library: seedLibrary(), methods: seedMethods(), students: [st, rf], drafts: {}, draftMeta: {}, settings: {wa: '5521984183052'}, seen: seedSeen([st, rf]), mig: 5};
}

let saveT;
function save(){ clearTimeout(saveT); saveT = setTimeout(() => { cacheWrite(); scheduleSync(); }, 150); }
let db = emptyDb();

const state = {mode:'aluno', sid: undefined, day: todayKey, dayPicked:false, feedF:'todos', feedN:20, copy:null, imp:null, sumOpen:false, obStep:0, newOpen:false, sdataOpen:false, volOpen:false, openEx:{}, editLog:null, logDraft:null, histN:5, stab:'treino', evoLib:null, evoMode:'serie', fperiod:'semana',
  psec:'alunos', pview:'list', ptab:'hist', editDay:'seg', picker:null, libOpen:null, libQ:'', libM:''};
const app = document.getElementById('app');

/* ---------- nuvem: login, banco de dados e sincronização ---------- */
const CFG = window.JAU_CONFIG || {};
const CONSENT_VERSION = 'teste-2026-10';
const RECOVERY_LINK = /type=recovery/.test(location.hash);
const APP_URL = location.origin + location.pathname.replace(/index\.html$/, '');
const AUTH = {screen: 'loading', view: RECOVERY_LINK ? 'recovery' : 'login', user: null, profile: null, msg: '', err: '', busy: false};
const SYNC = {synced: {}, status: 'ok', timer: null, running: false, again: false, retry: 0, retryT: null, lastPull: 0, pulling: false, pendingRender: false};
let sb = null;
try {
  if (window.supabase && CFG.supabaseUrl && !/COLE_AQUI/.test(CFG.supabaseUrl + CFG.supabaseKey))
    sb = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseKey, {auth: {persistSession: true, autoRefreshToken: true, detectSessionInUrl: true}});
} catch(e){ sb = null; }
if (sb) sb.auth.onAuthStateChange((ev, session) => {
  if (ev === 'PASSWORD_RECOVERY'){ AUTH.view = 'recovery'; AUTH.user = session && session.user; setTimeout(() => { AUTH.screen = 'auth'; AUTH.err = AUTH.msg = ''; render(); }, 0); }
});
const isP = () => !!(AUTH.profile && AUTH.profile.role === 'personal');
const cacheKey = () => 'jau-cache-v1:' + (AUTH.user ? AUTH.user.id : 'anon');
function emptyDb(){ return {library: [], methods: [], students: [], drafts: {}, draftMeta: {}, settings: {wa: ''}, seen: {}, onboarded: {}}; }
function cacheWrite(){ if (!AUTH.user) return; try { localStorage.setItem(cacheKey(), JSON.stringify({db, synced: SYNC.synced, profile: AUTH.profile})); } catch(e){} }
function cacheRead(){ try { const c = JSON.parse(localStorage.getItem(cacheKey()) || 'null'); return c && c.db ? c : null; } catch(e){ return null; } }

/* Cada linha do banco vira uma "foto" em texto. Salvar = enviar só as fotos que mudaram. */
function snap(){
  const m = {}, P = isP(), logIds = new Set();
  db.students.forEach(s => {
    if (P){
      const {id, logs, privNotes, last, email, userId, ...rest} = s;
      m['stu:' + id] = JSON.stringify({email: email || null, data: rest});
      m['prv:' + id] = JSON.stringify(privNotes || '');
    }
    (s.logs || []).forEach(l => { const {id, date, ...rest} = l; logIds.add(id); m['log:' + id] = JSON.stringify({student_id: s.id, date, data: rest}); });
  });
  if (P){
    db.library.forEach((l, i) => { const {id, ...rest} = l; m['lib:' + id] = JSON.stringify({ord: i, data: rest}); });
    db.methods.forEach((x, i) => { const {id, ...rest} = x; m['met:' + id] = JSON.stringify({ord: i, data: rest}); });
    m['set:wa'] = JSON.stringify((db.settings && db.settings.wa) || '');
    Object.keys(db.seen || {}).forEach(k => { if (db.seen[k] && logIds.has(k)) m['seen:' + k] = '1'; });
  }
  return m;
}
const TBL = {
  lib: {t: 'library', pk: 'id', row: (id, v) => ({id, ord: v.ord, data: v.data})},
  met: {t: 'methods', pk: 'id', row: (id, v) => ({id, ord: v.ord, data: v.data})},
  set: {t: 'settings', pk: 'key', row: (id, v) => ({key: id, value: v})},
  stu: {t: 'students', pk: 'id', row: (id, v) => ({id, email: v.email, data: v.data})},
  prv: {t: 'student_private', pk: 'student_id', row: (id, v) => ({student_id: id, notes: v})},
  log: {t: 'logs', pk: 'id', row: (id, v) => ({id, student_id: v.student_id, date: v.date, data: v.data})},
  seen: {t: 'feed_seen', pk: 'log_id', row: id => ({log_id: id})}
};
const UP_ORDER = ['lib', 'met', 'set', 'stu', 'prv', 'log', 'seen'], DEL_ORDER = ['seen', 'log', 'prv', 'stu', 'met', 'lib', 'set'];
function diff(){
  const cur = snap(), prev = SYNC.synced, up = {}, del = {};
  const pre = k => k.slice(0, k.indexOf(':'));
  Object.keys(cur).forEach(k => { if (prev[k] !== cur[k]) (up[pre(k)] = up[pre(k)] || []).push(k); });
  Object.keys(prev).forEach(k => { if (!(k in cur)) (del[pre(k)] = del[pre(k)] || []).push(k); });
  return {cur, up, del, n: Object.keys(up).length + Object.keys(del).length};
}
const hasPending = () => diff().n > 0;
async function push(){
  if (!sb || !AUTH.user) return;
  const {cur, up, del} = diff(), prev = SYNC.synced;
  for (const p of UP_ORDER){
    const ks = up[p]; if (!ks) continue;
    for (let i = 0; i < ks.length; i += 200){
      const part = ks.slice(i, i + 200);
      const rows = part.map(k => TBL[p].row(k.slice(p.length + 1), JSON.parse(cur[k])));
      const {error} = await sb.from(TBL[p].t).upsert(rows, {onConflict: TBL[p].pk});
      if (error) throw error;
      part.forEach(k => prev[k] = cur[k]);
    }
  }
  for (const p of DEL_ORDER){
    const ks = del[p]; if (!ks) continue;
    for (let i = 0; i < ks.length; i += 200){
      const part = ks.slice(i, i + 200);
      const {error} = await sb.from(TBL[p].t).delete().in(TBL[p].pk, part.map(k => k.slice(p.length + 1)));
      if (error) throw error;
      part.forEach(k => delete prev[k]);
    }
  }
  cacheWrite();
  if (up.stu && isP()) setTimeout(() => refresh(true), 1500);
}
const isNetErr = e => !e || (!e.code && /fetch|network|load failed|timeout/i.test(String(e.message || e)));
function setSync(st){
  const was = SYNC.status; SYNC.status = st;
  const c = document.getElementById('syncchip'); if (!c) return;
  if (st === 'offline'){ c.textContent = 'Sem internet. Está tudo salvo no aparelho e vai pra nuvem quando o sinal voltar.'; c.hidden = false; }
  else if (st === 'error'){ c.textContent = 'Não consegui salvar na nuvem. Tentando de novo…'; c.hidden = false; }
  else { c.hidden = true; if (st === 'ok' && (was === 'offline' || was === 'error')) toast('Tudo salvo na nuvem.'); }
}
function scheduleSync(delay){ if (!sb || !AUTH.user) return; clearTimeout(SYNC.timer); SYNC.timer = setTimeout(runSync, delay == null ? 700 : delay); }
async function runSync(){
  if (!sb || !AUTH.user) return;
  if (SYNC.running){ SYNC.again = true; return; }
  SYNC.running = true;
  try { await push(); SYNC.retry = 0; setSync('ok'); }
  catch(e){
    console.error('sync', e); SYNC.retry++;
    setSync(navigator.onLine === false || isNetErr(e) ? 'offline' : 'error');
    clearTimeout(SYNC.retryT); SYNC.retryT = setTimeout(runSync, Math.min(60000, 3000 * SYNC.retry));
  } finally {
    SYNC.running = false;
    if (SYNC.again){ SYNC.again = false; scheduleSync(150); }
  }
}
async function fetchAll(t, pk){
  const out = [];
  for (let from = 0; ; from += 1000){
    const {data, error} = await sb.from(t).select('*').order(pk).range(from, from + 999);
    if (error) throw error;
    out.push(...data);
    if (data.length < 1000) return out;
  }
}
const byOrd = (a, b) => (a.ord - b.ord) || (a.id < b.id ? -1 : 1);
/* Baixa tudo do banco. Devolve true se algo mudou. */
async function pull(){
  if (!sb || SYNC.pulling) return false;
  SYNC.pulling = true;
  try {
    const P = isP();
    const [lib, met, set, stus, logs, prv, seen] = await Promise.all([
      fetchAll('library', 'id'), fetchAll('methods', 'id'), fetchAll('settings', 'key'), fetchAll('students', 'id'), fetchAll('logs', 'id'),
      P ? fetchAll('student_private', 'student_id') : Promise.resolve([]), P ? fetchAll('feed_seen', 'log_id') : Promise.resolve([])]);
    if (hasPending()) return false;
    const before = JSON.stringify([db.library, db.methods, db.students, db.settings, db.seen]);
    const logsBy = {}, prvBy = {};
    logs.sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : (a.created_at < b.created_at ? -1 : 1))
      .forEach(r => (logsBy[r.student_id] = logsBy[r.student_id] || []).push(Object.assign({id: r.id, date: r.date}, r.data)));
    prv.forEach(r => prvBy[r.student_id] = r.notes || '');
    db.library = lib.sort(byOrd).map(r => Object.assign({id: r.id}, r.data));
    db.methods = met.sort(byOrd).map(r => Object.assign({id: r.id}, r.data));
    const wa = set.find(r => r.key === 'wa');
    db.settings = Object.assign({}, db.settings, {wa: wa && typeof wa.value === 'string' ? wa.value : ''});
    db.seen = Object.fromEntries(seen.map(r => [r.log_id, true]));
    db.students = stus.sort((a, b) => a.created_at < b.created_at ? -1 : 1).map(r => {
      const s = Object.assign({id: r.id, email: r.email || '', userId: r.user_id || null}, r.data, {privNotes: P ? (prvBy[r.id] || '') : '', logs: logsBy[r.id] || []});
      s.days = s.days || {}; DAYS.forEach(x => { s.days[x.k] = s.days[x.k] || {title: '', ex: []}; if (!s.days[x.k].ex) s.days[x.k].ex = []; });
      s.last = s.logs.reduce((m, x) => !m || x.date > m ? x.date : m, null);
      return s;
    });
    SYNC.synced = snap(); SYNC.lastPull = Date.now(); dataVer++; cacheWrite();
    if (!db.students.find(s => s.id === state.sid)) state.sid = db.students[0] && db.students[0].id;
    return before !== JSON.stringify([db.library, db.methods, db.students, db.settings, db.seen]);
  } finally { SYNC.pulling = false; }
}
const typing = () => { const a = document.activeElement; return !!(a && a.matches && a.matches('input,textarea,select')); };
async function refresh(force){
  if (!sb || AUTH.screen !== 'app' || (!force && Date.now() - SYNC.lastPull < 20000)) return;
  try {
    if (hasPending()) await runSync();
    const changed = await pull();
    if (changed){ if (typing() || state.done || state.editLog) SYNC.pendingRender = true; else render(); }
  } catch(e){ if (isNetErr(e)) setSync('offline'); }
}
document.addEventListener('focusout', () => setTimeout(() => { if (SYNC.pendingRender && !typing() && !state.done && !state.editLog){ SYNC.pendingRender = false; render(); } }, 120));
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible'){ runSync(); refresh(); } });
window.addEventListener('online', () => { runSync(); refresh(true); });
setInterval(() => { if (document.visibilityState === 'visible' && isP()) refresh(); }, 60000);

/* ---------- entrar ---------- */
async function boot(){
  if (!sb){ AUTH.screen = 'error'; AUTH.err = 'O app ainda não foi ligado ao banco de dados. Falta preencher o arquivo config.js.'; render(); return; }
  let session = null;
  try { const {data} = await sb.auth.getSession(); session = data && data.session; } catch(e){ session = null; }
  if (AUTH.view === 'recovery' && session){ AUTH.user = session.user; AUTH.screen = 'auth'; render(); return; }
  if (!session){ AUTH.screen = 'auth'; render(); return; }
  if (/access_token|type=signup/.test(location.hash)) history.replaceState(null, '', location.pathname + location.search);
  await enter(session.user);
}
async function enter(user){
  AUTH.user = user; AUTH.err = AUTH.msg = '';
  if (AUTH.view === 'recovery'){ AUTH.screen = 'auth'; render(); return; }
  const c = cacheRead();
  if (c){ db = Object.assign(emptyDb(), c.db); SYNC.synced = c.synced || {}; AUTH.profile = c.profile || null; }
  else { db = emptyDb(); SYNC.synced = {}; AUTH.profile = null; }
  try {
    const {data, error} = await sb.from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (error) throw error;
    if (data) AUTH.profile = data;
  } catch(e){
    if (!AUTH.profile){ AUTH.screen = 'error'; AUTH.err = isNetErr(e) ? 'Sem internet. No primeiro acesso o app precisa de conexão. Conecte-se e tente de novo.' : 'Não consegui carregar sua conta (' + (e.message || e) + ').'; render(); return; }
  }
  if (!AUTH.profile){ AUTH.screen = 'error'; AUTH.err = 'Sua conta existe, mas o banco de dados ainda não foi configurado. Avise o seu personal.'; render(); return; }
  if (!isP() && (!AUTH.profile.consent_terms_at || !AUTH.profile.consent_health_at)){ AUTH.screen = 'consent'; render(); return; }
  await openApp(!!c);
}
async function openApp(hasCache){
  state.mode = isP() ? 'personal' : 'aluno';
  if (!isP()) state.stab = state.stab || 'treino';
  if (hasCache && (db.students.length || db.library.length)){ AUTH.screen = 'app'; if (!db.students.find(s => s.id === state.sid)) state.sid = db.students[0] && db.students[0].id; render(); }
  else { AUTH.screen = 'loading'; render(); }
  try { if (hasPending()) await push(); } catch(e){}
  try { await pull(); setSync(hasPending() ? 'offline' : 'ok'); }
  catch(e){
    console.error('pull', e);
    if (AUTH.screen !== 'app'){ AUTH.screen = 'error'; AUTH.err = isNetErr(e) ? 'Sem internet. Conecte-se e tente de novo.' : 'Não consegui carregar os dados (' + (e.message || e) + ').'; render(); return; }
    setSync(isNetErr(e) ? 'offline' : 'error');
  }
  if (isP()){
    let seeded = false;
    if (!db.library.length){ db.library = seedLibrary(); seeded = true; }
    if (!db.methods.length){ db.methods = seedMethods(); seeded = true; }
    if (!db.settings.wa){ db.settings.wa = '5521984183052'; seeded = true; }
    if (seeded){ cacheWrite(); runSync(); }
  } else if (!db.students.length){ AUTH.screen = 'waiting'; render(); return; }
  AUTH.screen = 'app';
  if (!db.students.find(s => s.id === state.sid)) state.sid = db.students[0] && db.students[0].id;
  render();
}
async function logout(){
  try { await sb.auth.signOut({scope: 'local'}); } catch(e){}
  try { localStorage.removeItem(cacheKey()); } catch(e){}
  clearTimeout(SYNC.timer); clearTimeout(SYNC.retryT);
  db = emptyDb(); SYNC.synced = {}; AUTH.user = null; AUTH.profile = null; AUTH.screen = 'auth'; AUTH.view = 'login'; AUTH.err = AUTH.msg = '';
  state.done = null; state.sid = undefined; state.psec = 'alunos'; state.pview = 'list'; state.stab = 'treino';
  setSync('ok'); render(); top();
}
function authErr(e){
  const m = String((e && e.message) || e || '');
  if (/invalid login credentials/i.test(m)) return 'E-mail ou senha incorretos.';
  if (/email not confirmed/i.test(m)) return 'Falta confirmar o e-mail. Abra o link que enviamos (veja também o spam) e depois entre.';
  if (/already registered|already been registered/i.test(m)) return 'Esse e-mail já tem conta. Toque em "Entrar" ou em "Esqueci minha senha".';
  if (/rate limit|security purposes|too many/i.test(m)) return 'Muitas tentativas seguidas. Espere alguns minutos e tente de novo.';
  if (/password/i.test(m) && /least|short|weak/i.test(m)) return 'A senha precisa ter pelo menos 8 caracteres.';
  if (/same.*password|different from the old/i.test(m)) return 'A nova senha precisa ser diferente da anterior.';
  if (isNetErr(e)) return 'Sem conexão com a internet.';
  return 'Não deu certo: ' + m;
}
const ICON_EYE = '<svg class="ic" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/></svg>';
function pwField(id, label, auto){ return `<label>${label}<span class="pw"><input id="${id}" type="password" autocomplete="${auto}" minlength="8" required><button type="button" class="pwtog" data-act="pw-toggle" data-v="${id}" aria-label="Mostrar senha">${ICON_EYE}</button></span></label>`; }
function authView(){
  const band = `<header class="band authband"><div class="wrap"><img class="logo" src="${LOGO}" alt="Jau Training, Online Strength Coaching" width="560" height="406"></div></header>`;
  const err = AUTH.err ? `<p class="autherr" role="alert">${esc(AUTH.err)}</p>` : '';
  const msg = AUTH.msg ? `<p class="authmsg" role="status">${esc(AUTH.msg)}</p>` : '';
  const out = AUTH.user ? `<button type="button" class="linkbtn" data-act="logout">Sair desta conta</button>` : '';
  const wrap = inner => band + `<main class="wrap auth">${inner}</main>`;
  if (AUTH.screen === 'loading') return wrap(`<p class="muted center">Carregando seus treinos…</p>`);
  if (AUTH.screen === 'error') return wrap(`<section class="card authcard"><h2>Não deu pra abrir</h2><p>${esc(AUTH.err)}</p><button class="btn block" type="button" data-act="auth-retry">Tentar de novo</button>${out}</section>`);
  if (AUTH.screen === 'waiting') return wrap(`<section class="card authcard"><p class="eyebrow">Conta criada</p><h2>Falta só o seu personal liberar</h2>
    <p>Você entrou com <b>${esc(AUTH.user && AUTH.user.email)}</b>. Assim que o Jau cadastrar este e-mail na sua ficha, ela aparece aqui.</p>
    <p class="muted small">Se você passou outro e-mail pra ele, avise ou entre com o e-mail certo.</p>
    <button class="btn block" type="button" data-act="auth-retry">Atualizar</button>${out}</section>`);
  if (AUTH.screen === 'consent') return wrap(`<section class="card authcard consent"><p class="eyebrow">Antes de começar</p><h2>Seus dados no Jau Training</h2>
    <p>Para montar e acompanhar o seu treino, o app guarda o seu nome e e-mail, a sua ficha, as cargas e repetições que você registra, as observações que você escreve nos exercícios e a frequência dos treinos.</p>
    <ul class="clist">
      <li><b>Quem vê:</b> só você e o seu personal. Os dados não são vendidos nem compartilhados com terceiros.</li>
      <li><b>Onde ficam:</b> num banco de dados protegido por senha (Supabase), com servidor em São Paulo.</li>
      <li><b>Seus direitos:</b> você pode pedir uma cópia, a correção ou a exclusão dos seus dados, e retirar esta autorização quando quiser, direto com o seu personal.</li>
      <li><b>Fase de testes:</b> o app ainda está sendo testado e pode mudar.</li>
    </ul>${err}
    <form id="f-consent" class="authform">
      <label class="ck"><input type="checkbox" id="c-terms" required><span>Li e aceito os termos de uso e a política de privacidade acima.</span></label>
      <label class="ck"><input type="checkbox" id="c-health" required><span>Autorizo o uso dos meus dados de saúde e treino (cargas, frequência e observações sobre dores ou desconfortos) para a prescrição e o acompanhamento do meu treino.</span></label>
      <button class="btn block" type="submit" ${AUTH.busy ? 'disabled' : ''}>Começar</button>
    </form>${out}</section>`);
  const v = AUTH.view, busy = AUTH.busy ? 'disabled' : '';
  if (v === 'signup') return wrap(`<section class="card authcard"><p class="eyebrow">Primeiro acesso</p><h2>Criar sua conta</h2>
    <p class="muted small">Use o mesmo e-mail que você passou pro seu personal. É por ele que a sua ficha aparece.</p>${err}${msg}
    <form id="f-signup" class="form authform">
      <label>Seu nome<input id="a-name" autocomplete="name" required></label>
      <label>E-mail<input id="a-email" type="email" autocomplete="email" inputmode="email" required></label>
      ${pwField('a-pass', 'Crie uma senha <span class="hint">Mínimo de 8 caracteres.</span>', 'new-password')}
      <button class="btn block" type="submit" ${busy}>${AUTH.busy ? 'Criando…' : 'Criar conta'}</button>
    </form>
    <p class="authalt">Já tem conta? <button type="button" class="linkbtn" data-act="auth-view" data-v="login">Entrar</button></p></section>`);
  if (v === 'sent') return wrap(`<section class="card authcard"><p class="eyebrow">Quase lá</p><h2>Confirme o seu e-mail</h2>
    <p>Enviamos um link para <b>${esc(AUTH.sentTo || '')}</b>. Abra o e-mail (olhe também o spam e as promoções) e toque no link. Você volta pra cá já com a conta ativa.</p>
    <button class="btn block quiet" type="button" data-act="auth-view" data-v="login">Voltar para entrar</button></section>`);
  if (v === 'forgot') return wrap(`<section class="card authcard"><p class="eyebrow">Recuperar acesso</p><h2>Esqueci minha senha</h2>
    <p class="muted small">Digite o seu e-mail. Enviamos um link para você criar uma senha nova.</p>${err}${msg}
    <form id="f-forgot" class="form authform"><label>E-mail<input id="a-email" type="email" autocomplete="email" inputmode="email" required></label>
      <button class="btn block" type="submit" ${busy}>${AUTH.busy ? 'Enviando…' : 'Enviar link'}</button></form>
    <p class="authalt"><button type="button" class="linkbtn" data-act="auth-view" data-v="login">Voltar para entrar</button></p></section>`);
  if (v === 'recovery') return wrap(`<section class="card authcard"><p class="eyebrow">Recuperar acesso</p><h2>Crie uma senha nova</h2>${err}${msg}
    ${AUTH.user ? `<form id="f-recovery" class="form authform">${pwField('a-pass', 'Nova senha <span class="hint">Mínimo de 8 caracteres.</span>', 'new-password')}
      <button class="btn block" type="submit" ${busy}>${AUTH.busy ? 'Salvando…' : 'Salvar nova senha'}</button></form>`
      : `<p>Este link expirou ou já foi usado. Peça um novo.</p><button class="btn block" type="button" data-act="auth-view" data-v="forgot">Pedir novo link</button>`}</section>`);
  return wrap(`<section class="card authcard"><p class="eyebrow">Bem-vindo</p><h2>Entrar</h2>${err}${msg}
    <form id="f-login" class="form authform">
      <label>E-mail<input id="a-email" type="email" autocomplete="email" inputmode="email" required></label>
      ${pwField('a-pass', 'Senha', 'current-password')}
      <button class="btn block" type="submit" ${busy}>${AUTH.busy ? 'Entrando…' : 'Entrar'}</button>
    </form>
    <p class="authalt"><button type="button" class="linkbtn" data-act="auth-view" data-v="forgot">Esqueci minha senha</button></p>
    <p class="authalt">Primeiro acesso? <button type="button" class="linkbtn" data-act="auth-view" data-v="signup">Criar conta</button></p></section>`);
}
function authBusy(on){ AUTH.busy = on; const f = document.querySelector('.authform'); if (f) f.querySelectorAll('button[type=submit]').forEach(b => b.disabled = on); }
document.addEventListener('submit', async e => {
  const id = e.target.id;
  if (!['f-login', 'f-signup', 'f-forgot', 'f-recovery', 'f-consent'].includes(id)) return;
  e.preventDefault();
  if (AUTH.busy || !sb) return;
  const val = x => { const el = document.getElementById(x); return el ? el.value.trim() : ''; };
  const email = val('a-email').toLowerCase(), pass = (document.getElementById('a-pass') || {}).value || '';
  if ((id === 'f-signup' || id === 'f-recovery') && pass.length < 8){ AUTH.err = 'A senha precisa ter pelo menos 8 caracteres.'; render(); return; }
  AUTH.err = AUTH.msg = ''; authBusy(true);
  try {
    if (id === 'f-login'){
      const {data, error} = await sb.auth.signInWithPassword({email, password: pass});
      if (error) throw error;
      AUTH.busy = false; await enter(data.user); return;
    }
    if (id === 'f-signup'){
      const {data, error} = await sb.auth.signUp({email, password: pass, options: {emailRedirectTo: APP_URL, data: {name: val('a-name')}}});
      if (error) throw error;
      if (data.user && Array.isArray(data.user.identities) && !data.user.identities.length) throw new Error('already registered');
      AUTH.busy = false;
      if (data.session){ await enter(data.user); return; }
      AUTH.sentTo = email; AUTH.view = 'sent'; render(); return;
    }
    if (id === 'f-forgot'){
      const {error} = await sb.auth.resetPasswordForEmail(email, {redirectTo: APP_URL});
      if (error) throw error;
      AUTH.msg = 'Pronto! Se existir uma conta com esse e-mail, o link chega em instantes. Olhe também o spam.';
    }
    if (id === 'f-recovery'){
      const {data, error} = await sb.auth.updateUser({password: pass});
      if (error) throw error;
      history.replaceState(null, '', location.pathname + location.search);
      AUTH.busy = false; AUTH.view = 'login'; toast('Senha nova salva.'); await enter(data.user || AUTH.user); return;
    }
    if (id === 'f-consent'){
      if (!document.getElementById('c-terms').checked || !document.getElementById('c-health').checked){ AUTH.err = 'Marque as duas autorizações para continuar.'; AUTH.busy = false; render(); return; }
      const now = new Date().toISOString();
      const {error} = await sb.from('profiles').update({consent_terms_at: now, consent_health_at: now, consent_version: CONSENT_VERSION}).eq('id', AUTH.user.id);
      if (error) throw error;
      Object.assign(AUTH.profile, {consent_terms_at: now, consent_health_at: now, consent_version: CONSENT_VERSION});
      AUTH.busy = false; await openApp(false); return;
    }
  } catch(err){ AUTH.err = authErr(err); }
  AUTH.busy = false; render();
});

/* ---------- convite e conta ---------- */
function accessHTML(s){
  if (s.userId) return '<span class="acc ok">App ativo</span>';
  if (s.email) return `<span class="acc wait">Convite pendente</span><button type="button" class="linkbtn small" data-act="invite" data-v="${s.id}">Enviar convite</button>`;
  return '<span class="acc none">Sem e-mail de acesso</span>';
}
function inviteMsg(s){
  const first = s.name.trim().split(' ')[0];
  return `Oi, ${first}! Seu treino agora está no app da Jau Training.\n\n1. Abra: ${APP_URL}\n2. Toque em "Criar conta" e use este e-mail: ${s.email}\n3. Confirme no link que chega no seu e-mail (olhe o spam também)\n4. Para abrir como app: no iPhone, Safari > Compartilhar > Adicionar à Tela de Início. No Android, Chrome > menu ⋮ > Instalar app.\n\nQualquer dúvida, me chama!`;
}
async function shareText(text, okMsg){
  try { if (navigator.share && matchMedia('(pointer:coarse)').matches){ await navigator.share({text}); return; } } catch(e){ if (e && e.name === 'AbortError') return; }
  try { await navigator.clipboard.writeText(text); toast(okMsg); }
  catch(e){ window.prompt('Copie a mensagem:', text); }
}
function accountHTML(){
  return AUTH.user ? `<div class="acct"><span class="muted small">Conectado como <b>${esc(AUTH.user.email)}</b></span><button class="icon" type="button" data-act="logout">Sair</button></div>` : '';
}

/* ---------- helpers ---------- */
const stu = () => db.students.find(s => s.id === state.sid) || db.students[0];
const lib = id => db.library.find(l => l.id === id) || {id, name:'Exercício removido', primary:[], secondary:[], instructions:'', video:''};
const meth = id => db.methods.find(m => m.id === id) || db.methods[0];
const draftKey = () => state.sid + '|' + state.day;
const draft = () => (db.drafts[draftKey()] = db.drafts[draftKey()] || {});
function drEx(exId){ const d = draft(); d[exId] = d[exId] || {sets:{}, comment:''}; if (!d[exId].sets) d[exId].sets = {}; return d[exId]; }
function targets(ex){ return (ex.series && ex.series.length ? ex.series : [{type:'trab', reps:''}]).map(s => s.reps); }
const measOf = (ex, k) => (ex && ex.meas && ex.meas[k]) || 'reps';
const tgtFmt = (t, m) => m === 'tempo' && t && !/s|seg|min/i.test(t) ? t + ' s' : t;
const markTxt = b => (b.kg ? fmtKg(b.kg) + ' kg × ' : '') + b.reps + (b.t ? ' s' : '');
const stypeOf = (ex, i) => (ex.series && ex.series[i] && ex.series[i].type) || 'trab';
const countType = (ex, t) => (ex.series || []).filter(s => s.type === t).length;
const dot = t => `<i class="sdot ${t}" title="${STYPES[t].l}"></i>`;
function restSecs(r){ const m = String(r || '').match(/(\d+):(\d{2})/); return m ? (+m[1]) * 60 + (+m[2]) : 90; }
function fmt(s){ s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
function lastEntry(st, exId, items){
  for (let k = st.logs.length - 1; k >= 0; k--){ const e = st.logs[k].entries.find(e => e.exId === exId && (!items || e.items.join() === items.join())); if (e) return e; }
  return null;
}
function dateBR(iso, opts){ try { return new Date(iso).toLocaleDateString('pt-BR', opts || {weekday:'short', day:'2-digit', month:'2-digit'}); } catch(e){ return ''; } }
const ddmm = iso => dateBR(iso, {day:'2-digit', month:'2-digit'});
function shortTitle(t){ return (t || '').split(/[ ,]/)[0] || '—'; }
function ytId(url){ const m = String(url || '').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/))([\w-]{11})/); return m ? m[1] : null; }
function videoUrl(l){ const id = ytId(l.video); return id ? 'https://www.youtube.com/watch?v=' + id : (l.video || ''); }
function usage(libId){ let n = 0; db.students.forEach(s => Object.values(s.days).forEach(d => d.ex.forEach(e => { if (e.items.includes(libId)) n++; }))); return n; }
function exName(ex){ return ex.items.map(i => lib(i).name).join(' + '); }

function dayMuscles(day){
  const prim = {}, sec = {};
  day.ex.forEach(ex => { const n = (ex.series || []).filter(s => s.type !== 'aq').length; ex.items.forEach(id => { const l = lib(id);
    l.primary.forEach(m => prim[m] = (prim[m] || 0) + n); l.secondary.forEach(m => sec[m] = (sec[m] || 0) + n); }); });
  const levels = {}; MUSCLES.forEach(([k]) => levels[k] = prim[k] ? 2 : sec[k] ? 1 : 0);
  return {levels, prim, sec};
}

const ICON_PLAY = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10.5" stroke="currentColor" stroke-width="1.6"/><path d="M10 8.3v7.4l6-3.7z" fill="currentColor"/></svg>';
const ICON_CHECK = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/* ---------- body map ---------- */
const HEAD = '<ellipse class="nb" cx="60" cy="18" rx="10.5" ry="13.5"/><path class="nb" d="M55 30 L65 30 L66.5 40 L53.5 40 Z"/>';
const FRONT = [
  ['trapezio','M53.5 38 C48 42 43 44.5 37.5 46.5 L53 46 Z'],
  ['delt_med','M33 47 C29 47.5 24 52 24 60.5 C24 65.5 25 69.5 27 72.5 C28 70 29.2 67.8 30.5 66 C30 61 29.8 56.5 30 53 C30.6 50.5 31.6 48.5 33 47 Z'],
  ['delt_ant','M33 47 C34.5 46.6 36 46.5 37 46.5 C39 48.5 40 51.5 40 55.5 C35.5 58 32.5 61.5 30.5 66 C29.8 61 29.8 56.5 30 53 C30.6 50.5 31.6 48.5 33 47 Z'],
  ['peitoral','M42 49.5 C48 46.5 55 47.5 59.5 49.5 L59.5 71 C52 74 45 73 40 68 C38 62 39 55 42 49.5 Z'],
  ['biceps','M28 75 C30 67 34 61 39 59 C40 68 38 81 35 91 C32 93 29 93 27 90 C26 85 26 80 28 75 Z'],
  ['antebraco','M27 95 C30 96 33 96 35 94 C35 104 32 117 29 127 L24 127 C22 117 23 104 27 95 Z'],
  [null,'M23 129.5 L30 129.5 C31 134 30 139 27 141 C24 140 22 135 23 129.5 Z'],
  ['obliquos','M41 71.5 C44 74 47 75 48.5 76 L48.5 115 C45 112 42 107 41 99 C40 91 40 81 41 71.5 Z'],
  ['abdomen','M50.5 75 L59.5 75 L59.5 118 C55.5 119.5 52.5 118.5 50.5 115.5 Z'],
  [null,'M41 117 C46 119.5 53 121.5 59.5 121 L59.5 124 C56 123.5 53 124 51 125.5 C47 122.5 44 121.5 40.5 122 Z'],
  ['quadriceps','M40 123.5 C45 120.5 52 122.5 55.5 127.5 C56.5 145 55.5 167 53.5 185 C49.5 188 45 188 42 185 C38 167 37 145 40 123.5 Z'],
  ['adutores','M57 126 C58 124 59 122.5 59.5 122 L59.5 138 C58.5 150 57.5 158 56 165 C57 150 57.5 138 57 126 Z'],
  [null,'M43 188.5 C46 190.5 51 190.5 53.5 188.5 L53.5 196 C50 198 46.5 198 43 196 Z'],
  ['panturrilha','M42 199 C46 197 52 197 55 200 C55 214 53 228 51 240 L46 240 C43 228 41 213 42 199 Z'],
  [null,'M45 242 L52 242 C54 246 54 250 52 252 L44 252 C43 249 44 245 45 242 Z']
];
const BACK = [
  ['trapezio','M60 31 L60 79 C55 67 48 57 37.5 48 C43 45 49 42 54 36.5 Z'],
  ['delt_med','M33 47 C29 47.5 24 52 24 60.5 C24 65.5 25 69.5 27 72.5 C28 70 29.2 67.8 30.5 66 C30 61 29.8 56.5 30 53 C30.6 50.5 31.6 48.5 33 47 Z'],
  ['delt_post','M33 47 C34.5 46.6 36 46.5 37 46.5 C39 48.5 40 51.5 40 55.5 C35.5 58 32.5 61.5 30.5 66 C29.8 61 29.8 56.5 30 53 C30.6 50.5 31.6 48.5 33 47 Z'],
  ['costas','M41 57 C47 60 54 68 59.5 81 L59.5 97 C53 101 47 104 43 106 C40 96 38 81 38 68 C38 63 39 59 41 57 Z'],
  ['triceps','M28 75 C30 67 34 61 39 59 C40 68 38 81 35 91 C32 93 29 93 27 90 C26 85 26 80 28 75 Z'],
  ['antebraco','M27 95 C30 96 33 96 35 94 C35 104 32 117 29 127 L24 127 C22 117 23 104 27 95 Z'],
  [null,'M23 129.5 L30 129.5 C31 134 30 139 27 141 C24 140 22 135 23 129.5 Z'],
  ['lombar','M45 107.5 C50 103.5 55 100.5 59.5 99.5 L59.5 117 C54 117 49 116 45 113.5 Z'],
  ['abdutores','M40 110 C42.5 112.5 45 115 47 118 C45 122 42.5 125.5 40 128 C38.8 121.5 38.8 115.5 40 110 Z'],
  ['gluteos','M43.5 118.5 C48 116.5 55 117 59.5 119 L59.5 141 C54 146 47 146 43 141 C40.5 135 40.5 125 43.5 118.5 Z'],
  ['posteriores','M41 146.5 C47 149.5 54 149.5 58 146.5 C58 160 56 174 54 186 C50 189 46 189 43 186 C40 172 39 158 41 146.5 Z'],
  [null,'M43 189 C46 191 51 191 54 189 L53.5 196 C50 197.5 46.5 197.5 43 196 Z'],
  ['panturrilha','M42 199 C45 195 53 195 56 200 C57 211 55 223 52 233 L46 233 C42 223 40 211 42 199 Z'],
  [null,'M46 235 L52 235 L53.5 252 L44 252 Z']
];
function half(shapes, lv){ return shapes.map(([m, d]) => m ? `<path class="mu l${lv[m] || 0}" d="${d}"><title>${MNAME[m]}</title></path>` : `<path class="nb" d="${d}"/>`).join(''); }
function figure(shapes, lv, cap){
  const h = half(shapes, lv);
  return `<figure><svg viewBox="18 0 84 256" role="img" aria-label="Corpo, vista de ${cap.toLowerCase()}">${HEAD}<g>${h}</g><g transform="translate(120 0) scale(-1 1)">${h}</g></svg><figcaption>${cap}</figcaption></figure>`;
}
function bodyMap(lv, sm){ return `<div class="bodymap ${sm ? 'sm' : ''}">${figure(FRONT, lv, 'Frente')}${figure(BACK, lv, 'Costas')}</div>`; }
function legend(){ return '<div class="legend"><span><i></i>Principal</span><span><i class="s"></i>Auxiliar</span><span><i class="z"></i>Não treinado</span></div>'; }
function muscleCard(day, title, sm){
  const {levels, prim, sec} = dayMuscles(day);
  const p = Object.entries(prim).sort((a, b) => b[1] - a[1]);
  const s = Object.keys(sec).filter(k => !prim[k]);
  return `<section class="card mapcard ${sm ? 'sm' : ''}">${bodyMap(levels, sm)}
    <div class="mlist"><div><p class="eyebrow">Mapa muscular</p><h3>${esc(title)}</h3></div>
      <div class="mtags">${p.map(([k, n]) => `<span class="mtag"><i></i>${MNAME[k]} <small>${n} séries</small></span>`).join('')}${s.map(k => `<span class="mtag s"><i></i>${MNAME[k]}</span>`).join('')}</div>
      ${legend()}</div></section>`;
}

/* ---------- alternativas, recordes, conquistas, alertas ---------- */
const ICON_SWAP = '<svg class="ic" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 8h13l-3.5-3.5M19 16H6l3.5 3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ICON_COPY = '<svg class="ic" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="8.5" y="8.5" width="11" height="11" rx="2" stroke="currentColor" stroke-width="2"/><path d="M15.5 5.5V5a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 5v8A1.5 1.5 0 0 0 6 14.5h.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const ICON_UP = '<svg class="ic" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M5 15v3.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ICON_CAM = '<svg class="ic" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2.2l1.4-2h5.8l1.4 2h2.2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="12.5" r="3.3" stroke="currentColor" stroke-width="2"/></svg>';
const ICON_PLUS = '<svg class="ic" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
const ICON_CHAT = '<svg class="ic" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4.5 19.5l1.3-3.6A7.5 7.5 0 1 1 8.6 18.6z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 10.5h6M9 13.5h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
const waNum = () => String((db.settings && db.settings.wa) || '').replace(/\D/g, '');
const waLink = msg => `https://wa.me/${waNum()}?text=${encodeURIComponent(msg)}`;
const waPretty = () => { const n = waNum().replace(/^55/, ''); return n.length >= 10 ? `(${n.slice(0, 2)}) ${n.slice(2, -4)}-${n.slice(-4)}` : n; };
const ICON_TROPHY = '<svg class="trophy" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 3.5h10V8a5 5 0 0 1-10 0V3.5z" fill="currentColor"/><path d="M7 5.5H4.5A2.5 2.5 0 0 0 7 9.5M17 5.5h2.5A2.5 2.5 0 0 1 17 9.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M12 13v3.5M8.5 20.5h7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M9.5 16.5h5v4h-5z" fill="currentColor"/></svg>';
function usedItems(ex, rec){ const sw = (rec && rec.swap) || {}; return ex.items.map((id, k) => sw[k] && ex.alt && ex.alt[k] ? ex.alt[k] : id); }
const beats = (c, b) => !b || c.kg > b.kg || (c.kg === b.kg && c.reps > b.reps);
function bestSets(e, pi){
  const out = [];
  e.sets.forEach((s, si) => { if ((s.type || 'trab') !== 'trab' || s.done === false) return; const p = s.parts[pi]; if (!p) return;
    const tmp = !!(e.meas && e.meas[pi] === 'tempo'), kg0 = numKg(p.kg), r = parseInt(p.reps) || 0; if ((kg0 || tmp) && r) out.push({kg: kg0 || 0, reps: r, si}); });
  return out;
}
let prCache = {k: null, v: null}, dataVer = 0;
function prHistory(st){
  const key = dataVer + '|' + st.id + '|' + st.logs.length + '|' + (st.logs.length ? st.logs[st.logs.length - 1].id : '');
  if (prCache.k === key) return prCache.v;
  const best = {}, prs = {}; let count = 0;
  st.logs.slice().sort((a, b) => a.date < b.date ? -1 : 1).forEach(l => l.entries.forEach(e => e.items.forEach((lid, pi) => {
    bestSets(e, pi).forEach(c => {
      const t = !!(e.meas && e.meas[pi] === 'tempo');
      if (best[lid] && beats(c, best[lid])){ (prs[l.id] = prs[l.id] || []).push({libId: lid, kg: c.kg, reps: c.reps, si: c.si, exId: e.exId, t}); count++; }
      if (beats(c, best[lid])) best[lid] = {kg: c.kg, reps: c.reps, date: l.date, t};
    });
  })));
  prCache = {k: key, v: {best, prs, count}};
  return prCache.v;
}
function draftPRs(st, ex, rec){
  const out = new Set(); if (!rec || !rec.sets) return out;
  const h = prHistory(st).best;
  usedItems(ex, rec).forEach((lid, pi) => {
    let b = h[lid] ? {kg: h[lid].kg, reps: h[lid].reps} : null; if (!b) return;
    targets(ex).forEach((_, si) => {
      if (stypeOf(ex, si) !== 'trab') return; const s = rec.sets[si]; if (!s || !s.done) return;
      const p = s.parts && s.parts[pi]; if (!p) return;
      const c = {kg: numKg(p.kg), reps: parseInt(p.reps) || 0}; if ((!c.kg && measOf(ex, pi) !== 'tempo') || !c.reps) return; c.kg = c.kg || 0;
      if (beats(c, b)){ out.add(si + '-' + pi); b = c; }
    });
  });
  return out;
}
const ACH = [
  {id:'t1', ic:'1', n:'Primeiro treino', d:'O começo de tudo', k:'total', v:1},
  {id:'t10', ic:'10', n:'10 treinos', d:'Pegando o ritmo', k:'total', v:10},
  {id:'t25', ic:'25', n:'25 treinos', d:'Já é rotina', k:'total', v:25},
  {id:'t50', ic:'50', n:'50 treinos', d:'Meio caminho pro 100', k:'total', v:50},
  {id:'t100', ic:'100', n:'100 treinos', d:'Lenda da consultoria', k:'total', v:100},
  {id:'wk1', ic:'✓', n:'Semana completa', d:'Todos os treinos planejados na semana', k:'fullWeeks', v:1},
  {id:'wk5', ic:'5✓', n:'5 semanas completas', d:'Plano cumprido 5 vezes', k:'fullWeeks', v:5},
  {id:'s4', ic:'4S', n:'Constância', d:'4 semanas seguidas com 3+ treinos', k:'bestStreak', v:4},
  {id:'s8', ic:'8S', n:'Disciplina', d:'8 semanas seguidas com 3+ treinos', k:'bestStreak', v:8},
  {id:'s12', ic:'12S', n:'Inabalável', d:'12 semanas seguidas com 3+ treinos', k:'bestStreak', v:12},
  {id:'pr1', ic:'PR', n:'Primeiro recorde', d:'Superou a melhor marca', k:'prs', v:1},
  {id:'pr10', ic:'10PR', n:'Quebrando marcas', d:'10 recordes pessoais', k:'prs', v:10},
  {id:'pr50', ic:'50PR', n:'Máquina de recordes', d:'50 recordes pessoais', k:'prs', v:50},
  {id:'v10', ic:'10t', n:'10 toneladas', d:'De carga total levantada', k:'tons', v:10, u:' t'},
  {id:'v50', ic:'50t', n:'50 toneladas', d:'De carga total levantada', k:'tons', v:50, u:' t'},
  {id:'v100', ic:'100t', n:'100 toneladas', d:'De carga total levantada', k:'tons', v:100, u:' t'}
];
function achStats(st){
  const days = trainedDays(st), plan = plannedPerWeek(st), target = Math.max(1, Math.min(3, plan));
  const wk = new Map(); days.forEach(d => { const k = dayKeyOf(weekStart(d)); wk.set(k, (wk.get(k) || 0) + 1); });
  let fullWeeks = 0, bestStreak = 0, cur = 0;
  if (days.length){
    const end = weekStart(new Date()); let w = weekStart(days[0]);
    while (w <= end){ const n = wk.get(dayKeyOf(w)) || 0, isNow = dayKeyOf(w) === dayKeyOf(end);
      if (plan && n >= plan) fullWeeks++;
      if (n >= target){ cur++; bestStreak = Math.max(bestStreak, cur); } else if (!isNow) cur = 0;
      w = new Date(w); w.setDate(w.getDate() + 7); }
  }
  let vol = 0;
  st.logs.forEach(l => l.entries.forEach(e => e.sets.forEach(s => { if (s.done === false || (s.type || 'trab') !== 'trab') return; s.parts.forEach((p, pi) => { if (e.meas && e.meas[pi] === 'tempo') return; const kg = numKg(p.kg), r = parseInt(p.reps) || 0; if (kg && r) vol += kg * r; }); })));
  return {total: st.logs.length, fullWeeks, bestStreak, prs: prHistory(st).count, tons: vol / 1000};
}
function unlocked(st){ const s = achStats(st); return ACH.filter(a => s[a.k] >= a.v); }
const medal = (a, on) => `<span class="medal ${on ? 'on' : ''}" aria-hidden="true"><span>${a.ic}</span></span>`;
function achSection(st){
  const s = achStats(st), on = a => s[a.k] >= a.v;
  const list = ACH.filter(on).concat(ACH.filter(a => !on(a)));
  return `<section class="card"><div class="sechd"><p class="eyebrow">Conquistas</p><span class="muted small">${ACH.filter(on).length} de ${ACH.length}</span></div>
    <div class="achgrid">${list.map(a => `<div class="ach ${on(a) ? 'on' : ''}">${medal(a, on(a))}<b>${a.n}</b><span>${on(a) ? a.d : fmtKg(Math.min(a.v, Math.floor(s[a.k]))) + ' de ' + a.v + (a.u || '')}</span></div>`).join('')}</div></section>`;
}
function recordsSection(st){
  const h = prHistory(st);
  const rows = Object.entries(h.best).map(([id, b]) => ({id, ...b})).sort((a, b) => a.date < b.date ? 1 : -1).slice(0, 8);
  if (!rows.length) return '';
  return `<section class="card"><div class="sechd"><p class="eyebrow">Melhores marcas</p><span class="muted small">${h.count} recordes batidos</span></div>
    <div class="reclist">${rows.map(r => `<div class="rec">${ICON_TROPHY}<span class="nm">${esc(lib(r.id).name)}<small>${dateBR(r.date, {day:'2-digit', month:'2-digit'})}</small></span><b>${esc(markTxt(r))}</b></div>`).join('')}</div></section>`;
}
function alertFor(s){
  const plan = plannedPerWeek(s); if (!plan) return null;
  if (!s.logs.length) return {lvl:'info', t:'Ainda não fez o primeiro treino'};
  const last = new Date(s.logs.reduce((m, l) => l.date > m ? l.date : m, s.logs[0].date));
  const t0 = new Date(); t0.setHours(0, 0, 0, 0); const l0 = new Date(last); l0.setHours(0, 0, 0, 0);
  const days = Math.round((t0 - l0) / 864e5);
  if (days >= 7) return {lvl:'high', days, t:`Sem treinar há ${days} dias`};
  if (days >= 4) return {lvl:'mid', days, t:`Sem treinar há ${days} dias`};
  const n14 = trainedDays(s).filter(d => d >= new Date(Date.now() - 14 * 864e5)).length;
  if (n14 < plan) return {lvl:'mid', t:`Só ${n14} ${n14 === 1 ? 'treino' : 'treinos'} nos últimos 14 dias (plano: ${plan * 2})`};
  return null;
}
function nudgeMsg(s){
  const a = alertFor(s) || {}, first = s.name.split(' ')[0];
  if (!s.logs.length) return `Oi, ${first}! Sua ficha já está no app. Bora fazer o primeiro treino? Qualquer dúvida, me chama!`;
  if (a.days) return `Oi, ${first}! Tudo certo? Vi que faz ${a.days} dias desde seu último treino e senti sua falta. Aconteceu alguma coisa? Se a rotina apertou, me conta que eu ajusto o treino pra caber no seu tempo. Bora voltar com tudo! 💪`;
  return `Oi, ${first}! Tudo certo? Notei que os treinos diminuíram nas últimas semanas. Se algo estiver atrapalhando, me conta que a gente ajusta a ficha. Bora retomar o ritmo! 💪`;
}
function attentionHTML(){
  if (!db.students.length) return '';
  const list = db.students.map(s => ({s, a: alertFor(s)})).filter(x => x.a).sort((x, y) => ({high:0, mid:1, info:2}[x.a.lvl] - {high:0, mid:1, info:2}[y.a.lvl]));
  if (!list.length) return `<section class="attn okk"><b>Todos os alunos em dia</b><span>Ninguém está há 4 dias ou mais sem treinar.</span></section>`;
  return `<section class="attn"><div class="attn-h"><b>Precisam de atenção</b><span class="cnt">${list.length}</span></div>
    ${list.map(({s, a}) => `<div class="attn-row ${a.lvl}"><i class="lv"></i><div class="who"><b>${esc(s.name)}</b><span>${esc(a.t)}</span></div>
      <div class="acts"><button type="button" class="icon" data-act="nudge" data-v="${s.id}">Copiar mensagem</button><button type="button" class="icon" data-act="p-track" data-v="${s.id}">Ver</button></div></div>`).join('')}
    <p class="hint">Alerta quando o aluno fica 4 dias ou mais sem treinar, ou faz menos da metade do planejado nas últimas 2 semanas.</p></section>`;
}
function nextProto(p){ p = String(p || 'Protocolo 0'); const m = p.match(/(\d+)\s*$/); return m ? p.replace(/(\d+)\s*$/, String(+m[1] + 1)) : p + ' 2'; }
function touchStart(){ db.draftMeta = db.draftMeta || {}; const k = draftKey(); if (!db.draftMeta[k]) db.draftMeta[k] = Date.now(); }
function doneData(st){
  const l = st.logs.find(x => x.id === state.done.logId); if (!l) return null;
  let sets = 0, vol = 0;
  l.entries.forEach(e => e.sets.forEach(x => { if (!x.done) return; sets++; if ((x.type || 'trab') !== 'trab') return; x.parts.forEach((p, pi) => { if (e.meas && e.meas[pi] === 'tempo') return; const kg = numKg(p.kg), r = parseInt(p.reps) || 0; if (kg && r) vol += kg * r; }); }));
  return {l, sets, vol: Math.round(vol)};
}
function doneView(st){
  const dd = doneData(st); if (!dd){ state.done = null; return studentView(); }
  const l = dd.l;
  const byLib = {}; (prHistory(st).prs[l.id] || []).forEach(p => { if (beats(p, byLib[p.libId])) byLib[p.libId] = p; });
  const prs = Object.values(byLib);
  const ach = (state.done.newAch || []).map(id => ACH.find(a => a.id === id)).filter(Boolean);
  const f = freqStats(st);
  return `<main class="wrap">
    <section class="card stkcard">
      <div><p class="eyebrow">Treino concluído</p><h2 class="stk-h">Mandou bem, ${esc(st.name.split(' ')[0])}!</h2>
        <p class="small muted">${f.week}º treino da semana${f.streak ? ' · ' + f.streak + (f.streak === 1 ? ' semana' : ' semanas') + ' de sequência' : ''}</p></div>
      <div class="stk-prev"><img id="sticker-img" alt="Imagem do treino com logo, nome do treino, volume load e séries" hidden><p id="stk-wait" class="small">Gerando imagem…</p></div>
      <p class="small muted">Imagem PNG com fundo transparente: no Instagram, coloque por cima da sua foto no story ou no post.</p>
      <button class="btn block" type="button" data-act="save-sticker" id="save-stk" disabled>Salvar imagem</button>
    </section>
    ${prs.length ? `<section class="card"><div class="sechd"><p class="eyebrow">${prs.length === 1 ? 'Recorde do dia' : prs.length + ' recordes do dia'}</p></div><div class="reclist">${prs.map(p => `<div class="rec">${ICON_TROPHY}<span class="nm">${esc(lib(p.libId).name)}</span><b>${esc(markTxt(p))}</b></div>`).join('')}</div></section>` : ''}
    ${ach.length ? `<section class="card"><div class="sechd"><p class="eyebrow">${ach.length === 1 ? 'Conquista desbloqueada' : 'Conquistas desbloqueadas'}</p></div><div class="achgrid">${ach.map(a => `<div class="ach on">${medal(a, true)}<b>${esc(a.n)}</b><span>${esc(a.d)}</span></div>`).join('')}</div></section>` : ''}
    <button class="btn block ghost" type="button" data-act="done-close">Voltar ao app</button>
  </main>`;
}
/* imagem PNG transparente para compartilhar */
let STICKER = null;
function wrapLines(ctx, text, max){
  const words = String(text).split(/\s+/), lines = []; let cur = '';
  words.forEach(w => { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > max && cur){ lines.push(cur); cur = w; } else cur = t; });
  if (cur) lines.push(cur); return lines;
}
function spacedText(ctx, text, cx, y, sp){
  const chars = [...text], ws = chars.map(ch => ctx.measureText(ch).width), tot = ws.reduce((a, b) => a + b, 0) + sp * (chars.length - 1);
  let x = cx - tot / 2; const al = ctx.textAlign; ctx.textAlign = 'left';
  chars.forEach((ch, i) => { ctx.fillText(ch, x, y); x += ws[i] + sp; }); ctx.textAlign = al;
}
async function makeSticker(title, vol, sets){
  const serif = '"Cormorant Garamond", Georgia, "Times New Roman", serif', sans = 'Montserrat, "Helvetica Neue", Arial, sans-serif';
  try { await Promise.all(['italic 700 120px "Cormorant Garamond"', '800 100px Montserrat', '700 30px Montserrat'].map(f => document.fonts.load(f))); } catch(e){}
  const logo = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = LOGO_HI; });
  const W = 1080, PAD = 70, c = document.createElement('canvas'), ctx = c.getContext('2d');
  const logoW = 600, logoH = Math.round(logoW * logo.height / logo.width);
  let fs = 132, lines;
  const fit = () => { ctx.font = `italic 700 ${fs}px ${serif}`; lines = wrapLines(ctx, title.toUpperCase(), W - PAD * 2); };
  fit(); while ((lines.length > 2 || lines.some(t => ctx.measureText(t).width > W - PAD * 2)) && fs > 64){ fs -= 6; fit(); }
  const yLogo = PAD, yKick = yLogo + logoH + 92, yTitle0 = yKick + 34 + Math.round(fs * 0.86);
  const yTitleEnd = yTitle0 + (lines.length - 1) * Math.round(fs * 0.98);
  const yNum = yTitleEnd + 190, yLbl = yNum + 62, H = yLbl + PAD;
  c.width = W; c.height = H;
  ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 22; ctx.shadowOffsetY = 3;
  ctx.drawImage(logo, (W - logoW) / 2, yLogo, logoW, logoH);
  ctx.font = `700 34px ${sans}`; spacedText(ctx, 'TREINO CONCLUÍDO', W / 2, yKick, 9);
  ctx.font = `italic 700 ${fs}px ${serif}`; lines.forEach((t, i) => ctx.fillText(t, W / 2, yTitle0 + i * Math.round(fs * 0.98)));
  const cols = [{cx: W * 0.29, num: vol.toLocaleString('pt-BR'), unit: 'kg', lbl: 'VOLUME LOAD'}, {cx: W * 0.71, num: String(sets), unit: '', lbl: sets === 1 ? 'SÉRIE' : 'SÉRIES'}];
  cols.forEach(col => {
    ctx.font = `800 104px ${sans}`; const w1 = ctx.measureText(col.num).width;
    ctx.font = `700 46px ${sans}`; const w2 = col.unit ? ctx.measureText(col.unit).width + 12 : 0;
    let x = col.cx - (w1 + w2) / 2; ctx.textAlign = 'left';
    ctx.font = `800 104px ${sans}`; ctx.fillText(col.num, x, yNum);
    if (col.unit){ ctx.font = `700 46px ${sans}`; ctx.fillText(col.unit, x + w1 + 12, yNum); }
    ctx.textAlign = 'center'; ctx.font = `700 30px ${sans}`; spacedText(ctx, col.lbl, col.cx, yLbl, 6);
  });
  ctx.shadowColor = 'transparent'; ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(W / 2 - 1.5, yNum - 96, 3, yLbl - yNum + 104);
  const blob = await new Promise(res => c.toBlob(res, 'image/png'));
  return blob;
}
async function renderSticker(){
  const st = stu(); if (!st || !state.done) return; const dd = doneData(st); if (!dd) return;
  const img = document.getElementById('sticker-img'), wait = document.getElementById('stk-wait'), btn = document.getElementById('save-stk');
  try {
    if (!STICKER || STICKER.logId !== dd.l.id){
      const blob = await makeSticker(dd.l.title || 'Treino', dd.vol, dd.sets);
      if (STICKER) URL.revokeObjectURL(STICKER.url);
      const d = new Date(dd.l.date), stamp = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      STICKER = {logId: dd.l.id, blob, url: URL.createObjectURL(blob), name: `treino-jau-training-${stamp}.png`};
    }
    const i2 = document.getElementById('sticker-img'); if (!i2) return;
    i2.src = STICKER.url; i2.hidden = false; const w2 = document.getElementById('stk-wait'); if (w2) w2.hidden = true;
    const b2 = document.getElementById('save-stk'); if (b2) b2.disabled = false;
  } catch(e){ if (wait) wait.textContent = 'Não consegui gerar a imagem neste aparelho.'; }
}
async function saveSticker(){
  if (!STICKER) return;
  try {
    const file = new File([STICKER.blob], STICKER.name, {type: 'image/png'});
    if (navigator.canShare && navigator.canShare({files: [file]}) && matchMedia('(pointer:coarse)').matches){ await navigator.share({files: [file]}); return; }
  } catch(e){ if (e && e.name === 'AbortError') return; }
  const a = document.createElement('a'); a.href = STICKER.url; a.download = STICKER.name; document.body.appendChild(a); a.click(); a.remove();
  toast('Imagem salva.');
}

/* ---------- cardio por dia ---------- */
const ICON_HEART = '<svg class="ic" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M6 12h3l1.5-2.5 2.5 5 1.5-2.5H18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const WHEN = {antes: 'Antes do treino', depois: 'Depois do treino', separado: 'Em outro horário', livre: 'Quando preferir'};
const CD_MODS = ['Esteira', 'Esteira inclinada', 'Caminhada', 'Corrida', 'Bicicleta', 'Bike de spinning', 'Elíptico', 'Escada', 'Remo', 'Natação', 'Pular corda', 'HIIT'];
const cardioList = d => ((d && d.cardio) || []).filter(c => c.mod || c.dur || c.obs || c.int);
const cardioTxt = c => [c.mod || 'Cardio', c.dur, c.when && c.when !== 'livre' ? (WHEN[c.when] || '').toLowerCase() : ''].filter(Boolean).join(' · ');
function cardioCard(d){
  const cs = cardioList(d); if (!cs.length) return '';
  return `<section class="cardio" aria-label="Cardio de hoje"><div class="cdh">${ICON_HEART}<b>Cardio de hoje</b></div>
    ${cs.map(c => `<div class="cdi"><p class="cdm"><b>${esc(c.mod || 'Cardio')}</b>${c.dur ? `<span class="cdd">${esc(c.dur)}</span>` : ''}${WHEN[c.when] ? `<span class="cdw">${WHEN[c.when]}</span>` : ''}</p>
      ${c.int ? `<p class="cdx"><span>Intensidade:</span> ${esc(c.int)}</p>` : ''}${c.obs ? `<p class="cdx">${esc(c.obs)}</p>` : ''}</div>`).join('')}</section>`;
}
function cardioSum(d){
  const cs = cardioList(d); if (!cs.length) return '';
  return `<div class="sumcardio">${ICON_HEART}<span><b>Cardio:</b> ${cs.map(c => esc(cardioTxt(c)) + (c.int ? ' (' + esc(c.int) + ')' : '')).join(' · ')}</span></div>`;
}
function cardioEditor(d){
  const cs = d.cardio || [];
  return `<section class="cardioed"><div class="sechd" style="margin-bottom:0"><p class="eyebrow">${ICON_HEART}Cardio do dia</p><span class="hint">O aluno vê antes do 1º exercício, sem precisar marcar como feito.</span></div>
    ${cs.map((c, i) => `<div class="form cdrow">
      <div class="grid4 cdgrid">
        <label>Modalidade<input id="cd-mod-${i}" list="cd-mods" data-cd="mod" data-i="${i}" value="${esc(c.mod)}" placeholder="Ex.: Esteira inclinada"></label>
        <label>Duração<input id="cd-dur-${i}" data-cd="dur" data-i="${i}" value="${esc(c.dur)}" placeholder="Ex.: 20 min"></label>
        <label>Intensidade<input id="cd-int-${i}" data-cd="int" data-i="${i}" value="${esc(c.int)}" placeholder="Ex.: moderada, FC 130–140"></label>
        <label>Quando<select id="cd-when-${i}" data-cd="when" data-i="${i}">${Object.entries(WHEN).map(([k, l]) => `<option value="${k}" ${c.when === k ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
      </div>
      <label>Observação<input id="cd-obs-${i}" data-cd="obs" data-i="${i}" value="${esc(c.obs)}" placeholder="Ex.: inclinação 8%, velocidade 5,5 km/h"></label>
      <div class="tools"><button type="button" class="icon danger" data-act="cd-del" data-i="${i}">Remover cardio</button></div>
    </div>`).join('')}
    <div class="tools"><button type="button" class="icon" data-act="cd-add">${ICON_PLUS}${cs.length ? 'Outro cardio neste dia' : 'Adicionar cardio neste dia'}</button></div>
    <datalist id="cd-mods">${CD_MODS.map(m => `<option value="${m}"></option>`).join('')}</datalist>
  </section>`;
}

/* ---------- primeiro acesso do aluno ---------- */
function onboardHTML(st){
  if (state.mode !== 'aluno' || state.done || (db.onboarded && db.onboarded[st.id])) return '';
  const k = state.obStep;
  const steps = [
    {t: 'Marque cada série', p: 'Preencha a carga e as repetições e toque no ✓. Se for repetir o treino anterior, toque direto no ✓: os valores da última vez entram sozinhos.',
     m: `<div class="obmock"><div class="set done"><span class="sn">${dot('trab')}1</span><div class="parts"><div class="part"><span class="target">10 a 12</span><span class="fld"><input value="40" readonly tabindex="-1" aria-hidden="true"><span>kg</span></span><span class="fld"><input value="12" readonly tabindex="-1" aria-hidden="true"><span>reps</span></span></div></div><span class="chk">${ICON_CHECK}</span></div></div>`},
    {t: 'O descanso é automático', p: 'Ao marcar a série, o cronômetro de descanso começa sozinho na parte de baixo da tela. Precisa de mais um pouco? Toque em +15s.',
     m: `<div class="obmock obtimer"><div class="obbar"><i></i></div><div class="obt"><span><small>DESCANSO</small><b>1:24</b></span><span class="obbtn">+15s</span></div></div>`},
    {t: 'Aparelho ocupado? Dor ou dúvida?', p: 'Quando o personal cadastrar uma alternativa, aparece um botão para trocar o exercício na hora. Sentiu incômodo ou ficou com dúvida? Escreva na observação do exercício: ela chega direto pro personal.',
     m: `<div class="obmock"><span class="swapbtn">${ICON_SWAP}Aparelho ocupado? Trocar por Afundo com halteres</span></div>`}
  ];
  const sp = steps[k];
  return `<div class="obov" role="dialog" aria-modal="true" aria-label="Como usar o app"><div class="obcard">
    <p class="eyebrow">Bem-vindo(a) ao app · ${k + 1} de ${steps.length}</p><h2 class="obh">${sp.t}</h2>${sp.m}<p class="obp">${sp.p}</p>
    <div class="obnav"><button type="button" class="linkbtn" data-act="ob-skip">Pular</button><span class="obdots">${steps.map((_, i) => `<i class="${i === k ? 'on' : ''}"></i>`).join('')}</span>
      <button type="button" class="btn sm" data-act="${k < steps.length - 1 ? 'ob-next' : 'ob-skip'}">${k < steps.length - 1 ? 'Próximo' : 'Começar treino'}</button></div>
  </div></div>`;
}

/* ---------- feed de atividade (personal) ---------- */
function allLogs(){ const out = []; db.students.forEach(st => st.logs.forEach(l => out.push({st, l}))); return out.sort((a, b) => a.l.date < b.l.date ? 1 : -1); }
const isSeen = l => !!(db.seen && db.seen[l.id]);
function unreadCount(){ return allLogs().filter(x => !isSeen(x.l)).length; }
function whenTxt(iso){
  const d = new Date(iso), t0 = new Date(); t0.setHours(0, 0, 0, 0); const d0 = new Date(d); d0.setHours(0, 0, 0, 0);
  const days = Math.round((t0 - d0) / 864e5), hm = d.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
  return days === 0 ? 'hoje, ' + hm : days === 1 ? 'ontem, ' + hm : dateBR(iso);
}
function logStats(l){
  let sets = 0, vol = 0;
  l.entries.forEach(e => e.sets.forEach(x => { if (!x.done) return; sets++; if ((x.type || 'trab') !== 'trab') return; x.parts.forEach((p, pi) => { if (e.meas && e.meas[pi] === 'tempo') return; const kg = numKg(p.kg), r = parseInt(p.reps) || 0; if (kg && r) vol += kg * r; }); }));
  return {sets, vol: Math.round(vol)};
}
function feedView(){
  const f = state.feedF, items = allLogs().filter(x => f === 'obs' ? x.l.entries.some(e => e.comment) : f === 'naolidos' ? !isSeen(x.l) : true);
  const shown = items.slice(0, state.feedN), un = unreadCount();
  return `<main class="wrap">
    <div class="sectionhead"><div><p class="eyebrow">Painel do personal</p><h2>Atividade dos alunos</h2></div><span class="muted small">${un ? un + (un === 1 ? ' treino não lido' : ' treinos não lidos') : 'Tudo lido'}</span></div>
    <div class="seg" role="group" aria-label="Filtro"><button type="button" data-act="feedf" data-v="todos" aria-pressed="${f === 'todos'}">Todos</button><button type="button" data-act="feedf" data-v="naolidos" aria-pressed="${f === 'naolidos'}">Não lidos${un ? ' (' + un + ')' : ''}</button><button type="button" data-act="feedf" data-v="obs" aria-pressed="${f === 'obs'}">Com observação</button></div>
    ${un ? '<div class="row" style="justify-content:flex-end"><button type="button" class="linkbtn" data-act="feed-allread">Marcar tudo como lido</button></div>' : ''}
    <div class="fgrid">${shown.length ? shown.map(({st, l}) => feedItem(st, l)).join('') : `<div class="empty">${f === 'naolidos' ? 'Nenhum treino novo. Tudo em dia!' : f === 'obs' ? 'Nenhum treino com observação.' : 'Os treinos que os alunos finalizarem aparecem aqui.'}</div>`}</div>
    ${items.length > shown.length ? '<button class="btn block quiet" type="button" data-act="feed-more">Ver mais</button>' : ''}
  </main>`;
}
function feedItem(st, l){
  const seen = isSeen(l), sx = logStats(l), prMap = prHistory(st).prs[l.id] || [], byLib = {};
  prMap.forEach(p => { if (beats(p, byLib[p.libId])) byLib[p.libId] = p; });
  const prs = Object.values(byLib), cmts = l.entries.filter(e => e.comment);
  return `<article class="fitem ${seen ? '' : 'unread'}">
    <div class="fhead"><span class="fav" aria-hidden="true">${esc(st.name.trim().charAt(0).toUpperCase())}</span>
      <div class="fwho"><b>${esc(st.name)}</b><span>${esc(whenTxt(l.date))}${l.protocol ? ' · ' + esc(l.protocol) : ''}${l.sample ? ' · exemplo' : ''}</span></div>
      ${seen ? '' : '<span class="fdot" title="Não lido"></span>'}</div>
    <p class="ftitle"><b>${esc(l.title || 'Treino')}</b> · ${sx.sets} ${sx.sets === 1 ? 'série' : 'séries'}${sx.vol ? ' · ' + sx.vol.toLocaleString('pt-BR') + ' kg' : ''}</p>
    ${prs.length ? `<div class="fprs">${prs.map(p => `<span class="mpill gold">${ICON_TROPHY}${esc(lib(p.libId).name)}: ${esc(markTxt(p))}</span>`).join('')}</div>` : ''}
    ${cmts.map(e => `<div class="cmt"><b>${esc(e.items.map(i => lib(i).name).join(' + '))}</b>${esc(e.comment)}</div>`).join('')}
    <div class="row"><button type="button" class="btn sm quiet" data-act="feed-open" data-v="${st.id}" data-log="${l.id}">Ver treino completo</button><button type="button" class="linkbtn" data-act="feed-seen" data-v="${l.id}">${seen ? 'Marcar como não lido' : 'Marcar como lido'}</button></div>
  </article>`;
}

/* ---------- copiar treino ---------- */
function cloneDay(d){ return {title: d.title, cardio: JSON.parse(JSON.stringify(d.cardio || [])), ex: d.ex.map(e => Object.assign(JSON.parse(JSON.stringify(e)), {id: uid()}))}; }
function cloneDays(days){ const o = {}; DAYS.forEach(x => o[x.k] = cloneDay(days[x.k] || {title:'', ex:[]})); return o; }
function copyPanel(s){
  const c = state.copy; if (!c) return '';
  const tgt = db.students.find(x => x.id === c.sid);
  const dName = isSeq(s) ? slotFull(s, state.editDay) : slotFull(s, state.editDay).toLowerCase(), src = s.days[state.editDay];
  let warn = '', ok = !!tgt;
  if (c.mode === 'day'){
    if (!c.day) ok = false;
    else if (tgt){ const td = tgt.days[c.day], same = tgt.id === s.id && c.day === state.editDay;
      if (same){ ok = false; warn = 'Escolha um dia diferente do atual.'; }
      else warn = td && td.ex.length ? `O ${isSeq(tgt) ? slotFull(tgt, c.day) : 'treino de ' + slotFull(tgt, c.day).toLowerCase()} de ${tgt.name.split(' ')[0]} (${td.title || 'sem nome'}, ${td.ex.length} exercícios) será substituído.` : (td && td.title ? `${slotFull(tgt, c.day)} (${td.title}) não tem exercícios e passa a ter este treino.` : 'Esse dia está vazio, nada será substituído.'); }
  } else if (tgt) warn = `A ficha atual de ${tgt.name.split(' ')[0]} será substituída pela de ${s.name.split(' ')[0]}. O histórico de cargas dela continua salvo.`;
  const opts = db.students.filter(x => c.mode === 'day' || x.id !== s.id).map(x => `<option value="${x.id}" ${x.id === c.sid ? 'selected' : ''}>${esc(x.name)}${x.id === s.id ? ' (este aluno)' : ''}</option>`).join('');
  return `<div class="copyp">
    <b>${c.mode === 'day' ? `Copiar ${isSeq(s) ? 'o ' + dName : 'o treino de ' + dName} (${esc(src.title || 'sem nome')}) para:` : `Copiar a ficha inteira de ${esc(s.name)} para:`}</b>
    <label class="cpl">Aluno<select id="cp-st" data-change="cpst">${c.mode === 'all' ? '<option value="">Escolha o aluno</option>' : ''}${opts}</select></label>
    ${c.mode === 'day' ? `<div class="cpl">Dia<nav class="week">${DAYS.map(x => `<button type="button" data-act="cp-day" data-v="${x.k}" aria-pressed="${x.k === c.day}" ${tgt && tgt.id === s.id && x.k === state.editDay ? 'disabled' : ''}><span class="d">${slotShort(tgt || s, x.k)}</span><span class="t">${esc(shortTitle(tgt && tgt.days[x.k] && tgt.days[x.k].title))}</span></button>`).join('')}</nav></div>` : ''}
    ${warn ? `<p class="cpw">${esc(warn)}</p>` : ''}
    <div class="row"><button class="btn sm" type="button" data-act="copy-do" ${ok ? '' : 'disabled'}>Copiar</button><button class="btn sm quiet" type="button" data-act="copy-cancel">Cancelar</button></div>
  </div>`;
}

/* ---------- volume semanal (só personal) ---------- */
function weekVolume(s){
  const dir = {}, ind = {};
  Object.values(s.days).forEach(d => d.ex.forEach(ex => { const n = (ex.series || []).filter(x => x.type === 'trab').length;
    ex.items.forEach(id => { const l = lib(id); l.primary.forEach(m => dir[m] = (dir[m] || 0) + n); l.secondary.forEach(m => ind[m] = (ind[m] || 0) + n); }); }));
  return {dir, ind};
}
function volumeCard(s){
  const {dir, ind} = weekVolume(s);
  const rows = MUSCLES.map(([k, n]) => ({n, d: dir[k] || 0})).filter(r => r.d).sort((a, b) => b.d - a.d);
  const none = MUSCLES.filter(([k]) => !dir[k]).map(([, n]) => n);
  const max = Math.max(1, ...rows.map(r => r.d));
  const top3 = rows.slice(0, 3).map(r => `${r.n} ${r.d}`).join(' · ');
  return `<details class="card volc" id="volc" ${state.volOpen ? 'open' : ''}><summary><span class="vsum"><b>Volume semanal por músculo</b><small>${esc(top3 || 'Sem séries de trabalho ainda')}</small></span></summary>
    <div class="vbars">${rows.map(r => `<div class="vrow"><span class="vn">${r.n}</span><span class="vb"><i style="width:${(r.d / max * 100).toFixed(1)}%"></i></span><span class="vv"><b>${r.d}</b> <small>séries</small></span></div>`).join('')}</div>
    ${none.length ? `<p class="small muted">Sem volume: ${esc(none.join(', '))}</p>` : ''}
    <p class="hint">Conta só os músculos principais (agonistas) de cada exercício, nas séries de trabalho da semana. Aquecimento e preparatória não contam. Só você vê este quadro.</p></details>`;
}

/* ---------- importar ficha em PDF ---------- */
let impFile = null, impCtl = null, pdfjsP = null;
function loadPdfJs(){
  if (pdfjsP) return pdfjsP;
  const base = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
  const add = src => new Promise((res, rej) => { const el = document.createElement('script'); el.src = src; el.onload = res; el.onerror = () => rej(new Error('load ' + src)); document.head.appendChild(el); });
  pdfjsP = add(base + 'pdf.worker.min.js').then(() => add(base + 'pdf.min.js')).then(() => { if (!window.pdfjsLib) throw new Error('pdfjs'); return window.pdfjsLib; })
    .catch(e => { pdfjsP = null; throw e; });
  return pdfjsP;
}
async function pdfText(file){
  const lib = await loadPdfJs();
  const doc = await lib.getDocument({data: new Uint8Array(await file.arrayBuffer()), isEvalSupported: false, disableFontFace: true}).promise;
  const pages = [];
  for (let p = 1; p <= doc.numPages; p++){
    const tc = await (await doc.getPage(p)).getTextContent();
    const rows = [];
    tc.items.forEach(it => { if (!it.str || !it.str.trim()) return; const x = it.transform[4], y = it.transform[5];
      let r = rows.find(r => Math.abs(r.y - y) < 3); if (!r){ r = {y, items: []}; rows.push(r); } r.items.push({x, w: it.width || 0, s: it.str}); });
    rows.sort((a, b) => b.y - a.y);
    const lines = rows.map(r => { r.items.sort((a, b) => a.x - b.x); let line = '', end = null;
      r.items.forEach(i => { if (end !== null){ const gap = i.x - end; line += gap > 18 ? '  |  ' : (gap > 1.5 ? ' ' : ''); } line += i.s; end = i.x + i.w; });
      return line.replace(/\s+/g, ' ').trim(); }).filter(Boolean);
    pages.push(`--- Página ${p} ---\n` + lines.join('\n'));
  }
  return pages.join('\n\n');
}
function buildImportPrompt(text){
  return `Você converte fichas de treino de musculação (texto extraído de um PDF, as colunas de tabelas aparecem separadas por "|") em JSON para um app de personal trainer.
Responda SOMENTE com um objeto JSON neste formato:
{"aluno":"nome do aluno ou vazio","protocolo":"ex.: Protocolo 11 (ou vazio)","foco":"objetivo/foco do treino ou vazio","cardio":"orientações de cardio ou vazio",
 "organizacao":"dias|sequencia","dias":{"seg":{"titulo":"nome do treino do dia","exercicios":[EX],"cardios":[CARDIO]},"ter":{...},"qua":{...},"qui":{...},"sex":{...},"sab":{...},"dom":{...}}}
EX = {"itens":[{"nome":"nome do exercício como está no PDF","lib":"id da biblioteca ou null","medida":"reps|tempo","musculos":{"principais":[],"auxiliares":[]}}],"metodo":"id do método","series":[{"tipo":"aq|prep|trab","reps":"10 a 12"}],"intervalo":"2:00 a 2:30","obs":"instrução de execução do exercício"}
CARDIO = {"modalidade":"ex.: Esteira inclinada","duracao":"ex.: 20 min","intensidade":"ex.: moderada","quando":"antes|depois|separado|livre","obs":""}
Regras:
- Cardio prescrito para um dia vai em "cardios" daquele dia (pode haver mais de um). O "cardio" do topo é só a orientação geral de cardio, em texto.
- Use exatamente as chaves seg, ter, qua, qui, sex, sab, dom. Dia de descanso ou só cardio: "exercicios":[] com o título que aparece (ex.: "Descanso"). Dia sem nada na ficha: título vazio.
- Se a ficha usar treinos A/B/C (sem dias da semana), use "organizacao":"sequencia" e coloque A em seg, B em ter e assim por diante. Com dias da semana, "organizacao":"dias".
- Séries: uma entrada por série, na ordem de execução. "3 séries de 10 a 12" vira 3 entradas tipo "trab" com reps "10 a 12". "1x 10 a 12 / 2x 8 a 10" vira 1 entrada "10 a 12" e 2 entradas "8 a 10". Uma série de aquecimento (ex.: "realizar 1 série de aquecimento com 12 reps") vira uma entrada tipo "aq" no início, com as reps indicadas. Série preparatória ou de reconhecimento de carga vira "prep".
- Exercício medido por tempo (prancha, isometria, "30 seg", "40s"): "medida":"tempo" e, nas séries, "reps" só com os segundos (ex.: "30 a 45"). Nos demais, "medida":"reps".
- Conjugados (bi-set, ou dois exercícios unidos por "+"): um único exercício com 2 itens, metodo "conjugado" e reps de cada série no formato "12 a 15 + 12 a 15".
- metodo: use um destes ids: ${db.methods.map(m => m.id + ' (' + m.name + ')').join(', ')}. Na dúvida, "normal".
- lib: o id da biblioteca abaixo que seja o MESMO exercício (mesmo movimento e equipamento). Se nenhum for o mesmo, use null e preencha "musculos" usando só estas chaves: ${MUSCLES.map(m => m[0]).join(', ')}.
- intervalo: o descanso indicado, no formato do PDF. obs: só a instrução de execução daquele exercício, sem repetir séries e repetições.
- Ignore textos gerais: boas-vindas, regras da consultoria, orientações gerais, assinatura e registro profissional.
Biblioteca (id: nome):
${db.library.map(l => l.id + ': ' + l.name).join('\n')}

Texto do PDF (entre <<< e >>>):
<<<
${text}
>>>`;
}
const STOP = new Set(['com', 'de', 'da', 'do', 'das', 'dos', 'na', 'no', 'em', 'e', 'a', 'o', 'para', 'p']);
const toks = n => new Set(norm(n).replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(t => t && !STOP.has(t)));
function fuzzyLib(name){
  const a = toks(name); let best = null, bs = 0;
  db.library.forEach(l => { const b = toks(l.name); let inter = 0; a.forEach(t => { if (b.has(t)) inter++; }); const sc = inter / (a.size + b.size - inter || 1); if (sc > bs){ bs = sc; best = l.id; } });
  return bs >= 0.75 ? best : null;
}
const str = v => typeof v === 'string' ? v.trim() : (v == null ? '' : String(v));
function normalizeImport(raw){
  raw = raw && typeof raw === 'object' ? raw : {};
  const out = {aluno: str(raw.aluno), protocolo: str(raw.protocolo), foco: str(raw.foco), cardio: str(raw.cardio), org: raw.organizacao === 'sequencia' ? 'seq' : 'fixo', dias: {}};
  DAYS.forEach(x => { const d = (raw.dias || {})[x.k] || {};
    out.dias[x.k] = {titulo: str(d.titulo), exercicios: (Array.isArray(d.exercicios) ? d.exercicios : []).map(ex => {
      ex = ex || {};
      const itens = (Array.isArray(ex.itens) ? ex.itens : []).filter(i => i && str(i.nome)).map(i => {
        const lid = db.library.some(l => l.id === i.lib) ? i.lib : null, mus = i.musculos || {};
        return {nome: str(i.nome), meas: i.medida === 'tempo' ? 'tempo' : 'reps', choice: lid || fuzzyLib(i.nome) || '__new',
          prim: (Array.isArray(mus.principais) ? mus.principais : []).filter(k => MNAME[k]), sec: (Array.isArray(mus.auxiliares) ? mus.auxiliares : []).filter(k => MNAME[k])}; });
      if (!itens.length) return null;
      let series = (Array.isArray(ex.series) ? ex.series : []).map(sr => ({type: ['aq', 'prep', 'trab'].includes(sr && sr.tipo) ? sr.tipo : 'trab', reps: str(sr && sr.reps) || '10 a 12'}));
      if (!series.length) series = [1, 2, 3].map(() => ({type: 'trab', reps: '10 a 12'}));
      let metodo = db.methods.some(m => m.id === ex.metodo) ? ex.metodo : 'normal';
      if (itens.length > 1 && metodo === 'normal') metodo = 'conjugado';
      return {itens, metodo, series, intervalo: str(ex.intervalo) || '1:30 a 2:00', obs: str(ex.obs)};
    }).filter(Boolean), cardios: (Array.isArray(d.cardios) ? d.cardios : []).map(c => ({mod: str(c && c.modalidade), dur: str(c && c.duracao), int: str(c && c.intensidade), when: ['antes', 'depois', 'separado', 'livre'].includes(c && c.quando) ? c.quando : 'livre', obs: str(c && c.obs)})).filter(c => c.mod || c.dur || c.obs)}; });
  return out;
}
function importErr(e){
  const c = e && e.code;
  if (c === 'not_granted' || c === 'sampling_disabled') return 'O uso do Claude não foi permitido neste app, então não dá pra ler o PDF com IA. Você pode permitir no aviso que aparece ao tentar de novo.';
  if (c === 'rate_limited') return 'Muitas leituras seguidas ou limite de uso atingido. Espere um pouco e tente de novo.';
  if (c === 'invalid_json' || c === 'empty_completion') return 'O Claude respondeu, mas não consegui montar a ficha com a resposta. Tente de novo.';
  if (c === 'prompt_too_large') return 'Esse PDF tem texto demais para ler de uma vez. Tente enviar só as páginas da ficha.';
  if (c === 'session_expired') return 'Sua sessão no Claude expirou. Entre de novo e tente outra vez.';
  return 'Algo deu errado na leitura. Tente de novo em instantes.';
}
async function runImport(){
  const im = state.imp; if (!im || !impFile) return;
  im.fileName = impFile.name; im.stage = 'reading'; render(); top();
  let text = '';
  try { text = await pdfText(impFile); }
  catch(e){ im.stage = 'error'; im.err = 'Não consegui abrir esse arquivo. Confira se é o PDF da ficha e tente de novo.'; render(); return; }
  if (text.replace(/---.*?---|[\s|]/g, '').length < 60){ im.stage = 'error'; im.err = 'Esse PDF parece ser uma imagem (foto ou escaneado), sem texto para ler. Exporte a ficha do Canva como PDF normal e tente de novo.'; render(); return; }
  let sample = null;
  try { sample = window.claude && window.claude.use ? await window.claude.use('sample') : null; } catch(e){ sample = null; }
  if (!sample){ im.stage = 'error'; im.err = 'A leitura com IA só funciona com o app aberto dentro do Claude.'; render(); return; }
  if (state.imp !== im) return;
  im.stage = 'thinking'; render();
  impCtl = new AbortController();
  try {
    const raw = await sample.json(buildImportPrompt(text.slice(0, 150000)), {signal: impCtl.signal});
    if (state.imp !== im) return;
    im.data = normalizeImport(raw);
    const n = DAYS.reduce((a, x) => a + im.data.dias[x.k].exercicios.length + im.data.dias[x.k].cardios.length, 0);
    if (!n){ im.stage = 'error'; im.err = 'Não encontrei exercícios nesse PDF. Confira se é o arquivo da ficha.'; render(); return; }
    im.stage = 'review'; render(); top();
  } catch(e){
    if (state.imp !== im) return;
    if (e && e.code === 'cancelled'){ im.stage = 'pick'; render(); return; }
    im.stage = 'error'; im.err = importErr(e); render();
  }
}
function seriesSummary(ex){
  const g = []; ex.series.forEach(x => { const last = g[g.length - 1]; if (last && last.type === x.type && last.r === x.reps) last.n++; else g.push({type: x.type, n: 1, r: x.reps}); });
  return g.map(x => `<span class="rg">${dot(x.type)}${x.n}× ${esc(x.r)}</span>`).join('');
}
function importView(){
  const im = state.imp, L = k => String.fromCharCode(65 + k);
  const back = '<button class="back" type="button" data-act="imp-cancel">← Voltar</button>';
  const head = '<div class="sectionhead"><div><p class="eyebrow">Importar ficha</p><h2>Do PDF para o app</h2></div></div>';
  if (im.stage === 'pick') return `<main class="wrap v-narrow">${back}${head}
    <p class="note">Envie a ficha em PDF, como as que você faz no Canva. O Claude lê o arquivo, monta os dias, exercícios, séries e métodos e liga cada exercício à sua biblioteca. Você confere tudo antes de salvar.</p>
    <section class="card form">
      <label>Arquivo PDF<input id="imp-file" type="file" accept="application/pdf,.pdf"></label>
      ${impFile ? `<span class="small muted">Selecionado: ${esc(impFile.name)}</span>` : ''}
      <label>Importar para<select id="imp-target" data-change="imptarget"><option value="new" ${im.target === 'new' ? 'selected' : ''}>Novo aluno (nome vem do PDF)</option>${db.students.map(x => `<option value="${x.id}" ${im.target === x.id ? 'selected' : ''}>${esc(x.name)} (substitui a ficha atual)</option>`).join('')}</select></label>
      <button class="btn" type="button" data-act="imp-go" ${impFile ? '' : 'disabled'}>Ler PDF e montar ficha</button>
    </section></main>`;
  if (im.stage === 'reading' || im.stage === 'thinking') return `<main class="wrap v-narrow">${head}
    <section class="card impwait"><span class="spin" aria-hidden="true"></span><b>${im.stage === 'reading' ? 'Lendo o PDF…' : 'O Claude está montando a ficha…'}</b>
      <p class="small muted">${im.stage === 'thinking' ? 'Costuma levar de 30 segundos a 2 minutos. Se aparecer um pedido de permissão para usar o Claude, é só permitir.' : esc(im.fileName || '')}</p>
      ${im.stage === 'thinking' ? '<button class="btn sm quiet" type="button" data-act="imp-stop">Parar</button>' : ''}</section></main>`;
  if (im.stage === 'error') return `<main class="wrap v-narrow">${back}${head}<section class="card"><b>Não deu certo</b><p class="small" style="margin-top:6px">${esc(im.err)}</p>
    <div class="row" style="margin-top:12px"><button class="btn sm" type="button" data-act="imp-retry">Tentar de novo</button><button class="btn sm quiet" type="button" data-act="imp-cancel">Voltar</button></div></section></main>`;
  const d = im.data, tgt = db.students.find(x => x.id === im.target);
  let nEx = 0, nNew = 0, nDays = 0;
  DAYS.forEach(x => { const ex = d.dias[x.k].exercicios; if (ex.length) nDays++; nEx += ex.length; ex.forEach(e => e.itens.forEach(i => { if (i.choice === '__new') nNew++; })); });
  const libOpts = it => `<option value="__new" ${it.choice === '__new' ? 'selected' : ''}>+ Criar novo: ${esc(it.nome)}</option>` + db.library.slice().sort((a, b) => a.name.localeCompare(b.name, 'pt')).map(l => `<option value="${l.id}" ${it.choice === l.id ? 'selected' : ''}>${esc(l.name)}</option>`).join('');
  return `<main class="wrap v-narrow">${back}
    <div class="sectionhead"><div><p class="eyebrow">Confira antes de salvar</p><h2>Ficha importada</h2></div><span class="muted small">${esc(im.fileName || '')}</span></div>
    <p class="note">Confira principalmente o campo abaixo de cada nome: é o exercício da sua biblioteca ligado ao que está no PDF. Exercícios marcados como "Criar novo" entram na biblioteca com os músculos sugeridos. Depois de importar, tudo pode ser editado na ficha.</p>
    <section class="card form">
      ${tgt ? `<p class="small"><b>Destino:</b> ${esc(tgt.name)}. A ficha atual será substituída; o histórico de cargas continua salvo.</p>` : `<label>Nome do aluno<input id="imp-aluno" data-imp="aluno" value="${esc(d.aluno)}" placeholder="Nome do aluno"></label>`}
      <div class="grid4" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))"><label>Protocolo<input id="imp-proto" data-imp="protocolo" value="${esc(d.protocolo)}"></label><label>Foco<input id="imp-foco" data-imp="foco" value="${esc(d.foco)}"></label></div>
      <label>Orientações de cardio<input id="imp-cardio" data-imp="cardio" value="${esc(d.cardio)}"></label>
    </section>
    <p class="impsum"><b>${nDays}</b> dias com treino · <b>${nEx}</b> exercícios · <b>${nNew}</b> ${nNew === 1 ? 'novo' : 'novos'} na biblioteca</p>
    ${DAYS.map(x => { const day = d.dias[x.k]; return `<section class="card impday">
      <div class="impdh"><span class="chip"><b>${x.l}</b></span><input id="imp-dt-${x.k}" data-impday="${x.k}" value="${esc(day.titulo)}" placeholder="Título do dia (ou vazio)" aria-label="Título de ${x.f}"></div>
      ${(day.cardios || []).length ? `<p class="impcd">${ICON_HEART}<span>Cardio: ${esc(day.cardios.map(cardioTxt).join(' · '))}</span></p>` : ''}
      ${day.exercicios.length ? day.exercicios.map((ex, ei) => `<div class="impex"><span class="num">${ei + 1}</span><div class="impb ${ex.itens.length > 1 ? 'conjgrp' : ''}">
          ${ex.itens.map((it, ii) => `<div class="impit"><span class="pdfn">${ex.itens.length > 1 ? `<span class="ab">${L(ii)}</span>` : ''}${esc(it.nome)}</span>
            <select id="imp-l-${x.k}-${ei}-${ii}" data-implib="${x.k}|${ei}|${ii}" class="${it.choice === '__new' ? 'isnew' : ''}" aria-label="Exercício da biblioteca para ${esc(it.nome)}">${libOpts(it)}</select></div>`).join('')}
          <div class="impmeta">${methPill(ex.metodo)}<span class="rgs">${seriesSummary(ex)}</span><span class="sx">desc. ${esc(ex.intervalo)}</span></div></div>
        <button class="icon" type="button" data-act="imp-del" data-v="${x.k}|${ei}" aria-label="Remover exercício">✕</button></div>`).join('') : '<p class="small muted">Sem exercícios (descanso ou cardio).</p>'}
    </section>`; }).join('')}
    <div class="row"><button class="btn" type="button" data-act="imp-save">Importar ficha</button><button class="btn quiet" type="button" data-act="imp-cancel">Cancelar</button></div>
  </main>`;
}
function saveImport(){
  const im = state.imp, d = im.data, created = {}; let nNew = 0, nEx = 0;
  const days = {};
  DAYS.forEach(x => { const dd = d.dias[x.k];
    days[x.k] = {title: dd.titulo, cardio: (dd.cardios || []).map(c => Object.assign({}, c)), ex: dd.exercicios.map(ex => { nEx++;
      const items = ex.itens.map(it => {
        if (it.choice !== '__new' && db.library.some(l => l.id === it.choice)) return it.choice;
        const key = norm(it.nome); if (created[key]) return created[key];
        const l = newLibItem(it.nome); l.primary = it.prim.slice(); l.secondary = it.sec.filter(k => !it.prim.includes(k)); l.instructions = ex.obs; nNew++;
        created[key] = l.id; return l.id; });
      return {id: uid(), items, method: ex.metodo, meas: ex.itens.map(it => it.meas || 'reps'), series: ex.series.map(x2 => ({type: x2.type, reps: x2.reps})), rest: ex.intervalo, notes: '', alt: []}; })}; });
  let st = db.students.find(x => x.id === im.target);
  if (st){ st.days = days; st.schedule = d.org; if (d.protocolo) st.protocol = d.protocolo; if (d.foco) st.focus = d.foco; if (d.cardio) st.cardio = d.cardio; }
  else { st = {id: uid(), name: d.aluno || 'Aluno importado', protocol: d.protocolo || 'Protocolo 1', focus: d.foco, cardio: d.cardio, privNotes: '', schedule: d.org, days, logs: [], last: null}; db.students.push(st); }
  state.sid = st.id; state.pview = 'edit'; state.editDay = (DAYS.find(x => days[x.k].ex.length) || DAYS[0]).k; state.imp = null; impFile = null; state.copy = null;
  save(); render(); top();
  toast(`Ficha importada: ${nEx} exercícios${nNew ? `, ${nNew} ${nNew === 1 ? 'novo' : 'novos'} na biblioteca` : ''}. Confira e ajuste o que precisar.`);
}

/* ---------- histórico de cargas / referência ---------- */
function refFor(st, libId){
  const logs = st.logs.slice().sort((a, b) => a.date < b.date ? 1 : -1);
  for (const l of logs) for (const e of l.entries){ const pi = e.items.indexOf(libId);
    if (pi > -1 && e.sets.some(x => x.parts[pi] && (x.parts[pi].kg || x.parts[pi].reps))) return {log: l, entry: e, pi}; }
  return null;
}
function typeOrd(ex, si){ const t = stypeOf(ex, si); let n = 0; for (let i = 0; i < si; i++) if (stypeOf(ex, i) === t) n++; return n; }
function refPart(ref, type, ord){
  if (!ref) return null;
  const same = ref.entry.sets.filter(x => (x.type || 'trab') === type);
  const x = same[ord] || same[same.length - 1]; return x ? x.parts[ref.pi] : null;
}
function workKg(ref){ return ref.entry.sets.filter(x => (x.type || 'trab') === 'trab').map(x => x.parts[ref.pi] && numKg(x.parts[ref.pi].kg)).filter(Boolean); }
function refLine(st, refs, conj){
  const ok = refs.filter(Boolean); if (!ok.length) return '';
  const txt = refs.map((r, k) => { if (!r) return ''; const w = workKg(r);
    const tm = r.entry.meas && r.entry.meas[r.pi] === 'tempo', rr = r.entry.sets.filter(x => (x.type || 'trab') === 'trab').map(x => x.parts[r.pi] && x.parts[r.pi].reps).filter(Boolean);
    if (tm && !w.length) return (conj ? String.fromCharCode(65 + k) + ': ' : '') + (rr.length ? rr.join(' · ') + ' s' : '—');
    return (conj ? String.fromCharCode(65 + k) + ': ' : '') + (w.length ? w.map(fmtKg).join(' · ') + ' kg' : '—'); }).filter(Boolean).join(' | ');
  const r0 = ok[0], other = r0.log.protocol && st.protocol && r0.log.protocol !== st.protocol;
  return `<span class="last ${other ? 'ref' : ''}">${other ? 'Referência' : 'Último treino'}: ${esc(txt)} <small>(${ddmm(r0.log.date)}${other ? ' · ' + esc(r0.log.protocol) : ''})</small></span>`;
}
function editRef(id){
  const st = stu(); if (!st) return ''; const r = refFor(st, id); if (!r) return '<span class="refline none">Nunca fez este exercício</span>';
  const w = workKg(r), reps = r.entry.sets.filter(x => (x.type || 'trab') === 'trab').map(x => x.parts[r.pi] && x.parts[r.pi].reps).filter(Boolean);
  return `<span class="refline">Última vez: ${w.length ? w.map(fmtKg).join(' · ') + ' kg' : '—'}${reps.length ? ' × ' + esc(reps[0]) + (r.entry.meas && r.entry.meas[r.pi] === 'tempo' ? ' s' : '') : ''} · ${ddmm(r.log.date)}${r.log.protocol ? ' · ' + esc(r.log.protocol) : ''}</span>`;
}
function pickRef(id){
  if (state.mode !== 'personal') return ''; const st = stu(); if (!st) return ''; const r = refFor(st, id); if (!r) return '';
  const w = workKg(r); return w.length ? ` · já fez: ${esc(fmtKg(Math.max(...w)))} kg em ${ddmm(r.log.date)}` : '';
}
function loadIndex(s){
  const map = new Map();
  s.logs.forEach(l => l.entries.forEach(e => e.items.forEach(id => {
    const r = map.get(id) || {id, n: 0, last: null, protos: new Set()};
    r.n++; if (!r.last || l.date > r.last) r.last = l.date; if (l.protocol) r.protos.add(l.protocol); map.set(id, r); })));
  return map;
}
function loadsView(s){
  const map = loadIndex(s);
  if (!map.size) return `<div class="empty">Quando ${esc(s.name.split(' ')[0])} registrar cargas, o histórico de cada exercício fica salvo aqui, inclusive dos protocolos antigos.</div>`;
  const cur = new Set(); Object.values(s.days).forEach(d => d.ex.forEach(e => e.items.forEach(i => cur.add(i))));
  if (state.loadLib && map.has(state.loadLib)) return loadDetail(s, state.loadLib, cur);
  const best = prHistory(s).best;
  const rows = [...map.values()].sort((a, b) => a.last < b.last ? 1 : -1);
  return `<p class="note">Todo registro de carga fica salvo por exercício, mesmo depois de trocar a ficha. Quando um exercício volta para o treino, a última carga aparece como referência para o aluno e para você.</p>
    <input id="load-q" class="search" placeholder="Buscar exercício" autocomplete="off">
    <div class="loadlist" id="load-list">${rows.map(r => { const b = best[r.id];
      return `<button type="button" class="loadrow" data-act="load-open" data-v="${r.id}" data-name="${esc(norm(lib(r.id).name))}">
        <span class="nm">${esc(lib(r.id).name)}${cur.has(r.id) ? '<span class="curtag">Na ficha</span>' : ''}<small>${r.n} ${r.n === 1 ? 'sessão' : 'sessões'} · último ${ddmm(r.last)} · ${esc([...r.protos].join(', ') || '—')}</small></span>
        <span class="vl">${b ? fmtKg(b.kg) + ' kg' : '—'}<small>recorde</small></span></button>`; }).join('')}</div>`;
}
function loadDetail(s, id, cur){
  const sess = [];
  s.logs.forEach(l => l.entries.forEach(e => { const pi = e.items.indexOf(id); if (pi > -1) sess.push({l, e, pi}); }));
  sess.sort((a, b) => a.l.date < b.l.date ? 1 : -1);
  const b = prHistory(s).best[id], r0 = sess[0], first = sess[sess.length - 1];
  const lastW = r0 ? workKg({entry: r0.e, pi: r0.pi}) : [];
  return `<button class="back" type="button" data-act="load-back">← Todos os exercícios</button>
    <section class="card evo-head">
      <div><p class="eyebrow">Histórico de cargas</p><h3 class="ldh">${esc(lib(id).name)}${cur.has(id) ? '<span class="curtag">Na ficha</span>' : ''}</h3></div>
      <div class="stats">
        <div class="stat"><span>Recorde</span><b>${b ? fmtKg(b.kg) + ' kg' : '—'}</b></div>
        <div class="stat"><span>Última</span><b>${lastW.length ? fmtKg(Math.max(...lastW)) + ' kg' : '—'}</b></div>
        <div class="stat"><span>Sessões</span><b>${sess.length}</b></div>
      </div>
      <p class="small muted">Primeiro registro em ${dateBR(first.l.date, {day:'2-digit', month:'2-digit', year:'numeric'})}. Bolinhas: ${dot('aq')} aquecimento ${dot('prep')} preparatória ${dot('trab')} trabalho.</p>
      <button type="button" class="icon" data-act="load-chart" data-v="${id}" style="align-self:flex-start">Ver gráfico de evolução</button>
    </section>
    <section class="card"><div class="tablewrap"><table class="ltable"><thead><tr><th>Data</th><th>Protocolo</th><th>Séries (kg × reps)</th></tr></thead><tbody>
      ${sess.map(({l, e, pi}) => `<tr><td>${dateBR(l.date, {day:'2-digit', month:'2-digit', year:'2-digit'})}</td><td>${esc(l.protocol || '—')}</td><td><div class="lsets">${e.sets.map(x => { const p = x.parts[pi] || {}; return `<span>${dot(x.type || 'trab')}${p.kg ? esc(fmtKg(numKg(p.kg))) : '–'} × ${esc(p.reps || '–')}${e.meas && e.meas[pi] === 'tempo' ? ' s' : ''}</span>`; }).join('')}</div>${e.comment ? `<div class="cmt" style="margin-top:6px"><b>Observação</b>${esc(e.comment)}</div>` : ''}</td></tr>`).join('')}
    </tbody></table></div></section>`;
}

/* ---------- frequência ---------- */
const DAY_MS = 864e5;
function weekStart(d){ const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - (x.getDay() + 6) % 7); return x; }
function dayKeyOf(d){ const x = new Date(d); return x.getFullYear() + '-' + (x.getMonth() + 1) + '-' + x.getDate(); }
function trainedDays(st){ const m = new Map(); st.logs.forEach(l => { const k = dayKeyOf(l.date); if (!m.has(k)) m.set(k, new Date(l.date)); }); return [...m.values()].sort((a, b) => a - b); }
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const isSeq = st => !!st && st.schedule === 'seq';
const slotIdx = k => DAYS.findIndex(x => x.k === k);
const slotShort = (st, k) => isSeq(st) ? LETTERS[slotIdx(k)] : DAYS[slotIdx(k)].l;
const slotFull = (st, k) => isSeq(st) ? 'Treino ' + LETTERS[slotIdx(k)] : DAYS[slotIdx(k)].f;
function seqSlots(st){ return DAYS.filter(x => { const d = st.days[x.k]; return d && (d.ex.length || cardioList(d).length); }).map(x => x.k); }
function nextSlot(st){
  const sl = seqSlots(st); if (!sl.length) return 'seg';
  const last = st.logs.slice().sort((a, b) => a.date < b.date ? 1 : -1).find(l => sl.includes(l.day));
  return last ? sl[(sl.indexOf(last.day) + 1) % sl.length] : sl[0];
}
function splitChips(st){
  const ks = isSeq(st) ? seqSlots(st) : DAYS.map(x => x.k);
  return `<div class="split">${ks.map(k => `<span class="chip"><b>${slotShort(st, k)}</b>${esc(shortTitle(st.days[k] && st.days[k].title))}</span>`).join('')}</div>`;
}
function plannedPerWeek(st){
  if (isSeq(st)) return Math.max(1, Math.min(7, parseInt(st.perWeek) || seqSlots(st).length || 1));
  return DAYS.filter(d => st.days[d.k] && st.days[d.k].ex.length).length;
}
function freqStats(st){
  const days = trainedDays(st), now = new Date();
  const ws = weekStart(now), ms = new Date(now.getFullYear(), now.getMonth(), 1), t90 = new Date(now - 90 * DAY_MS);
  const since = s => days.filter(d => d >= s).length;
  const inWeek = w => days.filter(d => d >= w && d < new Date(+w + 7 * DAY_MS)).length;
  const plan = plannedPerWeek(st), target = Math.max(1, Math.min(3, plan));
  let w = new Date(ws); if (inWeek(w) < target) w = new Date(+w - 7 * DAY_MS);
  let streak = 0; while (inWeek(w) >= target){ streak++; w = new Date(+w - 7 * DAY_MS); }
  const weeks90 = 90 / 7;
  return {days, week: since(ws), month: since(ms), m3: since(t90), all: days.length, first: days[0], plan, target, streak,
    avg3: since(t90) / weeks90, weekDays: DAYS.map((x, i) => { const d = new Date(+ws + i * DAY_MS); return {l: x.l, date: d, on: days.some(t => dayKeyOf(t) === dayKeyOf(d)), today: dayKeyOf(d) === dayKeyOf(now), future: d > now}; })};
}
function freqMsg(f){
  const n = f.week, p = f.plan, t = n === 1 ? 'treino' : 'treinos';
  if (!p) return {h: 'Sua ficha ainda está sendo montada.', s: 'Assim que o personal liberar, seus treinos aparecem aqui.'};
  if (n === 0) return {h: 'Nenhum treino ainda essa semana.', s: 'Hoje é um ótimo dia pra começar. Bora?'};
  if (n >= p) return {h: `Semana completa: ${n} ${t}!`, s: 'Você fez tudo o que estava planejado. Orgulho demais!'};
  return {h: `Você fez ${n} ${t} essa semana. Continue assim!`, s: `Faltam ${p - n} para fechar os ${p} da semana.`};
}
function weekStrip(st){
  const f = freqStats(st), m = freqMsg(f);
  return `<button type="button" class="wstrip" data-act="stab" data-v="perfil" aria-label="Ver frequência">
    <span class="wdots">${f.weekDays.map(d => `<span class="wd ${d.on ? 'on' : ''} ${d.today ? 'today' : ''}"><i>${d.on ? ICON_CHECK : ''}</i>${d.l[0]}</span>`).join('')}</span>
    <span class="wmsg"><b>${esc(m.h)}</b><span>${esc(m.s)}</span></span></button>`;
}
function profile(st){
  const f = freqStats(st), m = freqMsg(f), per = state.fperiod;
  const PER = {semana:['Semana', f.week], mes:['Mês', f.month], m3:['3 meses', f.m3], tudo:['Tudo', f.all]};
  const val = PER[per][1];
  let sub;
  if (per === 'semana') sub = `<div class="pbar" aria-hidden="true">${Array.from({length: Math.max(f.plan, val)}, (_, i) => `<i class="${i < val ? 'on' : ''}"></i>`).join('')}</div><p class="muted small">${val} de ${f.plan} treinos planejados nesta semana</p>`;
  else if (per === 'mes') sub = `<p class="muted small">em ${new Date().toLocaleDateString('pt-BR', {month:'long'})}</p>`;
  else if (per === 'm3') sub = `<p class="muted small">nos últimos 90 dias · média de ${fmtKg(f.avg3)} por semana</p>`;
  else sub = `<p class="muted small">${f.first ? 'desde ' + dateBR(f.first, {day:'2-digit', month:'2-digit', year:'numeric'}) : 'nenhum treino registrado ainda'}</p>`;
  // heatmap: últimas 12 semanas
  const W = 12, ws = weekStart(new Date()), start = new Date(+ws - (W - 1) * 7 * DAY_MS), now = new Date();
  const on = new Set(f.days.map(dayKeyOf));
  let heat = '<span></span>';
  for (let c = 0; c < W; c++){ const d0 = new Date(+start + c * 7 * DAY_MS); let lbl = '';
    for (let i = 0; i < 7; i++){ const d = new Date(+d0 + i * DAY_MS); if (d.getDate() === 1 || c === 0 && i === 0) lbl = d.toLocaleDateString('pt-BR', {month:'short'}).replace('.', ''); }
    heat += `<span class="hm">${lbl}</span>`; }
  DAYS.forEach((x, i) => {
    heat += `<span class="hd">${i % 2 === 0 ? x.l[0] : ''}</span>`;
    for (let c = 0; c < W; c++){ const d = new Date(+start + (c * 7 + i) * DAY_MS);
      const cls = d > now ? 'fut' : on.has(dayKeyOf(d)) ? 'on' : '';
      heat += `<span class="hc ${cls} ${dayKeyOf(d) === dayKeyOf(now) ? 'today' : ''}" title="${dateBR(d)}"></span>`; }
  });
  return `<section class="freq">
      <div class="seg" role="group" aria-label="Período">${Object.entries(PER).map(([k, [l]]) => `<button type="button" data-act="fper" data-v="${k}" aria-pressed="${per === k}">${l}</button>`).join('')}</div>
      <div class="card fbig"><p class="eyebrow">Treinos</p><b class="bignum">${val}</b>${sub}</div>
    </section>
    <section class="card fmsg"><span class="wdots">${f.weekDays.map(d => `<span class="wd ${d.on ? 'on' : ''} ${d.today ? 'today' : ''}"><i>${d.on ? ICON_CHECK : ''}</i>${d.l[0]}</span>`).join('')}</span><div><b>${esc(m.h)}</b><p class="muted small">${esc(m.s)}</p></div></section>
    <div class="stats">
      <div class="stat"><span>Sequência</span><b>${f.streak} ${f.streak === 1 ? 'semana' : 'semanas'}</b></div>
      <div class="stat"><span>Por semana</span><b>${fmtKg(f.avg3)}</b></div>
      <div class="stat"><span>Total</span><b>${f.all}</b></div>
    </div>
    <p class="small muted" style="margin-top:-12px">Sequência: semanas seguidas com ${f.target} ou mais treinos.</p>
    ${achSection(st)}${recordsSection(st)}${histSection(st)}
    ${waNum() ? `<a class="btn block ghost" href="${esc(waLink('Oi! '))}" target="_blank" rel="noopener">${ICON_CHAT}Falar com o personal no WhatsApp</a><p class="small muted" style="text-align:center;margin-top:-12px">${esc(waPretty())}</p>` : ''}
    <div class="row" style="justify-content:center"><button type="button" class="linkbtn" data-act="ob-reset">Ver o tutorial do app de novo</button></div>
    <section class="card"><p class="eyebrow" style="margin-bottom:10px">Últimas 12 semanas</p><div class="heat">${heat}</div>
      <div class="legend" style="margin-top:10px"><span><i></i>Treinou</span><span><i class="z"></i>Sem treino</span></div></section>
    <section class="card pinfo"><p class="eyebrow">Sua ficha</p><h3>${esc(st.protocol || '—')}</h3><p class="muted small">Foco: ${esc(st.focus || '—')}</p>${st.cardio ? `<p class="small">Cardio: ${esc(st.cardio)}</p>` : ''}
      ${splitChips(st)}${isSeq(st) ? `<p class="small muted">Sequência: faça os treinos na ordem, em qualquer dia. Meta: ${plannedPerWeek(st)} por semana.</p>` : ''}</section>
    ${st.logs.some(l => l.sample) ? '<p class="sample">A frequência inclui o histórico de exemplo das últimas 10 semanas.</p>' : ''}`;
}

/* ---------- resumo para foto ---------- */
function repsFor(ex){
  // agrupa séries seguidas de mesmo tipo e mesma meta: [{type, n, r}] por exercício (A, B...)
  return ex.items.map((_, k) => {
    const groups = [];
    (ex.series || []).forEach(s => { const ps = String(s.reps).split(/\s*\+\s*/); const r = ps[k] || ps[0];
      const g = groups[groups.length - 1]; if (g && g.type === s.type && g.r === r) g.n++; else groups.push({type: s.type, n: 1, r}); });
    return groups.map(g => `<span class="rg">${dot(g.type)}${g.n}× ${esc(tgtFmt(g.r, measOf(ex, k)))}</span>`).join('');
  });
}
const altTxt = (ex, k) => ex.alt && ex.alt[k] ? `<small class="altsum">ou ${esc(lib(ex.alt[k]).name)}</small>` : '';
function summaryCard(st, d, df){
  let total = 0;
  const rows = d.ex.map((ex, i) => {
    total += countType(ex, 'trab') + countType(ex, 'prep');
    const reps = repsFor(ex), conj = ex.items.length > 1, L = k => String.fromCharCode(65 + k);
    const names = conj
      ? `<div class="snm conjgrp">${ex.items.map((id, k) => `<span class="pl"><span class="ab">${L(k)}</span><span class="t">${esc(lib(id).name)}${altTxt(ex, k)}</span><span class="r">${reps[k]}</span></span>`).join('')}</div>`
      : `<div class="snm"><span class="pl"><span class="t">${esc(lib(ex.items[0]).name)}${altTxt(ex, 0)}</span><span class="r">${reps[0]}</span></span></div>`;
    const extra = [ex.method !== 'normal' ? methPill(ex.method) : '', `<span class="sx">desc. ${esc(ex.rest)}</span>`].filter(Boolean).join('');
    return `<li><span class="sn2">${i + 1}</span><div class="sbody">${names}<div class="sext">${extra}</div></div></li>`;
  }).join('');
  return `<section class="sumcard" aria-label="Resumo do treino">
    <div class="sumhead"><img class="cheetah" src="${CHEETAH}" alt="" width="360" height="138"><div><b>${esc(st.name)}</b><span class="sinfo">${esc(st.protocol || '')}${st.protocol ? ' · ' : ''}${df.f}</span></div>
      <h3 class="serif">${esc(d.title)}</h3></div>
    <ol class="sumlist">${rows}</ol>
    <div class="sumfoot"><span>${d.ex.length} exercícios · ${total} séries válidas</span><span class="tleg"><span>${dot('aq')}Aquec.</span><span>${dot('prep')}Prep.</span><span>${dot('trab')}Trabalho</span></span></div>
  </section>`;
}

/* ---------- charts ---------- */
const SC = ['var(--c1)','var(--c2)','var(--c3)','var(--c4)','var(--c5)','var(--c6)'];
const numKg = v => { const n = parseFloat(String(v ?? '').replace(',', '.')); return isNaN(n) ? null : n; };
function seriesFor(st, libId){
  const out = [];
  st.logs.slice().sort((a, b) => a.date < b.date ? -1 : 1).forEach(l => l.entries.forEach(e => {
    const pi = e.items.indexOf(libId); if (pi < 0) return;
    const work = e.sets.filter(s => (s.type || 'trab') === 'trab'), tm = !!(e.meas && e.meas[pi] === 'tempo');
    const sets = (work.length ? work : e.sets).map(s => { const p = s.parts[pi]; if (!p) return null;
      if (tm){ const sec = parseInt(p.reps) || 0, kg = numKg(p.kg); return sec ? {kg: sec, reps: kg ? fmtKg(kg) + ' kg' : '', t: 1} : null; }
      const kg = numKg(p.kg); return kg === null ? null : {kg, reps: p.reps}; });
    const valid = sets.filter(Boolean); if (!valid.length) return;
    out.push({d: l.date, sets, t: tm, best: valid.reduce((a, b) => b.kg > a.kg ? b : a)});
  }));
  const lastT = out.length ? out[out.length - 1].t : false;
  const res = out.filter(r => r.t === lastT); res.unit = lastT ? 's' : 'kg';
  return res;
}
function planExFor(st, libId){ for (const d of DAYS){ const ex = st.days[d.k].ex.find(e => e.items.includes(libId)); if (ex) return ex; } return null; }
function methPill(id, cls){ return id && id !== 'normal' ? `<span class="mpill ${cls || ''}">${esc(meth(id).name)}</span>` : ''; }
function spark(ser){
  if (ser.length < 2) return '<svg class="spk" aria-hidden="true"></svg>';
  const v = ser.map(p => p.best.kg), lo = Math.min(...v), hi = Math.max(...v), r = hi - lo || 1;
  const pts = ser.map((p, i) => [3 + i * 78 / (ser.length - 1), 22 - (p.best.kg - lo) / r * 18]);
  const last = pts[pts.length - 1];
  return `<svg class="spk" viewBox="0 0 84 26" aria-hidden="true"><polyline points="${pts.map(p => p.join(',')).join(' ')}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${last[0]}" cy="${last[1]}" r="3" fill="var(--accent)"/></svg>`;
}
function chartLines(mode, data, unit){
  if (mode === 'max') return [{name: unit === 's' ? 'Maior tempo' : 'Maior carga', short:'', color:'var(--accent)', vals: data.map(s => s.best)}];
  const n = Math.min(6, Math.max(...data.map(s => s.sets.length)));
  return Array.from({length: n}, (_, k) => ({name:'Série ' + (k + 1), short:'S' + (k + 1), color: SC[k], vals: data.map(s => s.sets[k] || null)}));
}
function drawChart(el){
  const {mode, data, unit} = JSON.parse(el.dataset.chart || '{}'), U = unit || 'kg';
  if (!data || !data.length){ el.innerHTML = '<p class="muted small">Nenhuma carga registrada ainda.</p>'; return; }
  const lines = chartLines(mode, data, U);
  const W = Math.max(260, el.clientWidth || 320), H = 220, pl = 40, pr = mode === 'max' ? 18 : 30, pt = 24, pb = 26;
  const all = lines.flatMap(l => l.vals.filter(Boolean).map(p => p.kg));
  const lo = Math.min(...all), hi = Math.max(...all);
  const range = (hi - lo) || Math.max(hi * 0.2, 2);
  const step = [0.5, 1, 2, 2.5, 5, 10, 20, 25, 50, 100, 200].find(s => range / s <= 4) || 200;
  let y0 = Math.max(0, Math.floor(lo / step) * step - (lo % step === 0 && lo > 0 ? step : 0));
  let y1 = Math.ceil(hi / step) * step; if (y1 <= hi) y1 += step;
  const n = data.length;
  const x = i => n === 1 ? (pl + W - pr) / 2 : pl + i * (W - pl - pr) / (n - 1);
  const y = v => pt + (1 - (v - y0) / (y1 - y0)) * (H - pt - pb);
  let g = '';
  for (let t = y0; t <= y1 + 1e-9; t += step){
    g += `<line x1="${pl}" x2="${W - pr}" y1="${y(t)}" y2="${y(t)}" stroke="var(--line)" stroke-width="1"/><text x="${pl - 8}" y="${y(t) + 4}" text-anchor="end">${fmtKg(t)}</text>`;
  }
  const every = n <= 6 ? 1 : Math.ceil(n / 5);
  data.forEach((p, i) => { if (i % every === 0 || i === n - 1) g += `<text x="${x(i)}" y="${H - 6}" text-anchor="middle">${ddmm(p.d)}</text>`; });
  g += `<line class="xh" x1="0" x2="0" y1="${pt - 6}" y2="${H - pb}" stroke="var(--muted)" stroke-width="1" stroke-dasharray="3 3" visibility="hidden"/>`;
  const ends = [];
  lines.forEach((l, li) => {
    let d = '', pen = false;
    l.vals.forEach((p, i) => { if (!p){ pen = false; return; } d += (pen ? 'L' : 'M') + x(i) + ' ' + y(p.kg) + ' '; pen = true; });
    if (mode === 'max'){ const base = `L${x(n - 1)} ${y(y0)} L${x(0)} ${y(y0)} Z`; g += `<path d="${d}${base}" fill="var(--accent)" opacity=".1"/>`; }
    g += `<path d="${d}" fill="none" stroke="${l.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
    l.vals.forEach((p, i) => { if (p) g += `<circle cx="${x(i)}" cy="${y(p.kg)}" r="${mode === 'max' && i === n - 1 ? 5 : 4}" fill="${l.color}" stroke="var(--surface)" stroke-width="2"/>`; });
    for (let i = n - 1; i >= 0; i--) if (l.vals[i]){ ends.push({li, x: x(i), y: y(l.vals[i].kg), v: l.vals[i].kg}); break; }
  });
  if (mode === 'max'){
    const e = ends[0]; g += `<text class="endlbl" x="${e.x}" y="${e.y - 12}" text-anchor="${n > 1 ? 'end' : 'middle'}">${fmtKg(e.v)} ${U}</text>`;
  } else {
    ends.sort((a, b) => a.y - b.y); let prev = -Infinity;
    ends.forEach(e => { const ly = Math.max(e.y + 4, prev + 12); prev = ly; g += `<text class="dlbl" x="${W - pr + 7}" y="${ly}" fill="${lines[e.li].color}">${lines[e.li].short}</text>`; });
  }
  const half = n === 1 ? (W - pl - pr) / 2 : (W - pl - pr) / (n - 1) / 2;
  data.forEach((p, i) => { g += `<rect class="hit" data-i="${i}" x="${x(i) - half}" y="0" width="${half * 2}" height="${H}" fill="transparent"/>`; });
  el.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${U === 's' ? (mode === 'max' ? 'Maior tempo por treino' : 'Tempo de cada série por treino') : (mode === 'max' ? 'Maior carga por treino' : 'Carga de cada série por treino')}">${g}</svg><div class="tip" hidden></div>`;
  const tip = el.querySelector('.tip'), xh = el.querySelector('.xh');
  el.querySelectorAll('.hit').forEach(h => {
    const i = +h.dataset.i;
    const show = () => {
      const rows = lines.map(l => { const p = l.vals[i]; return p ? `<span class="tr"><i style="background:${l.color}"></i>${l.name}: ${fmtKg(p.kg)} ${U}${p.reps ? (U === 's' ? ' com ' : ' × ') + esc(p.reps) : ''}</span>` : ''; }).join('');
      tip.innerHTML = `<b>${ddmm(data[i].d)}</b>${rows}`;
      tip.style.left = Math.min(W - 80, Math.max(80, x(i))) + 'px'; tip.hidden = false;
      xh.setAttribute('x1', x(i)); xh.setAttribute('x2', x(i)); xh.setAttribute('visibility', 'visible');
    };
    h.addEventListener('pointerenter', show); h.addEventListener('pointerdown', show);
    h.addEventListener('pointerleave', () => { tip.hidden = true; xh.setAttribute('visibility', 'hidden'); });
  });
}
function drawCharts(){ document.querySelectorAll('[data-chart]').forEach(drawChart); }
let rzT; window.addEventListener('resize', () => { clearTimeout(rzT); rzT = setTimeout(drawCharts, 120); });

function evolution(st){
  const ids = [];
  Object.values(st.days).forEach(d => d.ex.forEach(e => e.items.forEach(i => { if (!ids.includes(i)) ids.push(i); })));
  st.logs.forEach(l => l.entries.forEach(e => e.items.forEach(i => { if (!ids.includes(i)) ids.push(i); })));
  const rows = ids.map(id => ({id, ser: seriesFor(st, id)})).filter(r => r.ser.length);
  if (!rows.length) return `<div class="empty">Assim que ${esc(st.name.split(' ')[0])} registrar cargas, os gráficos de evolução aparecem aqui.</div>`;
  if (!state.evoLib || !rows.some(r => r.id === state.evoLib)) state.evoLib = rows[0].id;
  const cur = rows.find(r => r.id === state.evoLib), ser = cur.ser, mode = state.evoMode, U = ser.unit || 'kg';
  const first = ser[0].best, last = ser[ser.length - 1].best, delta = last.kg - first.kg, best = Math.max(...ser.map(p => p.best.kg));
  const pe = planExFor(st, cur.id);
  const partners = pe ? pe.items.filter(i => i !== cur.id).map(i => lib(i).name) : [];
  const ctx = pe && pe.method !== 'normal' ? `<p class="evctx">${methPill(pe.method)}${partners.length ? '<span>junto com ' + esc(partners.join(' e ')) + '</span>' : ''}</p>` : '';
  const lines = chartLines(mode, ser, U);
  const legendHTML = lines.length > 1 ? `<div class="clegend">${lines.map(l => `<span><i style="background:${l.color}"></i>${l.name}</span>`).join('')}</div>` : '';
  const recent = ser.slice(-6).reverse();
  const nS = Math.max(...ser.map(s => s.sets.length));
  const table = `<details class="ctable"><summary>Ver tabela</summary><div class="tablewrap"><table><thead><tr><th>Data</th>${Array.from({length: nS}, (_, k) => `<th>S${k + 1}</th>`).join('')}</tr></thead><tbody>${recent.map(s => `<tr><td>${ddmm(s.d)}</td>${Array.from({length: nS}, (_, k) => { const p = s.sets[k]; return `<td>${p ? (U === 's' ? fmtKg(p.kg) + ' s' + (p.reps ? ' · ' + esc(p.reps) : '') : fmtKg(p.kg) + ' × ' + esc(p.reps || '–')) : '–'}</td>`; }).join('')}</tr>`).join('')}</tbody></table></div></details>`;
  return `<section class="card evo-head">
      <label class="small muted" for="evo-sel">Exercício</label>
      <select id="evo-sel" class="selbox" data-change="evo">${rows.map(r => `<option value="${r.id}" ${r.id === cur.id ? 'selected' : ''}>${esc(lib(r.id).name)}</option>`).join('')}</select>
      ${ctx}
      <div class="stats">
        <div class="stat"><span>Última</span><b>${fmtKg(last.kg)} ${U}</b></div>
        <div class="stat"><span>Recorde</span><b>${fmtKg(best)} ${U}</b></div>
        <div class="stat"><span>Desde ${ddmm(ser[0].d)}</span><b class="${delta > 0 ? 'up' : ''}">${delta > 0 ? '+' : ''}${fmtKg(delta)} ${U}</b></div>
      </div>
      <div class="seg" role="group" aria-label="Tipo de gráfico"><button type="button" data-act="evomode" data-v="serie" aria-pressed="${mode === 'serie'}">Por série</button><button type="button" data-act="evomode" data-v="max" aria-pressed="${mode === 'max'}">${U === 's' ? 'Maior tempo' : 'Maior carga'}</button></div>
      ${legendHTML}
      <div class="chart" data-chart='${esc(JSON.stringify({mode, data: ser, unit: U}))}'></div>
      <p class="small muted">${U === 's' ? (mode === 'serie' ? 'Exercício por tempo: uma linha para cada série de trabalho, em segundos. Toque no gráfico para ver o tempo e a carga, se houver.' : 'Maior tempo segurado em cada treino, em segundos.') : (mode === 'serie' ? 'Uma linha para cada série de trabalho (aquecimento e preparatória ficam de fora). Toque no gráfico para ver carga e repetições.' : 'Maior carga feita em cada treino.')}</p>
      ${table}
    </section>
    <section class="card"><p class="eyebrow" style="margin-bottom:6px">Todos os exercícios</p><div class="evlist">${rows.map(r => {
      const d = r.ser[r.ser.length - 1].best.kg - r.ser[0].best.kg, px = planExFor(st, r.id);
      return `<button type="button" class="evrow" data-act="evo" data-v="${r.id}" aria-pressed="${r.id === cur.id}"><span class="nm">${esc(lib(r.id).name)}${px ? methPill(px.method, 'inl') : ''}</span>${spark(r.ser)}<span class="vl">${fmtKg(r.ser[r.ser.length - 1].best.kg)} ${r.ser.unit}<small class="${d > 0 ? '' : 'flat'}">${d > 0 ? '+' + fmtKg(d) : '='} ${r.ser.unit}</small></span></button>`;
    }).join('')}</div></section>
    ${st.logs.some(l => l.sample) ? '<p class="sample">O histórico das últimas 10 semanas é de exemplo, para demonstrar os gráficos. Os treinos registrados no app entram junto.</p>' : ''}`;
}

/* ---------- header ---------- */
function header(){
  const tabs = state.mode === 'aluno'
    ? [['treino','Treino'], ['evolucao','Evolução'], ['perfil','Perfil']].map(([k, l]) => `<button type="button" data-act="stab" data-v="${k}" aria-pressed="${state.stab === k}">${l}</button>`).join('')
    : [['alunos','Alunos'], ['feed','Atividade'], ['lib','Biblioteca'], ['metodos','Métodos']].map(([k, l]) => `<button type="button" data-act="psec" data-v="${k}" aria-pressed="${state.psec === k}">${l}${k === 'feed' && unreadCount() ? `<span class="tbadge">${unreadCount()}</span>` : ''}</button>`).join('');
  return `<header class="band"><div class="wrap">
    <div class="band-top"><img class="logo" src="${LOGO}" alt="Jau Training, Online Strength Coaching" width="560" height="406">
    ${isP() ? `<div class="modes" role="group" aria-label="Visão">
      <button type="button" data-act="mode" data-v="aluno" aria-pressed="${state.mode === 'aluno'}">Aluno</button>
      <button type="button" data-act="mode" data-v="personal" aria-pressed="${state.mode === 'personal'}">Personal</button>
    </div>` : ''}</div>
    <nav class="tabs">${tabs}</nav></div></header>`;
}

/* ---------- aluno ---------- */
function studentView(){
  const st = stu();
  if (!st) return `<main class="wrap"><div class="empty">Nenhum aluno cadastrado ainda. Vá em Personal para adicionar.</div></main>`;
  const preview = isP() ? `<p class="previewbar">Você está vendo o app como ${esc(st.name.split(' ')[0])}. Treinos registrados aqui entram no histórico do aluno.</p>` : '';
  if (state.done) return doneView(st);
  const first = st.name.split(' ')[0];
  const picker = isP() && db.students.length > 1 ? `<label class="viewas" for="viewas">Vendo como
      <select id="viewas" data-change="viewas">${db.students.map(s => `<option value="${s.id}" ${s.id === st.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select></label>` : '';
  const hello = preview + `<section class="hello"><p class="eyebrow">${esc(st.protocol || 'Sua ficha')}</p><h1>Olá, ${esc(first)}</h1><p class="muted small">Foco: ${esc(st.focus || '—')}</p>${picker}</section>`;
  if (state.stab === 'evolucao') return `<main class="wrap">${hello}${evolution(st)}</main>`;
  if (state.stab === 'perfil') return `<main class="wrap">${hello}${profile(st)}${isP() ? '' : accountHTML()}</main>`;
  const seq = isSeq(st), nxt = seq ? nextSlot(st) : null;
  if (seq && (!state.dayPicked || !seqSlots(st).includes(state.day))) state.day = nxt;
  const d = st.days[state.day] || {title:'', ex:[]};
  const df = {k: state.day, f: slotFull(st, state.day)};
  let body;
  if (!d.ex.length){
    const isCardio = /barquinho|remo|cardio|corrida|bike/i.test(d.title);
    body = cardioList(d).length ? cardioCard(d) : `<div class="restday"><h3>${esc(d.title || 'Sem treino neste dia')}</h3>
      <p>${isCardio ? esc(st.cardio || 'Dia de cardio.') : (d.title ? 'Dia de recuperação. Sono, hidratação e alimentação também fazem parte do treino.' : 'O personal ainda não montou o treino deste dia.')}</p></div>`;
  } else {
    body = `<button type="button" class="photobtn" data-act="sum-open">${ICON_CAM}<span><b>Resumo do treino pra foto</b><small>A ficha do dia num quadro só, pronta pra print</small></span></button>${cardioCard(d)}<div class="list">${d.ex.map((ex, i) => exCard(st, ex, i)).join('')}</div>
      ${muscleCard(d, 'O que foi treinado hoje', true)}
      <div id="finish-area"><button class="btn block" type="button" data-act="finish">Finalizar treino</button></div>`;
  }
  return `<main class="wrap">${hello}${weekStrip(st)}
    ${seq ? `<nav class="week seqnav" aria-label="Treinos da sequência" style="grid-template-columns:repeat(${Math.max(seqSlots(st).length, 1)},minmax(0,1fr))">${seqSlots(st).map(k => {
      const t = st.days[k].title || '';
      return `<button type="button" data-act="day" data-v="${k}" aria-pressed="${k === state.day}" class="${k === nxt ? 'today' : ''}" title="${esc(t)}"><span class="d">${slotShort(st, k)}</span><span class="t">${esc(shortTitle(t))}</span></button>`;
    }).join('')}</nav>` : `<nav class="week" aria-label="Dias da semana">${DAYS.map(x => {
      const t = st.days[x.k] ? st.days[x.k].title : '';
      return `<button type="button" data-act="day" data-v="${x.k}" aria-pressed="${x.k === state.day}" class="${x.k === todayKey ? 'today' : ''}" title="${esc(t)}"><span class="d">${x.l}</span><span class="t">${esc(shortTitle(t))}</span></button>`;
    }).join('')}</nav>`}
    <header class="dayhead">
      <div><p class="eyebrow">${df.f}${seq ? (state.day === nxt ? ' · próximo da sequência' : '') : (state.day === todayKey ? ' · hoje' : '')}</p><h2 class="serif">${esc(d.title || '—')}</h2></div>
      ${d.ex.length ? `<span class="prog" id="prog">${progText(d)}</span>` : ''}
    </header>
    ${body}${guide()}
    <p class="foot">Protocolo de treino fiscalizado e supervisionado pelo profissional Marcelo Júnior, CREF RJ-056749</p>
  </main>${state.sumOpen && d.ex.length ? `<div class="sumov" role="dialog" aria-modal="true" aria-label="Resumo do treino"><div class="sumov-in"><div class="sumov-top"><span class="small muted">Tire um print desta tela</span><button type="button" class="icon" data-act="sum-close">Fechar</button></div>${summaryCard(st, d, df)}</div></div>` : ''}${onboardHTML(st)}`;
}
function progText(d){
  const dr = draft(); let tot = 0, done = 0;
  d.ex.forEach(ex => { const n = targets(ex).length; tot += n; for (let i = 0; i < n; i++) if (dr[ex.id] && dr[ex.id].sets && dr[ex.id].sets[i] && dr[ex.id].sets[i].done) done++; });
  return `${done} de ${tot} séries`;
}
function exCard(st, ex, i){
  const dr = (draft()[ex.id]) || {sets:{}, comment:''}, used = usedItems(ex, dr);
  const ps = used.map(lib), conj = ps.length > 1, L = k => String.fromCharCode(65 + k);
  const tg = targets(ex), refs = used.map(id => refFor(st, id)), m = meth(ex.method);
  const prs = draftPRs(st, ex, dr), best = prHistory(st).best[used[0]];
  const nSets = tg.length, nDone = tg.filter((_, si) => dr.sets && dr.sets[si] && dr.sets[si].done).length, allDone = nSets > 0 && nDone === nSets;
  if (allDone && !state.openEx[ex.id]) return `<article class="ex exdone" id="exc-${ex.id}"><div class="ex-top"><span class="num ok">${ICON_CHECK}</span>
    <div style="min-width:0;flex:1"><h3>${ps.map(p => esc(p.name)).join(' + ')}</h3><p class="musc">${nSets} de ${nSets} séries concluídas${prs.size ? ' · novo recorde!' : ''}</p></div>
    <button type="button" class="icon" data-act="ex-open" data-v="${ex.id}">Ver séries</button></div></article>`;
  const isSw = k => !!(dr.swap && dr.swap[k] && ex.alt && ex.alt[k]);
  const swapBtns = ex.items.map((id, k) => { const a = ex.alt && ex.alt[k]; if (!a) return '';
    return `<button type="button" class="swapbtn" data-act="swap" data-ex="${ex.id}" data-i="${k}">${isSw(k) ? ICON_SWAP + 'Voltar para ' + esc(lib(id).name) : ICON_SWAP + 'Aparelho ocupado? Trocar por ' + esc(lib(a).name)}</button>`; }).join('');
  const lastTxt = refLine(st, refs, conj);
  const tag = k => isSw(k) ? '<span class="alttag">Alternativa</span>' : '';
  const title = conj ? ps.map((p, k) => `<span class="sub"><span class="ab">${L(k)}</span>${esc(p.name)}${tag(k)}</span>`).join('') : esc(ps[0].name) + tag(0);
  const muscles = [...new Set(ps.flatMap(p => p.primary))].map(k => MNAME[k]).join(', ');
  const rows = tg.map((t, si) => {
    const tp = conj ? t.split(/\s*\+\s*/) : [t];
    const s = (dr.sets && dr.sets[si]) || {};
    const curType = stypeOf(ex, si), ord = typeOrd(ex, si);
    const cells = ps.map((p, pi) => {
      const v = (s.parts && s.parts[pi]) || {}, lp = refPart(refs[pi], curType, ord);
      return `<div class="part ${conj ? 'withl' : ''}">${conj ? `<span class="plabel">${L(pi)}</span>` : ''}
        <span class="target">${esc(tgtFmt(tp[pi] || tp[0] || '', measOf(ex, pi)))}</span>
        <label class="fld"><input id="kg-${ex.id}-${si}-${pi}" inputmode="decimal" autocomplete="off" aria-label="Carga série ${si + 1}${conj ? ' ' + L(pi) : ''}" data-in="kg" data-ex="${ex.id}" data-set="${si}" data-part="${pi}" value="${esc(v.kg || '')}" placeholder="${esc((lp && lp.kg) || '')}"><span>kg</span></label>
        <label class="fld"><input id="rp-${ex.id}-${si}-${pi}" inputmode="numeric" autocomplete="off" aria-label="${measOf(ex, pi) === 'tempo' ? 'Segundos' : 'Repetições'} série ${si + 1}${conj ? ' ' + L(pi) : ''}" data-in="reps" data-ex="${ex.id}" data-set="${si}" data-part="${pi}" value="${esc(v.reps || '')}" placeholder="${esc((lp && lp.reps) || '')}"><span>${measOf(ex, pi) === 'tempo' ? 'seg' : 'reps'}</span></label>
      </div>`;
    }).join('');
    return `<div class="set ${s.done ? 'done' : ''} ${ps.some((_, pi) => prs.has(si + '-' + pi)) ? 'pr' : ''}" id="set-${ex.id}-${si}"><span class="sn">${dot(stypeOf(ex, si))}${si + 1}</span><div class="parts ${conj ? 'conj' : ''}">${cells}</div>
      <button class="chk" type="button" data-act="set" data-ex="${ex.id}" data-set="${si}" aria-pressed="${!!s.done}" aria-label="Concluir série ${si + 1}">${ICON_CHECK}${ICON_TROPHY}</button></div>`;
  }).join('');
  const how = ps.filter(p => p.instructions).map((p, k) => `<p>${conj ? `<span class="ab">${L(used.indexOf(p.id))}</span>` : ''}${esc(p.instructions)}</p>`).join('');
  const vids = ps.map((p, k) => {
    const u = videoUrl(p);
    return u ? `<a class="vcard" href="${esc(u)}" target="_blank" rel="noopener"><span class="thumb">${ICON_PLAY}</span><span class="vtxt"><b>${conj ? L(k) + ' · ' : ''}Ver execução</b><span>${esc(p.name)} · abre no YouTube</span></span></a>`
      : `<a class="vcard none" href="https://www.youtube.com/results?search_query=${encodeURIComponent(p.name + ' execução')}" target="_blank" rel="noopener"><span class="thumb">${ICON_PLAY}</span><span class="vtxt"><b>${conj ? L(k) + ' · ' : ''}Vídeo em breve</b><span>Enquanto isso, buscar exemplo no YouTube</span></span></a>`;
  }).join('');
  const hasM = m.id !== 'normal';
  return `<article class="ex ${hasM ? 'hasm' : ''}">
    ${hasM ? `<div class="mband">${methPill(m.id)}<p>${esc(m.desc)}</p></div>` : ''}
    <div class="ex-top"><span class="num">${i + 1}</span><div style="min-width:0">
      <h3 class="${conj ? 'conjgrp' : ''}">${title}</h3>
      <div class="meta"><span class="chip">${countType(ex, 'trab')} ${countType(ex, 'trab') === 1 ? 'série' : 'séries'} de trabalho</span><span class="chip">Intervalo ${esc(ex.rest)}</span></div>
      ${muscles ? `<p class="musc">${esc(muscles)}</p>` : ''}
    </div></div>
    ${ex.notes ? `<p class="pnote">${esc(ex.notes)}</p>` : ''}
    ${swapBtns}
    <details class="exinfo"><summary>Como fazer e vídeo</summary>${how ? `<div class="howto">${how}</div>` : ''}<div class="vids">${vids}</div></details>
    <div class="exlinks">${lastTxt}
      ${best ? `<span class="last rbest">${ICON_TROPHY}Recorde: ${esc(markTxt(best))}</span>` : ''}
      ${refs.some(Boolean) ? `<button type="button" class="linkbtn" data-act="goevo" data-v="${used[0]}">Ver evolução</button>` : ''}
      ${allDone ? `<button type="button" class="linkbtn" data-act="ex-close" data-v="${ex.id}">Recolher</button>` : ''}</div>
    <div class="sets">
      <div class="tleg">${['aq','prep','trab'].filter(t => countType(ex, t)).map(t => `<span>${dot(t)}${STYPES[t].l}</span>`).join('')}</div>
      <div class="shead"><span>#</span><div class="cols ${conj ? 'withl' : ''}">${conj ? '<span></span>' : ''}<span>Meta</span><span>Carga</span><span>${ex.items.every((_, k) => measOf(ex, k) === 'tempo') ? 'Tempo' : ex.items.some((_, k) => measOf(ex, k) === 'tempo') ? 'Reps/tempo' : 'Reps'}</span></div><span></span></div>
      ${rows}
    </div>
    ${waNum() ? `<a class="walink" href="${esc(waLink(`Oi! Tenho uma dúvida no exercício ${ps.map(p => p.name).join(' + ')} (${st.days[state.day] ? st.days[state.day].title : ''}): `))}" target="_blank" rel="noopener">${ICON_CHAT}Dúvida? Fale com o personal no WhatsApp</a>` : ''}
    <div class="cmtbox"><label for="cm-${ex.id}">Observação para o personal</label>
      <textarea id="cm-${ex.id}" rows="1" data-cm="${ex.id}" placeholder="Incômodo, equipamento que usou, ajuste de carga...">${esc(dr.comment || '')}</textarea></div>
  </article>`;
}
function guide(){
  return `<details class="guide"><summary>Como funciona o nosso trabalho</summary><ol>
    <li><b>Dúvidas e acompanhamento</b>Tem alguma dúvida sobre a planilha, execuções ou exercícios? Entre em contato. Sobre execução, grave um vídeo fazendo o exercício que eu corrijo o que for necessário.</li>
    <li><b>Dores ou desconforto</b>Fez algum movimento e não se sentiu bem? Não force: pule o exercício e me conte com detalhes o que aconteceu, no campo de observação do exercício. Se persistir, procure um profissional específico (fisioterapeuta, ortopedista).</li>
    <li><b>Execução e técnica</b>Uma boa execução sempre vem antes do aumento de carga: postura, cadência controlada, amplitude e core estável.</li>
    <li><b>Progressão de carga</b>Se a faixa é de 8 a 10 reps, ajuste a carga para que seja difícil chegar a 10, conseguindo no mínimo 8. Não chegou a 8: está pesado. Chegou a 10 com facilidade: aumente o peso.</li>
    <li><b>Comprometimento</b>O resultado é construído a cada treino e impulsionado por bons hábitos: alimentação regular, hidratação, sono de qualidade e respeito ao descanso.</li>
  </ol></details>`;
}

/* ---------- personal: alunos ---------- */
function trainerView(){
  if (state.psec === 'lib') return libraryView();
  if (state.psec === 'feed') return feedView();
  if (state.psec === 'metodos') return methodsView();
  if (state.pview === 'import' && state.imp) return importView();
  if (state.pview === 'edit') return editView();
  if (state.pview === 'track') return trackView();
  return `<main class="wrap v-alunos">
    <div class="sectionhead"><div><p class="eyebrow">Painel do personal</p><h2>Seus alunos</h2></div><span class="muted small">${db.students.length} ${db.students.length === 1 ? 'aluno' : 'alunos'}</span></div>
    ${attentionHTML()}
    <div class="stuacts"><input id="stu-q" class="search" placeholder="Buscar aluno" autocomplete="off" aria-label="Buscar aluno"><button class="btn sm" type="button" data-act="new-open">${ICON_PLUS}Novo aluno</button></div>
    ${state.newOpen ? `<form class="newst" id="newst"><input id="new-name" placeholder="Nome do novo aluno" aria-label="Nome do novo aluno" autocomplete="off">
      <input id="new-email" type="email" inputmode="email" placeholder="E-mail do aluno (para o acesso ao app)" aria-label="E-mail do aluno" autocomplete="off">
      <select id="new-from" class="selbox" aria-label="Começar com a ficha de"><option value="">Ficha em branco</option>${db.students.map(x => `<option value="${x.id}">Copiar ficha de ${esc(x.name.split(' ')[0])}</option>`).join('')}</select>
      <button class="btn sm" type="submit">Adicionar</button></form>` : ''}
    <div class="stugrid">${db.students.slice().sort((a, b) => { const o = {high: 0, mid: 1, info: 2}, la = alertFor(a), lb = alertFor(b); return (la ? o[la.lvl] : 3) - (lb ? o[lb.lvl] : 3) || a.name.localeCompare(b.name, 'pt'); }).map(s => {
      const lastLog = s.logs[s.logs.length - 1];
      const nc = lastLog ? lastLog.entries.filter(e => e.comment).length : 0;
      return `<article class="stu" data-name="${esc(norm(s.name))}">
      <div><p class="eyebrow">${esc(s.protocol || 'Sem protocolo')}</p><h3>${esc(s.name)}</h3><div class="accrow">${accessHTML(s)}</div>${(() => { const a = alertFor(s); return a ? `<span class="abadge ${a.lvl}">${esc(a.t)}</span>` : ''; })()}
      <p class="muted small" style="margin-top:4px">${s.last ? 'Último treino: ' + esc(dateBR(s.last)) : 'Ainda não registrou nenhum treino'} · ${s.logs.length} ${s.logs.length === 1 ? 'treino' : 'treinos'}</p>
      ${(() => { const f = freqStats(s); return `<p class="small" style="margin-top:4px"><b>${f.week}</b> de ${f.plan} treinos nesta semana · <b>${f.month}</b> no mês · sequência de ${f.streak} ${f.streak === 1 ? 'semana' : 'semanas'}</p>`; })()}
      ${s.privNotes ? `<p class="pnprev">Nota: ${esc(s.privNotes.length > 90 ? s.privNotes.slice(0, 90) + '…' : s.privNotes)}</p>` : ''}
      ${nc ? `<p class="alert" style="margin-top:4px">${nc} ${nc === 1 ? 'observação' : 'observações'} no último treino</p>` : ''}</div>
      ${splitChips(s)}
      <div class="row"><button class="btn sm" type="button" data-act="p-edit" data-v="${s.id}">Editar ficha</button>
        <button class="btn sm quiet" type="button" data-act="p-track" data-v="${s.id}">Acompanhar</button>
        <button class="btn sm ghost" type="button" data-act="p-open" data-v="${s.id}">Abrir como aluno</button></div>
    </article>`;}).join('')}</div>
    <p class="empty" id="stu-none" hidden>Nenhum aluno com esse nome.</p>
    <section class="card form"><label>Seu WhatsApp <span class="hint">Os alunos falam com você por ele, direto do exercício. Com DDD, só números.</span><input id="set-wa" inputmode="tel" data-setwa="1" value="${esc(waNum().replace(/^55/, ''))}" placeholder="21984183052"></label></section>
    ${accountHTML()}
  </main>`;
}
function editView(){
  const s = stu(), d = s.days[state.editDay];
  const pk = state.picker;
  return `<main class="wrap">
    <button class="back" type="button" data-act="p-back">← Alunos</button>
    <div class="sectionhead"><div><p class="eyebrow">Editar ficha</p><h2>${esc(s.name)}</h2></div><span class="muted small">Salvo automaticamente</span></div>
    <div class="edlay"><aside class="edside" aria-label="Dados e volume do aluno">
    <p class="eyebrow sidehd">Visão geral</p>
    <details class="card sdata" id="sdata" ${state.sdataOpen ? 'open' : ''}><summary><span class="vsum"><b>Dados do aluno e anotações</b><small>${esc([s.protocol, s.focus].filter(Boolean).join(' · ') || 'Toque para preencher')}${s.privNotes ? ' · com anotação privada' : ''}</small></span></summary>
    <div class="form">
      <label>Nome<input id="f-name" data-sf="name" value="${esc(s.name)}"></label>
      <label>E-mail de acesso <span class="hint">O aluno cria a conta no app com este e-mail e a ficha aparece pra ele. ${s.userId ? 'Situação: app ativo.' : s.email ? 'Situação: ainda não criou a conta.' : ''}</span><input id="f-email" type="email" inputmode="email" data-sf="email" value="${esc(s.email || '')}" placeholder="aluno@email.com"></label>
      <div class="grid4" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">
        <label>Organização dos treinos<select id="f-sched" data-sched="1"><option value="fixo" ${isSeq(s) ? '' : 'selected'}>Dias fixos da semana</option><option value="seq" ${isSeq(s) ? 'selected' : ''}>Sequência A, B, C (sem dia fixo)</option></select></label>
        ${isSeq(s) ? `<label>Meta de treinos por semana<input id="f-perweek" type="number" min="1" max="7" data-sf="perWeek" value="${esc(s.perWeek || '')}"></label>` : ''}
      </div>
      ${isSeq(s) ? '<span class="hint">Na sequência, o aluno faz A, B, C… na ordem, no dia que puder, e o app sugere o próximo. A frequência e os alertas usam a meta semanal.</span>' : ''}
      <div class="grid4" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">
        <label>Protocolo<input id="f-protocol" data-sf="protocol" value="${esc(s.protocol)}"></label>
        <label>Foco<input id="f-focus" data-sf="focus" value="${esc(s.focus)}"></label>
      </div>
      <label>Orientações gerais de cardio <span class="hint">Opcional. O cardio de cada dia é prescrito dentro do dia, logo abaixo.</span><input id="f-cardio" data-sf="cardio" value="${esc(s.cardio)}"></label>
    </div>
    <label class="privn">Anotações privadas <span class="hint">Só você vê. O aluno não tem acesso.</span><textarea id="f-priv" data-sf="privNotes" rows="3" placeholder="Lesões, preferências, horários, combinados...">${esc(s.privNotes || '')}</textarea></label>
    <div class="newproto"><button class="icon" type="button" data-act="new-proto">Iniciar próximo protocolo</button><span class="hint">Avança o número do protocolo (${esc(s.protocol || '—')} → ${esc(nextProto(s.protocol))}) e mantém todo o histórico de cargas. Quando um exercício antigo volta pra ficha, a última carga dele aparece como referência.</span></div>
    </details>
    ${volumeCard(s)}
    ${d.ex.length ? muscleCard(d, 'Músculos deste treino', true) : ''}
    </aside><div class="edmain">
    <nav class="week" aria-label="Dia para editar">${DAYS.map(x => `<button type="button" data-act="p-day" data-v="${x.k}" aria-pressed="${x.k === state.editDay}"><span class="d">${slotShort(s, x.k)}</span><span class="t">${esc(shortTitle(s.days[x.k].title))}</span></button>`).join('')}</nav>
    <div class="form"><label>${isSeq(s) ? 'Nome do ' + slotFull(s, state.editDay) : 'Nome do treino de ' + slotFull(s, state.editDay).toLowerCase()}<input id="f-dtitle" data-dt="1" value="${esc(d.title)}" placeholder="Ex.: Inferiores Completo, Descanso"></label></div>
    <div class="tools"><button class="icon" type="button" data-act="copy-open" data-v="day">${ICON_COPY}Copiar este dia</button><button class="icon" type="button" data-act="copy-open" data-v="all">${ICON_COPY}Copiar ficha inteira</button></div>
    ${copyPanel(s)}
    ${cardioEditor(d)}
    <div class="list">${d.ex.length ? d.ex.map((ex, i) => editEx(ex, i, d.ex.length) + (pk && pk.target === ex.id ? pickerHTML('Conjugar com qual exercício?') : '') + (pk && String(pk.target).startsWith('alt:' + ex.id + ':') ? pickerHTML('Alternativa para quando o aparelho estiver ocupado') : '') + (pk && String(pk.target).startsWith('swap:' + ex.id + ':') ? pickerHTML('Trocar ' + esc(lib(ex.items[+pk.target.split(':')[2]]).name) + ' por') : '')).join('') : '<div class="empty">Nenhum exercício neste dia. Deixe vazio para dia de descanso ou cardio.</div>'}</div>
    ${pk && pk.target === 'new' ? pickerHTML('Adicionar exercício da biblioteca') : `<button class="btn block ghost" type="button" data-act="pick-open" data-v="new">+ Adicionar exercício</button>`}
    </div></div>
    <div class="row" style="justify-content:center;margin-top:12px"><button class="icon danger" type="button" data-act="st-del" data-v="${s.id}">Remover aluno</button></div>
  </main>`;
}
function editEx(ex, i, n){
  const L = k => String.fromCharCode(65 + k);
  const hasM = ex.method !== 'normal';
  return `<div class="edit-ex ${hasM ? 'hasm' : ''}">
    ${hasM ? `<div class="mband">${methPill(ex.method)}<p>${esc(meth(ex.method).desc)}</p></div>` : ''}
    <div class="items ${ex.items.length > 1 ? 'conjgrp' : ''}">${ex.items.map((id, k) => { const l = lib(id); return `<div class="item"><span class="num">${ex.items.length > 1 ? L(k) : i + 1}</span>
      <span class="nm">${esc(l.name)}<small>${esc(l.primary.map(m => MNAME[m]).join(', ') || 'Sem músculos definidos')}</small>${editRef(id)}${ex.alt && ex.alt[k] ? `<span class="altline">Alternativa: <b>${esc(lib(ex.alt[k]).name)}</b> <button type="button" class="linkbtn" data-act="alt-del" data-ex="${ex.id}" data-i="${k}">remover</button></span>` : `<button type="button" class="linkbtn altadd" data-act="pick-open" data-v="alt:${ex.id}:${k}">+ Alternativa (aparelho ocupado)</button>`}</span>
      <span class="iacts">${videoUrl(l) ? '<span class="vok">Vídeo ✓</span>' : `<button type="button" class="linkbtn small" data-act="go-lib" data-v="${id}">Pôr vídeo</button>`}
      <button type="button" class="icon swapit" data-act="pick-open" data-v="swap:${ex.id}:${k}" aria-label="Trocar ${esc(l.name)} por outro exercício">${ICON_SWAP}Trocar</button>
      ${ex.items.length > 1 ? `<button type="button" class="icon" data-act="p-unpart" data-ex="${ex.id}" data-i="${k}" aria-label="Tirar ${esc(l.name)} do conjugado">✕</button>` : ''}</span></div>`; }).join('')}</div>
    <div class="grid4">
      <label>Método<select id="e-method-${ex.id}" data-ef="method" data-ex="${ex.id}">${db.methods.map(m => `<option value="${m.id}" ${ex.method === m.id ? 'selected' : ''}>${esc(m.name)}</option>`).join('')}</select></label>
      <label>Intervalo<input id="e-rest-${ex.id}" data-ef="rest" data-ex="${ex.id}" value="${esc(ex.rest)}"></label>
      ${ex.items.map((id, k) => `<label>Medida${ex.items.length > 1 ? ' ' + L(k) : ''}<select id="e-meas-${ex.id}-${k}" data-meas="${k}" data-ex="${ex.id}"><option value="reps" ${measOf(ex, k) === 'reps' ? 'selected' : ''}>Séries × repetições</option><option value="tempo" ${measOf(ex, k) === 'tempo' ? 'selected' : ''}>Séries × tempo (seg)</option></select></label>`).join('')}
    </div>
    <div class="sered"><span class="lbl2">Séries</span>
      ${ex.series.map((s, k) => `<div class="serow">${dot(s.type)}<span class="sn3">${k + 1}</span>
        <select id="sr-t-${ex.id}-${k}" data-srt="${k}" data-ex="${ex.id}" aria-label="Tipo da série ${k + 1}">${Object.entries(STYPES).map(([t, o]) => `<option value="${t}" ${s.type === t ? 'selected' : ''}>${o.l}</option>`).join('')}</select>
        <input id="sr-r-${ex.id}-${k}" data-srr="${k}" data-ex="${ex.id}" value="${esc(s.reps)}" aria-label="Meta da série ${k + 1}" placeholder="${ex.items.every((_, j) => measOf(ex, j) === 'tempo') ? 'Segundos (ex.: 30 a 45)' : 'Reps'}">
        <button type="button" class="icon" data-act="sr-del" data-ex="${ex.id}" data-i="${k}" ${ex.series.length < 2 ? 'disabled' : ''} aria-label="Remover série ${k + 1}">✕</button></div>`).join('')}
      <div class="tools"><button type="button" class="icon" data-act="sr-add" data-ex="${ex.id}" data-v="trab">+ Série de trabalho</button><button type="button" class="icon" data-act="sr-add" data-ex="${ex.id}" data-v="aq">+ Aquecimento</button><button type="button" class="icon" data-act="sr-add" data-ex="${ex.id}" data-v="prep">+ Preparatória</button></div>
      <span class="hint">Aquecimento e preparatória entram antes das séries de trabalho. Em conjugado, separe as metas com + (12 a 15 + 12 a 15). ${ex.items.some((_, j) => measOf(ex, j) === 'tempo') ? 'Nas séries por tempo, escreva só os segundos (ex.: 30 a 45); o app mostra "s".' : ''}</span>
    </div>
    <label>Observação do personal para este aluno<textarea id="e-notes-${ex.id}" rows="2" data-ef="notes" data-ex="${ex.id}" placeholder="Opcional. A instrução de execução vem da biblioteca.">${esc(ex.notes)}</textarea></label>
    <div class="tools"><button class="icon" type="button" data-act="pick-open" data-v="${ex.id}">+ Conjugar</button><button class="icon" type="button" data-act="p-up" data-v="${ex.id}" ${i === 0 ? 'disabled' : ''}>↑ Subir</button><button class="icon" type="button" data-act="p-down" data-v="${ex.id}" ${i === n - 1 ? 'disabled' : ''}>↓ Descer</button><button class="icon danger" type="button" data-act="p-del" data-v="${ex.id}">Remover</button></div>
  </div>`;
}
function pickerHTML(t){
  return `<div class="picker"><div class="hd"><b>${t}</b><button type="button" class="icon" data-act="pick-close">Cancelar</button></div>
    <input id="pick-q" class="search" placeholder="Buscar ou digitar um exercício novo" autocomplete="off" value="${esc(state.picker.q)}">
    <div class="pres" id="pick-res">${pickResults()}</div></div>`;
}
function pickResults(){
  const q = norm(state.picker.q.trim());
  let items = db.library.filter(l => !q || norm(l.name).includes(q) || l.primary.some(m => norm(MNAME[m]).includes(q)));
  items = items.slice(0, q ? 20 : 12);
  const exact = db.library.some(l => norm(l.name) === q);
  return items.map(l => `<button type="button" data-act="pick" data-v="${l.id}">${esc(l.name)}<small>${esc(l.primary.map(m => MNAME[m]).join(', ') || 'Personalizado')}${pickRef(l.id)}</small></button>`).join('')
    + (q && !exact ? `<button type="button" class="new" data-act="pick-new">+ Criar "${esc(state.picker.q.trim())}" na biblioteca</button>` : '')
    + (!items.length && !q ? '<p class="muted small">Biblioteca vazia.</p>' : '');
}
function logCard(st, l, prMap, html){ return state.editLog === l.id ? logEditHTML(st, l) : html; }
function logViewHTML(st, l, prMap){
  return `<article class="log">
      <div class="loghd"><div><p class="eyebrow">${esc(dateBR(l.date, {weekday:'long', day:'2-digit', month:'2-digit'}))}${l.protocol ? ' · ' + esc(l.protocol) : ''}</p><h3>${esc(l.title)}</h3></div><button type="button" class="icon" data-act="log-edit" data-v="${l.id}">Editar</button></div>
      <div class="tablewrap"><table>${l.entries.map(e => `<tr><td>${esc(e.items.map(i => lib(i).name).join(' + '))}${(prMap[l.id] || []).some(p => p.exId === e.exId) ? '<span class="mpill inl gold">Recorde</span>' : ''}</td><td>${e.sets.map(x => `${dot(x.type || 'trab')} ` + esc(x.parts.map((p, pi) => (p.kg || '–') + ' kg × ' + (p.reps || '–') + (e.meas && e.meas[pi] === 'tempo' ? ' s' : '')).join(' + '))).join('<br>')}</td></tr>${e.comment ? `<tr class="c"><td colspan="2"><div class="cmt"><b>Observação</b>${esc(e.comment)}</div></td></tr>` : ''}`).join('')}</table></div>
    </article>`;
}
function logEditHTML(st, l){
  const d = state.logDraft;
  return `<article class="log editing" id="log-${l.id}">
    <div class="loghd"><div><p class="eyebrow">Corrigindo · ${esc(dateBR(l.date, {weekday:'long', day:'2-digit', month:'2-digit'}))}</p><h3>${esc(l.title)}</h3></div></div>
    ${d.entries.map((e, ei) => `<div class="le"><b class="le-n">${esc(e.items.map(i => lib(i).name).join(' + '))}</b>
      ${e.sets.map((x, si) => `<div class="le-row">${dot(x.type || 'trab')}<span class="sn3">${si + 1}</span>
        ${x.parts.map((p, pi) => `<label class="fld"><input id="le-kg-${ei}-${si}-${pi}" inputmode="decimal" autocomplete="off" data-le="kg" data-e="${ei}" data-s="${si}" data-p="${pi}" value="${esc(p.kg)}" aria-label="Carga da série ${si + 1}"><span>kg</span></label><label class="fld"><input id="le-rp-${ei}-${si}-${pi}" inputmode="numeric" autocomplete="off" data-le="reps" data-e="${ei}" data-s="${si}" data-p="${pi}" value="${esc(p.reps)}" aria-label="Repetições da série ${si + 1}"><span>reps</span></label>`).join('')}
        <label class="le-done"><input id="le-d-${ei}-${si}" type="checkbox" data-led="1" data-e="${ei}" data-s="${si}" ${x.done ? 'checked' : ''}> feita</label></div>`).join('')}
      <textarea id="le-c-${ei}" class="le-c" rows="1" data-lec="${ei}" placeholder="Observação">${esc(e.comment || '')}</textarea></div>`).join('')}
    <div class="tools"><button class="btn sm" type="button" data-act="log-save">Salvar correção</button><button class="btn sm quiet" type="button" data-act="log-cancel">Cancelar</button><button class="icon danger" type="button" data-act="log-del" data-v="${l.id}">Excluir treino</button></div>
  </article>`;
}
function histSection(st){
  const all = st.logs.slice().sort((a, b) => a.date < b.date ? 1 : -1), logs = all.slice(0, state.histN), prMap = prHistory(st).prs;
  if (!logs.length) return '';
  return `<section class="hsec"><div class="sechd"><p class="eyebrow">Seus últimos treinos</p><span class="muted small">Digitou errado? Toque em Editar.</span></div>
    ${logs.map(l => logCard(st, l, prMap, logViewHTML(st, l, prMap))).join('')}
    ${all.length > logs.length ? '<button class="btn block quiet" type="button" data-act="hist-more">Ver mais treinos</button>' : ''}</section>`;
}
function trackView(){
  const s = stu();
  const logs = s.logs.slice().reverse(), prMap = prHistory(s).prs;
  const hist = logs.length ? logs.map(l => logCard(s, l, prMap, `<article class="log">
      <div class="loghd"><div><p class="eyebrow">${esc(dateBR(l.date, {weekday:'long', day:'2-digit', month:'2-digit'}))}${l.protocol ? ' · ' + esc(l.protocol) : ''}${l.sample ? ' · exemplo' : ''}</p><h3>${esc(l.title)}</h3></div><button type="button" class="icon" data-act="log-edit" data-v="${l.id}">Editar</button></div>
      <div class="tablewrap"><table>${l.entries.map(e => `<tr><td>${esc(e.items.map(i => lib(i).name).join(' + '))}${methPill(e.method || (e.items.length > 1 ? 'conjugado' : 'normal'), 'inl')}${e.alt ? '<span class="mpill inl alt">Alternativa</span>' : ''}${(prMap[l.id] || []).some(p => p.exId === e.exId) ? '<span class="mpill inl gold">Recorde</span>' : ''}</td><td>${e.sets.map(st => st.parts.map((p, pi) => (p.kg || '–') + ' kg × ' + (p.reps || '–') + (e.meas && e.meas[pi] === 'tempo' ? ' s' : '')).join(' + ')).map(esc).join('<br>')}</td></tr>${e.comment ? `<tr class="c"><td colspan="2"><div class="cmt"><b>Observação</b>${esc(e.comment)}</div></td></tr>` : ''}`).join('')}</table></div>
    </article>`)).join('') : `<div class="empty">Quando ${esc(s.name.split(' ')[0])} finalizar um treino, as cargas, repetições e observações de cada exercício aparecem aqui.</div>`;
  return `<main class="wrap">
    <button class="back" type="button" data-act="p-back">← Alunos</button>
    <div class="sectionhead"><div><p class="eyebrow">Acompanhar</p><h2>${esc(s.name)}</h2></div></div>
    <label class="privn">Anotações privadas <span class="hint">Só você vê.</span><textarea id="t-priv" data-sf="privNotes" rows="2" placeholder="Lesões, preferências, horários, combinados...">${esc(s.privNotes || '')}</textarea></label>
    <div class="seg" role="group"><button type="button" data-act="ptab" data-v="hist" aria-pressed="${state.ptab === 'hist'}">Histórico</button><button type="button" data-act="ptab" data-v="evo" aria-pressed="${state.ptab === 'evo'}">Evolução</button><button type="button" data-act="ptab" data-v="cargas" aria-pressed="${state.ptab === 'cargas'}">Cargas</button></div>
    ${state.ptab === 'evo' ? evolution(s) : state.ptab === 'cargas' ? loadsView(s) : `<div class="loggrid">${hist}</div>`}
  </main>`;
}

/* ---------- personal: biblioteca ---------- */
function libraryView(){
  return `<main class="wrap">
    <div class="sectionhead"><div><p class="eyebrow">Painel do personal</p><h2>Biblioteca de exercícios</h2></div><span class="muted small">${db.library.length} exercícios</span></div>
    <div class="filters"><input id="lib-q" class="search" placeholder="Buscar exercício" value="${esc(state.libQ)}" autocomplete="off">
      <select id="lib-m" class="selbox" data-change="libm" aria-label="Filtrar por músculo"><option value="">Todos os músculos</option>${MUSCLES.map(([k, l]) => `<option value="${k}" ${state.libM === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
    <button class="btn block ghost" type="button" data-act="lib-new">+ Criar exercício personalizado</button>
    <div class="list libcols" id="lib-list">${libList()}</div>
  </main>`;
}
function libList(){
  const q = norm(state.libQ.trim());
  const items = db.library.filter(l => (!q || norm(l.name).includes(q)) && (!state.libM || l.primary.includes(state.libM) || l.secondary.includes(state.libM)));
  if (!items.length) return '<div class="empty">Nenhum exercício encontrado. Crie um personalizado.</div>';
  return items.map(libItem).join('');
}
function libItem(l){
  const open = state.libOpen === l.id, u = usage(l.id), yt = ytId(l.video);
  const chips = (key, cls) => `<div class="mchips ${cls}">${MUSCLES.map(([k, n]) => `<button type="button" data-act="lib-m" data-lib="${l.id}" data-key="${key}" data-v="${k}" aria-pressed="${l[key].includes(k)}">${n}</button>`).join('')}</div>`;
  const lv = {}; MUSCLES.forEach(([k]) => lv[k] = l.primary.includes(k) ? 2 : l.secondary.includes(k) ? 1 : 0);
  return `<article class="libitem ${open ? 'open' : ''}" id="lib-${l.id}">
    <div class="libhead"><div class="nm"><b>${esc(l.name)}${l.custom ? '<span class="tagc">Personalizado</span>' : ''}</b><small>${esc(l.primary.map(m => MNAME[m]).join(', ') || 'Sem músculos definidos')} · ${yt ? 'vídeo do YouTube' : l.video ? 'vídeo' : 'sem vídeo'} · ${u ? 'em ' + u + (u === 1 ? ' ficha' : ' fichas') : 'não usado'}</small></div>
      <button type="button" class="icon" data-act="lib-open" data-v="${l.id}" aria-expanded="${open}">${open ? 'Fechar' : 'Editar'}</button></div>
    ${open ? `<div class="libed">
      <label>Nome<input id="l-name-${l.id}" data-lf="name" data-lib="${l.id}" value="${esc(l.name)}"></label>
      <div class="libgrid"><div style="display:grid;gap:12px;min-width:0">
        <label>Músculos principais</label>${chips('primary', '')}
        <label>Músculos auxiliares</label>${chips('secondary', 'sec')}
      </div><div>${bodyMap(lv, true)}</div></div>
      <label>Como fazer<textarea id="l-ins-${l.id}" rows="3" data-lf="instructions" data-lib="${l.id}">${esc(l.instructions)}</textarea></label>
      <label>Vídeo do YouTube<input id="l-vid-${l.id}" type="url" data-lf="video" data-lib="${l.id}" value="${esc(l.video)}" placeholder="https://youtube.com/watch?v=... ou link de Shorts"></label>
      <span id="l-vst-${l.id}">${videoStatus(l)}</span>
      <div class="tools">${u ? `<span class="hint">Usado em ${u} ${u === 1 ? 'ficha' : 'fichas'}. Tire das fichas para poder apagar.</span>` : `<button type="button" class="icon danger" data-act="lib-del" data-v="${l.id}">Apagar da biblioteca</button>`}</div>
    </div>` : ''}
  </article>`;
}
function videoStatus(l){
  if (!l.video) return '<span class="hint">Cole o link de um vídeo seu (pode ser não listado). O aluno vê o botão "Ver execução".</span>';
  const id = ytId(l.video);
  return id ? `<span class="ytok">Vídeo do YouTube reconhecido. <a href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener" style="color:inherit">Testar</a></span>` : '<span class="ytbad">Não reconheci como link do YouTube. O aluno vai abrir o link como está.</span>';
}

/* ---------- personal: métodos ---------- */
function methodsView(){
  return `<main class="wrap">
    <div class="sectionhead"><div><p class="eyebrow">Painel do personal</p><h2>Técnicas e métodos</h2></div></div>
    <p class="note">O aluno vê o nome do método no exercício e toca nele para ler a explicação.</p>
    <div class="list mcols">${db.methods.map(m => { const u = methodUsage(m.id); return `<div class="edit-ex">
      <label>Nome<input id="m-name-${m.id}" data-mf="name" data-m="${m.id}" value="${esc(m.name)}"></label>
      <label>Explicação para o aluno<textarea id="m-desc-${m.id}" rows="2" data-mf="desc" data-m="${m.id}">${esc(m.desc)}</textarea></label>
      <div class="tools"><span class="hint">${u ? 'Usado em ' + u + (u === 1 ? ' exercício' : ' exercícios') : 'Ainda não usado'}</span>${m.id !== 'normal' && !u ? `<button type="button" class="icon danger" data-act="m-del" data-v="${m.id}">Apagar</button>` : ''}</div>
    </div>`; }).join('')}</div>
    <button class="btn block ghost" type="button" data-act="m-new">+ Novo método</button>
  </main>`;
}
function methodUsage(id){ let n = 0; db.students.forEach(s => Object.values(s.days).forEach(d => d.ex.forEach(e => { if (e.method === id) n++; }))); return n; }

/* ---------- render ---------- */
function render(){
  if (AUTH.screen !== 'app'){ document.body.classList.remove('pm'); app.innerHTML = authView(); return; }
  document.body.classList.toggle('pm', state.mode !== 'aluno');
  app.innerHTML = header() + (state.mode === 'aluno' ? studentView() : trainerView());
  drawCharts();
  if (state.done && state.mode === 'aluno') renderSticker();
}

/* ---------- timer ---------- */
const T = {el: document.getElementById('timer'), end: 0, total: 0, iv: null};
let wake = null;
async function keepAwake(){ try { if (!wake && navigator.wakeLock) { wake = await navigator.wakeLock.request('screen'); wake.addEventListener('release', () => wake = null); } } catch(e){} }
function startTimer(ex){
  const sec = restSecs(ex.rest);
  T.total = sec; T.end = Date.now() + sec * 1000;
  document.getElementById('tmeta').textContent = 'meta ' + ex.rest;
  T.el.hidden = false; T.el.classList.remove('over');
  clearInterval(T.iv); T.iv = setInterval(tick, 250); tick(); keepAwake();
}
function tick(){
  const left = (T.end - Date.now()) / 1000;
  document.getElementById('tclock').textContent = fmt(Math.ceil(Math.max(0, left)));
  document.getElementById('tfill').style.width = Math.min(100, 100 * (1 - Math.max(0, left) / (T.total || 1))) + '%';
  if (left <= 0){
    clearInterval(T.iv); T.el.classList.add('over');
    document.getElementById('tlabel').textContent = 'Bora, próxima série';
    try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch(e){}
  } else document.getElementById('tlabel').textContent = 'Descanso';
}
document.getElementById('tplus').addEventListener('click', () => {
  if (Date.now() > T.end){ T.end = Date.now(); T.total = 0; }
  T.end += 15000; T.total += 15; T.el.classList.remove('over'); clearInterval(T.iv); T.iv = setInterval(tick, 250); tick();
});
document.getElementById('tskip').addEventListener('click', () => { clearInterval(T.iv); T.el.hidden = true; });

let toastT;
function toast(msg){ const t = document.getElementById('toast'); t.className = 'toast'; t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, 2600); }
function toastHTML(html, cls){ const t = document.getElementById('toast'); t.className = 'toast ' + (cls || ''); t.innerHTML = html; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, 3400); }

/* ---------- events ---------- */
function findEx(id){ const s = stu(); for (const k in s.days){ const i = s.days[k].ex.findIndex(e => e.id === id); if (i > -1) return {list: s.days[k].ex, i, ex: s.days[k].ex[i]}; } return null; }
function arm(b, label, reset){
  if (b.hasAttribute('data-armed')) return true;
  b.setAttribute('data-armed', ''); b.textContent = label;
  setTimeout(() => { if (b.isConnected){ b.removeAttribute('data-armed'); b.textContent = reset; } }, 3200);
  return false;
}
function top(){ window.scrollTo(0, 0); }
function newLibItem(name){ const l = {id: 'c-' + uid(), name, primary: [], secondary: [], instructions: '', video: '', custom: true}; db.library.unshift(l); return l; }

document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const act = b.dataset.act, v = b.dataset.v;
  if (act === 'mode'){ state.done = null; state.editLog = null; state.mode = v; if (v === 'personal'){ state.pview = 'list'; state.psec = 'alunos'; } render(); top(); }
  else if (act === 'stab'){ state.done = null; state.editLog = null; state.stab = v; render(); top(); }
  else if (act === 'psec'){ state.psec = v; state.pview = 'list'; state.picker = null; render(); top(); }
  else if (act === 'day'){ state.day = v; state.dayPicked = true; state.sumOpen = false; render(); }
  else if (act === 'meth'){ const box = document.getElementById('mx-' + v); if (box){ box.hidden = !box.hidden; b.setAttribute('aria-expanded', !box.hidden); } }
  else if (act === 'goevo'){ state.stab = 'evolucao'; state.evoLib = v; render(); top(); }
  else if (act === 'evo'){ state.evoLib = v; render(); }
  else if (act === 'evomode'){ state.evoMode = v; render(); }
  else if (act === 'fper'){ state.fperiod = v; render(); }
  else if (act === 'set'){
    const exId = b.dataset.ex, si = +b.dataset.set, rec = drEx(exId), f = findEx(exId), st = stu();
    touchStart();
    const before = f ? draftPRs(st, f.ex, rec) : new Set();
    rec.sets[si] = rec.sets[si] || {parts: []};
    const s = rec.sets[si]; s.done = !s.done; s.parts = s.parts || [];
    if (f && s.done && targets(f.ex).every((_, k) => rec.sets[k] && rec.sets[k].done)){ delete state.openEx[exId]; setTimeout(() => { if (state.mode === 'aluno' && !state.done && !document.querySelector('.fconfirm')) render(); }, 900); }
    if (s.done && f) f.ex.items.forEach((_, pi) => ['kg', 'reps'].forEach(k => {
      const inp = document.getElementById((k === 'kg' ? 'kg-' : 'rp-') + exId + '-' + si + '-' + pi); s.parts[pi] = s.parts[pi] || {};
      if (inp && !inp.value && inp.placeholder){ inp.value = inp.placeholder; s.parts[pi][k] = inp.placeholder; } }));
    document.getElementById('set-' + exId + '-' + si).classList.toggle('done', s.done);
    b.setAttribute('aria-pressed', s.done);
    if (f){
      const after = draftPRs(st, f.ex, rec), used = usedItems(f.ex, rec);
      targets(f.ex).forEach((_, k) => { const row = document.getElementById('set-' + exId + '-' + k); if (row) row.classList.toggle('pr', f.ex.items.some((_, pi) => after.has(k + '-' + pi))); });
      const fresh = [...after].filter(x => !before.has(x));
      if (fresh.length){ const [fs, fp] = fresh[fresh.length - 1].split('-').map(Number); const p = rec.sets[fs].parts[fp];
        toastHTML(`${ICON_TROPHY}<span>Novo recorde! ${esc(lib(used[fp]).name)}: ${esc(markTxt({kg: numKg(p.kg) || 0, reps: p.reps, t: measOf(f.ex, fp) === 'tempo'}))}</span>`, 'gold'); }
      if (s.done) startTimer(f.ex);
    }
    const p = document.getElementById('prog'); if (p) p.textContent = progText(stu().days[state.day]);
    save();
  }
  else if (act === 'finish'){
    const st = stu(), d = st.days[state.day], dr = draft(), entries = [];
    if (!b.dataset.force){
      let open = 0; d.ex.forEach(ex => targets(ex).forEach((_, si) => { if (!(dr[ex.id] && dr[ex.id].sets && dr[ex.id].sets[si] && dr[ex.id].sets[si].done)) open++; }));
      if (open > 0){ const fa = document.getElementById('finish-area');
        if (fa){ fa.innerHTML = `<div class="fconfirm" role="alert"><p><b>Faltam ${open} ${open === 1 ? 'série' : 'séries'} sem marcar.</b> Finalizar mesmo assim? Séries não marcadas não entram no volume, nos recordes nem no resumo.</p>
          <div class="row"><button class="btn sm" type="button" data-act="finish" data-force="1">Finalizar assim</button><button class="btn sm quiet" type="button" data-act="finish-cancel">Continuar treino</button></div></div>`; fa.scrollIntoView({block:'center'}); }
        return; }
    }
    const achBefore = new Set(unlocked(st).map(a => a.id));
    d.ex.forEach(ex => {
      const rec = dr[ex.id]; if (!rec) return;
      const used = usedItems(ex, rec);
      const sets = targets(ex).map((_, si) => { const s = (rec.sets || {})[si] || {};
        return {done: !!s.done, type: stypeOf(ex, si), parts: used.map((_, pi) => ({kg: (s.parts && s.parts[pi] && s.parts[pi].kg) || '', reps: (s.parts && s.parts[pi] && s.parts[pi].reps) || ''}))}; });
      const comment = (rec.comment || '').trim();
      if (comment || sets.some(s => s.done || s.parts.some(p => p.kg || p.reps))) entries.push({exId: ex.id, items: used, alt: used.some((u, k) => u !== ex.items[k]), method: ex.method, meas: ex.items.map((_, k) => measOf(ex, k)), sets, comment});
    });
    if (!entries.length){ toast('Marque ou preencha pelo menos uma série'); return; }
    const now = new Date().toISOString(), id = uid(), start = (db.draftMeta || {})[draftKey()];
    st.logs.push({id, date: now, day: state.day, title: d.title, protocol: st.protocol, entries});
    st.last = now; delete db.drafts[draftKey()]; if (db.draftMeta) delete db.draftMeta[draftKey()];
    const newAch = unlocked(st).filter(a => !achBefore.has(a.id)).map(a => a.id);
    save(); T.el.hidden = true; clearInterval(T.iv);
    state.done = {logId: id, start, newAch}; state.dayPicked = false;
    render(); top();
  }
  else if (act === 'save-sticker'){ saveSticker(); }
  else if (act === 'feedf'){ state.feedF = v; state.feedN = 20; render(); }
  else if (act === 'feed-more'){ state.feedN += 20; render(); }
  else if (act === 'feed-seen'){ db.seen = db.seen || {}; if (db.seen[v]) delete db.seen[v]; else db.seen[v] = true; save(); render(); }
  else if (act === 'feed-allread'){ db.seen = db.seen || {}; allLogs().forEach(x => db.seen[x.l.id] = true); save(); render(); toast('Tudo marcado como lido'); }
  else if (act === 'feed-open'){ db.seen = db.seen || {}; db.seen[b.dataset.log] = true; save(); state.sid = v; state.psec = 'alunos'; state.pview = 'track'; state.ptab = 'hist'; render(); const el = document.querySelector('[data-act="log-edit"][data-v="' + b.dataset.log + '"]'); if (el){ const art = el.closest('.log'); if (art){ art.scrollIntoView({block: 'start'}); art.classList.add('flash'); } } }
  else if (act === 'cd-add'){ const d0 = stu().days[state.editDay]; d0.cardio = d0.cardio || []; d0.cardio.push({mod:'', dur:'', int:'', when: d0.ex.length ? 'depois' : 'livre', obs:''}); save(); render(); const i = document.getElementById('cd-mod-' + (d0.cardio.length - 1)); if (i){ i.focus(); i.scrollIntoView({block:'center'}); } }
  else if (act === 'cd-del'){ const d0 = stu().days[state.editDay]; if (!arm(b, 'Confirmar remoção', 'Remover cardio')) return; d0.cardio.splice(+b.dataset.i, 1); save(); render(); }
  else if (act === 'sum-open'){ state.sumOpen = true; render(); }
  else if (act === 'sum-close'){ state.sumOpen = false; render(); }
  else if (act === 'ob-next'){ state.obStep++; render(); }
  else if (act === 'ob-skip'){ db.onboarded = db.onboarded || {}; db.onboarded[stu().id] = true; state.obStep = 0; save(); render(); top(); }
  else if (act === 'ob-reset'){ if (db.onboarded) delete db.onboarded[stu().id]; state.obStep = 0; save(); render(); }
  else if (act === 'new-open'){ state.newOpen = !state.newOpen; render(); const i = document.getElementById('new-name'); if (i) i.focus(); }
  else if (act === 'copy-open'){ const s0 = stu(); const other = db.students.find(x => x.id !== s0.id);
    state.copy = {mode: v, sid: v === 'all' ? '' : s0.id, day: null}; render(); const cp = document.querySelector('.copyp'); if (cp) cp.scrollIntoView({block:'center'}); }
  else if (act === 'copy-cancel'){ state.copy = null; render(); }
  else if (act === 'cp-day'){ if (state.copy){ state.copy.day = v; render(); } }
  else if (act === 'copy-do'){
    const c = state.copy, src = stu(), tgt = c && db.students.find(x => x.id === c.sid); if (!tgt) return;
    if (c.mode === 'day'){ if (!c.day) return; tgt.days[c.day] = cloneDay(src.days[state.editDay]); state.sid = tgt.id; state.editDay = c.day;
      toast(`Treino copiado para ${isSeq(tgt) ? slotFull(tgt, c.day) : slotFull(tgt, c.day).toLowerCase()}${tgt.id !== src.id ? ' de ' + tgt.name.split(' ')[0] : ''}. Agora é só ajustar.`); }
    else { tgt.days = cloneDays(src.days); tgt.schedule = src.schedule; tgt.perWeek = src.perWeek; state.sid = tgt.id; state.editDay = 'seg'; toast(`Ficha copiada para ${tgt.name.split(' ')[0]}. Agora é só ajustar.`); }
    state.copy = null; save(); render(); top(); }
  else if (act === 'imp-start'){ state.imp = {stage: 'pick', target: v || 'new', from: state.pview}; impFile = null; state.pview = 'import'; state.copy = null; render(); top(); }
  else if (act === 'imp-cancel'){ if (impCtl) impCtl.abort(); const from = state.imp && state.imp.from; state.imp = null; impFile = null; state.pview = from === 'edit' ? 'edit' : 'list'; render(); top(); }
  else if (act === 'imp-go'){ runImport(); }
  else if (act === 'imp-stop'){ if (impCtl) impCtl.abort(); }
  else if (act === 'imp-retry'){ if (state.imp){ state.imp.stage = 'pick'; render(); } }
  else if (act === 'imp-del'){ const [k, ei] = v.split('|'); state.imp.data.dias[k].exercicios.splice(+ei, 1); render(); }
  else if (act === 'imp-save'){ saveImport(); }
  else if (act === 'ex-open'){ state.openEx[v] = true; render(); const el = document.getElementById('set-' + v + '-0'); if (el) el.scrollIntoView({block:'center'}); }
  else if (act === 'ex-close'){ delete state.openEx[v]; render(); }
  else if (act === 'finish-cancel'){ const fa = document.getElementById('finish-area'); if (fa) fa.innerHTML = '<button class="btn block" type="button" data-act="finish">Finalizar treino</button>'; }
  else if (act === 'log-edit'){ const l = stu().logs.find(x => x.id === v); if (!l) return; state.editLog = v; state.logDraft = JSON.parse(JSON.stringify(l)); render(); const el = document.getElementById('log-' + v); if (el) el.scrollIntoView({block:'start'}); }
  else if (act === 'log-cancel'){ state.editLog = null; state.logDraft = null; render(); }
  else if (act === 'log-save'){ const st = stu(), l = st.logs.find(x => x.id === state.editLog); if (l && state.logDraft){ l.entries = state.logDraft.entries; dataVer++; save(); } state.editLog = null; state.logDraft = null; render(); toast('Treino corrigido. Gráficos e recordes atualizados.'); }
  else if (act === 'log-del'){ if (!arm(b, 'Toque de novo para excluir', 'Excluir treino')) return; const st = stu(); st.logs = st.logs.filter(x => x.id !== v); st.last = st.logs.reduce((m, x) => !m || x.date > m ? x.date : m, null); dataVer++; state.editLog = null; state.logDraft = null; save(); render(); toast('Treino excluído'); }
  else if (act === 'hist-more'){ state.histN += 10; render(); }
  else if (act === 'done-close'){ state.done = null; render(); top(); }
  else if (act === 'swap'){ const rec = drEx(b.dataset.ex); rec.swap = rec.swap || {}; const k = +b.dataset.i; rec.swap[k] = !rec.swap[k]; save(); render(); }
  else if (act === 'alt-del'){ const f = findEx(b.dataset.ex); if (f && f.ex.alt){ f.ex.alt[+b.dataset.i] = null; save(); render(); } }
  else if (act === 'st-del'){ if (!arm(b, 'Toque de novo para remover o aluno e o histórico', 'Remover aluno')) return; db.students = db.students.filter(x => x.id !== v); state.sid = db.students[0] && db.students[0].id; state.pview = 'list'; save(); render(); top(); toast('Aluno removido'); }
  else if (act === 'nudge'){
    const st = db.students.find(x => x.id === v); if (!st) return; const msg = nudgeMsg(st);
    const fallback = () => { const row = b.closest('.attn-row'); if (!row) return; let ta = row.nextElementSibling;
      if (!ta || !ta.classList.contains('nudgebox')){ row.insertAdjacentHTML('afterend', `<textarea class="nudgebox" readonly rows="3" aria-label="Mensagem para copiar">${esc(msg)}</textarea>`); ta = row.nextElementSibling; }
      ta.focus(); ta.select(); toast('Selecione e copie a mensagem abaixo'); };
    try { navigator.clipboard.writeText(msg).then(() => toast('Mensagem copiada. É só colar no WhatsApp.'), fallback); } catch(e){ fallback(); }
  }
  else if (act === 'p-edit'){ state.sid = v; state.pview = 'edit'; state.editDay = 'seg'; state.picker = null; render(); top(); }
  else if (act === 'p-track'){ state.sid = v; state.pview = 'track'; state.ptab = 'hist'; render(); top(); }
  else if (act === 'ptab'){ state.editLog = null; state.ptab = v; state.loadLib = null; render(); }
  else if (act === 'load-open'){ state.loadLib = v; render(); top(); }
  else if (act === 'load-back'){ state.loadLib = null; render(); }
  else if (act === 'load-chart'){ state.ptab = 'evo'; state.evoLib = v; state.loadLib = null; render(); top(); }
  else if (act === 'new-proto'){ const st = stu(); const from = st.protocol; st.protocol = nextProto(from); st.protocolStart = new Date().toISOString(); save(); render(); toast(`${st.protocol} iniciado. O histórico do ${from || 'protocolo anterior'} continua salvo.`); }
  else if (act === 'p-open'){ state.sid = v; state.mode = 'aluno'; state.stab = 'treino'; state.dayPicked = false; if (!isSeq(stu())) state.day = todayKey; render(); top(); }
  else if (act === 'p-back'){ state.pview = 'list'; state.picker = null; render(); top(); }
  else if (act === 'p-day'){ state.editDay = v; state.picker = null; render(); }
  else if (act === 'pick-open'){ state.picker = {target: v, q: ''}; render(); const q = document.getElementById('pick-q'); if (q){ q.focus(); q.scrollIntoView({block:'center'}); } }
  else if (act === 'pick-close'){ state.picker = null; render(); }
  else if (act === 'pick' || act === 'pick-new'){
    let l, created = false;
    if (act === 'pick-new'){ l = newLibItem(state.picker.q.trim()); created = true; } else l = lib(v);
    const day = stu().days[state.editDay];
    if (String(state.picker.target).startsWith('swap:')){ const [, exId, k] = state.picker.target.split(':'); const f = findEx(exId);
      if (f){ const from = lib(f.ex.items[+k]).name; f.ex.items[+k] = l.id; if (f.ex.alt) f.ex.alt[+k] = null; if (l.defMeas){ f.ex.meas = f.ex.items.map((_, j) => j === +k ? l.defMeas : measOf(f.ex, j)); } state.picker = null; save(); render(); toast(`${from} trocado por ${l.name}`); }
      return; }
    if (String(state.picker.target).startsWith('alt:')){ const [, exId, k] = state.picker.target.split(':'); const f = findEx(exId); if (f){ f.ex.alt = f.ex.alt || []; f.ex.alt[+k] = l.id; } }
    else if (state.picker.target === 'new'){ const ne = P([l.id], 3, l.defMeas === 'tempo' ? '30 a 45' : '10 a 12', '1:30 a 2:00'); ne.meas = [l.defMeas || 'reps']; day.ex.push(ne); }
    else { const f = findEx(state.picker.target); if (f){ f.ex.items.push(l.id); f.ex.meas = f.ex.items.map((_, j) => j === f.ex.items.length - 1 ? (l.defMeas || 'reps') : measOf(f.ex, j)); if (f.ex.method === 'normal') f.ex.method = 'conjugado'; f.ex.series.forEach(s => s.reps = s.reps + ' + ' + (s.type === 'trab' ? '10 a 12' : '12')); } }
    state.picker = null; save(); render();
    toast(created ? 'Criado na biblioteca. Complete músculos e vídeo por lá.' : l.name + ' adicionado');
  }
  else if (act === 'p-unpart'){
    const f = findEx(b.dataset.ex); const k = +b.dataset.i; if (!f) return;
    f.ex.items.splice(k, 1); if (f.ex.meas) f.ex.meas.splice(k, 1);
    f.ex.series.forEach(s => { const ps = String(s.reps).split(/\s*\+\s*/); if (ps.length > 1) ps.splice(k, 1); s.reps = ps.join(' + '); });
    if (f.ex.items.length === 1 && f.ex.method === 'conjugado') f.ex.method = 'normal';
    save(); render();
  }
  else if (act === 'sr-add'){
    const f = findEx(b.dataset.ex); if (!f) return; const t = v, list = f.ex.series;
    const parts = f.ex.items.length;
    if (t === 'trab'){ const last = list[list.length - 1]; list.push({type:'trab', reps: last && last.type === 'trab' ? last.reps : Array(parts).fill('10 a 12').join(' + ')}); }
    else { const at = t === 'aq' ? list.filter(s => s.type === 'aq').length : list.filter(s => s.type !== 'trab').length;
      list.splice(at, 0, {type: t, reps: Array(parts).fill(t === 'aq' ? '12' : '6 a 8').join(' + ')}); }
    save(); render();
  }
  else if (act === 'sr-del'){ const f = findEx(b.dataset.ex); if (!f || f.ex.series.length < 2) return; f.ex.series.splice(+b.dataset.i, 1); save(); render(); }
  else if (act === 'p-up' || act === 'p-down'){
    const f = findEx(v); if (!f) return; const j = f.i + (act === 'p-up' ? -1 : 1);
    if (j < 0 || j >= f.list.length) return; [f.list[f.i], f.list[j]] = [f.list[j], f.list[f.i]]; save(); render();
  }
  else if (act === 'p-del'){ if (!arm(b, 'Confirmar remoção', 'Remover')) return; const f = findEx(v); if (f){ f.list.splice(f.i, 1); save(); render(); toast('Exercício removido da ficha'); } }
  else if (act === 'go-lib'){ state.psec = 'lib'; state.libOpen = v; state.libQ = ''; state.libM = ''; render(); const el = document.getElementById('lib-' + v); if (el) el.scrollIntoView({block:'start'}); }
  else if (act === 'lib-open'){ state.libOpen = state.libOpen === v ? null : v; document.getElementById('lib-list').innerHTML = libList(); }
  else if (act === 'lib-new'){ const l = newLibItem('Novo exercício'); state.libOpen = l.id; state.libQ = ''; state.libM = ''; save(); render(); const i = document.getElementById('l-name-' + l.id); if (i){ i.focus(); i.select(); } }
  else if (act === 'lib-m'){
    const l = lib(b.dataset.lib), key = b.dataset.key, other = key === 'primary' ? 'secondary' : 'primary';
    const arr = l[key], ix = arr.indexOf(v);
    if (ix > -1) arr.splice(ix, 1); else { arr.push(v); const o = l[other].indexOf(v); if (o > -1) l[other].splice(o, 1); }
    save(); const el = document.getElementById('lib-' + l.id); if (el) el.outerHTML = libItem(l);
  }
  else if (act === 'lib-del'){ if (!arm(b, 'Toque de novo para apagar', 'Apagar da biblioteca')) return; db.library = db.library.filter(l => l.id !== v); state.libOpen = null; save(); document.getElementById('lib-list').innerHTML = libList(); toast('Exercício apagado'); }
  else if (act === 'm-new'){ const m = {id: 'm-' + uid(), name: 'Novo método', desc: ''}; db.methods.push(m); save(); render(); const i = document.getElementById('m-name-' + m.id); if (i){ i.focus(); i.select(); } }
  else if (act === 'm-del'){ if (!arm(b, 'Confirmar', 'Apagar')) return; db.methods = db.methods.filter(m => m.id !== v); save(); render(); }
  else if (act === 'logout'){ if (hasPending() && !arm(b, 'Há dados ainda não enviados. Toque de novo para sair mesmo assim', 'Sair')) return; logout(); }
  else if (act === 'auth-view'){ AUTH.view = v; AUTH.err = AUTH.msg = ''; render(); top(); }
  else if (act === 'auth-retry'){ AUTH.err = ''; if (AUTH.user) enter(AUTH.user); else boot(); }
  else if (act === 'pw-toggle'){ const i = document.getElementById(v); if (i){ i.type = i.type === 'password' ? 'text' : 'password'; b.setAttribute('aria-label', i.type === 'password' ? 'Mostrar senha' : 'Esconder senha'); } }
  else if (act === 'invite'){ const st = db.students.find(x => x.id === v); if (st) shareText(inviteMsg(st), 'Convite copiado. Cole no WhatsApp do aluno.'); }
  else if (act === 'reset'){ if (!arm(b, 'Toque de novo para apagar tudo e restaurar', 'Restaurar dados de exemplo')) return; db = seed(); state.sid = db.students[0].id; save(); render(); toast('Dados de exemplo restaurados'); }
});

document.addEventListener('change', e => {
  const t = e.target, c = t.dataset.change;
  if (c === 'cpst'){ if (state.copy){ state.copy.sid = t.value; render(); } return; }
  if (c === 'imptarget'){ if (state.imp) state.imp.target = t.value; return; }
  if (t.id === 'imp-file'){ impFile = t.files && t.files[0] || null; render(); return; }
  if (t.dataset.implib){ const [k, ei, ii] = t.dataset.implib.split('|'); state.imp.data.dias[k].exercicios[+ei].itens[+ii].choice = t.value; t.classList.toggle('isnew', t.value === '__new'); return; }
  if (c === 'viewas'){ state.sid = t.value; state.evoLib = null; state.dayPicked = false; if (!isSeq(stu())) state.day = todayKey; render(); return; }
  if (t.dataset.sched !== undefined){ const st = stu(); st.schedule = t.value; if (st.schedule === 'seq' && !st.perWeek) st.perWeek = String(seqSlots(st).length || 3); save(); render(); return; }
  if (c === 'evo'){ state.evoLib = t.value; render(); return; }
  if (c === 'libm'){ state.libM = t.value; document.getElementById('lib-list').innerHTML = libList(); return; }
  if (t.dataset.led && state.logDraft){ state.logDraft.entries[+t.dataset.e].sets[+t.dataset.s].done = t.checked; return; }
  if (t.dataset.meas !== undefined){ const f = findEx(t.dataset.ex); if (f){ f.ex.meas = f.ex.items.map((_, j) => j === +t.dataset.meas ? t.value : measOf(f.ex, j)); save(); render(); } return; }
  if (t.dataset.srt !== undefined){ const f = findEx(t.dataset.ex); if (f){ f.ex.series[+t.dataset.srt].type = t.value; save(); render(); } return; }
  if (t.dataset.ef === 'method' || t.dataset.ef === 'warmup'){ const f = findEx(t.dataset.ex); if (f){ f.ex[t.dataset.ef] = t.type === 'checkbox' ? t.checked : t.value; save(); if (t.dataset.ef === 'method') render(); } }
  if (t.dataset.ef === 'sets'){ render(); }
});

document.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.in){
    touchStart();
    const rec = drEx(t.dataset.ex), si = +t.dataset.set, pi = +t.dataset.part;
    rec.sets[si] = rec.sets[si] || {parts: []};
    const s = rec.sets[si]; s.parts = s.parts || []; s.parts[pi] = s.parts[pi] || {};
    s.parts[pi][t.dataset.in] = t.value.replace(',', '.');
    save(); return;
  }
  if (t.dataset.le && state.logDraft){ const p = state.logDraft.entries[+t.dataset.e].sets[+t.dataset.s].parts[+t.dataset.p]; p[t.dataset.le] = t.value.replace(',', '.'); return; }
  if (t.dataset.lec !== undefined && state.logDraft){ state.logDraft.entries[+t.dataset.lec].comment = t.value; return; }
  if (t.dataset.cm){ drEx(t.dataset.cm).comment = t.value; save(); return; }
  if (t.id === 'pick-q'){ state.picker.q = t.value; document.getElementById('pick-res').innerHTML = pickResults(); return; }
  if (t.id === 'stu-q'){ const q = norm(t.value.trim()); let any = false; document.querySelectorAll('article.stu').forEach(r => { r.hidden = !!q && !r.dataset.name.includes(q); if (!r.hidden) any = true; }); const n = document.getElementById('stu-none'); if (n) n.hidden = any; return; }
  if (t.id === 'load-q'){ const q = norm(t.value.trim()); document.querySelectorAll('#load-list .loadrow').forEach(r => r.hidden = !!q && !r.dataset.name.includes(q)); return; }
  if (t.id === 'lib-q'){ state.libQ = t.value; document.getElementById('lib-list').innerHTML = libList(); return; }
  if (t.dataset.lf){ const l = lib(t.dataset.lib); l[t.dataset.lf] = t.value; save();
    if (t.dataset.lf === 'video'){ const s = document.getElementById('l-vst-' + l.id); if (s) s.innerHTML = videoStatus(l); }
    return; }
  if (t.dataset.mf){ const m = meth(t.dataset.m); m[t.dataset.mf] = t.value; save(); return; }
  if (t.dataset.imp && state.imp){ state.imp.data[t.dataset.imp] = t.value; return; }
  if (t.dataset.impday && state.imp){ state.imp.data.dias[t.dataset.impday].titulo = t.value; return; }
  if (t.dataset.setwa){ const n = t.value.replace(/\D/g, ''); db.settings = db.settings || {}; db.settings.wa = n ? (n.length <= 11 ? '55' + n : n) : ''; save(); return; }
  if (t.dataset.sf){ stu()[t.dataset.sf] = t.dataset.sf === 'email' ? t.value.trim().toLowerCase() : t.value; save(); return; }
  if (t.dataset.dt){ stu().days[state.editDay].title = t.value; save(); return; }
  if (t.dataset.cd){ const d0 = stu().days[state.editDay]; if (d0.cardio && d0.cardio[+t.dataset.i]){ d0.cardio[+t.dataset.i][t.dataset.cd] = t.value; save(); } return; }
  if (t.dataset.srr !== undefined){ const f = findEx(t.dataset.ex); if (f){ f.ex.series[+t.dataset.srr].reps = t.value; save(); } return; }
  if (t.dataset.ef && t.type !== 'checkbox' && t.tagName !== 'SELECT'){
    const f = findEx(t.dataset.ex); if (!f) return;
    f.ex[t.dataset.ef] = t.dataset.ef === 'sets' ? Math.max(1, Math.min(10, parseInt(t.value) || 1)) : t.value;
    save();
  }
});

document.addEventListener('toggle', e => { const t = e.target; if (t.id === 'sdata') state.sdataOpen = t.open; if (t.id === 'volc') state.volOpen = t.open; }, true);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape'){ if (state.sumOpen){ state.sumOpen = false; render(); } }
  if (e.key === 'Enter' && e.target.id === 'pick-q'){ e.preventDefault(); const first = document.querySelector('#pick-res button'); if (first) first.click(); }
});

document.addEventListener('submit', e => {
  if (e.target.id !== 'newst') return;
  e.preventDefault();
  const inp = document.getElementById('new-name'), name = inp.value.trim();
  if (!name){ inp.focus(); return; }
  const days = {}; DAYS.forEach(x => days[x.k] = {title: x.k === 'dom' ? 'Descanso' : '', ex: []});
  const fromId = (document.getElementById('new-from') || {}).value, src = fromId && db.students.find(x => x.id === fromId);
  const em = ((document.getElementById('new-email') || {}).value || '').trim().toLowerCase();
  const s = {id: uid(), name, email: em, protocol: 'Protocolo 1', focus: src ? src.focus : '', cardio: '', privNotes: '', schedule: src ? src.schedule : 'fixo', perWeek: src ? src.perWeek : '', days: src ? cloneDays(src.days) : days, logs: [], last: null};
  db.students.push(s); save();
  state.sid = s.id; state.pview = 'edit'; state.editDay = 'seg'; state.newOpen = false; render(); top();
  toast(name.split(' ')[0] + ' adicionado. Monte a ficha.');
});

boot();
})();
