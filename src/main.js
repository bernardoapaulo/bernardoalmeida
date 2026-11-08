import './style.css';
import './theme.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { render, content, fmt } from './js/render.js';

gsap.registerPlugin(ScrollTrigger);

const RM = document.documentElement.classList.contains('rm');
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

document.getElementById('conteudo').innerHTML = render();

/* ---------- Divisão de texto em palavras com máscara (preserva <em>) ---------- */
function splitWords(el) {
  const walk = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((tok) => {
          if (!tok) return;
          if (/^\s+$/.test(tok)) return frag.append(' ');
          const w = document.createElement('span');
          w.className = 'w';
          const wi = document.createElement('span');
          wi.className = 'wi';
          wi.textContent = tok;
          w.append(wi);
          frag.append(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
  };
  const isHead = /^H[1-6]$/.test(el.tagName);
  if (isHead) el.setAttribute('aria-label', el.textContent.trim());
  walk(el);
  isHead && [...el.querySelectorAll('.w')].forEach((w) => w.setAttribute('aria-hidden', 'true'));
}
$$('[data-split], [data-words]').forEach(splitWords);

/* ---------- Scroll suave (Lenis) + ScrollTrigger ---------- */
let lenis = null;
if (!RM) {
  lenis = new Lenis({ lerp: 0.14, smoothWheel: true, wheelMultiplier: 1.25 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
$$('[data-scroll]').forEach((a) =>
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const t = $(a.getAttribute('href'));
    if (!t) return;
    lenis ? lenis.scrollTo(t, { offset: 0, duration: 1.4 }) : t.scrollIntoView();
  })
);

/* ---------- Barra de progresso ---------- */
gsap.to('.progress i', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.2 } });

/* ---------- Animações por entrada: reversíveis (descer toca, subir desfaz) ---------- */
const ENTER = 'top 105%';
const fin = (el, fn) => (el._fs = [...(el._fs || []), fn]);
const REV = []; // { trigger, tween } para a rede de segurança
const TITLES = '.works .h2, .why .h2, .steps .h2, .contact__title';
// toca ao entrar por baixo; ao voltar (sair por baixo) reverte um pouco mais rápido
const rv = (tween, trigger, start = ENTER) => {
  tween.pause(0);
  REV.push({ trigger, tween });
  ScrollTrigger.create({
    trigger,
    start,
    onEnter: () => tween.timeScale(1).play(),
    onLeaveBack: () => tween.timeScale(1.6).reverse(),
  });
  return tween;
};
if (!RM) {
  // contadores: contam ao entrar e reiniciam em 0 ao voltar
  $$('.count').forEach((el) => {
    const to = parseFloat(el.dataset.to);
    const f = fmt[el.dataset.fmt] || fmt.int;
    const o = { v: 0 };
    el.textContent = f(0);
    rv(gsap.to(o, { v: to, duration: 1.2, ease: 'power2.out', paused: true, onUpdate: () => (el.textContent = f(o.v)), onReverseComplete: () => (el.textContent = f(0)) }), el, 'top 100%');
  });
  $$('.bars').forEach((ul) => {
    const fills = $$('.bar i', ul);
    rv(gsap.fromTo(fills, { '--fill': 0 }, { '--fill': 1, duration: 0.8, ease: 'power3.out', stagger: 0.06, paused: true }), ul);
  });
  $$('.stat, .platform, .audience__title').forEach((el) => {
    rv(gsap.fromTo(el, { '--rule': 0 }, { '--rule': 1, duration: 0.8, ease: 'power3.out', paused: true }), el);
  });
  rv(gsap.fromTo('.total__num', { scale: 0.9, opacity: 0.6 }, { scale: 1, opacity: 1, duration: 0.8, ease: 'power3.out', transformOrigin: 'left bottom', paused: true }), '.total');
  rv(gsap.fromTo('.age__num', { scale: 0.85, opacity: 0.6, transformOrigin: 'left center' }, { scale: 1, opacity: 1, duration: 0.8, ease: 'power3.out', paused: true }), '.age');

  // títulos por palavra
  $$('[data-split]').filter((h) => !h.matches(TITLES)).forEach((h) => {
    const words = $$('.wi', h);
    rv(gsap.fromTo(words, { yPercent: 115 }, { yPercent: 0, duration: 0.7, ease: 'power3.out', stagger: 0.04, paused: true }), h);
  });

  // cards e fades
  $$('[data-fade]').forEach((e, i) => {
    const sib = [...e.parentElement.children].filter((c) => c.hasAttribute('data-fade')).indexOf(e);
    rv(gsap.fromTo(e, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', delay: Math.min(sib, 3) * 0.06, paused: true }), e);
  });

  // imagens com clip-path
  $$('[data-clip]').forEach((el) => {
    rv(gsap.fromTo(el, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 0.8, ease: 'power3.out', paused: true }), el);
  });

  // parallax leve (só fotos, nunca texto informativo)
  $$('[data-parallax]').forEach((el) => {
    const amt = Math.min(12, parseFloat(el.dataset.parallax));
    gsap.fromTo(el, { yPercent: amt / 2 }, { yPercent: -amt / 2, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // sobre: texto por palavra + chips
  const aw = $$('.about__lead .wi');
  if (aw.length) rv(gsap.fromTo(aw, { opacity: 0.6 }, { opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.03, paused: true }), '.about__lead');
  if ($('.chips')) rv(gsap.fromTo('.chip', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.05, paused: true }), '.chips');

  // títulos e eyebrows de Trabalhos em diante: máscara por palavra, rotação, em por último, parallax sutil
  {
    const cs = getComputedStyle(document.body);
    const fgC = cs.getPropertyValue('--fg').trim() || '#f2f1ed';
    const muC = cs.getPropertyValue('--muted').trim() || '#a9a9a4';
    const wide = matchMedia('(min-width: 900px) and (hover: hover)').matches;
    $$('.works .eyebrow, .why .eyebrow, .steps .eyebrow').forEach((eb) => {
      const txt = eb.textContent;
      eb.innerHTML = '<span class="eyebrow__t"></span><span class="eyebrow__rule" aria-hidden="true"></span>';
      const t = $('.eyebrow__t', eb);
      const rule = $('.eyebrow__rule', eb);
      t.textContent = txt;
      const ls = getComputedStyle(eb).letterSpacing;
      gsap.set(rule, { transformOrigin: 'left center' });
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
      tl.fromTo(t, { x: -24, opacity: 0, letterSpacing: '0.5em' }, { x: 0, opacity: 1, letterSpacing: ls, duration: 0.9 }, 0).fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 0.7 }, 0.15);
      rv(tl, eb);
    });
    $$('.works .h2, .why .h2, .steps .h2').forEach((h) => {
      const ems = $$('em .wi', h);
      const main = $$('.wi', h).filter((w) => !ems.includes(w));
      const tl = gsap.timeline({ paused: true });
      tl.fromTo(main, { yPercent: 110, rotate: 4, transformOrigin: 'left bottom' }, { yPercent: 0, rotate: 0, duration: 0.9, ease: 'power4.out', stagger: 0.07 }, 0);
      if (ems.length) {
        const at = Math.max(0, main.length - 1) * 0.07 + 0.2;
        tl.fromTo(ems, { yPercent: 110, rotate: 4, opacity: 0, transformOrigin: 'left bottom' }, { yPercent: 0, rotate: 0, opacity: 1, duration: 0.9, ease: 'power4.out', stagger: 0.07 }, at);
        tl.fromTo($$('em', h), { color: fgC }, { color: muC, duration: 0.8, ease: 'power2.out' }, at);
      }
      rv(tl, h);
      if (wide) gsap.fromTo(h, { yPercent: 6 }, { yPercent: -6, ease: 'none', scrollTrigger: { trigger: h, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    // contato: letra por letra + botões depois
    const ct = $('.contact__title');
    if (ct) {
      $$('.wi', ct).forEach((wi) => {
        const txt = wi.textContent;
        wi.textContent = '';
        [...txt].forEach((c) => {
          const s = document.createElement('span');
          s.className = 'ch';
          s.textContent = c;
          wi.append(s);
        });
      });
      const tl = gsap.timeline({ paused: true });
      tl.fromTo($$('.ch', ct), { yPercent: 110, rotate: 4, transformOrigin: 'left bottom' }, { yPercent: 0, rotate: 0, duration: 0.9, ease: 'power4.out', stagger: 0.025 }, 0);
      const emc = $$('em', ct);
      if (emc.length) tl.fromTo(emc, { color: fgC }, { color: muC, duration: 0.8, ease: 'power2.out' }, 0.3);
      tl.fromTo('.contact__buttons .btn', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.1 }, '>-0.4');
      rv(tl, ct);
    }
  }

  // rede de segurança: o que já passou da base da tela e não animou termina visível
  const settle = () => {
    const vh = innerHeight;
    REV.forEach(({ trigger, tween }) => {
      const el = typeof trigger === 'string' ? $(trigger) : trigger;
      if (el && el.getBoundingClientRect().top < vh && tween.progress() < 1 && !tween.isActive() && tween.reversed() === false && tween.paused()) tween.progress(1);
    });
  };
  setTimeout(settle, 2500);
  ScrollTrigger.addEventListener('refresh', settle);
  let st;
  addEventListener('scroll', () => (clearTimeout(st), (st = setTimeout(settle, 900))), { passive: true });
}

/* ---------- Pilares (galeria): pin + rolagem horizontal ligada à rolagem da página ---------- */
const pillarCards = $$('.pillar');
const pillarVideos = pillarCards.map((c) => $('video', c));
let hovered = -1;
let pinST = null;
const wantPlay = new WeakMap();
const tryPlay = (v) => {
  wantPlay.set(v, true);
  v.muted = true;
  v.defaultMuted = true;
  v.playsInline = true;
  v.removeAttribute('autoplay');
  if (v.preload !== 'auto') v.preload = 'auto';
  const p = v.play();
  p &&
    p.catch((e) => {
      if (e && e.name === 'NotAllowedError') return;
      // AbortError (load/pausa no meio): tenta de novo quando puder tocar
      v.addEventListener('canplay', () => wantPlay.get(v) && v.play().catch(() => {}), { once: true });
    });
};
const tryPause = (v) => {
  wantPlay.set(v, false);
  if (!v.paused) v.pause();
};
// fallback: se o vídeo falhar, o poster vira imagem de fundo (sem ícone quebrado)
pillarVideos.forEach((v) => {
  if (!v) return;
  v.muted = true;
  v.addEventListener('error', () => {
    if (v.poster) v.parentElement.style.background = `center / cover no-repeat url("${v.poster}")`;
    v.style.visibility = 'hidden';
  });
});
const visFrac = (el) => {
  const r = el.getBoundingClientRect();
  if (!r.width) return 0;
  return Math.max(0, Math.min(r.right, innerWidth) - Math.max(r.left, 0)) / r.width;
};
let nearest = -1;
// regra: todo vídeo com ≥ 50% da largura visível toca; o card sob o mouse sempre toca
const syncPillars = () => {
  let best = -1, bd = Infinity;
  const cx = innerWidth / 2;
  pillarCards.forEach((c, k) => {
    const vis = visFrac(c);
    const v = pillarVideos[k];
    if (vis > 0) {
      const r = c.getBoundingClientRect();
      const d = Math.abs(r.left + r.width / 2 - cx);
      if (d < bd) ((bd = d), (best = k));
    }
    if (!v) return;
    if (vis >= 0.5 || k === hovered) tryPlay(v);
    else {
      tryPause(v);
      if (vis > 0 && v.preload !== 'auto') v.preload = 'auto';
    }
  });
  if (best !== nearest) {
    nearest = best;
    pillarCards.forEach((c, k) => c.classList.toggle('is-active', k === best));
  }
};
if (RM) {
  pillarCards.forEach((c) => c.classList.add('is-active'));
  // sem autoplay: poster visível; clique reproduz
  pillarVideos.forEach((v) => {
    if (!v) return;
    v.parentElement.style.cursor = 'pointer';
    v.parentElement.addEventListener('click', () => (v.paused ? ((v.muted = true), v.play().catch(() => {})) : v.pause()));
  });
} else {
  let near = false;
  const sec0 = $('.pillars');
  ScrollTrigger.create({
    trigger: sec0,
    start: 'top bottom+=200',
    end: 'bottom top-=200',
    onToggle: (s) => {
      near = s.isActive;
      if (!near) pillarVideos.forEach((v) => v && tryPause(v));
    },
  });
  gsap.ticker.add(() => near && syncPillars());
  pillarCards.forEach((c, k) => {
    c.addEventListener('mouseenter', () => (hovered = k));
    c.addEventListener('mouseleave', () => hovered === k && (hovered = -1));
  });
}

const mm = gsap.matchMedia();
mm.add('(prefers-reduced-motion: no-preference)', () => {
  const sec = $('.pillars');
  const vp = $('.pillars__viewport');
  const track = $('.pillars__track');
  const desktop = matchMedia('(min-width: 900px)').matches;
  const pad = () => parseFloat(getComputedStyle(vp).paddingLeft) || 0;
  // curso total do scrub (px); a galeria sempre se move por transform no track
  const dist = () => Math.max(0, desktop ? track.scrollWidth - window.innerWidth + 120 : track.offsetWidth + pad() * 2 - vp.clientWidth);
  const start = () => (sec.offsetHeight > innerHeight ? 'top top' : 'center center');
  const cfg = { trigger: sec, start, end: () => '+=' + Math.max(dist(), 1), pin: true, scrub: 0.5, anticipatePin: 1, invalidateOnRefresh: true, refreshPriority: 10 };
  pinST = gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: cfg }).scrollTrigger;
  // tilt 3D suave (só com mouse)
  const cleanups = matchMedia('(hover: hover)').matches
    ? $$('[data-tilt]').map((card) => {
        const rx = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3.out' });
        const ry = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3.out' });
        const sc = gsap.quickTo(card, 'scale', { duration: 0.6, ease: 'power3.out' });
        gsap.set(card, { transformPerspective: 900 });
        const mv = (e) => {
          const r = card.getBoundingClientRect();
          ry(((e.clientX - r.left) / r.width - 0.5) * 16);
          rx(-((e.clientY - r.top) / r.height - 0.5) * 16);
          sc(1.03);
        };
        const lv = () => (rx(0), ry(0), sc(1));
        card.addEventListener('mousemove', mv);
        card.addEventListener('mouseleave', lv);
        return () => (card.removeEventListener('mousemove', mv), card.removeEventListener('mouseleave', lv));
      })
    : [];
  return () => {
    cleanups.forEach((c) => c());
    pinST = null;
  };
});

/* ---------- Galeria: setas, teclado, bordas do mouse e swipe movem só o x manual (.pillars__nudge) ----------
   posição total = x do scrub (rolagem, em .pillars__track) + x manual (em .pillars__nudge); a página nunca é rolada por estes controles */
{
  const stage = $('.pillars__stage');
  const vp = $('.pillars__viewport');
  const track = $('.pillars__track');
  const nudge = $('.pillars__nudge');
  const prev = $('.pillars__nav--prev');
  const next = $('.pillars__nav--next');
  const edgeL = $('.pillars__edge--l');
  const edgeR = $('.pillars__edge--r');
  const W = () => vp.clientWidth || innerWidth;
  const maxD = () => (pinST ? Math.max(0, pinST.end - pinST.start) : 0);
  const xs = () => +gsap.getProperty(track, 'x') || 0;
  const clampM = (v) => Math.min(-xs(), Math.max(-maxD() - xs(), v));
  const cardStep = () => {
    const a = pillarCards[0], b = pillarCards[1];
    return b ? b.offsetLeft - a.offsetLeft : a.offsetWidth;
  };
  // deslocamento total (positivo) que centraliza cada card
  const offsets = () => pillarCards.map((c) => Math.min(maxD(), Math.max(0, c.offsetLeft + c.offsetWidth / 2 - W() / 2)));

  if (!pinST) {
    // reduced-motion: rolagem horizontal nativa dentro do container; setas usam scrollBy só no container
    const go = (d) => vp.scrollBy({ left: d * cardStep(), behavior: 'auto' });
    const stepN = (d) => go(d);
    prev.addEventListener('click', () => stepN(-1));
    next.addEventListener('click', () => stepN(1));
    stage.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') (e.preventDefault(), stepN(e.key === 'ArrowRight' ? 1 : -1));
    });
    const updN = () => {
      prev.disabled = vp.scrollLeft <= 2;
      next.disabled = vp.scrollLeft >= vp.scrollWidth - vp.clientWidth - 2;
    };
    vp.addEventListener('scroll', updN, { passive: true });
    updN();
  } else {
    let mxT = 0; // alvo do x manual
    let qt = null;
    const mk = () => (qt = gsap.quickTo(nudge, 'x', { duration: 0.7, ease: 'power3.out' }));
    mk();
    const hard = (v) => {
      gsap.killTweensOf(nudge);
      gsap.set(nudge, { x: v });
      mxT = v;
      mk();
    };
    const move = (v) => {
      mxT = clampM(v);
      qt(mxT);
    };
    const step = (dir) => {
      const cur = -(xs() + mxT);
      const o = offsets();
      const t = dir > 0 ? o.find((v) => v > cur + 4) : [...o].reverse().find((v) => v < cur - 4);
      if (t !== undefined) move(-t - xs());
    };
    // clique, segurar para repetir (pointer) e teclado (click com detail 0)
    let hold = 0, rep = 0;
    const stopHold = () => (clearTimeout(hold), clearInterval(rep));
    [[prev, -1], [next, 1]].forEach(([b, d]) => {
      b.addEventListener('pointerdown', (e) => {
        if (e.button) return;
        step(d);
        stopHold();
        hold = setTimeout(() => (rep = setInterval(() => step(d), 450)), 500);
      });
      b.addEventListener('click', (e) => e.detail === 0 && step(d));
      b.addEventListener('pointerleave', stopHold);
    });
    addEventListener('pointerup', stopHold);
    addEventListener('pointercancel', stopHold);
    stage.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        step(e.key === 'ArrowRight' ? 1 : -1);
      }
    });

    // mantém sempre dentro do limite (a cada frame, cobre onUpdate do scrub e resize)
    gsap.ticker.add(() => {
      const cur = +gsap.getProperty(nudge, 'x') || 0;
      const c = clampM(cur);
      if (c !== cur) hard(c);
      else mxT = clampM(mxT);
      const t = -(xs() + mxT);
      prev.disabled = t <= 2;
      next.disabled = t >= maxD() - 2;
    });

    // borda do mouse: só mouse
    if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
      const ZONE = 0.22, MAXV = 18;
      let mx = null, raf = 0, vel = 0;
      const prox = () => {
        if (mx === null) return 0;
        const r = vp.getBoundingClientRect();
        const f = (mx - r.left) / r.width;
        if (f < ZONE) return -(1 - f / ZONE);
        if (f > 1 - ZONE) return (f - (1 - ZONE)) / ZONE;
        return 0;
      };
      const loop = () => {
        raf = 0;
        const p = prox();
        const a = Math.min(1, Math.abs(p));
        const target = Math.sign(p) * a * a * (3 - 2 * a) * MAXV;
        vel += (target - vel) * 0.15;
        edgeL.classList.toggle('on', p < -0.02);
        edgeR.classList.toggle('on', p > 0.02);
        stage.style.cursor = p < -0.02 ? 'w-resize' : p > 0.02 ? 'e-resize' : '';
        if (Math.abs(vel) > 0.05) move(mxT - vel * 2.2);
        if (mx !== null || Math.abs(vel) > 0.05) raf = requestAnimationFrame(loop);
      };
      const kick = () => !raf && (raf = requestAnimationFrame(loop));
      stage.addEventListener('mousemove', (e) => ((mx = e.clientX), kick()));
      stage.addEventListener('mouseleave', () => ((mx = null), kick()));
    }

    // swipe horizontal (toque/caneta): move o x manual; vertical segue rolando a página (touch-action: pan-y)
    let sx = 0, sy = 0, sm = 0, drag = false, id = null, lx = 0, lt = 0, v = 0;
    vp.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse') return;
      id = e.pointerId; sx = lx = e.clientX; sy = e.clientY; sm = mxT; drag = false; lt = performance.now(); v = 0;
    });
    vp.addEventListener('pointermove', (e) => {
      if (e.pointerId !== id) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (!drag && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
        drag = true;
        try { vp.setPointerCapture(id); } catch (_) {}
      }
      if (!drag) return;
      const now = performance.now();
      v = (e.clientX - lx) / Math.max(1, now - lt);
      lx = e.clientX; lt = now;
      hard(clampM(sm + dx));
    });
    const end = (e) => {
      if (e.pointerId !== id) return;
      id = null;
      if (drag) move(mxT + v * 220);
      drag = false;
    };
    vp.addEventListener('pointerup', end);
    vp.addEventListener('pointercancel', end);
  }
}

