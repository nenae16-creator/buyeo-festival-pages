// Festival map/app demo (Buyeo / Baekje Culture Foundation edition, Siheung engine) – vanilla JS SPA, fully driven by data/festival.json
import * as I from './icons.js';
import * as A from './art.js';

const root = document.getElementById('root');
let DATA = null, cleanup = [];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const $ = (s, el = root) => el.querySelector(s);
const $$ = (s, el = root) => [...el.querySelectorAll(s)];

// ---------- navigation ----------
// Hash routing (#/program?day=…) so the app works from file:// (double-click) as well as from a web server.
function route() {
  const h = location.hash.startsWith('#/') ? location.hash.slice(1) : '/';
  const [path, qs = ''] = h.split('?');
  return { path: path || '/', query: new URLSearchParams(qs) };
}
function navigate(path) { if ('#' + path === location.hash) render(); else location.hash = path; }
function replaceRoute(path) { history.replaceState(null, '', '#' + path); }
function onClickLink(url) {
  if (!url) return alert('추후 업데이트 예정입니다.');
  if (/^https?:\/\//.test(url)) return window.open(url, '_blank', 'noopener');
  if (url.startsWith('tel:')) { document.location.href = url; return; }
  navigate(url);
}
root.addEventListener('click', e => {
  const t = e.target.closest('[data-url]'); if (t) { e.preventDefault(); onClickLink(t.dataset.url); return; }
  if (e.target.closest('[data-back]')) { e.preventDefault(); history.length > 1 ? history.back() : navigate('/'); }
});
window.addEventListener('hashchange', render);

function applyTheme(t) {
  const r = document.documentElement.style;
  r.setProperty('--main', t.main); r.setProperty('--bg', t.bg); r.setProperty('--sub', t.sub); r.setProperty('--accent', t.accent); r.setProperty('--font', t.font);
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', t.bg);
}

// ---------- slider ----------
function slider(el, count, { interval = 3500, dots = null } = {}) {
  if (!el || count < 2) return;
  const track = $('.track', el); let i = 0, timer, sx = null;
  const go = n => { i = (n + count) % count; track.style.transform = `translateX(-${i * 100}%)`; if (dots) $$('span', dots).forEach((d, k) => d.classList.toggle('on', k === i)); };
  const start = () => { clearInterval(timer); timer = setInterval(() => go(i + 1), interval); };
  el.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
  el.addEventListener('touchend', e => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) { go(i + (dx < 0 ? 1 : -1)); start(); } sx = null; });
  if (dots) $$('span', dots).forEach((d, k) => d.addEventListener('click', ev => { ev.stopPropagation(); go(k); start(); }));
  go(0); start(); cleanup.push(() => clearInterval(timer));
}

