// Self-made SVG artwork for the Buyeo demo (no third-party images).
// Motifs: stylised five-storey stone pagoda silhouette, lotus roof-tile (연화문 수막새) rosette, Baekje palette.
const lotus = (cx, cy, r, fill, stroke) => {
  let petals = '';
  for (let i = 0; i < 8; i++) {
    const a = (i * 45) * Math.PI / 180, x = cx + Math.cos(a) * r * .55, y = cy + Math.sin(a) * r * .55;
    petals += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(r * .26).toFixed(1)}" ry="${(r * .42).toFixed(1)}" transform="rotate(${i * 45 + 90} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${fill}" stroke="${stroke}" stroke-width="${(r * .04).toFixed(1)}"/>`;
  }
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${stroke}" stroke-width="${(r * .06).toFixed(1)}"/>${petals}<circle cx="${cx}" cy="${cy}" r="${(r * .2).toFixed(1)}" fill="${stroke}"/>`;
};
export const pagoda = (x, y, s, fill) => {
  // five tiers, each roof wider than body, tapering upwards
  let g = '', cy = y;
  for (let i = 0; i < 5; i++) {
    const w = s * (1 - i * .13), bh = s * .16, rh = s * .06;
    g += `<rect x="${x - w * .32}" y="${cy - bh}" width="${w * .64}" height="${bh}" fill="${fill}"/>`;
    g += `<path d="M${x - w * .62} ${cy - bh} Q${x} ${cy - bh - rh * 1.6} ${x + w * .62} ${cy - bh} L${x + w * .5} ${cy - bh - rh} L${x - w * .5} ${cy - bh - rh}Z" fill="${fill}"/>`;
    cy -= bh + rh;
  }
  g += `<rect x="${x - s * .03}" y="${cy - s * .32}" width="${s * .06}" height="${s * .32}" fill="${fill}"/>`;
  g += `<rect x="${x - s * .7}" y="${y}" width="${s * 1.4}" height="${s * .08}" fill="${fill}"/>`;
  return g;
};
const stars = (n, w, h, seed = 7) => { let s = '', r = seed; for (let i = 0; i < n; i++) { r = (r * 9301 + 49297) % 233280; const x = r / 233280 * w; r = (r * 9301 + 49297) % 233280; const y = r / 233280 * h; s += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(1 + (i % 3) * .6).toFixed(1)}" fill="#F6E7B4" opacity="${.4 + (i % 4) * .15}"/>`; } return s; };

export function heroBanner(kind, f) {
  const W = 358, H = 358;
  if (kind === 'main') return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${f.name}">
    <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#141C36"/><stop offset=".62" stop-color="#2A3766"/><stop offset="1" stop-color="#7A3B2E"/></linearGradient>
    <radialGradient id="moon" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFF4CF"/><stop offset="1" stop-color="#E7C66E"/></radialGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#sky)"/>${stars(40, W, 200)}
    <circle cx="306" cy="104" r="34" fill="url(#moon)" opacity=".95"/>
    <g opacity=".18">${lotus(70, 80, 46, 'none', '#F6E7B4')}</g>
    <path d="M0 300 Q90 262 180 290 T358 280 V358 H0Z" fill="#1A2140"/>
    <path d="M0 318 Q100 296 200 316 T358 306 V358 H0Z" fill="#141A33"/>
    <g>${pagoda(270, 302, 120, '#0F1429')}</g>
    ${[40, 95, 150].map((x, i) => `<g transform="translate(${x} ${248 + i * 6})"><path d="M0 0 h16 v22 h-16z" fill="#E9A23B" opacity=".9"/><rect x="2" y="3" width="12" height="16" fill="#FFD27A"/><line x1="8" y1="-10" x2="8" y2="0" stroke="#E9A23B"/></g>`).join('')}
    <text x="24" y="58" fill="#E7C66E" font-family="Pretendard Variable,sans-serif" font-size="11" font-weight="700" letter-spacing="1.5">THE ${f.edition}ND BAEKJE CULTURAL FESTIVAL · BUYEO</text>
    <text x="24" y="120" fill="#FFF8E7" font-family="'Noto Serif KR',serif" font-size="44" font-weight="900">백제문화제</text>
    <text x="24" y="156" fill="#F3EDE1" font-family="'Noto Serif KR',serif" font-size="19" font-weight="700">${f.theme}</text>
    <rect x="24" y="174" width="168" height="1.5" fill="#C9A24B"/>
    <text x="24" y="200" fill="#F3EDE1" font-family="Pretendard Variable,sans-serif" font-size="15" font-weight="700">2026. 10. 3.(토) – 10. 11.(일)</text>
    <text x="24" y="222" fill="#D9CDB4" font-family="Pretendard Variable,sans-serif" font-size="13">부여 시가지 · 정림사지 · 석탑로 · 관북리유적</text>
  </svg>`;
  if (kind === 'shuttle') return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="무료 셔틀버스">
    <rect width="${W}" height="${H}" fill="#F3EDE1"/><g opacity=".12">${lotus(300, 70, 60, 'none', '#1E2A4A')}${lotus(40, 320, 40, 'none', '#1E2A4A')}</g>
    <text x="28" y="70" fill="#A33B2B" font-family="Pretendard Variable" font-size="15" font-weight="800">축제 기간 매일 09:00–23:00</text>
    <text x="28" y="118" fill="#1E2A4A" font-family="'Noto Serif KR',serif" font-size="40" font-weight="900">무료 셔틀버스</text>
    <text x="28" y="160" fill="#1E2A4A" font-family="'Noto Serif KR',serif" font-size="30" font-weight="900">3개 노선 운행</text>
    ${[['1노선 구드래', '#B8322A', 196], ['2노선 백마강 테마파크', '#2B5DA8', 232], ['3노선 부여 롯데리조트', '#5E9E3A', 268]].map(([t, c, y]) => `<rect x="28" y="${y}" width="200" height="28" rx="14" fill="${c}"/><text x="44" y="${y + 19}" fill="#fff" font-family="Pretendard Variable" font-size="13" font-weight="700">${t}</text>`).join('')}
    <g transform="translate(236 210)"><rect x="0" y="0" width="100" height="64" rx="12" fill="#1E2A4A"/><rect x="8" y="10" width="22" height="18" rx="3" fill="#BFD3F2"/><rect x="36" y="10" width="22" height="18" rx="3" fill="#BFD3F2"/><rect x="64" y="10" width="28" height="18" rx="3" fill="#BFD3F2"/><rect x="0" y="40" width="100" height="6" fill="#C9A24B"/><circle cx="22" cy="66" r="9" fill="#333"/><circle cx="78" cy="66" r="9" fill="#333"/></g>
    <text x="28" y="330" fill="#6b6255" font-family="Pretendard Variable" font-size="12">군청 로터리 · 보건소 로터리 순환</text>
  </svg>`;
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="개막식">
    <defs><linearGradient id="op" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7A2A22"/><stop offset="1" stop-color="#1E2A4A"/></linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#op)"/>${stars(30, W, H, 3)}
    <g opacity=".25">${lotus(179, 200, 120, 'none', '#E7C66E')}</g>
    <text x="179" y="96" text-anchor="middle" fill="#E7C66E" font-family="Pretendard Variable" font-size="16" font-weight="800">10. 3.(토) 19:00 · 정림사지 주무대</text>
    <text x="179" y="160" text-anchor="middle" fill="#FFF8E7" font-family="'Noto Serif KR',serif" font-size="52" font-weight="900">개막식</text>
    <text x="179" y="204" text-anchor="middle" fill="#F3EDE1" font-family="Pretendard Variable" font-size="15" font-weight="600">사비천도 선포식 17:00 · 드론 아트쇼</text>
    <text x="179" y="236" text-anchor="middle" fill="#F3EDE1" font-family="Pretendard Variable" font-size="14">축하공연 싸이펀 · 순순희 · 키라스 · 트리플S</text>
    <g>${pagoda(179, 330, 70, '#121833')}</g>
  </svg>`;
}
export function midBanner() {
  return `<svg viewBox="0 0 358 88" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="나이트 퍼레이드">
    <rect width="358" height="88" rx="12" fill="#1E2A4A"/><g opacity=".3">${lotus(320, 44, 34, 'none', '#E7C66E')}</g>${stars(14, 358, 88, 11)}
    <text x="20" y="36" fill="#E7C66E" font-family="Pretendard Variable" font-size="13" font-weight="700">10. 10.(토) 19:30 · 시가지 일원</text>
    <text x="20" y="64" fill="#FFF8E7" font-family="'Noto Serif KR',serif" font-size="22" font-weight="900">백제문화 나이트 퍼레이드</text></svg>`;
}
export function midBanner2() {
  return `<svg viewBox="0 0 358 88" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="백제역사문화행렬">
    <rect width="358" height="88" rx="12" fill="#A33B2B"/><g opacity=".25">${lotus(318, 44, 34, 'none', '#FFF4CF')}</g>
    <text x="20" y="36" fill="#FFE7B0" font-family="Pretendard Variable" font-size="13" font-weight="700">10. 9.(금) 15:30 · 시가지 일원</text>
    <text x="20" y="64" fill="#FFF8E7" font-family="'Noto Serif KR',serif" font-size="22" font-weight="900">백제역사문화행렬</text></svg>`;
}
export const logo = (f) => `<svg height="32" viewBox="0 0 196 32" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${f.name}">
  <g transform="translate(14 16)">${lotus(0, 0, 13, '#C9A24B', '#1E2A4A')}</g>
  <text x="34" y="12" fill="#1E2A4A" font-family="Pretendard Variable" font-size="8.5" font-weight="700" letter-spacing=".3">BAEKJE CULTURAL FESTIVAL · BUYEO</text>
  <text x="34" y="29" fill="#1E2A4A" font-family="'Noto Serif KR',serif" font-size="17" font-weight="900">제${f.edition}회 백제문화제</text></svg>`;
// Small square icons for menu/widgets (44–48px)
export const icon = (k) => {
  const bg = { map: '#E9E1CF', program: '#E9E1CF', bus: '#E6ECF6', calendar: '#F4E3DF', faq: '#E7EFE9', parking: '#E9E6F2' }[k] || '#eee';
  const g = {
    map: `<path d="M10 14l8-3 8 3 8-3v20l-8 3-8-3-8 3z" fill="#fff" stroke="#1E2A4A" stroke-width="1.6" stroke-linejoin="round"/><path d="M18 11v20M26 14v20" stroke="#1E2A4A" stroke-width="1.2"/><circle cx="29" cy="17" r="4" fill="#A33B2B"/>`,
    program: `<g transform="translate(22 30)">${pagoda(0, 0, 22, '#1E2A4A')}</g><circle cx="33" cy="12" r="3" fill="#C9A24B"/>`,
    bus: `<rect x="9" y="11" width="26" height="20" rx="4" fill="#2B5DA8"/><rect x="12" y="14" width="9" height="7" rx="1" fill="#DCE8FA"/><rect x="23" y="14" width="9" height="7" rx="1" fill="#DCE8FA"/><circle cx="15" cy="32" r="3" fill="#333"/><circle cx="29" cy="32" r="3" fill="#333"/>`,
    calendar: `<rect x="10" y="12" width="24" height="22" rx="3" fill="#fff" stroke="#A33B2B" stroke-width="1.6"/><rect x="10" y="12" width="24" height="6" fill="#A33B2B"/><text x="22" y="31" text-anchor="middle" font-size="11" font-weight="800" fill="#1E2A4A" font-family="Pretendard Variable">10</text>`,
    faq: `<circle cx="22" cy="22" r="12" fill="#2F6E62"/><text x="22" y="27" text-anchor="middle" font-size="15" font-weight="800" fill="#fff" font-family="Pretendard Variable">?</text>`,
    parking: `<rect x="11" y="11" width="22" height="22" rx="5" fill="#5B4A7A"/><text x="22" y="28" text-anchor="middle" font-size="15" font-weight="900" fill="#fff" font-family="Pretendard Variable">P</text>`,
  }[k] || '';
  return `<svg viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg"><rect width="44" height="44" rx="10" fill="${bg}"/>${g}</svg>`;
};