/* ---------- Vídeos só tocam quando visíveis ---------- */
const io = new IntersectionObserver(
  (entries) =>
    entries.forEach((en) => {
      const v = en.target;
      if (en.isIntersecting) v.play().catch(() => {});
      else v.pause();
    }),
  { threshold: 0.35 }
);
$$('video[data-autoplay]').filter((v) => !v.closest('.pillar')).forEach((v) => {
  if (RM) v.removeAttribute('loop');
  io.observe(v);
});

/* ---------- Lightbox ---------- */
const lb = $('.lightbox');
const lbBody = $('.lightbox__body');
let lastFocus = null;
$$('[data-open]').forEach((b) =>
  b.addEventListener('click', () => {
    lastFocus = b;
    const src = b.dataset.video;
    const photos = (b.dataset.photos || '').split('|').filter(Boolean);
    lbBody.innerHTML = src
      ? `<video src="${src}" controls autoplay playsinline aria-label="${b.dataset.title}"></video>`
      : photos.length
      ? `<div class="lightbox__photos">${photos.map((p, i) => `<img src="${p}" alt="${b.dataset.title}, foto ${i + 1}" />`).join('')}</div>`
      : `<div class="media is-missing" style="aspect-ratio:9/16" data-label="Vídeo pendente · ${b.dataset.title}" role="img" aria-label="Vídeo pendente"></div>`;
    lb.showModal();
    lenis && lenis.stop();
  })
);
const closeLb = () => lb.open && lb.close();
lb.addEventListener('close', () => {
  lbBody.innerHTML = '';
  lenis && lenis.start();
  lastFocus && lastFocus.focus();
});
$('.lightbox__close').addEventListener('click', closeLb);
lb.addEventListener('click', (e) => e.target === lb && closeLb());

