/* Arteo – interactions and motion.
   Motif: two print plates (blue, pink) that drift out of register with
   movement and settle back. Everything degrades to static without GSAP or
   with prefers-reduced-motion. */
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const desktopMQ = matchMedia('(min-width: 901px)');
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  if (hasGsap) {
    gsap.registerPlugin(ScrollTrigger);
    // Phones resize the viewport when the URL bar slides; re-measuring then makes the page jump.
    ScrollTrigger.config({ ignoreMobileResize: true });
  }

  // Always start at the top so the load sequence is seen and pinned sections measure cleanly.
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (!location.hash) window.scrollTo(0, 0);

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  /* One frame loop for everything continuous. */
  const tickers = [];
  const onTick = fn => tickers.push(fn);
  if (hasGsap) {
    gsap.ticker.add((time, dt) => tickers.forEach(fn => fn(time, dt)));
  } else {
    let last = performance.now();
    const loop = now => {
      const dt = now - last; last = now;
      tickers.forEach(fn => fn(now / 1000, dt));
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /* ---------- Slovak typesetting: keep one-letter words off line ends ---------- */
  const glue = str => str.replace(/(^|[\s(„])([aikosuvzAIKOSUVZ])\s+/g, '$1$2\u00A0');
  (function glueText() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n => { if (n.parentElement.closest('script, style')) return; n.textContent = glue(n.textContent); });
    document.querySelectorAll('[data-text]').forEach(el => { el.dataset.text = glue(el.dataset.text); });
  })();

  /* ---------- Theme ---------- */
  const themeBtn = document.querySelector('.theme-toggle');
  const sysDark = matchMedia('(prefers-color-scheme: dark)');
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  const isDark = () => (root.dataset.theme ? root.dataset.theme === 'dark' : sysDark.matches);

  function syncThemeUI() {
    const dark = isDark();
    themeBtn.setAttribute('aria-label', dark ? 'Prepnúť na svetlý režim' : 'Prepnúť na tmavý režim');
    themeBtn.querySelector('i').className = dark ? 'ph ph-sun' : 'ph ph-moon';
    metaTheme.setAttribute('content', dark ? '#141417' : '#EEEEE9');
  }
  themeBtn.addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('arteo-theme', next); } catch (e) { /* storage blocked */ }
    syncThemeUI();
  });
  if (sysDark.addEventListener) sysDark.addEventListener('change', syncThemeUI);
  syncThemeUI();

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    if (hasGsap) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.lagSmoothing(0);
    }
    onTick(time => lenis.raf(time * 1000));
  }

  /* ---------- Mobile menu ---------- */
  const menuBtn = document.querySelector('.menu-toggle');
  const menu = document.getElementById('mobile-menu');
  let menuOpen = false;

  function setMenu(open) {
    menuOpen = open;
    menu.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Zavrieť menu' : 'Otvoriť menu');
    menuBtn.querySelector('i').className = open ? 'ph ph-x' : 'ph ph-list';
    // iOS ignores overflow on body alone; locking the root stops the page scrolling under the menu.
    root.style.overflow = document.body.style.overflow = open ? 'hidden' : '';
    if (lenis) (open ? lenis.stop() : lenis.start());
    if (open) nav.classList.remove('is-hidden');
    if (open && hasGsap && !reduce) {
      gsap.fromTo(menu.querySelectorAll('a'),
        { yPercent: 70, opacity: 0 },
        { yPercent: 0, opacity: 1, stagger: 0.05, duration: 0.7, delay: 0.12, ease: 'expo.out', overwrite: true });
    }
  }
  menuBtn.addEventListener('click', () => setMenu(!menuOpen));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menuOpen) { setMenu(false); menuBtn.focus(); } });

  /* ---------- Anchor links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (menuOpen) setMenu(false);
      if (lenis) lenis.scrollTo(target, { duration: 1.4 });
      else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
      if (id !== '#top') target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });

  /* ---------- Nav state + scroll-velocity misregistration ---------- */
  const nav = document.querySelector('.nav');
  if (hasGsap) {
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate(self) {
        const y = self.scroll();
        nav.classList.toggle('is-scrolled', y > 24);
        nav.classList.toggle('is-hidden', self.direction === 1 && y > 520 && !menuOpen);
      }
    });
    // A refresh measures from the top for a moment; re-read the real position afterwards.
    ScrollTrigger.addEventListener('refresh', () => nav.classList.toggle('is-scrolled', window.scrollY > 24));
  }

  // Written onto the misregistered headings only: a variable on <html> would
  // restyle the whole document every frame, which is what stutters on phones.
  let reg = 0;
  let regStr = '0.00';
  const regEls = [...document.querySelectorAll('.reg')];
  if (lenis) {
    onTick(() => {
      const target = clamp(lenis.velocity * 0.9, -16, 16);
      const next = lerp(reg, target, 0.12);
      reg = Math.abs(next) < 0.02 ? 0 : next;
      const s = reg.toFixed(2);
      if (s !== regStr) {
        regStr = s;
        regEls.forEach(el => el.style.setProperty('--reg', s));
      }
    });
  }

  /* ---------- Hero poster: the logo's pink r arch overprints the headline ----------
     The arch is the r arch from the Arteo logo (stroke = 26/61.5 of its radius,
     180..310 deg), scaled to the hero and anchored to the headline so it always
     crosses its right side. Where it overlaps the blue headline the inks blend
     into the overprint colour. It leans and turns toward the pointer, turns as
     the hero scrolls away, and (mouse only) can be dragged and springs back. */
  const hero = document.querySelector('.hero');
  const title = hero.querySelector('.hero-title');
  const arc = hero.querySelector('.hero-arch');
  const STROKE = 26 / 61.5;
  const nf = v => (Math.round(v * 100) / 100).toString();
  arc.innerHTML =
    `<defs><pattern id="arch-dots" patternUnits="userSpaceOnUse" width="7" height="7">` +
    `<circle class="arch-dot" cx="3.5" cy="3.5" r="2.6"/></pattern></defs>` +
    `<path class="arch-home" fill="url(#arch-dots)"/>` +
    `<g class="arch-in"><g class="arch-move"><path class="arch-ink"/></g></g>`;
  const home = arc.querySelector('.arch-home');
  const ink = arc.querySelector('.arch-ink');
  const move = arc.querySelector('.arch-move');

  const geo = { cx: 0, cy: 0, r: 0 };
  const band = (cx, cy, ro, ri, a0, a1) => {
    const rad = d => d * Math.PI / 180;
    const P = (q, a) => `${nf(cx + q * Math.cos(rad(a)))} ${nf(cy + q * Math.sin(rad(a)))}`;
    return `M${P(ro, a0)}A${nf(ro)} ${nf(ro)} 0 0 1 ${P(ro, a1)}L${P(ri, a1)}A${nf(ri)} ${nf(ri)} 0 0 0 ${P(ri, a0)}Z`;
  };

  // Kept under the old name: boot and resize call it.
  function fitWordmark() {
    const h = hero.getBoundingClientRect();
    const t = title.getBoundingClientRect();
    const W = h.width, H = h.height;
    const tRight = t.right - h.left, tBottom = t.bottom - h.top;
    let r, cx, cy;
    if (W > 900) {
      r = Math.min(W * 0.4, H * 0.68);
      cx = Math.min(tRight, W * 0.74);
      cy = tBottom + r * 0.18;
      r = Math.min(r, cy - 70); // keep the top of the arch below the nav
    } else {
      r = W * 0.9;
      cx = W * 0.98;
      cy = tBottom + r * 0.42;
    }
    // The arch's lowest point is its left end at cy: keep it above the intro text and buttons.
    const bTop = hero.querySelector('.hero-bottom').getBoundingClientRect().top - h.top;
    const cap = bTop - 20;
    if (cy > cap) {
      r = Math.max(60, r - (cy - cap) * 0.5);
      cy = cap;
    }
    r = Math.min(r, cy - 60);
    Object.assign(geo, { cx, cy, r });
    arc.setAttribute('viewBox', `0 0 ${nf(W)} ${nf(H)}`);
    const d = band(cx, cy, r, r * (1 - STROKE), 180, 310);
    ink.setAttribute('d', d);
    home.setAttribute('d', d);
    written.t = '';
    render();
  }

  const pos = { x: 0, y: 0 };            // drag offset (px)
  const lean = { x: 0, y: 0, a: 0 };     // pointer lean + turn
  const drag = { on: false, id: null, sx: 0, sy: 0, ox: 0, oy: 0 };
  const hover = { x: 0, y: 0, active: false };
  const intro = { on: !reduce && hasGsap, a: reduce ? 0 : -38 };
  let spin = 0;                          // scroll turn (deg)
  let springBack = null;
  const written = { t: '', o: '' };
  const rubber = (d, lim) => Math.sign(d) * lim * (1 - Math.exp(-Math.abs(d) / lim));

  function render() {
    const x = pos.x + lean.x, y = pos.y + lean.y + reg * 0.8;
    const a = lean.a + spin + intro.a;
    const t = `translate(${nf(x)} ${nf(y)}) rotate(${nf(a)} ${nf(geo.cx)} ${nf(geo.cy)})`;
    if (written.t !== t) {
      written.t = t;
      move.setAttribute('transform', t);
      home.setAttribute('transform', `translate(0 ${nf(reg * 0.8)}) rotate(${nf(spin + intro.a)} ${nf(geo.cx)} ${nf(geo.cy)})`);
    }
    // While dragged out, a halftone outline marks where the plate belongs.
    const o = clamp(Math.hypot(pos.x, pos.y) / 40, 0, 1).toFixed(2);
    if (written.o !== o) { written.o = o; home.style.opacity = o; }
  }

  ink.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse' || drag.on) return; // touch scrolls the page instead
    e.preventDefault();
    if (springBack) { springBack.kill(); springBack = null; }
    Object.assign(drag, { on: true, id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y });
    ink.setPointerCapture(e.pointerId);
    arc.classList.add('is-dragging');
  });
  ink.addEventListener('pointermove', e => {
    if (!drag.on || e.pointerId !== drag.id) return;
    pos.x = rubber(drag.ox + e.clientX - drag.sx, geo.r * 0.5);
    pos.y = rubber(drag.oy + e.clientY - drag.sy, geo.r * 0.4);
    if (reduce) render();
  });
  const release = e => {
    if (!drag.on || e.pointerId !== drag.id) return;
    drag.on = false;
    arc.classList.remove('is-dragging');
    if (hasGsap && !reduce) {
      springBack = gsap.to(pos, { x: 0, y: 0, duration: 1.6, ease: 'elastic.out(1, 0.32)', onUpdate: render });
    } else { pos.x = 0; pos.y = 0; render(); }
  };
  ink.addEventListener('pointerup', release);
  ink.addEventListener('pointercancel', release);

  hero.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    const h = hero.getBoundingClientRect();
    hover.x = (e.clientX - h.left) / h.width - 0.5;   // -0.5..0.5
    hover.y = (e.clientY - h.top) / h.height - 0.5;
    hover.active = true;
  });
  hero.addEventListener('pointerleave', () => { hover.active = false; });

  let heroVisible = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; }).observe(hero);
  }

  function wordmarkFrame() {
    if (!heroVisible && !intro.on && !drag.on) return;
    const k = hover.active && !drag.on ? 1 : 0;
    lean.x = lerp(lean.x, k * hover.x * geo.r * 0.07, 0.06);
    lean.y = lerp(lean.y, k * hover.y * geo.r * 0.05, 0.06);
    lean.a = lerp(lean.a, k * hover.x * -9, 0.05);   // the plate turns, so the overprint slides over the words
    const p = clamp(window.scrollY / Math.max(1, hero.offsetHeight), 0, 1);
    spin = lerp(spin, p * 32, 0.12);
    render();
  }
  if (!reduce) onTick(wordmarkFrame);

  /* ---------- Load sequence: the plate swings in and locks over the headline ---------- */
  function playIntro() {
    if (!intro.on) { intro.a = 0; render(); return; }
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, onComplete: () => { intro.on = false; } });
    tl.from('.hero-title', { y: 40, opacity: 0, duration: 1.3 }, 0.1)
      .from('.hero-title', { '--reg-local': 30, duration: 1.8 }, 0.3)
      .to(intro, { a: 0, duration: 1.9, ease: 'expo.out', onUpdate: render }, 0.35)
      .from('.arch-in', { opacity: 0, duration: 0.6, ease: 'power1.out' }, 0.35)
      .from('.hero-bottom > *', { y: 26, opacity: 0, duration: 1.2, stagger: 0.1 }, 0.6);
  }

  /* ---------- Work: horizontal pan ---------- */
  function setupWork() {
    if (!hasGsap) return;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
      root.classList.add('has-pan');
      const pin = document.querySelector('.work-pin');
      const track = document.querySelector('.work-track');
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

      const pan = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: pin,
          start: 'top top',
          end: () => '+=' + distance(),
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1
        }
      });

      // Each image drifts inside its frame while the strip moves.
      gsap.utils.toArray('.project-media img').forEach(img => {
        gsap.fromTo(img, { xPercent: 6 }, {
          xPercent: -6, ease: 'none',
          scrollTrigger: { trigger: img.closest('.project'), containerAnimation: pan, start: 'left right', end: 'right left', scrub: true }
        });
      });

      // Projects arrive slightly out of register (rotated) and straighten.
      gsap.utils.toArray('.project').forEach((p, i) => {
        gsap.fromTo(p, { rotate: i % 2 ? -3 : 3, yPercent: i % 2 ? -4 : 4 }, {
          rotate: 0, yPercent: 0, ease: 'none',
          scrollTrigger: { trigger: p, containerAnimation: pan, start: 'left 100%', end: 'left 45%', scrub: true }
        });
      });

      return () => root.classList.remove('has-pan');
    });

    // Phones: the strip becomes a column, but each print still arrives a little
    // out of register and settles as it scrolls into place.
    mm.add('(max-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      gsap.utils.toArray('.project').forEach((p, i) => {
        const media = p.querySelector('.project-media');
        gsap.fromTo(media, { rotate: i % 2 ? -2.5 : 2.5, y: 56 }, {
          rotate: 0, y: 0, ease: 'none',
          scrollTrigger: { trigger: p, start: 'top 100%', end: 'top 58%', scrub: 0.5 }
        });
        gsap.fromTo(media.querySelector('img'), { yPercent: -5, scale: 1.12 }, {
          yPercent: 5, scale: 1.12, ease: 'none',
          scrollTrigger: { trigger: media, start: 'top bottom', end: 'bottom top', scrub: true }
        });
      });
    });
  }

  /* ---------- Manifesto: words print in as you read ---------- */
  function setupManifesto() {
    const el = document.querySelector('.manifesto-text');
    [...el.childNodes].forEach(node => {
      if (node.nodeType !== 3) return;
      const frag = document.createDocumentFragment();
      // Split on breaking whitespace only, so no-break spaces stay inside a word.
      node.textContent.split(/([ \t\n\r]+)/).forEach(part => {
        if (!part) return;
        if (/^[ \t\n\r]+$/.test(part)) { frag.append(document.createTextNode(' ')); return; }
        const s = document.createElement('span');
        s.className = 'w';
        s.textContent = part;
        frag.append(s);
      });
      node.replaceWith(frag);
    });
    if (!hasGsap || reduce) return;
    const items = el.querySelectorAll('.w, .inline-img');
    gsap.fromTo(items, { opacity: 0.12 }, {
      opacity: 1, ease: 'none', stagger: 0.05,
      scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true }
    });
    gsap.fromTo(el.querySelectorAll('.inline-img'), { scale: 0.4 }, {
      scale: 1, ease: 'none', stagger: 0.5,
      scrollTrigger: { trigger: el, start: 'top 75%', end: 'bottom 50%', scrub: true }
    });
  }

  /* ---------- Section titles: print pull ---------- */
  function setupTitles() {
    if (!hasGsap || reduce) return;
    gsap.utils.toArray('.section-title.reg, .contact-title').forEach(el => {
      const settings = getComputedStyle(el).fontVariationSettings;
      const wdth = /"wdth"\s+([\d.]+)/.exec(settings);
      const wght = /"wght"\s+([\d.]+)/.exec(settings);
      const w = wdth ? +wdth[1] : 84;
      const g = wght ? +wght[1] : 800;
      gsap.fromTo(el,
        { '--reg-local': 28, fontVariationSettings: `"wdth" ${Math.min(125, w + 36)}, "wght" ${g}` },
        {
          '--reg-local': 0, fontVariationSettings: `"wdth" ${w}, "wght" ${g}`,
          duration: 1.6, ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true }
        });
    });
  }

  /* ---------- Services accordion ---------- */
  const accItems = [...document.querySelectorAll('.acc-item')];
  function openAcc(item, toggle) {
    const closing = toggle && item.classList.contains('is-open');
    accItems.forEach(i => {
      const open = i === item && !closing;
      i.classList.toggle('is-open', open);
      i.querySelector('.acc-head').setAttribute('aria-expanded', String(open));
    });
    // Stacked accordion animates its height; measure triggers below it once it has settled.
    if (!desktopMQ.matches && hasGsap) {
      clearTimeout(accTimer);
      accTimer = setTimeout(() => ScrollTrigger.refresh(), 700);
    }
  }
  let accTimer;
  accItems.forEach(item => {
    const head = item.querySelector('.acc-head');
    head.addEventListener('click', () => openAcc(item, !desktopMQ.matches));
    if (finePointer) item.addEventListener('pointerenter', () => { if (desktopMQ.matches) openAcc(item, false); });
  });

  /* ---------- Clients marquee (direction follows scroll) ---------- */
  function setupMarquee() {
    const track = document.querySelector('.marquee-track');
    const group = track.querySelector('.marquee-group');
    if (reduce) return;
    const clone = group.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.append(clone);

    let x = 0, dir = -1, groupW = group.offsetWidth, visible = false;
    window.addEventListener('resize', () => { groupW = group.offsetWidth; });
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(track);

    onTick((time, dt) => {
      if (!visible || !groupW) return;
      const v = lenis ? lenis.velocity : 0;
      if (Math.abs(v) > 0.2) dir = v > 0 ? -1 : 1;
      const speed = (55 + Math.min(Math.abs(v) * 45, 700)) * (dt / 1000);
      x += dir * speed;
      if (x <= -groupW) x += groupW;
      if (x > 0) x -= groupW;
      track.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
    });
  }

  /* ---------- Testimonial: the image is pulled out from under a pink plate ---------- */
  function setupVoices() {
    const media = document.querySelector('.voices-media');
    const wipe = media && media.querySelector('.voices-wipe');
    if (!wipe || !hasGsap || reduce) return;
    gsap.fromTo(wipe, { scaleX: 1, transformOrigin: 'right center' }, {
      scaleX: 0, duration: 1.3, ease: 'expo.inOut',
      scrollTrigger: { trigger: media, start: 'top 75%', once: true }
    });
    gsap.fromTo(media.querySelector('img'), { scale: 1.15 }, {
      scale: 1, duration: 1.8, ease: 'expo.out',
      scrollTrigger: { trigger: media, start: 'top 75%', once: true }
    });
  }

  /* ---------- Magnetic buttons ---------- */
  function setupMagnetic() {
    if (!finePointer || reduce || !hasGsap) return;
    document.querySelectorAll('.magnetic').forEach(el => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' });
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.25);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.35);
      });
      el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
  }

  /* ---------- Contact form (opens the mail client, no backend yet) ---------- */
  function setupForm() {
    const form = document.querySelector('.form');
    const status = form.querySelector('.form-status');
    const fields = [
      { el: form.elements.name, err: 'e-name', ok: v => v.trim().length > 1 },
      { el: form.elements.email, err: 'e-mail', ok: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) },
      { el: form.elements.message, err: 'e-msg', ok: v => v.trim().length > 3 }
    ];

    function mark(f, valid) {
      const err = document.getElementById(f.err);
      err.hidden = valid;
      f.el.setAttribute('aria-invalid', String(!valid));
      if (valid) f.el.removeAttribute('aria-describedby');
      else f.el.setAttribute('aria-describedby', f.err);
    }

    fields.forEach(f => f.el.addEventListener('input', () => {
      if (f.el.getAttribute('aria-invalid') === 'true') mark(f, f.ok(f.el.value));
    }));

    form.addEventListener('submit', e => {
      e.preventDefault();
      let firstBad = null;
      fields.forEach(f => {
        const valid = f.ok(f.el.value);
        mark(f, valid);
        if (!valid && !firstBad) firstBad = f.el;
      });
      if (firstBad) { firstBad.focus(); status.hidden = true; return; }

      const topic = form.querySelector('input[name="topic"]:checked');
      const company = form.elements.company.value.trim();
      const phone = form.elements.phone.value.trim();
      const body = [
        form.elements.message.value.trim(),
        '',
        topic ? 'Potrebujem: ' + topic.value : '',
        company ? 'Firma: ' + company : '',
        phone ? 'Telefón: ' + phone : '',
        form.elements.name.value.trim() + ', ' + form.elements.email.value.trim()
      ].filter((line, i) => i < 2 || line).join('\n');
      const href = 'mailto:hello@arteo.sk'
        + '?subject=' + encodeURIComponent('Nový projekt: ' + form.elements.name.value.trim())
        + '&body=' + encodeURIComponent(body);
      window.location.href = href;
      status.hidden = false;
      status.textContent = 'Otvorili sme váš e-mailový program s pripravenou správou. Ak sa neotvoril, napíšte nám priamo na hello@arteo.sk.';
    });
  }

  /* ---------- Boot ---------- */
  setupManifesto();
  setupWork();
  setupTitles();
  setupMarquee();
  setupVoices();
  setupMagnetic();
  setupForm();

  const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  fontsReady.then(() => {
    fitWordmark();
    playIntro();
    if (hasGsap) ScrollTrigger.refresh();
  });

  let resizeTimer;
  let lastWidth = window.innerWidth;
  window.addEventListener('resize', () => {
    // Height-only changes are the phone URL bar sliding; ScrollTrigger handles real ones itself.
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      fitWordmark();
      if (hasGsap) ScrollTrigger.refresh();
    }, 150);
  });
})();