// ---------- language (best-effort machine translation, as in the original platform) ----------
const LANGS = [{ text: 'KOR', code: 'ko' }, { text: 'ENG', code: 'en' }, { text: 'CHN', code: 'zh-CN' }, { text: 'JPN', code: 'ja' }];
const getLang = () => localStorage.getItem('language') || 'ko';
const tcache = JSON.parse(localStorage.getItem('demo:tcache') || '{}');
async function translatePage() {
  const lang = getLang(); if (lang === 'ko') return;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), nodes = [];
  while (w.nextNode()) if (/[가-힣]/.test(w.currentNode.nodeValue)) nodes.push(w.currentNode);
  for (const n of nodes) {
    const src = n.__o || (n.__o = n.nodeValue), key = lang + '|' + src;
    if (tcache[key]) { n.nodeValue = tcache[key]; continue; }
    try { const j = await (await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ko&tl=${lang}&dt=t&q=${encodeURIComponent(src)}`)).json(); n.nodeValue = tcache[key] = j[0].map(x => x[0]).join(''); } catch { }
  }
  localStorage.setItem('demo:tcache', JSON.stringify(tcache));
}
const langWidget = () => `<div class="lang"><div class="lang-btn" id="langBtn">${I.globe}${LANGS.find(l => l.code === getLang())?.text || 'KOR'}${I.caret}</div>
  <div class="lang-menu" id="langMenu" hidden>${LANGS.map(l => `<div data-lang="${l.code}" class="${l.code === getLang() ? 'on' : ''}">${l.text}</div>`).join('')}</div></div>`;
function bindLang() {
  const b = $('#langBtn'), m = $('#langMenu'); if (!b) return;
  b.onclick = e => { e.stopPropagation(); m.hidden = !m.hidden; };
  $$('[data-lang]', m).forEach(d => d.onclick = e => { e.stopPropagation(); localStorage.setItem('language', d.dataset.lang); render(); });
  const c = () => { m.hidden = true; }; document.addEventListener('click', c); cleanup.push(() => document.removeEventListener('click', c));
}

// ---------- shared ----------
const subHeader = (title, { cls = 'b1', right = '', tabs = '', bg = false } = {}) => `
  <div class="subhead-wrap"><div class="subhead ${bg ? 'bg' : cls}"><div class="l"><span data-back>${I.back}</span><h1>${esc(title)}</h1></div>${right}</div>${tabs}</div>
  <div class="spacer"></div>${tabs ? '<div class="spacer" style="height:46px"></div>' : ''}`;
const endedRibbon = () => DATA.endedNotice && todayISO() > DATA.festival.endDate ? `<div class="ended">${esc(DATA.endedNotice)}</div>` : '';
const demoBadge = () => `<div class="demo-badge">${esc(DATA.demoNotice)}</div>`;
const fmtDay = d => { const x = DATA.days.find(v => v.date === d); const [, m, dd] = d.split('-'); return `${+m}.${+dd}(${x?.dow || ''})`; };
const todayISO = () => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
const catOf = k => DATA.categories.find(c => c.key === k) || { name: k, color: '#666' };
const sortKey = p => { const m = (p.time || '').match(/(\d{1,2}):(\d{2})/); return m ? m[1].padStart(2, '0') + ':' + m[2] : '99'; };

// ---------- pages ----------
function Home() {
  const f = DATA.festival, h = DATA.home, ft = DATA.footer;
  const heroes = ['main', 'opening', 'shuttle'];
  const heroUrls = h.heroUrls || {};
  root.innerHTML = `<div class="app"><div class="page">
    <div class="home-header"><div class="inner"><span class="logo" data-url="/">${A.logo(f)}</span>${langWidget()}</div></div>
    <div class="spacer"></div>
    ${endedRibbon()}
    <div class="home-main">
      <div class="slider top" id="top"><div class="track">${heroes.map(k => `<div class="slide" data-url="${heroUrls[k]}">${A.heroBanner(k, f)}</div>`).join('')}</div>
        <div class="dots" id="dots">${heroes.map((_, k) => `<span class="${k ? '' : 'on'}"></span>`).join('')}</div></div>
      <div class="menu-card">${h.menu.map((m, k) => `${k ? '<div class="divider"></div>' : ''}<div class="menu-row"><div class="l"><span class="icon">${A.icon(m.icon)}</span><div class="t"><h1>${esc(m.name)}</h1><h2>${esc(m.summary)}</h2></div></div><button type="button" data-url="${esc(m.url)}">자세히 보기</button></div>`).join('')}</div>
      <div class="slider mid" id="mid"><div class="track"><div class="slide" data-url="${esc((h.midUrls || [])[0] || '/program')}">${A.midBanner()}</div><div class="slide" data-url="${esc((h.midUrls || [])[1] || '/program')}">${A.midBanner2()}</div></div></div>
      <div class="widgets">${h.widgets.map(w => `<div class="widget" data-url="${esc(w.url)}"><h2>${esc(w.description)}</h2><h1>${esc(w.name)}</h1><span class="wicon">${A.icon(w.icon)}</span></div>`).join('')}</div>
      <div class="down-widgets">${h.down.map(w => `<h1 data-url="${esc(w.url)}">${esc(w.name)}</h1>`).join('')}</div>
    </div>
    <div class="footer">
      <div class="sns"><a href="${esc(ft.instagram)}" target="_blank" rel="noopener" aria-label="인스타그램">${I.instagram}</a><a href="${esc(ft.youtube)}" target="_blank" rel="noopener" aria-label="유튜브">${I.youtube}</a></div>
      <h1>${esc(ft.name)}</h1>
      <button data-url="${esc(ft.officialUrl)}">공식 홈페이지 이동</button>
      <h2>${esc(ft.address)}\n${esc(ft.contact)}\n${esc(ft.copyright)}</h2>
      ${demoBadge()}
    </div>
  </div></div>`;
  slider($('#top'), heroes.length, { dots: $('#dots') }); slider($('#mid'), 2, { interval: 4000 }); bindLang();
}

function FestivalInfo() {
  const f = DATA.festival;
  const row = (k, v) => `<div class="kv"><span>${esc(k)}</span><b>${esc(v)}</b></div>`;
  root.innerHTML = `<div class="app"><div class="page">${subHeader('축제 정보', { bg: true })}
    <div class="finfo">${endedRibbon()}
      <div class="info-card"><p class="eyebrow">${esc(f.subTheme)}</p><h1 class="serif">${esc(f.theme)}</h1><p class="intro">${esc(f.intro)}</p>
        ${row('기간', f.dateLabel)}${row('장소', f.venueLabel + ' (' + f.venues.join(' · ') + ')')}${row('주행사장', f.mainVenue)}${row('운영시간', f.hours)}${row('관람료', f.fee)}${row('주최 / 주관', f.host + ' / ' + f.organizer)}</div>
      <div class="lineup-card" data-url="/program"><div class="body" style="border-radius:12px"><h1>날짜별 프로그램</h1><div class="go"><h2>확인하러 가기</h2>${I.chevronRight}</div></div></div>
      ${DATA.categories.map(c => `<button class="info-btn" data-url="/program?cat=${c.key}"><h1><i class="dot" style="background:${c.color}"></i>${esc(c.name)} 프로그램</h1><h2>${DATA.programs.filter(p => p.cat === c.key).length}개</h2></button>`).join('')}
      ${(DATA.infoButtons || []).map(b => `<button class="info-btn" data-url="${esc(b.url)}"><h1>${esc(b.name)}</h1><h2>${esc(b.value)}</h2></button>`).join('')}
    </div></div></div>`;
}

function programCard(p) {
  const c = catOf(p.cat);
  return `<div class="pcard"><div class="ptime">${esc(p.time || '시각 미공개')}</div><div class="pbody">
    <span class="chip-s" style="background:${c.color}">${esc(c.name)}</span><h3>${esc(p.title)}</h3>
    <p class="venue">${I.pin}${esc(p.venue)}</p>${p.desc ? `<p class="desc">${esc(p.desc)}</p>` : ''}
    ${p.performers.length ? `<p class="perf">출연 · ${p.performers.map(esc).join(', ')}</p>` : ''}${p.note ? `<p class="note">※ ${esc(p.note)}</p>` : ''}</div></div>`;
}
function Program() {
  const q = route().query;
  const days = DATA.days;
  let day = q.get('day'); if (day === 'today') day = todayISO();
  let idx = Math.max(0, days.findIndex(d => d.date === day));
  if (!day || days.findIndex(d => d.date === day) < 0) { const t = days.findIndex(d => d.date === todayISO()); idx = t >= 0 ? t : 0; }
  let cat = q.get('cat') || 'all';
  const draw = () => {
    const d = days[idx].date;
    const list = DATA.programs.filter(p => p.dates.includes(d) && (cat === 'all' || p.cat === cat));
    const timed = list.filter(p => !p.always).sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
    const always = list.filter(p => p.always);
    root.innerHTML = `<div class="app"><div class="page">${subHeader('프로그램 안내', { cls: 'b4', tabs: `<div class="tabs" id="dtabs">${days.map((x, k) => `<h1 data-i="${k}" class="${k === idx ? 'on' : ''}"><small>${esc(x.label)}</small>${fmtDay(x.date)}</h1>`).join('')}</div>` })}
      <div class="catbar">${[{ key: 'all', name: '전체', color: 'var(--main)' }, ...DATA.categories].map(c => `<span class="cchip ${c.key === cat ? 'on' : ''}" data-c="${c.key}" style="--c:${c.color}">${esc(c.name)}</span>`).join('')}</div>
      <div class="plist">
        <h2 class="sec">${fmtDay(d)} 시간별 프로그램 <span>${timed.length}</span></h2>
        ${timed.length ? timed.map(programCard).join('') : '<p class="empty-msg small">해당 날짜에 시간이 정해진 프로그램이 없습니다.</p>'}
        ${always.length ? `<h2 class="sec">상설·기간 운영 <span>${always.length}</span></h2>${always.map(programCard).join('')}` : ''}
        <p class="srcnote">${esc(DATA.programSourceNote || '')} 일정은 현장 사정에 따라 변경될 수 있습니다.</p>
      </div></div></div>`;
    $$('#dtabs h1').forEach(h => h.onclick = () => { idx = +h.dataset.i; replaceRoute(`/program?day=${days[idx].date}${cat !== 'all' ? '&cat=' + cat : ''}`); draw(); translatePage(); });
    $$('.cchip').forEach(h => h.onclick = () => { cat = h.dataset.c; replaceRoute(`/program?day=${days[idx].date}${cat !== 'all' ? '&cat=' + cat : ''}`); draw(); translatePage(); });
    $('#dtabs .on')?.scrollIntoView({ inline: 'center', block: 'nearest' });
  };
  draw();
}

function shuttleStatus() {
  const t = todayISO(), f = DATA.festival;
  if (t > f.endDate) return `${f.startDate.slice(0, 4)}년 축제 운행 종료 (참고용 안내)`;
  if (t < f.startDate) return `운행 예정 · ${DATA.shuttle.period}`;
  return '운행 기간입니다 · 배차간격은 위 안내 기준';
}
function Shuttle() {
  const s = DATA.shuttle;
  root.innerHTML = `<div class="app"><div class="page">${subHeader('셔틀버스 안내')}
    <div class="finfo" style="margin-top:12px">${endedRibbon()}
      <div class="info-card"><div class="kv"><span>운행 기간</span><b>${esc(s.period)}</b></div><div class="kv"><span>운행 시간</span><b>${esc(s.hours)}</b></div><div class="kv"><span>요금</span><b>${esc(s.fare)}</b></div></div>
      ${s.routes.map(r => `<div class="route"><div class="rhead" style="background:${r.color}"><b>${r.no}</b>${esc(r.name)}</div>
        <div class="rbody"><p class="interval">${esc(r.interval)}</p><ol class="stops">${r.stops.map(st => `<li><i style="border-color:${r.color}"></i>${esc(st)}</li>`).join('')}</ol>
        ${r.times ? `<table class="ttable"><tr><th>구간</th><th>첫차</th><th>막차</th></tr>${r.times.map(x => `<tr><td>${esc(x[0])}</td><td>${esc(x[1])}</td><td>${esc(x[2])}</td></tr>`).join('')}</table>` : ''}
        <p class="eta">${I.clock}${esc(shuttleStatus())}</p></div></div>`).join('')}
      ${(s.extra || []).map(x => `<div class="info-card"><h3 class="ctitle">${esc(x.title)}</h3><p class="cbody">${esc(x.body)}</p></div>`).join('')}
      <p class="srcnote">${esc(s.note)}<br>출처: ${esc(s.source)}</p>
      <button class="info-btn" data-url="/map?cat=shuttle"><h1>지도에서 정류장 보기</h1>${I.chevronRight}</button>
    </div></div></div>`;
}
function Parking() {
  const p = DATA.parking;
  root.innerHTML = `<div class="app"><div class="page">${subHeader('주차 안내')}
    <div class="finfo" style="margin-top:12px">
      <div class="info-card warn">${esc(p.intro)}</div>
      ${p.zones.map((z, k) => `<h2 class="sec">${esc(z.name)} <span>${esc(z.total)}</span></h2>
        <div class="info-card"><p class="tag">${esc(z.access)}</p>
        <table class="ttable"><tr><th>위치</th><th>면수</th><th>운영</th></tr>${z.lots.map(l => `<tr><td>${esc(l[0])}</td><td>${esc(l[1])}</td><td>${esc(l[2])}</td></tr>`).join('')}</table></div>`).join('')}
      <p class="srcnote">${esc(p.fee)}<br>출처: ${p.sources.map(esc).join('<br>')}</p>
      <button class="info-btn" data-url="/map?cat=parking"><h1>지도에서 주차장 보기</h1>${I.chevronRight}</button>
    </div></div></div>`;
}

function Posts(type) {
  const isEvent = type === 'event', items = DATA.notices.filter(n => n.type === (isEvent ? 'EVENT' : 'NOTICE'));
  root.innerHTML = `<div class="app"><div class="page">
    ${subHeader(isEvent ? '이벤트' : '공지사항', { cls: 'b2', tabs: `<div class="tabs2"><h1 style="left:25%" class="${isEvent ? '' : 'on'}" data-url="/post/notice">공지사항</h1><h1 style="left:75%" class="${isEvent ? 'on' : ''}" data-url="/post/event">이벤트</h1><div class="bar" style="left:${isEvent ? 75 : 25}%"></div></div>` })}
    <div class="list">${items.map(n => `<div class="post" data-url="${esc(n.url)}"><h3>${esc(n.title)}</h3><p>${esc(n.summary)}</p><span>${esc(n.date)} · 공식 누리집 ↗</span></div>`).join('') || '<div class="empty-msg">등록된 글이 없습니다.</div>'}</div></div></div>`;
}
function Faq() {
  root.innerHTML = `<div class="app"><div class="page">${subHeader('자주 묻는 질문')}
    <div class="finfo" style="margin-top:12px">${DATA.faq.map((f, k) => `<details class="faq" ${k ? '' : 'open'}><summary><b>Q</b>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}
    <p class="srcnote">${esc(DATA.faqSourceNote || '')}</p></div></div></div>`;
}

function MapPage() {
  const m = DATA.map, cats = m.categories;
  let cat = route().query.get('cat') || 'all';
  root.innerHTML = `<div class="app"><div class="map-page">
    <div class="map-head"><span data-back>${I.back}</span><h1>축제장 지도</h1></div>
    <div id="map"></div>
    <div class="chips">${cats.map(c => `<span class="chip ${c.key === cat ? 'on' : ''}" data-cat="${c.key}">${c.color ? `<i class="dot" style="background:${c.color}"></i>` : ''}${esc(c.name)}</span>`).join('')}</div>
    <button class="locate" id="locate" aria-label="현재 위치">${I.locate}</button>
    <div class="map-note">${esc(m.note || '● 실선: 좌표 확인 · ◌ 점선: 위치 근사(예시)')}</div>
  </div></div>`;
  const map = L.map('map', { zoomControl: false }).setView(m.center, m.zoom);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
  const layer = L.layerGroup().addTo(map);
  const color = k => cats.find(c => c.key === k)?.color || '#333';
  const draw = () => {
    layer.clearLayers(); const pts = [];
    m.markers.filter(x => cat === 'all' || x.cat === cat).forEach(x => {
      const html = `<div class="pin ${x.verified ? '' : 'approx'}" style="--c:${color(x.cat)}"><span></span></div>`;
      L.marker([x.lat, x.lng], { zIndexOffset: x.cat === 'venue' ? 1000 : 0, icon: L.divIcon({ className: '', html, iconSize: [28, 36], iconAnchor: [14, 34], popupAnchor: [0, -30] }) })
        .bindPopup(`<b>${esc(x.name)}</b><br>${esc(x.desc)}<br><small>${x.verified ? (x.source.includes('openstreetmap') ? '좌표: OpenStreetMap' : '좌표: 공식 누리집 지도 링크') : '⚠ 위치 근사(예시)'} · <a href="${esc(x.source)}" target="_blank" rel="noopener">출처</a></small>`).addTo(layer);
      pts.push([x.lat, x.lng]);
    });
    if (cat === 'all') map.setView(m.center, m.zoom); else if (pts.length > 1) map.fitBounds(pts, { padding: [60, 40], maxZoom: 17 }); else if (pts.length) map.setView(pts[0], 17);
  };
  draw();
  $$('.chip').forEach(c => c.onclick = () => { cat = c.dataset.cat; $$('.chip').forEach(o => o.classList.toggle('on', o === c)); draw(); });
  $('#locate').onclick = () => navigator.geolocation?.getCurrentPosition(p => { map.setView([p.coords.latitude, p.coords.longitude], 17); L.circleMarker([p.coords.latitude, p.coords.longitude], { radius: 8, color: '#2563eb' }).addTo(map); }, () => alert('위치 정보를 가져올 수 없습니다.'));
  cleanup.push(() => map.remove());
}

// 재단이 주관하는 여러 행사를 한 화면에서 (통합 플랫폼 제안의 시연)
function Foundation() {
  const ev = DATA.foundationEvents, t = todayISO();
  const st = e => t > e.end ? ['done', '종료'] : t < e.start ? ['next', '예정'] : ['now', '진행 중'];
  const md = d => { const [, m, dd] = d.split('-'); return `${+m}.${+dd}`; };
  root.innerHTML = `<div class="app"><div class="page">${subHeader(ev.title, { bg: true })}
    <div class="finfo" style="margin-top:12px">
      <div class="info-card"><p class="intro">${esc(ev.intro)}</p></div>
      ${ev.items.map(e => { const [c, l] = st(e); return `<div class="info-card ev">
        <div class="when">${esc(e.start.slice(0, 4))}<b>${md(e.start)}</b>${e.end !== e.start ? '~' + md(e.end) : ''}</div>
        <div><span class="st ${c}">${l}</span><h3>${esc(e.name)}</h3><p>${I.pin}${esc(e.venue)}</p><p>${esc(e.desc)}</p>
        <div class="go" data-url="${esc(e.url)}">${e.url.startsWith('/') ? '이 앱에서 보기 ›' : '공식 안내 ↗'}</div></div></div>`; }).join('')}
      <p class="srcnote">${esc(ev.source)}</p>
    </div></div></div>`;
}

function NotFound() {
  root.innerHTML = `<div class="nf"><div class="box"><p class="code">404</p><h1>페이지를 찾을 수 없어요</h1>
    <p class="d">요청하신 페이지가 없거나 주소가\n변경되었을 수 있어요.</p>
    <div class="btns"><button class="p" data-url="/">홈으로 돌아가기</button><button class="s" data-back>이전 페이지로</button></div></div></div>`;
}

const routes = [
  [/^\/$/, Home], [/^\/festival-info\/?$/, FestivalInfo], [/^\/program\/?$/, Program], [/^\/map\/?$/, MapPage],
  [/^\/shuttle\/?$/, Shuttle], [/^\/parking\/?$/, Parking], [/^\/post\/(notice|event)\/?$/, m => Posts(m[1])], [/^\/faq\/?$/, Faq], [/^\/foundation\/?$/, Foundation],
];
function render() {
  cleanup.forEach(fn => fn()); cleanup = [];
  const p = route().path, hit = routes.find(([re]) => re.test(p));
  hit ? hit[1](p.match(hit[0])) : NotFound();
  window.scrollTo(0, 0); translatePage();
}
function boot(d) { DATA = d; applyTheme(d.theme); document.title = d.festival.name + ' · ' + d.festival.region; render(); }
// data/festival.js sets window.FESTIVAL_DATA (works on file://); fall back to fetching the JSON when served over http.
if (window.FESTIVAL_DATA) boot(window.FESTIVAL_DATA);
else fetch('data/festival.json').then(r => r.json()).then(boot).catch(() => { root.innerHTML = '<p style="padding:24px">데이터를 불러오지 못했습니다 (data/festival.js 확인).</p>'; });