/* ---------- Copiar e-mail ---------- */
$$('[data-copy]').forEach((b) =>
  b.addEventListener('click', async () => {
    const label = $('span', b);
    const old = label.textContent;
    try {
      await navigator.clipboard.writeText(b.dataset.copy);
    } catch {
      const t = document.createElement('textarea');
      t.value = b.dataset.copy;
      document.body.append(t);
      t.select();
      document.execCommand('copy');
      t.remove();
    }
    b.classList.add('done');
    label.textContent = b.dataset.done;
    setTimeout(() => (b.classList.remove('done'), (label.textContent = old)), 1800);
  })
);

/* ---------- Desktop: botões magnéticos ---------- */
if (!RM && matchMedia('(hover: hover) and (pointer: fine)').matches) {
  $$('.magnetic').forEach((b) => {
    const x = gsap.quickTo(b, 'x', { duration: 0.5, ease: 'power3.out' });
    const y = gsap.quickTo(b, 'y', { duration: 0.5, ease: 'power3.out' });
    b.addEventListener('mousemove', (e) => {
      const r = b.getBoundingClientRect();
      x((e.clientX - (r.left + r.width / 2)) * 0.25);
      y((e.clientY - (r.top + r.height / 2)) * 0.35);
    });
    b.addEventListener('mouseleave', () => (x(0), y(0)));
  });
}

