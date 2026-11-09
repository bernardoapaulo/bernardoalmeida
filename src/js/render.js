import content from '../data/content.json';

const ASSETS = new Set(__ASSETS__);
const BASE = import.meta.env.BASE_URL;
const IMG_EXT = ['avif', 'webp', 'jpg', 'jpeg', 'png'];
export const url = (p) => BASE + p;
export const has = (p) => ASSETS.has(p);

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const nf = new Intl.NumberFormat('pt-BR');
const nf1 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
export const fmt = {
  int: (v) => nf.format(Math.round(v)),
  plus: (v) => '+' + nf.format(Math.round(v)),
  pct: (v) => nf1.format(v) + '%',
  mil: (v) => nf1.format(v / 1000) + ' mil',
};
const dateBR = (iso) => iso.split('-').reverse().join('/');

function findImage(base, exts = IMG_EXT) {
  const ext = exts.find((e) => has(`${base}.${e}`));
  return ext ? `${base}.${ext}` : null;
}

/** Imagem com placeholder automático quando o arquivo não existe. */
export function media({ base, ratio = '4/5', label, alt = '', cls = '', eager = false, sizes = '100vw' }) {
  const file = findImage(base);
  const style = `aspect-ratio:${ratio}`;
  if (!file) return `<div class="media is-missing ${cls}" style="${style}" data-label="${esc(label || base)}" role="img" aria-label="${esc(alt)}"></div>`;
  const stem = base;
  const set = [800, 1600].filter((w) => has(`${stem}-${w}.webp`)).map((w) => `${url(`${stem}-${w}.webp`)} ${w}w`).join(', ');
  const [rw, rh] = ratio.split('/').map(Number);
  return `<div class="media ${cls}" style="${style}"><img src="${url(file)}" ${set ? `srcset="${set}" sizes="${sizes}"` : ''} width="${rw * 200}" height="${rh * 200}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high" decoding="async"' : 'loading="lazy" decoding="async"'} /></div>`;
}

/** Vídeo em loop com fallback para foto e depois placeholder. */
export function video({ file, poster, ratio = '9/16', label, alt = '', cls = '' }) {
  const posterFile = poster ? findImage(poster) : null;
  if (!has(file)) return media({ base: poster || file, ratio, label, alt, cls });
  return `<div class="media ${cls}" style="aspect-ratio:${ratio}"><video src="${url(file)}" ${posterFile ? `poster="${url(posterFile)}"` : ''} muted loop playsinline webkit-playsinline disablepictureinpicture controlslist="nodownload noplaybackrate" preload="metadata" aria-label="${esc(alt)}" data-autoplay></video></div>`;
}

export function mascot(variant = 'jaqueta') {
  const png = has(`lego/lego-${variant}.png`);
  if (png) return `<span class="lego lego--img"><img src="${url(`lego/lego-${variant}.png`)}" alt="" width="60" height="100" /></span>`;
  const shirt = variant === 'jaqueta' ? '#C4623B' : '#E3A857';
  return `<span class="lego" aria-hidden="true"><svg viewBox="0 0 60 104" width="60" height="104">
  <g class="lego__leg lego__leg--l"><rect x="14" y="68" width="14" height="32" rx="3" fill="#0E1A2F"/><rect x="12" y="96" width="18" height="7" rx="3" fill="#F3EEE4"/></g>
  <g class="lego__leg lego__leg--r"><rect x="32" y="68" width="14" height="32" rx="3" fill="#0E1A2F"/><rect x="30" y="96" width="18" height="7" rx="3" fill="#F3EEE4"/></g>
  <rect x="12" y="62" width="36" height="12" rx="3" fill="#13233f"/>
  <g class="lego__arm lego__arm--l"><rect x="3" y="34" width="10" height="28" rx="4" fill="${shirt}"/><circle cx="8" cy="64" r="5" fill="#F2C94C"/></g>
  <g class="lego__arm lego__arm--r"><rect x="47" y="34" width="10" height="28" rx="4" fill="${shirt}"/><circle cx="52" cy="64" r="5" fill="#F2C94C"/></g>
  <rect x="12" y="32" width="36" height="34" rx="5" fill="${shirt}"/>
  <path d="M30 32v34" stroke="#0E1A2F" stroke-opacity=".35" stroke-width="2"/>
  <rect x="25" y="26" width="10" height="8" fill="#F2C94C"/>
  <rect x="16" y="3" width="28" height="26" rx="7" fill="#F2C94C"/>
  <rect x="24" y="0" width="12" height="5" rx="2" fill="#F2C94C"/>
  <path d="M16 12c2-9 26-9 28 0-8-3-20-3-28 0z" fill="#3a2a1d"/>
  <circle cx="24" cy="18" r="1.8" fill="#0E1A2F"/><circle cx="36" cy="18" r="1.8" fill="#0E1A2F"/>
  <path d="M24 23c3 3 9 3 12 0" stroke="#0E1A2F" stroke-width="1.6" fill="none" stroke-linecap="round"/>
</svg></span>`;
}

