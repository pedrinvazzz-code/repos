(() => {
  "use strict";

  const D = window.SITE;
  const ICONS = window.ICONS;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const PANELS = ["inicio", "projetos", "lab", "perfil"];

  function icon(name, attrs = "") {
    const i = ICONS.ui[name] || ICONS.logos[name];
    return i ? `<svg viewBox="${i.viewBox}" fill="currentColor" aria-hidden="true" focusable="false" ${attrs}>${i.body}</svg>` : "";
  }

  const store = {
    get(key) { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* sem armazenamento: segue sem lembrar */ } }
  };

  /* ---------- Textos fixos ---------- */
  function initText() {
    $("[data-name]").textContent = D.name;
    $("[data-role]").textContent = D.role;
    $("[data-updated]").textContent = D.updated;

    const top = D.links.filter((l) => ["LinkedIn", "E-mail", "GitHub"].includes(l.label));
    $("[data-nav-links]").innerHTML = top.map((l) =>
      `<a class="nav-link" href="${l.url}"${l.url.startsWith("http") ? ' target="_blank" rel="noopener"' : ""}>${l.label === "E-mail" ? "Email" : esc(l.label)}</a>`
    ).join("");

    const hour = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone: D.timeZone }).format(new Date()));
    $("[data-greeting]").textContent = hour >= 5 && hour < 12 ? "bom dia," : hour >= 12 && hour < 18 ? "boa tarde," : "boa noite,";

    const P = D.poster;
    $("[data-poster-left]").textContent = P.left;
    $("[data-poster-right]").textContent = P.right;
    $("[data-poster-sub-left]").textContent = P.subLeft;
    const handle = `<a class="handle" href="${P.subRight.url}" target="_blank" rel="noopener">${esc(P.subRight.handle)}</a>`;
    $("[data-poster-sub-right]").innerHTML = `${esc(P.subRight.text)} ${handle}`;
    $("[data-poster-sub-merged]").innerHTML = `${esc(P.subLeft)} · ${esc(P.subRight.text.replace(/^agora: /, ""))} ${handle}`;

    const folder = ICONS.ui["folder-simple-fill"];
    $("[data-icon-folder]").innerHTML =
      `<svg viewBox="${folder.viewBox}" aria-hidden="true"><defs><linearGradient id="folder-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9d6fa"/><stop offset="1" stop-color="#5fa8ec"/></linearGradient></defs><g fill="url(#folder-grad)">${folder.body}</g></svg>`;
    $("[data-icon-lab]").innerHTML = icon("table-fill");
  }

  /* ---------- Console: mini pipeline na tela ---------- */
  const toy = { active: true };
  function initToy() {
    const canvas = $("[data-screen]");
    const ctx = canvas.getContext("2d");
    const rowsEl = $("[data-rows]");
    const css = getComputedStyle(document.documentElement);
    const C = Object.fromEntries(["bg", "dot", "bar", "bar-top", "block", "ground", "floor", "duck", "beak"]
      .map((k) => [k, css.getPropertyValue(`--scr-${k}`).trim()]));
    const W = 96, H = 54, GROUND = 47, TOP = 12, BAR_W = 10, GAP = 6;
    const X0 = Math.round((W - (5 * BAR_W + 4 * GAP)) / 2);
    const MAX_H = GROUND - TOP - 3;
    const BASE = [5, 9, 10, 14, 4];

    let bars = BASE.slice();
    let rows = bars.reduce((a, b) => a + b, 0);
    let blocks = [];
    let sparks = [];
    let flash = 0;
    const duck = { x: 6, dir: 1, step: 0, y: 0, vy: 0, dash: 0 };
    const DUCK = ["...XX.", "..XoXb", "XXXXX.", ".XXXX."];
    const LEGS = ["..X.X.", ".X..X."];

    const px = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h); };
    const barX = (i) => X0 + i * (BAR_W + GAP);

    function spawn(bar, x) {
      const b = bar ?? Math.floor(Math.random() * 5);
      const bx = x ?? barX(b) + 1 + Math.floor(Math.random() * (BAR_W - 3));
      blocks.push({ bar: b, x: Math.min(Math.max(bx, barX(b)), barX(b) + BAR_W - 2), y: TOP - 2, vy: 0.2 });
    }
    function land(bar, x, y) {
      bars[bar]++;
      rows++;
      sparks.push({ x, y, t: 8 });
      if (bars[bar] > MAX_H) {
        bars = bars.map((h) => Math.max(2, Math.ceil(h / 2)));
        flash = 6;
      }
    }
    function update() {
      for (const b of blocks) {
        b.vy = Math.min(b.vy + 0.06, 1.3);
        b.y += b.vy;
        const target = GROUND - bars[b.bar] - 2;
        if (b.y >= target) { b.done = true; land(b.bar, b.x, target); }
      }
      blocks = blocks.filter((b) => !b.done);
      sparks.forEach((sp) => sp.t--);
      sparks = sparks.filter((sp) => sp.t > 0);
      if (flash) flash--;
      const speed = duck.dash > 0 ? 0.7 : 0.16;
      if (duck.dash > 0) duck.dash--;
      duck.x += speed * duck.dir;
      duck.step += duck.dash > 0 ? 0.25 : 0.08;
      if (duck.x > W - 8) { duck.x = W - 8; duck.dir = -1; }
      if (duck.x < 2) { duck.x = 2; duck.dir = 1; }
      if (duck.y < 0 || duck.vy) {
        duck.vy += 0.12;
        duck.y += duck.vy;
        if (duck.y >= 0) { duck.y = 0; duck.vy = 0; }
      }
    }
    function draw() {
      const bg = flash ? C.bar : C.bg;
      px(0, 0, W, H, bg);
      for (let x = 1; x < W; x += 3) px(x, TOP - 4, 1, 1, C.dot);
      bars.forEach((h, i) => {
        px(barX(i), GROUND - h, BAR_W, h, flash ? C["bar-top"] : C.bar);
        px(barX(i), GROUND - h, BAR_W, 1, C["bar-top"]);
      });
      for (const b of blocks) px(b.x, b.y, 2, 2, C.block);
      for (const sp of sparks) {
        const d = 9 - sp.t;
        px(sp.x - d, sp.y - 1, 1, 1, C["bar-top"]);
        px(sp.x + 1 + d, sp.y - 1, 1, 1, C["bar-top"]);
        px(sp.x + 0.5, sp.y - 1 - d, 1, 1, C["bar-top"]);
      }
      px(0, GROUND, W, 1, C.ground);
      for (let x = 0; x < W; x++) for (let y = GROUND + 1; y < H; y++) if ((x + y) % 2 === 0) px(x, y, 1, 1, C.floor);
      const art = [...DUCK, LEGS[Math.floor(duck.step) % 2]];
      const dx = Math.round(duck.x);
      const dy = GROUND - art.length + Math.round(duck.y);
      art.forEach((row, ry) => {
        [...row].forEach((ch, rx) => {
          if (ch === ".") return;
          const col = duck.dir > 0 ? rx : row.length - 1 - rx;
          px(dx + col, dy + ry, 1, 1, ch === "o" ? bg : ch === "b" ? C.beak : C.duck);
        });
      });
      rowsEl.textContent = String(rows);
    }

    let raf = 0;
    let last = 0;
    let acc = 0;
    let trickle = 0;
    let visible = true;
    function frame(t) {
      raf = 0;
      if (!toy.active || !visible || document.hidden) return;
      const dt = Math.min(100, t - (last || t));
      last = t;
      acc += dt;
      trickle += dt;
      if (trickle > 2800) { trickle = 0; spawn(); }
      while (acc >= 1000 / 30) { update(); acc -= 1000 / 30; }
      draw();
      raf = requestAnimationFrame(frame);
    }
    toy.start = () => {
      if (reduceMotion) { draw(); return; }
      if (!raf) { last = 0; raf = requestAnimationFrame(frame); }
    };

    const grow = (i, n) => { bars[i] = Math.min(MAX_H, bars[i] + n); rows += n; };
    const actions = {
      run() {
        if (reduceMotion) { bars.forEach((_, i) => grow(i, 2)); draw(); return; }
        for (let i = 0; i < 10; i++) setTimeout(() => spawn(i % 5), i * 70);
        duck.vy = -1.1;
      },
      drop(bar, x) {
        if (reduceMotion) { grow(bar ?? Math.floor(Math.random() * 5), 1); draw(); return; }
        spawn(bar, x);
      },
      reset() {
        bars = BASE.slice();
        rows = bars.reduce((a, b) => a + b, 0);
        blocks = [];
        flash = reduceMotion ? 0 : 4;
        draw();
      },
      hop() { if (!reduceMotion && duck.y === 0) duck.vy = -1.5; },
      left() { duck.dir = -1; duck.dash = reduceMotion ? 0 : 18; if (reduceMotion) { duck.x = Math.max(2, duck.x - 8); draw(); } },
      right() { duck.dir = 1; duck.dash = reduceMotion ? 0 : 18; if (reduceMotion) { duck.x = Math.min(W - 8, duck.x + 8); draw(); } }
    };
    $("[data-run]").addEventListener("click", () => actions.run());
    $$("[data-key]").forEach((b) => b.addEventListener("click", () => actions[b.dataset.key]()));

    // Tocar na tela derruba um bloco na barra mais próxima.
    canvas.addEventListener("click", (e) => {
      const r = canvas.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * W;
      const bar = Math.max(0, Math.min(4, Math.round((x - X0 - BAR_W / 2) / (BAR_W + GAP))));
      actions.drop(bar, Math.round(x) - 1);
    });

    // Com o foco no console, o teclado também joga.
    const KEYS = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "hop", ArrowDown: "drop", a: "run", b: "reset", x: "hop", y: "drop" };
    $("[data-console]").addEventListener("keydown", (e) => {
      const action = KEYS[e.key.length === 1 ? e.key.toLowerCase() : e.key];
      if (!action || e.metaKey || e.ctrlKey || e.altKey) return;
      e.preventDefault();
      actions[action]();
    });

    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) toy.start(); }).observe(canvas);
    document.addEventListener("visibilitychange", () => { if (!document.hidden) toy.start(); });
    draw();
    toy.start();
  }

  /* ---------- Projetos ---------- */
  function formatStat(s, v) {
    const n = Math.round(v).toLocaleString("pt-BR");
    return s.format === "usd" ? `US$ ${n}` : s.format === "pct" ? `${n}%` : n;
  }
  function renderWorks() {
    $("[data-works]").innerHTML = D.projects.map((p, i) => {
      const preview = p.cover
        ? `<img src="${p.cover.src}" alt="" loading="lazy" decoding="async" style="object-position:${p.cover.position || "50% 50%"}">`
        : `<div class="work-stats">${p.stats.map((s) => `<div class="stat"><span class="stat-value" data-stat="${s.value}" data-format="${s.format}">${formatStat(s, s.value)}</span><span class="stat-label">${esc(s.label)}</span></div>`).join("")}</div>`;
      return `
        <a class="work-card" href="#projetos/${p.id}" data-case-open="${p.id}" style="--i:${i}">
          <div class="work-preview">${preview}</div>
          <div class="work-meta">
            <div class="work-meta-row">
              <span class="work-company">${esc(p.company)}</span>
              <span class="badge">${p.badge.live ? '<span class="badge-dot" aria-hidden="true"></span>' : ""}${esc(p.badge.text)}</span>
            </div>
            <h2 class="work-title">${esc(p.title)}</h2>
          </div>
        </a>`;
    }).join("");
  }

  function countStats() {
    if (reduceMotion) return;
    $$("[data-stat]").forEach((el) => {
      const target = Number(el.dataset.stat);
      const s = { format: el.dataset.format };
      const t0 = performance.now();
      const tick = (t) => {
        const k = Math.min(1, (t - t0) / 900);
        el.textContent = formatStat(s, target * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  function dealCards() {
    if (reduceMotion) return;
    const panel = $("#panel-projetos");
    const folder = $('[data-go="projetos"] .dock-icon').getBoundingClientRect();
    const ox = folder.left + folder.width / 2;
    const oy = folder.top + folder.height / 2;
    $$(".work-card", panel).forEach((card, i) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--dx", `${ox - (r.left + r.width / 2)}px`);
      card.style.setProperty("--dy", `${oy - (r.top + r.height / 2)}px`);
      card.style.setProperty("--rot", `${(i % 2 ? 1 : -1) * (4 + i * 2)}deg`);
    });
    panel.classList.remove("dealing");
    void panel.offsetWidth;
    panel.classList.add("dealing");
    clearTimeout(dealCards.t);
    dealCards.t = setTimeout(() => panel.classList.remove("dealing"), 1400);
  }

  /* ---------- Janela do projeto ---------- */
  const caseEl = $("[data-case]");
  const caseWin = $("[data-case-window]");
  let caseFromPage = false;
  let caseId = null;

  function renderMedia(m) {
    if (m.type === "phones") {
      return `<figure class="case-figure"><div class="case-phones">${m.items.map((it) =>
        `<img src="${it.src}" width="${it.width}" height="${it.height}" alt="${esc(it.alt)}" loading="lazy" decoding="async">`).join("")}</div>${m.caption ? `<figcaption>${esc(m.caption)}</figcaption>` : ""}</figure>`;
    }
    return `<figure class="case-figure"><img src="${m.src}" width="${m.width}" height="${m.height}" alt="${esc(m.alt)}" loading="lazy" decoding="async">${m.caption ? `<figcaption>${esc(m.caption)}</figcaption>` : ""}</figure>`;
  }

  function openCase(id) {
    const p = D.projects.find((x) => x.id === id);
    if (!p || (caseId === id && !caseEl.hidden)) return;
    caseId = id;
    const [first, ...rest] = p.media;
    caseWin.innerHTML = `
      <div class="window-bar">
        <span class="window-dots">
          <button class="window-dot window-dot--red" type="button" data-close-case aria-label="Fechar">${icon("x")}</button>
          <span class="window-dot window-dot--yellow" aria-hidden="true"></span>
          <span class="window-dot window-dot--green" aria-hidden="true"></span>
        </span>
        <span class="window-name">${esc(p.file)}</span>
      </div>
      <div class="case-scroll">
        <div class="case-in">
          <p class="case-company">${esc(p.company)}</p>
          <h1 class="case-title" id="case-title" tabindex="-1">${esc(p.title)}</h1>
          <p class="case-tagline">${esc(p.tagline)}</p>
          <ul class="case-tags" aria-label="Ferramentas">${p.stack.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
          ${first ? renderMedia(first) : ""}
          <div class="case-secs">${p.sections.map((s) => `<section class="case-sec"><h2>${esc(s.heading)}</h2><p>${esc(s.body)}</p></section>`).join("")}</div>
          ${rest.map(renderMedia).join("")}
          <div class="case-actions">
            <a class="btn btn-accent" href="${p.url}" target="_blank" rel="noopener">Ver no GitHub ${icon("arrow-up-right")}</a>
            <button class="btn btn-ghost" type="button" data-close-case>Fechar</button>
          </div>
        </div>
      </div>`;
    caseEl.hidden = false;
    caseEl.classList.remove("closing");
    document.documentElement.classList.add("locked");
    for (const el of [$(".top-nav"), $("main"), $(".dock")]) el.setAttribute("inert", "");
    $("#case-title", caseWin).focus({ preventScroll: true });
  }

  function hideCase() {
    if (caseEl.hidden) return;
    const id = caseId;
    caseId = null;
    for (const el of [$(".top-nav"), $("main"), $(".dock")]) el.removeAttribute("inert");
    document.documentElement.classList.remove("locked");
    const finish = () => { caseEl.hidden = true; caseWin.innerHTML = ""; };
    if (reduceMotion) finish();
    else { caseEl.classList.add("closing"); setTimeout(finish, 340); }
    const card = $(`[data-case-open="${id}"]`);
    if (card) card.focus({ preventScroll: true });
  }

  function closeCase() {
    if (caseEl.hidden) return;
    if (caseFromPage) { caseFromPage = false; history.back(); }
    else { history.replaceState(null, "", "#projetos"); hideCase(); }
  }

  /* ---------- Navegação entre painéis ---------- */
  let current = null;
  function parseHash() {
    const [panel, id] = location.hash.replace(/^#\/?/, "").split("/");
    return { panel: PANELS.includes(panel) ? panel : "inicio", caseId: panel === "projetos" && id ? id : null };
  }

  function showPanel(name) {
    if (name === current) return false;
    current = name;
    $$("[data-panel]").forEach((p) => {
      const on = p.dataset.panel === name;
      p.hidden = !on;
      p.classList.toggle("enter", on && !reduceMotion);
    });
    $$(".dock-item").forEach((b) => {
      if (b.dataset.go === name) b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
    });
    document.body.dataset.view = name;
    toy.active = name === "inicio";
    if (toy.active && toy.start) toy.start();
    window.scrollTo(0, 0);
    const titles = { inicio: "Engenharia de Dados", projetos: "Projetos", lab: "Laboratório", perfil: "Perfil" };
    document.title = `${D.name} | ${titles[name]}`;
    return true;
  }

  function route() {
    const { panel, caseId: id } = parseHash();
    const changed = showPanel(panel);
    if (changed && panel === "projetos" && !id) { requestAnimationFrame(dealCards); countStats(); }
    else if (changed && panel === "projetos") countStats();
    if (id) openCase(id);
    else hideCase();
  }

  function initNav() {
    document.addEventListener("click", (e) => {
      const go = e.target.closest("[data-go]");
      if (go) {
        e.preventDefault();
        const name = go.dataset.go;
        if (go.classList.contains("dock-item") && !reduceMotion) {
          go.classList.remove("bounce");
          void go.offsetWidth;
          go.classList.add("bounce");
        }
        const hash = name === "inicio" ? "" : `#${name}`;
        if (location.hash !== hash) {
          if (hash) location.hash = hash;
          else { history.pushState(null, "", location.pathname + location.search); route(); }
        }
        return;
      }
      const open = e.target.closest("[data-case-open]");
      if (open && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        caseFromPage = true;
        location.hash = `#projetos/${open.dataset.caseOpen}`;
        return;
      }
      if (e.target.closest("[data-close-case]")) closeCase();
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && caseId) closeCase(); });
    window.addEventListener("hashchange", route);
    window.addEventListener("popstate", route);
    // Ao voltar para uma página sem hash, o navegador só dispara popstate; route() é idempotente.
  }

  /* ---------- Laboratório ---------- */
  const KEYWORDS = {
    py: "def return try except raise as if else elif for in not is None import from class self and or with True False lambda",
    sql: "SELECT FROM GROUP BY AS AVG CREATE TABLE SCHEMA SET TO INTEGER TEXT PRIMARY KEY WHERE ORDER JOIN ON COUNT SUM",
    cs: "interface public private protected abstract class double string int void this static return new base override virtual using"
  };
  function highlight(code, lang) {
    const kw = new Set(KEYWORDS[lang].split(" "));
    const re = {
      py: /(#[^\n]*)|([fbr]?"(?:[^"\\\n]|\\.)*"|[fbr]?'(?:[^'\\\n]|\\.)*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)|([\s\S])/g,
      sql: /(--[^\n]*)|('(?:[^'\\]|\\.)*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)|([\s\S])/g,
      cs: /(\/\/[^\n]*)|(\$?"(?:[^"\\\n]|\\.)*")|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)|([\s\S])/g
    }[lang];
    let out = "";
    let prev = "";
    let m;
    while ((m = re.exec(code))) {
      if (m[1]) out += `<span class="tok-c">${esc(m[1])}</span>`;
      else if (m[2]) out += `<span class="tok-s">${esc(m[2])}</span>`;
      else if (m[3]) out += `<span class="tok-n">${m[3]}</span>`;
      else if (m[4]) {
        const w = m[4];
        if (kw.has(w)) out += `<span class="tok-k">${w}</span>`;
        else if (prev === "def" || prev === "class" || prev === "interface" || code[re.lastIndex] === "(") out += `<span class="tok-f">${w}</span>`;
        else out += w;
        prev = w;
        continue;
      } else out += esc(m[5]);
      if (m[5] === undefined || /\S/.test(m[5])) prev = "";
    }
    return out;
  }

  function renderLab() {
    const L = D.lab;
    $("[data-lab-title]").textContent = L.title;
    $("[data-lab-sub]").textContent = L.sub;
    const tile = (t) => {
      const media = t.image
        ? `<span class="tile-img"><img src="${t.image.src}" width="${t.image.width}" height="${t.image.height}" alt="${esc(t.image.alt)}" loading="lazy" decoding="async"></span>`
        : `<pre class="tile-code"><code>${highlight(t.code, t.lang)}</code></pre>`;
      return `<a class="tile${t.span === 2 ? " span-2" : ""}" href="${t.url}" target="_blank" rel="noopener" aria-label="${esc(t.name)}, abrir no GitHub">
        <span class="tile-bar"><span class="tile-dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="tile-name">${esc(t.name)}</span><span class="tile-open">${icon("arrow-up-right")}</span></span>
        ${media}
      </a>`;
    };
    const note = `<div class="note"><div class="note-bar"></div><div class="note-body"><h2 class="note-title">${esc(L.note.title)}</h2>${L.note.paragraphs.map((p) => `<p>${p}</p>`).join("")}</div></div>`;
    const [first, ...others] = L.tiles;
    $("[data-lab-grid]").innerHTML = tile(first) + note + others.map(tile).join("");
  }

  /* ---------- Adesivos ---------- */
  function initBoard() {
    const B = D.board;
    const desk = $("[data-board]");
    const paper = $("[data-paper]");
    const host = $("[data-stickers]");
    $("[data-board-title]").textContent = B.title;
    $("[data-todo]").innerHTML = B.todo.map((t) => `<li${t.done ? ' class="done"' : ""}><span>${esc(t.text)}</span>${t.done ? '<span class="sr-only"> (feito)</span>' : ""}</li>`).join("");
    host.innerHTML = B.stickers.map((s) =>
      `<div class="sticker-slot" data-slot="${s.id}"><button class="sticker" type="button" data-sticker="${s.id}" style="--c:${s.color}" aria-label="Adesivo ${esc(s.label)}: colar no papel">${icon(s.id)}</button></div>`
    ).join("");

    const KEY = "pedro-adesivos";
    let placed = store.get(KEY) || {};

    const size = () => $(".sticker-slot", host).getBoundingClientRect().width;
    function put(id, x, y, rot) {
      const s = B.stickers.find((k) => k.id === id);
      if (!s) return;
      $(`[data-placed="${id}"]`, desk)?.remove();
      const el = document.createElement("span");
      el.className = "placed";
      el.dataset.placed = id;
      el.setAttribute("role", "img");
      el.setAttribute("aria-label", `Adesivo ${s.label}`);
      el.style.cssText = `--c:${s.color};--rot:${rot}deg;left:calc(${(x * 100).toFixed(2)}% - var(--s) / 2);top:calc(${(y * 100).toFixed(2)}% - var(--s) / 2);width:var(--s);height:var(--s)`;
      el.innerHTML = icon(id);
      desk.appendChild(el);
      $(`[data-slot="${id}"]`, host).classList.add("used");
    }
    function sync() {
      desk.style.setProperty("--s", `${Math.round(size())}px`);
      Object.entries(placed).forEach(([id, p]) => put(id, p.x, p.y, p.rot));
    }
    function save(id, x, y) {
      const rot = Math.round((Math.random() * 2 - 1) * 14);
      placed[id] = { x, y, rot };
      store.set(KEY, placed);
      put(id, x, y, rot);
    }
    function randomOnPaper(id) {
      const d = desk.getBoundingClientRect();
      const p = paper.getBoundingClientRect();
      const x = (p.left - d.left + p.width * (0.15 + Math.random() * 0.7)) / d.width;
      const y = (p.top - d.top + p.height * (0.2 + Math.random() * 0.6)) / d.height;
      save(id, x, y);
    }

    let drag = null;
    let suppressClick = false;
    host.addEventListener("pointerdown", (e) => {
      const btn = e.target.closest("[data-sticker]");
      if (!btn || e.button > 0) return;
      e.preventDefault();
      const r = btn.getBoundingClientRect();
      const ghost = btn.cloneNode(true);
      ghost.classList.add("dragging");
      ghost.removeAttribute("data-sticker");
      ghost.setAttribute("aria-hidden", "true");
      ghost.style.width = `${r.width}px`;
      ghost.style.height = `${r.height}px`;
      ghost.style.left = `${r.left}px`;
      ghost.style.top = `${r.top}px`;
      document.body.appendChild(ghost);
      drag = { id: btn.dataset.sticker, ghost, sx: e.clientX, sy: e.clientY, ox: e.clientX - r.left, oy: e.clientY - r.top, moved: false };
      btn.setPointerCapture(e.pointerId);
    });
    host.addEventListener("pointermove", (e) => {
      if (!drag) return;
      if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 4) drag.moved = true;
      drag.ghost.style.left = `${e.clientX - drag.ox}px`;
      drag.ghost.style.top = `${e.clientY - drag.oy}px`;
      drag.ghost.style.transform = `rotate(${Math.max(-12, Math.min(12, (e.clientX - drag.sx) / 12))}deg) scale(1.08)`;
    });
    const end = (e) => {
      if (!drag) return;
      const { id, ghost, moved } = drag;
      drag = null;
      suppressClick = true;
      ghost.remove();
      if (!moved) { randomOnPaper(id); return; }
      const d = desk.getBoundingClientRect();
      const inside = e.clientX >= d.left && e.clientX <= d.right && e.clientY >= d.top && e.clientY <= d.bottom;
      const onSheet = e.target.closest && $(".board-sheet").contains(document.elementFromPoint(e.clientX, e.clientY));
      if (inside && !onSheet) save(id, (e.clientX - d.left) / d.width, (e.clientY - d.top) / d.height);
    };
    host.addEventListener("pointerup", end);
    host.addEventListener("pointercancel", () => { if (drag) { drag.ghost.remove(); drag = null; } });
    host.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-sticker]");
      if (!btn) return;
      if (suppressClick) { suppressClick = false; return; }
      randomOnPaper(btn.dataset.sticker);
    });
    $("[data-board-reset]").addEventListener("click", () => {
      placed = {};
      store.set(KEY, placed);
      $$(".placed", desk).forEach((el) => el.remove());
      $$(".sticker-slot", host).forEach((s) => s.classList.remove("used"));
    });

    new ResizeObserver(() => { if (size()) desk.style.setProperty("--s", `${Math.round(size())}px`); }).observe(host);
    const lab = $("#panel-lab");
    new MutationObserver(() => { if (!lab.hidden) sync(); }).observe(lab, { attributes: true, attributeFilter: ["hidden"] });
  }

  /* ---------- Perfil ---------- */
  function renderProfile() {
    const P = D.profile;
    $("[data-profile-heading]").textContent = P.heading;
    $("[data-profile-body]").innerHTML = P.paragraphs.map((p) => `<p class="profile-body">${p}</p>`).join("");
    $("[data-facts]").innerHTML = P.facts.map((f) => `
      <div class="txt-card"><span class="txt-name">${esc(f.file)}</span><p class="txt-text">${esc(f.text)}${f.link ? ` <a href="${f.link.url}" target="_blank" rel="noopener">${esc(f.link.label)} ↗</a>` : ""}</p></div>`).join("");
    $("[data-profile-links]").innerHTML = D.links.map((l) =>
      `<li><a href="${l.url}"${l.url.startsWith("http") ? ' target="_blank" rel="noopener"' : ""}>${icon(l.icon)}<span>${esc(l.label)}</span><span class="hint">${esc(l.hint)}</span></a></li>`
    ).join("");

    const prints = $("[data-prints]");
    prints.innerHTML = P.prints.map((p, i) => `
      <figure class="print${i === 0 ? " front" : ""}" tabindex="0" role="button" aria-label="Foto: ${esc(p.alt)}. Trazer para a frente.">
        <span class="print-tape" aria-hidden="true"></span>
        <span class="print-photo"><img src="${p.src}" alt="" style="object-position:${p.position}" loading="lazy" decoding="async"><span class="stamp" aria-hidden="true">${esc(p.stamp)}</span></span>
      </figure>`).join("");
    const bring = (el) => {
      if (el.classList.contains("front")) return;
      $$(".print", prints).forEach((p) => p.classList.remove("front"));
      el.classList.add("front", "swap");
      setTimeout(() => el.classList.remove("swap"), 300);
    };
    prints.addEventListener("click", (e) => { const el = e.target.closest(".print"); if (el) bring(el); });
    prints.addEventListener("keydown", (e) => {
      const el = e.target.closest(".print");
      if (el && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); bring(el); }
    });
  }

  function init() {
    initText();
    renderWorks();
    renderLab();
    renderProfile();
    initBoard();
    initToy();
    initNav();
    route();
  }

  init();
})();
