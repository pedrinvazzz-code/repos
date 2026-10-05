(() => {
  "use strict";

  const D = window.SITE;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const normalize = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const hexAlpha = (hex, a) => {
    const n = parseInt(hex.slice(1), 16);
    return `rgb(${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255} / ${a})`;
  };

  /* ---------- Relógio ---------- */
  function initClock() {
    const fmt = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: D.timeZone });
    const tick = () => {
      const t = fmt.format(new Date());
      $$("[data-clock]").forEach((el) => { el.textContent = t; });
    };
    tick();
    setInterval(tick, 10000);
    $$("[data-city]").forEach((el) => { el.textContent = D.city; });
    $$("[data-year]").forEach((el) => { el.textContent = String(new Date().getFullYear()); });
    $$("[data-mod]").forEach((el) => { el.textContent = isMac ? "⌘" : "Ctrl"; });
  }

  /* ---------- Ilha dinâmica (status, avisos e voltar) ---------- */
  const island = {
    el: null,
    text: null,
    mode: "status",
    flashTimer: 0,
    init() {
      this.el = $("[data-island]");
      this.text = $("[data-island-text]");
      this.text.textContent = this.label();
      this.el.addEventListener("click", () => {
        if (this.mode === "case") closeCase();
        else document.getElementById("contato").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      });
      window.matchMedia("(max-width: 419px)").addEventListener("change", () => this.set(this.label()));
    },
    label() {
      if (this.mode === "case") return "← Voltar aos projetos";
      return window.matchMedia("(max-width: 419px)").matches ? D.statusShort : D.status;
    },
    setMode(mode) {
      this.mode = mode;
      this.el.dataset.mode = mode;
      this.el.setAttribute("aria-label", mode === "case" ? "Voltar aos projetos" : `${D.status}. Ir para contato`);
      clearTimeout(this.flashTimer);
      this.set(this.label());
    },
    flash(msg) {
      clearTimeout(this.flashTimer);
      this.set(msg);
      this.flashTimer = setTimeout(() => this.set(this.label()), 1900);
    },
    set(msg) {
      const el = this.el;
      if (this.text.textContent === msg) return;
      if (reduceMotion) { this.text.textContent = msg; return; }
      const from = el.offsetWidth;
      el.classList.add("swap");
      setTimeout(() => {
        this.text.textContent = msg;
        el.style.width = "auto";
        const to = el.offsetWidth;
        el.style.width = from + "px";
        void el.offsetWidth;
        el.style.width = to + "px";
        el.classList.remove("swap");
        const done = () => { el.style.width = ""; el.removeEventListener("transitionend", done); };
        el.addEventListener("transitionend", done);
      }, 160);
    }
  };

  /* ---------- Título editável ao vivo ---------- */
  function initHero() {
    const box = $("[data-hero]");
    const title = $("[data-hero-title]");
    const caretsEl = $("[data-carets]");
    const input = $("[data-hero-input]");
    const logEl = $("[data-log]");
    const opsEl = $("[data-ops]");
    const statusEl = $("[data-log-status]");
    const peersEl = $("[data-peers]");

    const PEERS = {
      pedro: { name: "Pedro", color: "#0B0B0B" },
      etl: { name: "ETL", color: "#2F6BFF" },
      voce: { name: "Você", color: "#FF5A36" }
    };
    const MAX_CHARS = 64;
    const MAX_LINES = 3;

    let nextId = 1;
    let ops = 0;
    let lastUser = 0;
    let heroVisible = true;
    const peers = {
      pedro: { on: false, caret: null, sel: null },
      etl: { on: false, caret: null, sel: null },
      voce: { on: false, caret: null, sel: null }
    };
    let chars = [...D.hero.start].map((ch) => ({ id: nextId++, ch, serif: false, by: null }));

    peersEl.innerHTML = Object.keys(PEERS).map((k) => `<span data-peer="${k}" style="--c:${PEERS[k].color}"></span>`).join("");
    const caretEls = {};
    for (const k of Object.keys(PEERS)) {
      const el = document.createElement("div");
      el.className = "caret off";
      el.style.setProperty("--c", PEERS[k].color);
      el.innerHTML = `<span class="caret-flag">${PEERS[k].name}</span>`;
      caretsEl.appendChild(el);
      caretEls[k] = el;
    }

    const text = () => chars.map((c) => c.ch).join("");
    const indexOf = (id) => (id === null ? chars.length : chars.findIndex((c) => c.id === id));
    const rangeOf = (word) => {
      const i = text().indexOf(word);
      if (i < 0) return null;
      return { from: chars[i].id, to: chars[i + word.length] ? chars[i + word.length].id : null };
    };
    const idsIn = (range) => {
      const a = indexOf(range.from);
      const b = indexOf(range.to);
      if (a < 0) return [];
      return chars.slice(a, b < 0 ? chars.length : b).map((c) => c.id);
    };
    const lineCount = () => chars.filter((c) => c.ch === "\n").length + 1;

    function render() {
      const selColor = new Map();
      for (const k of Object.keys(peers)) {
        const p = peers[k];
        if (p.on && p.sel) idsIn(p.sel).forEach((id) => selColor.set(id, PEERS[k].color));
      }
      let html = "";
      for (const c of chars) {
        if (c.ch === "\n") { html += `<span class="z" data-c="${c.id}"></span><br>`; continue; }
        const style = [];
        if (c.by) style.push(`color:${c.by}`);
        if (selColor.has(c.id)) style.push(`background:${hexAlpha(selColor.get(c.id), 0.16)}`);
        html += `<span${c.serif ? ' class="s"' : ""} data-c="${c.id}"${style.length ? ` style="${style.join(";")}"` : ""}>${esc(c.ch)}</span>`;
      }
      html += '<span class="z" data-c="end"></span>';
      title.innerHTML = html;
      placeCarets();
      $$("[data-peer]", peersEl).forEach((el) => el.classList.toggle("on", peers[el.dataset.peer].on));
      opsEl.textContent = String(ops);
    }

    function placeCarets() {
      const base = box.getBoundingClientRect();
      const size = parseFloat(getComputedStyle(title).fontSize);
      for (const k of Object.keys(peers)) {
        const p = peers[k];
        const el = caretEls[k];
        if (!p.on) { el.classList.add("off"); continue; }
        let target = p.caret === null ? null : title.querySelector(`[data-c="${p.caret}"]`);
        if (!target) target = title.querySelector('[data-c="end"]');
        const r = target.getBoundingClientRect();
        const h = size * 0.86;
        const x = r.left - base.left - 1;
        const y = r.top - base.top + (r.height - h) / 2;
        el.style.height = h + "px";
        el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
        el.classList.remove("off");
        el.classList.toggle("blink", k === "voce" && document.activeElement === input);
      }
    }

    /* Registro de operações */
    const entries = [];
    function log(who, msg) {
      entries.push({ who, msg });
      if (entries.length > 5) entries.shift();
      logEl.innerHTML = entries.map((e, i) =>
        `<li${i === entries.length - 1 ? ' class="new"' : ""}><span class="who" style="color:${PEERS[e.who].color}">${PEERS[e.who].name.toLowerCase()}</span>${esc(e.msg)}</li>`
      ).join("");
    }

    /* Edições */
    function insertAt(who, ch, serif) {
      const i = indexOf(peers[who].caret);
      chars.splice(i < 0 ? chars.length : i, 0, { id: nextId++, ch, serif: !!serif, by: who === "voce" ? PEERS.voce.color : null });
      ops++;
    }
    async function typeText(who, str, speed, serif) {
      for (const ch of str) {
        insertAt(who, ch, serif);
        render();
        await wait(speed * (0.65 + 0.7 * Math.random()));
      }
    }
    function select(who, range) {
      peers[who].sel = range;
      peers[who].caret = range.to;
      render();
    }
    async function replace(who, range, str, speed, serif) {
      const ids = new Set(idsIn(range));
      const old = chars.filter((c) => ids.has(c.id)).map((c) => c.ch).join("");
      chars = chars.filter((c) => !ids.has(c.id));
      ops += ids.size;
      peers[who].sel = null;
      peers[who].caret = range.to;
      render();
      if (speed) await wait(170);
      if (speed) await typeText(who, str, speed, serif);
      else for (const ch of str) insertAt(who, ch, serif);
      log(who, `"${old}" → "${str}"`);
    }

    /* Roteiro: o ETL troca "Planilhas" e o Pedro troca o final da frase. */
    async function play() {
      await wait(900);
      peers.pedro.on = true;
      peers.pedro.caret = null;
      statusEl.textContent = "sincronizando";
      render();
      await wait(420);
      peers.etl.on = true;
      peers.etl.caret = chars[0].id;
      render();
      await wait(1000);
      await Promise.all(D.hero.edits.map(async (edit, i) => {
        const range = rangeOf(edit.find);
        if (!range) return;
        const who = edit.peer;
        await wait(250 + i * 510);
        if (i > 0) {
          peers[who].caret = range.from;
          render();
          await wait(520);
        }
        select(who, range);
        await wait(560 + i * 80);
        await replace(who, range, edit.replace, 58 + i * 18, edit.serif);
      }));
      statusEl.textContent = "sincronizado";
      await wait(700);
      idle();
    }

    /* Depois do roteiro, o ETL passeia pelo texto de vez em quando. */
    async function idle() {
      for (;;) {
        await wait(2600 + 2200 * Math.random());
        if (!heroVisible || document.hidden || Date.now() - lastUser < 9000) continue;
        const starts = [];
        chars.forEach((c, i) => {
          if (c.ch !== " " && c.ch !== "\n" && (i === 0 || /[ \n]/.test(chars[i - 1].ch))) starts.push(i);
        });
        if (!starts.length) continue;
        const a = starts[Math.floor(Math.random() * starts.length)];
        let b = a;
        while (b < chars.length && chars[b].ch !== " " && chars[b].ch !== "\n") b++;
        peers.etl.sel = null;
        peers.etl.caret = chars[a].id;
        render();
        if (Math.random() < 0.45) {
          await wait(500);
          select("etl", { from: chars[a].id, to: chars[b] ? chars[b].id : null });
          await wait(1100);
          peers.etl.sel = null;
          peers.etl.caret = chars[b] ? chars[b].id : null;
          render();
        }
      }
    }

    function applyInstant() {
      for (const edit of D.hero.edits) {
        const range = rangeOf(edit.find);
        if (range) replace(edit.peer, range, edit.replace, 0, edit.serif);
      }
      statusEl.textContent = "sincronizado";
      render();
    }

    /* Visitante digitando */
    let typed = "";
    let deleted = 0;
    let logTimer = 0;
    const flushLog = () => {
      if (typed) log("voce", `ins "${typed}"`);
      if (deleted) log("voce", `del ${deleted}`);
      typed = "";
      deleted = 0;
    };
    const scheduleLog = () => { clearTimeout(logTimer); logTimer = setTimeout(flushLog, 700); };

    box.addEventListener("pointerdown", (e) => {
      lastUser = Date.now();
      const hit = e.target.closest("[data-c]");
      let caret = null;
      if (hit && hit.dataset.c !== "end") {
        const r = hit.getBoundingClientRect();
        const id = Number(hit.dataset.c);
        const i = indexOf(id);
        if (e.clientX > r.left + r.width / 2 && chars[i] && chars[i].ch !== "\n") caret = chars[i + 1] ? chars[i + 1].id : null;
        else caret = id;
      }
      peers.voce.on = true;
      peers.voce.caret = caret;
      e.preventDefault();
      input.focus({ preventScroll: true });
      render();
    });
    box.addEventListener("click", () => input.focus({ preventScroll: true }));
    input.addEventListener("focus", render);
    input.addEventListener("blur", () => {
      flushLog();
      peers.voce.on = false;
      render();
    });
    input.addEventListener("input", () => {
      const value = input.value.replace(/\r/g, "");
      input.value = "";
      if (!value) return;
      lastUser = Date.now();
      for (const ch of value) {
        if (chars.length >= MAX_CHARS) break;
        if (ch === "\n" && lineCount() >= MAX_LINES) continue;
        insertAt("voce", ch, false);
        typed += ch === "\n" ? "↵" : ch;
      }
      render();
      scheduleLog();
    });
    input.addEventListener("keydown", (e) => {
      lastUser = Date.now();
      const i = indexOf(peers.voce.caret);
      const at = i < 0 ? chars.length : i;
      if (e.key === "Backspace") {
        e.preventDefault();
        if (at > 0) { chars.splice(at - 1, 1); ops++; deleted++; scheduleLog(); }
      } else if (e.key === "Delete") {
        e.preventDefault();
        if (at < chars.length) {
          chars.splice(at, 1);
          peers.voce.caret = chars[at] ? chars[at].id : null;
          ops++; deleted++; scheduleLog();
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (at > 0) peers.voce.caret = chars[at - 1].id;
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (at < chars.length) peers.voce.caret = chars[at + 1] ? chars[at + 1].id : null;
      } else if (e.key === "Escape" || e.key === "Tab") {
        input.blur();
        return;
      } else {
        return;
      }
      render();
    });

    new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; }).observe($("[data-hero-section]"));
    new ResizeObserver(() => placeCarets()).observe(title);
    if (document.fonts) document.fonts.ready.then(placeCarets);

    $("[data-hero-sub]").textContent = D.hero.sub;
    render();
    if (reduceMotion) applyInstant();
    else play();
  }

  /* ---------- Projetos ---------- */
  function renderWork() {
    $("[data-work-count]").textContent = `${D.projects.length} projetos`;
    $("[data-work]").innerHTML = D.projects.map((p, i) => `
      <a class="row" href="#/projeto/${p.id}" data-reveal data-project="${p.id}" style="--i:${i}">
        <div class="row-in">
          <span class="row-num">${String(i + 1).padStart(2, "0")}</span>
          <h3 class="row-title">${esc(p.title)}</h3>
          <span class="row-tags">${p.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</span>
          <span class="row-year">${esc(p.year)}</span>
          <span class="row-arrow" aria-hidden="true">→</span>
        </div>
      </a>`).join("");
  }

  /* ---------- Estudo de caso ---------- */
  const caseEl = $("[data-case]");
  let caseFromPage = false;
  let caseId = null;
  let closeTimer = 0;

  function renderMedia(m) {
    if (m.type === "phones") {
      return `<figure class="figure"><div class="phones">${m.items.map((it) =>
        `<img src="${it.src}" width="${it.width}" height="${it.height}" alt="${esc(it.alt)}" loading="lazy" decoding="async">`
      ).join("")}</div>${m.caption ? `<figcaption>${esc(m.caption)}</figcaption>` : ""}</figure>`;
    }
    return `<figure class="figure"><img src="${m.src}" width="${m.width}" height="${m.height}" alt="${esc(m.alt)}" loading="lazy" decoding="async">${m.caption ? `<figcaption>${esc(m.caption)}</figcaption>` : ""}</figure>`;
  }

  function renderCase(p) {
    const i = D.projects.indexOf(p);
    const next = D.projects[(i + 1) % D.projects.length];
    const [first, ...rest] = p.media || [];
    return `
      <article class="case-in">
        <div class="container">
          <h1 class="case-title" id="case-title" tabindex="-1">${esc(p.title)}</h1>
          <p class="case-tagline">${esc(p.tagline)}</p>
          <dl class="case-meta">
            <div><dt>Ano</dt><dd>${esc(p.year)}</dd></div>
            <div class="wide"><dt>Stack</dt><dd class="tags">${p.stack.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</dd></div>
          </dl>
          ${first ? renderMedia(first) : ""}
          <div class="case-secs">
            ${p.sections.map((s) => `<div class="case-sec"><h2>${esc(s.heading)}</h2><p>${esc(s.body)}</p></div>`).join("")}
          </div>
          ${rest.map(renderMedia).join("")}
          <div class="case-actions">
            <a class="btn btn-ink" href="${p.url}" target="_blank" rel="noopener">Ver no GitHub</a>
            <button class="btn btn-soft" type="button" data-action="close-case">Voltar aos projetos</button>
          </div>
          <a class="case-next" href="#/projeto/${next.id}" data-next="${next.id}">
            <span>Próximo projeto</span>
            <strong>${esc(next.title)} →</strong>
          </a>
        </div>
      </article>`;
  }

  function setInert(on, except) {
    for (const el of [$("[data-page]"), $("[data-footer]"), $("[data-dock]")]) {
      if (el === except) continue;
      if (on) el.setAttribute("inert", "");
      else if (el !== $("[data-dock]")) el.removeAttribute("inert");
    }
  }

  function openCase(id) {
    const p = D.projects.find((x) => x.id === id);
    if (!p) return;
    clearTimeout(closeTimer);
    caseId = id;
    caseEl.innerHTML = renderCase(p);
    caseEl.hidden = false;
    caseEl.scrollTop = 0;
    document.documentElement.classList.add("locked");
    setInert(true);
    island.setMode("case");
    syncDock();
    void caseEl.offsetWidth;
    caseEl.classList.add("open");
    $("#case-title", caseEl).focus({ preventScroll: true });
  }

  function hideCase() {
    if (caseEl.hidden) return;
    const id = caseId;
    caseId = null;
    caseEl.classList.remove("open");
    document.documentElement.classList.remove("locked");
    setInert(false);
    syncDock();
    island.setMode("status");
    closeTimer = setTimeout(() => { caseEl.hidden = true; caseEl.innerHTML = ""; }, reduceMotion ? 0 : 450);
    const row = $(`[data-project="${id}"]`);
    if (row) row.focus({ preventScroll: true });
  }

  function closeCase() {
    if (caseEl.hidden) return;
    if (caseFromPage) {
      caseFromPage = false;
      history.back();
    } else {
      history.replaceState(null, "", location.pathname + location.search);
      hideCase();
    }
  }

  function route() {
    const m = location.hash.match(/^#\/projeto\/([\w-]+)$/);
    if (m) openCase(m[1]);
    else hideCase();
  }

  function goToCase(id) {
    caseFromPage = true;
    location.hash = `#/projeto/${id}`;
  }

  function initCase() {
    document.addEventListener("click", (e) => {
      const row = e.target.closest("[data-project]");
      if (row && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        goToCase(row.dataset.project);
        return;
      }
      const next = e.target.closest("[data-next]");
      if (next) {
        e.preventDefault();
        history.replaceState(null, "", `#/projeto/${next.dataset.next}`);
        openCase(next.dataset.next);
        return;
      }
      if (e.target.closest('[data-action="close-case"]')) closeCase();
    });
    window.addEventListener("hashchange", route);
    route();
  }

  /* ---------- Stack ---------- */
  let syncDock = () => {};
  function initStack() {
    const hosts = $$("[data-seg]");
    const section = $("[data-stack-section]");
    const blurb = $("[data-stack-blurb]");
    const list = $("[data-stack-list]");
    const dock = $("[data-dock]");
    let current = D.stack[0].id;

    hosts.forEach((host) => {
      host.innerHTML = `<div class="seg" role="group" aria-label="Categorias da stack"><span class="seg-ind" aria-hidden="true"></span>${
        D.stack.map((s) => `<button type="button" data-tab="${s.id}" aria-pressed="false">${esc(s.label)}</button>`).join("")
      }</div>`;
    });

    const moveIndicators = () => {
      hosts.forEach((host) => {
        const ind = $(".seg-ind", host);
        const btn = $(`[data-tab="${current}"]`, host);
        if (!btn || !btn.offsetWidth) return;
        ind.style.width = btn.offsetWidth + "px";
        ind.style.transform = `translateX(${btn.offsetLeft}px)`;
      });
    };

    const fill = () => {
      const s = D.stack.find((x) => x.id === current);
      blurb.textContent = s.blurb;
      list.innerHTML = s.items.map((it) => `<li>${esc(it)}</li>`).join("");
    };

    let swapTimer = 0;
    const select = (id, animate) => {
      if (id === current && animate) return;
      current = id;
      $$("[data-tab]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.tab === id)));
      moveIndicators();
      clearTimeout(swapTimer);
      if (!animate || reduceMotion) { fill(); return; }
      section.classList.add("stack-swap");
      swapTimer = setTimeout(() => { fill(); section.classList.remove("stack-swap"); }, 200);
    };

    document.addEventListener("click", (e) => {
      const b = e.target.closest("[data-tab]");
      if (b) select(b.dataset.tab, true);
    });

    let inView = false;
    let nextNear = false;
    syncDock = () => {
      const show = inView && !nextNear && !caseId;
      dock.classList.toggle("show", show);
      if (show) dock.removeAttribute("inert");
      else dock.setAttribute("inert", "");
      if (show) requestAnimationFrame(moveIndicators);
    };
    new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; syncDock(); }, { rootMargin: "-30% 0px -30% 0px" }).observe($(".container", section));
    // Some antes que a próxima seção chegue à parte de baixo da tela, para não cobrir o texto.
    new IntersectionObserver(([entry]) => { nextNear = entry.isIntersecting; syncDock(); }, { rootMargin: "0px 0px -10% 0px" }).observe($("#sobre .container"));
    window.addEventListener("resize", moveIndicators);
    if (document.fonts) document.fonts.ready.then(moveIndicators);
    select(current, false);
  }

  /* ---------- Sobre ---------- */
  function initAbout() {
    const host = $("[data-about]");
    let n = 0;
    host.innerHTML = D.about.map((p, pi) =>
      `<p class="${pi === 0 ? "about-lead" : "about-body"}">${
        p.split(/\s+/).map((w) => `<span class="w" style="--i:${n++}">${esc(w)}</span>`).join(" ")
      }</p>`
    ).join("");
    if (reduceMotion) return;
    const words = $$(".w", host);
    if (window.CSS && CSS.supports("animation-timeline: view()")) {
      host.classList.add("scroll-tl");
      const total = words.length;
      words.forEach((w, i) => {
        const start = 6 + (40 * i) / total;
        w.style.animationRange = `cover ${start.toFixed(2)}% cover ${(start + 120 / total).toFixed(2)}%`;
      });
    } else {
      const io = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) { host.classList.add("in"); io.disconnect(); }
      }, { threshold: 0.35 });
      io.observe(host);
    }
  }

  /* ---------- Certificados ---------- */
  function renderCerts() {
    const total = D.certificates.reduce((sum, g) => sum + g.items.length, 0);
    $("[data-cert-count]").textContent = `${total} certificados`;
    $("[data-cert-link]").href = D.certificatesUrl;
    $("[data-certs]").innerHTML = D.certificates.map((g) => `
      <div class="cert">
        <div class="cert-head"><h3 class="cert-issuer">${esc(g.issuer)}</h3><span class="cert-n">${g.items.length}</span></div>
        <ul>${g.items.map((it) => `<li>${esc(it)}</li>`).join("")}</ul>
      </div>`).join("");
  }

  /* ---------- Contato ---------- */
  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(D.email);
      island.flash("E-mail copiado");
    } catch {
      window.location.href = `mailto:${D.email}`;
    }
  }
  function runContact(c) {
    if (c.action === "copy") copyEmail();
    else window.open(c.url, "_blank", "noopener");
  }
  function renderContacts() {
    $("[data-contacts]").innerHTML = D.contacts.map((c) => c.action === "copy"
      ? `<li><button class="contact-row" type="button" data-contact="${c.id}"><span class="label">${esc(c.label)}</span><span class="hint">${esc(c.hint)}</span></button></li>`
      : `<li><a class="contact-row" href="${c.url}" target="_blank" rel="noopener"><span class="label">${esc(c.label)}</span><span class="hint">${esc(c.hint)}</span></a></li>`
    ).join("");
    document.addEventListener("click", (e) => {
      const b = e.target.closest("[data-contact]");
      if (b) runContact(D.contacts.find((c) => c.id === b.dataset.contact));
    });
  }

  /* ---------- Paleta de comandos ---------- */
  function initPalette() {
    const pal = $("[data-palette]");
    const input = $("[data-palette-input]");
    const listEl = $("[data-palette-list]");
    const sections = [["Projetos", "projetos"], ["Stack", "stack"], ["Sobre", "sobre"], ["Certificados", "certificados"], ["Contato", "contato"]];
    const items = [
      ...D.contacts.map((c) => ({ group: "Contato", label: c.label, hint: c.hint, keywords: c.keywords || "", run: () => runContact(c) })),
      ...D.projects.map((p) => ({ group: "Projetos", label: p.title, hint: p.tags.join(", "), keywords: p.stack.join(" "), run: () => goToCase(p.id) })),
      ...sections.map(([label, id]) => ({
        group: "Ir para", label, hint: "seção", keywords: "",
        run: () => {
          if (caseId) closeCase();
          setTimeout(() => document.getElementById(id).scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" }), caseId ? 460 : 0);
        }
      }))
    ];
    let shown = [];
    let active = 0;
    let lastFocus = null;

    const render = () => {
      const q = normalize(input.value.trim());
      shown = items.filter((it) => !q || normalize(`${it.label} ${it.hint} ${it.keywords} ${it.group}`).includes(q));
      if (active >= shown.length) active = Math.max(0, shown.length - 1);
      if (!shown.length) {
        listEl.innerHTML = `<li class="pal-empty" role="presentation">Nada encontrado para “${esc(input.value.trim())}”.</li>`;
        input.removeAttribute("aria-activedescendant");
        return;
      }
      let html = "";
      let group = "";
      shown.forEach((it, i) => {
        if (it.group !== group) {
          group = it.group;
          html += `<li class="pal-group" role="presentation">${esc(group)}</li>`;
        }
        html += `<li class="pal-item" id="pal-${i}" role="option" data-i="${i}" aria-selected="${i === active}"><span>${esc(it.label)}</span><span class="hint">${esc(it.hint)}</span></li>`;
      });
      listEl.innerHTML = html;
      input.setAttribute("aria-activedescendant", `pal-${active}`);
      const el = $(`#pal-${active}`, listEl);
      if (el) el.scrollIntoView({ block: "nearest" });
    };

    const open = () => {
      if (!pal.hidden) return;
      lastFocus = document.activeElement;
      pal.hidden = false;
      input.value = "";
      active = 0;
      render();
      input.focus();
    };
    const close = () => {
      if (pal.hidden) return;
      pal.hidden = true;
      if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
    };
    const runActive = () => {
      const it = shown[active];
      if (!it) return;
      close();
      it.run();
    };

    input.addEventListener("input", () => { active = 0; render(); });
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); active = (active + 1) % Math.max(shown.length, 1); render(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); active = (active - 1 + shown.length) % Math.max(shown.length, 1); render(); }
      else if (e.key === "Enter") { e.preventDefault(); runActive(); }
      else if (e.key === "Tab") { e.preventDefault(); }
    });
    listEl.addEventListener("mousemove", (e) => {
      const it = e.target.closest("[data-i]");
      if (it && Number(it.dataset.i) !== active) { active = Number(it.dataset.i); render(); }
    });
    listEl.addEventListener("click", (e) => {
      const it = e.target.closest("[data-i]");
      if (it) { active = Number(it.dataset.i); runActive(); }
    });

    document.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (pal.hidden) open(); else close();
      } else if (e.key === "Escape") {
        if (!pal.hidden) close();
        else if (caseId) closeCase();
      }
    });
    document.addEventListener("click", (e) => {
      const a = e.target.closest("[data-action]");
      if (!a) return;
      const action = a.dataset.action;
      if (action === "palette") open();
      else if (action === "close-palette") close();
      else if (action === "top") {
        if (caseId) caseEl.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
        else window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      }
    });
  }

  /* ---------- Revelações ---------- */
  function initReveal() {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    $$("[data-reveal]").forEach((el) => io.observe(el));
  }

  function initBrand() {
    const brand = $(".brand");
    brand.innerHTML = [...D.brand].map((ch, i) => `<span class="l" style="--i:${i}">${ch === " " ? " " : esc(ch)}</span>`).join("");
  }

  function initFooter() {
    const name = $("[data-footer-name]");
    name.innerHTML = [...D.footerName].map((ch, i) =>
      `<span class="fl"><span style="--i:${i}"${i === 0 ? ' class="serif"' : ""}>${esc(ch)}</span></span>`
    ).join("");
    const footer = $("[data-footer]");
    const bar = $(".bar");
    new IntersectionObserver(([entry]) => {
      footer.classList.toggle("in", entry.isIntersecting);
      bar.classList.toggle("away", entry.isIntersecting);
    }, { threshold: 0.45 }).observe(footer);
  }

  function init() {
    initClock();
    island.init();
    island.setMode("status");
    initBrand();
    initHero();
    renderWork();
    initStack();
    initAbout();
    renderCerts();
    renderContacts();
    initFooter();
    initPalette();
    initReveal();
    initCase();
  }

  init();
})();