const icons = {
  video: '<rect x="6" y="14" width="36" height="28" rx="5"/><path d="M42 24l12-7v22l-12-7z"/>',
  photo: '<rect x="6" y="12" width="48" height="36" rx="5"/><circle cx="22" cy="26" r="5"/><path d="M8 44l16-12 12 9 8-6 10 8"/>',
  megaphone: '<path d="M10 24h10l22-12v36L20 36H10z"/><path d="M20 36l4 14h8l-4-14"/><path d="M50 24c3 3 3 9 0 12"/>',
  pin: '<path d="M30 54S12 38 12 26a18 18 0 0136 0c0 12-18 28-18 28z"/><circle cx="30" cy="26" r="6"/>',
};

const bars = (obj, max) =>
  Object.entries(obj)
    .map(([k, v]) => `<li class="bar"><span>${esc(k)}</span><i style="--w:${Math.min(100, (v / max) * 100).toFixed(1)}%"></i><b>${fmt.pct(v)}</b></li>`)
    .join('');

const count = (to, f, extra = '') => `<span class="count" data-to="${to}" data-fmt="${f}" ${extra}>${fmt[f](to)}</span>`;

export function render() {
  const c = content;
  const cp = c.copy;
  const ig = c.instagram;
  const tt = c.tiktok;
  const asOf = dateBR(c.as_of);
  const total = ig.followers + tt.followers;
  const h = cp.hero;
  const out = [];

  // 4.1 Hero
  out.push(`
<section class="hero" id="topo" data-pose>
  <div class="topstrip"><div class="container topstrip__in"><span class="topstrip__links"><a href="https://wa.me/${c.contact.whatsapp}" target="_blank" rel="noopener">WhatsApp</a><a href="mailto:${c.contact.email}">E-mail</a></span></div></div>
  <header class="nav container">
    <nav class="nav__l" aria-label="Seções"><a href="#numeros" data-scroll>Números</a><a href="#trabalhos" data-scroll>Trabalhos</a></nav>
    <a class="nav__brand" href="#topo" data-scroll>BERNARDO ALMEIDA</a>
    <nav class="nav__r" aria-label="Contato"><span class="nav__city">${esc(c.person.city)}</span><a href="#contato" data-scroll>Contato</a></nav>
  </header>
  <div class="hero__stage container">
    <h1 class="hero__title sr-only">${esc(c.person.name)}, creator de viagem, moda e lifestyle</h1>
    <div class="hero__photo" data-parallax="6">${media({ base: (has('photos/hero-cutout.png') || has('photos/hero-cutout.webp')) ? 'photos/hero-cutout' : 'photos/hero', ratio: '2/3', label: 'Hero · photos/hero-cutout.png (recorte) ou hero.jpg', alt: `Retrato de ${c.person.name}`, cls: 'cutout bw', eager: true, sizes: '(min-width:900px) 40vw, 80vw' })}</div>
    <div class="hero__cta">
      <a class="btn btn--primary magnetic" href="#contato" data-scroll>${esc(h.cta_primary)}</a>
    </div>
    <p class="hero__sub">${esc(h.subtitle)}</p>
    <p class="hero__edition">Creator<br>2026</p>
  </div>
  <div class="marquee" aria-hidden="true"><div class="marquee__track">${[0, 1]
    .map(() => `<div class="marquee__set">${h.marquee.map((m) => `<span>${esc(m.toUpperCase())}</span><span class="dot">•</span>`).join('')}</div>`)
    .join('')}</div></div>
</section>`);

  // 4.2 Números
  const n = cp.numbers;
  const igMax = Math.max(...Object.values(ig.audience.country), ...Object.values(ig.audience.cities));
  out.push(`
<section class="numbers section" id="numeros">
  <div class="container">
    <p class="eyebrow">${esc(n.eyebrow)}</p>
    <h2 class="h2" data-split>${n.title}</h2>
    <div class="total">
      <p class="total__num">${count(total, 'mil', 'data-big')}</p>
      <p class="total__label">${esc(n.total_label)}</p>
      <p class="total__sum">${fmt.int(ig.followers)} no Instagram + ${fmt.int(tt.followers)} no TikTok</p>
    </div>
    <h3 class="platform">${esc(n.instagram_label)}</h3>
    <div class="cards">
      ${n.cards
        .map(
          (k) => `<article class="stat" data-fade><p class="stat__num">${count(ig[k.key], k.format === 'pct' ? 'pct' : k.prefix ? 'plus' : 'int')}</p><p class="stat__label">${esc(k.label)}</p></article>`
        )
        .join('')}
    </div>
    <p class="source">${esc(n.instagram_source.replace('{date}', asOf))}. Engajamento = ${esc(ig.engagement_definition)}.</p>
    <div class="audience">
      <h3 class="audience__title">${esc(n.audience_title)}</h3>
      <div class="audience__grid">
        <div><h4>País</h4><ul class="bars">${bars(ig.audience.country, 100)}</ul></div>
        <div><h4>Cidades</h4><ul class="bars">${bars(ig.audience.cities, 30)}</ul></div>
        <div class="age"><p class="age__num">${count(ig.audience.age_18_34_pct_approx, 'int', 'data-suffix="%"')}<small>%</small></p><p>${esc(n.audience_age)}</p></div>
      </div>
    </div>
    ${
      tt.show
        ? `<div class="tiktok">
      <h3 class="platform">${esc(n.tiktok_label)}</h3>
      <div class="cards cards--two">
        <article class="stat" data-fade><p class="stat__num">${count(tt.followers, 'int')}</p><p class="stat__label">Seguidores no TikTok</p></article>
        <article class="stat" data-fade><p class="stat__num">${count(tt.views_30d, 'mil')}</p><p class="stat__label">Visualizações nos últimos 30 dias</p></article>
      </div>
      <div class="audience__grid audience__grid--two">
        <div><h4>País</h4><ul class="bars">${bars(tt.audience.country, 100)}</ul></div>
        <div><h4>Cidades</h4><ul class="bars">${bars(tt.audience.cities, 30)}</ul></div>
      </div>
      <p class="source">${esc(n.tiktok_source.replace('{date}', asOf))}</p>
    </div>`
        : ''
    }
  </div>
</section>`);

  // 4.3 Sobre
  const a = cp.about;
  out.push(`
<section class="about section" id="sobre" data-pose>
  <div class="container about__grid">
    <div class="about__photo" data-parallax="6">${media({ base: 'photos/about', ratio: '4/5', label: 'Sobre · photos/about.jpg (4:5)', alt: `${c.person.name} em retrato`, cls: 'arch', sizes: '(min-width:900px) 36vw, 80vw' })}</div>
    <div class="about__text">
      <p class="eyebrow">${esc(a.eyebrow)}</p>
      <p class="about__lead" data-words>${esc(a.text)}</p>
      <ul class="chips">${a.chips.map((x) => `<li class="chip">${esc(x)}</li>`).join('')}</ul>
    </div>
  </div>
</section>`);

  // 4.4 Pilares
  const p = cp.pillars;
  out.push(`
<section class="pillars" id="conteudo-pilares">
  <div class="pillars__pin">
    <div class="container pillars__head"><p class="eyebrow">${esc(p.eyebrow)}</p><h2 class="h2" data-split>${p.title}</h2></div>
    <div class="pillars__stage">
    <div class="pillars__edge pillars__edge--l" aria-hidden="true"></div>
    <div class="pillars__edge pillars__edge--r" aria-hidden="true"></div>
    <button class="pillars__nav pillars__nav--prev" type="button" aria-label="Conteúdo anterior">‹</button>
    <button class="pillars__nav pillars__nav--next" type="button" aria-label="Próximo conteúdo">›</button>
    <div class="pillars__viewport" tabindex="0" role="region" aria-label="Pilares de conteúdo (use as setas do teclado)">
      <div class="pillars__nudge">
      <div class="pillars__track">
        ${p.items
          .map(
            (it) => `<article class="pillar" data-tilt>
          <div class="phone">${video({ file: it.video, poster: it.photo, ratio: '9/16', label: `${it.name} · ${it.video}`, alt: `Exemplo de conteúdo de ${it.name}` })}<button class="pillar__play" type="button" hidden aria-label="Reproduzir vídeo de ${esc(it.name)}">▶</button><button class="pillar__pause" type="button" aria-label="Pausar vídeo de ${esc(it.name)}" aria-pressed="false">⏸</button></div>
          <h3 class="pillar__name">${esc(it.name)}</h3>
          <ul class="pillar__formats">${it.formats.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
        </article>`
          )
          .join('')}
      </div>
      </div>
    </div>
    </div>
  </div>
</section>`);

  // 4.5 Trabalhos
  const w = cp.works;
  const resultBlock = (it) => {
    if (it.result !== 'capetown') return '';
    const r = ig.best_reel_recent;
    const cr = ig.best_carousel_recent;
    const thumb = (base, alt) => (has(`${base}.jpg`) ? `<span class="work__thumb"><img src="${url(`${base}.jpg`)}" alt="${alt}" loading="lazy" decoding="async" width="355" height="500" /></span>` : '');
    return `<div class="work__results">
      <div>${thumb('photos/post-reel', 'Capa do reel em destaque')}<p class="work__rt">Reel em destaque</p><p><b>${count(r.views, 'int')}</b> visualizações</p><p><b>${count(r.reach, 'int')}</b> contas alcançadas</p><p><b>${count(r.shares, 'int')}</b> compartilhamentos</p><p><b>${count(r.saves, 'int')}</b> salvamentos</p></div>
      <div>${thumb('photos/post-carousel', 'Capa do carrossel em destaque')}<p class="work__rt">Carrossel em destaque</p><p><b>${count(cr.views, 'int')}</b> visualizações</p><p><b>${count(cr.reach, 'int')}</b> contas alcançadas</p><p><b>${count(cr.profile_visits, 'int')}</b> visitas ao perfil</p><p><b>${count(cr.new_followers, 'int')}</b> novos seguidores</p></div>
    </div>
    ${it.results_note ? `<p class="work__note">${esc(it.results_note)}</p>` : ''}`;
  };
  out.push(`
<section class="works section" id="trabalhos">
  <div class="container">
    <p class="eyebrow">${esc(w.eyebrow)}</p>
    <h2 class="h2" data-split>${w.title}</h2>
    <div class="works__list">
      ${w.items
        .map(
          (it) => {
            const vid = it.video && has(it.video);
            const hasVisual = vid || (it.poster && findImage(it.poster));
            const slides = (it.photos || []).filter((p) => findImage(p));
            const img = hasVisual
              ? `<span class="work__img ${slides.length > 1 ? 'work__img--slides' : ''}" data-clip>${media({ base: it.poster, ratio: it.ratio || '4/5', label: `${it.name} · ${it.poster}.jpg`, alt: `${it.name}: ${it.format}`, sizes: '(min-width:900px) 40vw, 90vw' })}${slides.length > 1 ? `<span class="work__slide2">${media({ base: slides[1], ratio: '4/5', alt: `${it.name}, foto 2`, sizes: '(min-width:900px) 40vw, 90vw' })}</span>` : ''}${vid ? '<span class="work__play" aria-hidden="true">▶</span>' : ''}</span>`
              : '';
            const wrap = !hasVisual
              ? ''
              : vid
              ? `<button class="work__open" type="button" data-open="${esc(it.id)}" data-video="${url(it.video)}" data-title="${esc(it.name)}" aria-label="Abrir ${esc(it.name)}">${img}</button>`
              : `<div class="work__open work__open--static">${img}</div>`;
            return `<article class="work ${hasVisual ? '' : 'work--solo'}" data-work>
        ${wrap}
        <div class="work__info">
          <p class="work__tag">${esc(it.tag)} · ${esc(it.format)}</p>
          <h3 class="work__name">${esc(it.name)}</h3>          ${resultBlock(it)}
        </div>
      </article>`;
          }
        )
        .join('')}
    </div>
  </div>
</section>`);

  // 4.6 Por que comigo
  const y = cp.why;
  out.push(`
<section class="why section" id="porque">
  <div class="container">
    <p class="eyebrow">${esc(y.eyebrow)}</p>
    <h2 class="h2" data-split>${y.title}</h2>
    <div class="why__stack">
      ${y.items.map((it, i) => `<article class="why__card why__card--${i + 1}" style="--i:${i}"><span class="why__n">${esc(it.n)}</span><h3>${esc(it.title)}</h3><p>${esc(it.text)}</p></article>`).join('')}
    </div>
  </div>
</section>`);

  // 4.8 Como funciona
  const s = cp.steps;
  out.push(`
<section class="steps section" id="como-funciona">
  <div class="container">
    <p class="eyebrow">${esc(s.eyebrow)}</p>
    <h2 class="h2" data-split>${s.title}</h2>
    <div class="steps__list">
      <svg class="steps__svg" viewBox="0 0 40 1000" preserveAspectRatio="none" aria-hidden="true">
        <path class="steps__ghost" d="M20 0 C 40 125, 0 250, 20 375 S 40 625, 20 750 S 0 900, 20 1000" pathLength="1" vector-effect="non-scaling-stroke"/>
        <path class="steps__draw" d="M20 0 C 40 125, 0 250, 20 375 S 40 625, 20 750 S 0 900, 20 1000" pathLength="1" vector-effect="non-scaling-stroke"/>
      </svg>
      ${s.items.map((it) => `<article class="step"><span class="step__n"><span>${it.n}</span></span><div><h3>${esc(it.title)}</h3><p>${esc(it.text)}</p></div></article>`).join('')}
    </div>
    ${s.note ? `<p class="steps__note">${esc(s.note)}</p>` : ""}
  </div>
</section>`);

  // 4.9 Contato
  const k = cp.contact;
  const ct = c.contact;
  out.push(`
<section class="contact section" id="contato" data-pose>
  <div class="container">
    <h2 class="contact__title" data-split>${k.title}</h2>
    <div class="contact__buttons">
      <a class="btn btn--primary magnetic" href="https://wa.me/${ct.whatsapp}" target="_blank" rel="noopener">WhatsApp</a>
      <a class="btn btn--ghost magnetic" href="mailto:${ct.email}">${esc(ct.email)}</a>
      <button class="btn btn--ghost magnetic" type="button" data-copy="${ct.email}" data-done="${esc(k.email_copied)}"><span>${esc(k.email_copy)}</span></button>
      <a class="btn btn--ghost magnetic" href="https://instagram.com/${ct.instagram}" target="_blank" rel="noopener">Instagram @${ct.instagram}</a>
      <a class="btn btn--ghost magnetic" href="https://tiktok.com/@${ct.tiktok}" target="_blank" rel="noopener">TikTok @${ct.tiktok}</a>
    </div>
    <footer class="foot">
      <p class="foot__thanks">${esc(k.thanks)}</p>
      <p class="foot__small">${esc(c.person.name)} · ${esc(c.person.handle)} · ${esc(c.person.city)}</p>
    </footer>
  </div>
</section>`);

  return out.join('\n');
}

export { content };