/* ---------- Hero: entrada rápida; termina na hora ao começar a rolar ---------- */
function startHero() {
  if (RM) return;
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from('.topstrip, .nav', { opacity: 0, y: -12, duration: 0.5, stagger: 0.05 }, 0)
    .from('.hero__sub', { opacity: 0, y: 20, duration: 0.5 }, 0.2)
    .from('.hero__cta .btn', { opacity: 0, y: 20, duration: 0.5, stagger: 0.06 }, 0.3)
    .fromTo('.hero__photo .media', { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% -10% 0 -10%)', duration: 0.9, ease: 'power3.inOut' }, 0.05)
    .from('.marquee', { opacity: 0, duration: 0.5 }, 0.4);
  const finish = () => {
    tl.timeScale(8);
    ['wheel', 'touchmove', 'keydown', 'scroll'].forEach((e) => removeEventListener(e, finish));
  };
  ['wheel', 'touchmove', 'keydown', 'scroll'].forEach((e) => addEventListener(e, finish, { passive: true }));
}

startHero();

/* ---------- Passos: curva que desenha, marcador que percorre, passos que acendem ---------- */
{
  const list = $('.steps__list');
  const steps = $$('.step', list);
  const draw = $('.steps__draw');
  const svg = $('.steps__svg');
  if (RM || !list) {
    draw && (draw.style.strokeDashoffset = 0);
    steps.forEach((s) => s.classList.add('on'));
  } else {
    const wide = matchMedia('(min-width: 900px)').matches;
    // entrada de cada passo (reversível): número sobe da máscara, título em clip-path, texto em fade
    steps.forEach((s, i) => {
      const side = wide ? (i % 2 ? 1 : -1) : 0;
      const n = $('.step__n > span', s);
      const h = $('h3', s);
      const p = $('p', s);
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
      tl.fromTo(n, { yPercent: 110 }, { yPercent: 0, duration: 0.7 }, 0)
        .fromTo(h, { clipPath: side > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0%)', duration: 0.8 }, 0.1)
        .fromTo(p, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7 }, 0.25);
      if (side) tl.fromTo(s, { x: side * 40 }, { x: 0, duration: 0.8 }, 0);
      rv(tl, s);
    });

    // marcador + pulso (HTML, só transform/opacity)
    const dot = document.createElement('span');
    dot.className = 'steps__dot';
    dot.setAttribute('aria-hidden', 'true');
    const ring = document.createElement('span');
    ring.className = 'steps__ring';
    ring.setAttribute('aria-hidden', 'true');
    list.append(ring, dot);
    const L = draw.getTotalLength ? draw.getTotalLength() : 1;
    let geo = null;
    const measure = () => {
      const r = svg.getBoundingClientRect();
      const lr = list.getBoundingClientRect();
      geo = {
        w: r.width,
        h: r.height,
        ox: r.left - lr.left,
        oy: r.top - lr.top,
        cy: steps.map((s) => (s.getBoundingClientRect().top - lr.top + s.offsetHeight * 0.32) / r.height),
      };
    };
    const pt = (t) => {
      // pathLength=1 no SVG: converte o parâmetro para comprimento real
      const q = draw.getPointAtLength(Math.min(Math.max(t, 0), 1) * L);
      return { x: geo.ox + (q.x / 40) * geo.w, y: geo.oy + (q.y / 1000) * geo.h };
    };
    gsap.set(dot, { xPercent: -50, yPercent: -50 });
    gsap.set(ring, { xPercent: -50, yPercent: -50, opacity: 0 });
    const lit = new Array(steps.length).fill(false);
    const pulse = (i) => {
      const q = pt(geo.cy[i]);
      gsap.killTweensOf(ring);
      gsap.fromTo(ring, { x: q.x, y: q.y, scale: 0.4, opacity: 0.8 }, { scale: 2.6, opacity: 0, duration: 0.8, ease: 'power2.out' });
    };
    const prog = { p: 0 };
    gsap.to(prog, {
      p: 1,
      ease: 'none',
      onUpdate: () => {
        if (!geo) measure();
        const t = prog.p;
        draw.style.strokeDashoffset = 1 - t;
        const q = pt(t);
        gsap.set(dot, { x: q.x, y: q.y, opacity: t > 0.002 && t < 0.998 ? 1 : 0.0 });
        steps.forEach((s, i) => {
          const on = t >= geo.cy[i];
          if (on !== lit[i]) {
            lit[i] = on;
            s.classList.toggle('on', on);
            on && pulse(i);
          }
        });
      },
      scrollTrigger: { trigger: list, start: 'top 70%', end: 'bottom 60%', scrub: 0.4, onRefresh: () => (geo = null) },
    });
  }
}

document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());
