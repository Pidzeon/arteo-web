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
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

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
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Zavrieť menu' : 'Otvoriť menu');
    menuBtn.querySelector('i').className = open ? 'ph ph-x' : 'ph ph-list';
    document.body.style.overflow = open ? 'hidden' : '';
    if (lenis) (open ? lenis.stop() : lenis.start());
    if (open && hasGsap && !reduce) {
      gsap.fromTo(menu.querySelectorAll('a'),
        { yPercent: 60, opacity: 0 },
        { yPercent: 0, opacity: 1, stagger: 0.06, duration: 0.8, ease: 'expo.out' });
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
  }

  let reg = 0;
  if (lenis) {
    onTick(() => {
      const target = clamp(lenis.velocity * 0.9, -16, 16);
      const next = lerp(reg, target, 0.12);
      if (Math.abs(next - reg) > 0.01 || (Math.abs(next) > 0.01 && Math.abs(next) < 0.05)) {
        reg = Math.abs(next) < 0.02 ? 0 : next;
        root.style.setProperty('--reg', reg.toFixed(2));
      }
    });
  }

  /* ---------- Hero wordmark ---------- */
  const wm = document.querySelector('.wordmark');
  const layers = [...wm.querySelectorAll('.wm-layer')];
  const letters = 'ARTEO'.split('');
  layers.forEach(l => { l.innerHTML = letters.map(c => `<span>${c}</span>`).join(''); });
  const blueEls = [...layers[0].children];
  const pinkEls = [...layers[1].children];
  const pinkLayer = layers[1];
  const hero = document.querySelector('.hero');

  const BASE_W = 86; // condensed-ish base: taller letters for the same width
  const st = letters.map(() => ({ b: BASE_W, p: BASE_W }));
  let centers = [];
  let fontPx = 200;
  let sigma = 120;
  const pointer = { x: 0, active: false, vx: 0, lastX: null };
  const off = { x: 0, y: 0 };
  const intro = { on: !reduce && hasGsap, w: Object.fromEntries(letters.map((_, i) => [i, 125])), plate: reduce ? 0 : 1 };

  function fitWordmark() {
    wm.style.fontSize = '100px';
    blueEls.forEach(s => s.style.setProperty('--w', BASE_W));
    pinkEls.forEach(s => s.style.setProperty('--w', BASE_W));
    const natural = blueEls.reduce((sum, s) => sum + s.getBoundingClientRect().width, 0);
    const avail = wm.clientWidth;
    fontPx = (100 * avail / natural) * 0.985;
    wm.style.fontSize = fontPx.toFixed(2) + 'px';
    const wmLeft = wm.getBoundingClientRect().left;
    centers = blueEls.map(s => { const r = s.getBoundingClientRect(); return r.left - wmLeft + r.width / 2; });
    sigma = (avail / letters.length) * 0.85;
  }

  hero.addEventListener('pointermove', e => {
    const rect = wm.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    if (pointer.lastX !== null) pointer.vx = lerp(pointer.vx, e.clientX - pointer.lastX, 0.5);
    pointer.lastX = e.clientX;
    pointer.active = e.pointerType === 'mouse' || e.pointerType === 'pen';
  });
  hero.addEventListener('pointerleave', () => { pointer.active = false; pointer.lastX = null; });

  function wordmarkFrame(time) {
    if (!centers.length) return;
    const width = wm.clientWidth;
    // No pointer: a slow virtual cursor sweeps the word so it keeps breathing.
    const x = pointer.active ? pointer.x : width / 2 + Math.sin(time * 0.45) * width * 0.42;
    const gain = pointer.active ? 46 : 30;

    const prox = centers.map(c => Math.exp(-Math.pow((x - c) / sigma, 2)));
    const mean = prox.reduce((a, b) => a + b, 0) / prox.length;

    st.forEach((s, i) => {
      let t = reduce ? BASE_W : clamp(BASE_W + gain * (prox[i] - mean) * 1.6, 75, 125);
      if (intro.on) t = intro.w[i];
      s.b = lerp(s.b, t, 0.14);
      s.p = lerp(s.p, t, 0.075); // pink plate lags: shapes ghost while stretching
      blueEls[i].style.setProperty('--w', s.b.toFixed(1));
      pinkEls[i].style.setProperty('--w', s.p.toFixed(1));
    });

    pointer.vx *= 0.9;
    const rest = fontPx * 0.012;
    const tx = rest + clamp(pointer.vx * 0.6, -28, 28) + intro.plate * -fontPx * 0.14;
    const ty = -rest * 0.6 + reg * 1.2 + intro.plate * fontPx * 0.05;
    off.x = lerp(off.x, tx, 0.1);
    off.y = lerp(off.y, ty, 0.1);
    pinkLayer.style.setProperty('--mx', off.x.toFixed(2) + 'px');
    pinkLayer.style.setProperty('--my', off.y.toFixed(2) + 'px');
  }
  if (!reduce) onTick(wordmarkFrame);

  /* ---------- Load sequence: plates come in out of register, then lock ---------- */
  function playIntro() {
    if (!intro.on) { intro.plate = 0; wordmarkFrame(0); return; }
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, onComplete: () => { intro.on = false; } });
    tl.from(blueEls, { yPercent: 70, opacity: 0, duration: 1.3, stagger: 0.07 }, 0)
      .from(pinkEls, { yPercent: 90, opacity: 0, duration: 1.5, stagger: 0.07 }, 0.12)
      .to(intro.w, { 0: BASE_W, 1: BASE_W, 2: BASE_W, 3: BASE_W, 4: BASE_W, duration: 1.6, ease: 'expo.inOut' }, 0.1)
      .to(intro, { plate: 0, duration: 1.8, ease: 'expo.inOut' }, 0.35)
      .from('.hero-title', { '--reg-local': 30, duration: 1.8 }, 0.3)
      .from('.hero-title, .hero-side', { y: 26, opacity: 0, duration: 1.2, stagger: 0.1 }, 0.25);
    // Hand off from the intro width values to the live interaction smoothly.
    tl.add(() => { intro.on = false; }, 1.7);
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
    if (!desktopMQ.matches && hasGsap) setTimeout(() => ScrollTrigger.refresh(), 50);
  }
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
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      fitWordmark();
      if (hasGsap) ScrollTrigger.refresh();
    }, 150);
  });
})();
