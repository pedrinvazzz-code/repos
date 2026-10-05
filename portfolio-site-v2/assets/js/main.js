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

  /* ---------- Console: menu de jogos ---------- */
  const toy = { active: true };
  function initToy() {
    const canvas = $("[data-screen]");
    const ctx = canvas.getContext("2d");
    const W = 96, H = 54;
    const css = getComputedStyle(document.documentElement);
    const C = Object.fromEntries(["bg", "dot", "bar", "bar-top", "block", "ground", "floor", "duck", "beak", "bad", "sel"]
      .map((k) => [k, css.getPropertyValue(`--scr-${k}`).trim()]));
    const menuEl = $("[data-menu]");
    const tilesEl = $("[data-tiles]");
    const hudEl = $("[data-hud]");
    const cardEl = $("[data-card]");
    const glyph = (l) => `<span class="btn-glyph" aria-hidden="true">${l}</span>`;

    const rand = (a, b) => a + Math.random() * (b - a);
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    const px = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
    const sprite = (g, art, x, y, colors, flip = false) => art.forEach((row, ry) => [...row].forEach((ch, rx) => {
      if (ch === ".") return;
      px(g, x + (flip ? row.length - 1 - rx : rx), y + ry, 1, 1, colors[ch]);
    }));
    const DUCK = ["...XX.", "..XoXb", "XXXXX.", ".XXXX."];
    const LEGS = ["..X.X.", ".X..X."];
    const BUG = ["X....X", ".XXXX.", "XXooXX", ".XXXX.", "X.XX.X"];
    const duckColors = (bg) => ({ X: C.duck, o: bg, b: C.beak });
    const drawDuck = (g, x, y, step = 0, flip = false, bg = C.bg) =>
      sprite(g, [...DUCK, LEGS[Math.floor(step) % 2]], x, y, duckColors(bg), flip);
    const drawBug = (g, x, y) => sprite(g, BUG, x, y, { X: C.bad, o: C.bg });
    const backdrop = (g, w, h, dotsY = 9) => { px(g, 0, 0, w, h, C.bg); for (let x = 1; x < w; x += 3) px(g, x, dotsY, 1, 1, C.dot); };
    const floor = (g, y, w = W, h = H) => {
      px(g, 0, y, w, 1, C.ground);
      for (let x = 0; x < w; x++) for (let yy = y + 1; yy < h; yy++) if ((x + yy) % 2 === 0) px(g, x, yy, 1, 1, C.floor);
    };
    const tableSprite = (g, x, y, w, h) => {
      px(g, x, y, w, h, C.block);
      px(g, x, y, w, 2, C.bar);
      for (let cx = x + 6; cx < x + w - 1; cx += 6) px(g, cx, y + 2, 1, h - 2, C.dot);
    };
    const rowSprite = (g, x, y, bad) => {
      px(g, x, y, 8, 3, bad ? C.bad : C.bar);
      if (bad) { px(g, x + 2, y + 1, 1, 1, C.bg); px(g, x + 5, y + 1, 1, 1, C.bg); }
      else px(g, x, y, 8, 1, C["bar-top"]);
    };

    /* Os jogos. Cada um sabe se reiniciar, avançar um passo, desenhar e reagir a botões e toques. */
    const GAMES = [
      {
        id: "limpeza", name: "Limpeza de dados", how: "Pegue as linhas verdes com a tabela e desvie das vermelhas.",
        reset() { this.p = { x: W / 2 - 9, y: 46, w: 18, h: 5 }; this.items = []; this.t = 0; this.score = 0; this.life = 3; this.hurt = 0; this.target = null; this.dead = false; },
        step() {
          this.t++;
          const every = Math.max(14, 36 - Math.floor(this.score / 2));
          if (this.t % every === 0) {
            const bad = Math.random() < Math.min(0.5, 0.28 + this.score / 90);
            this.items.push({ x: rand(2, W - 10), y: 8, w: 8, h: 3, bad, vy: 0.42 + Math.random() * 0.22 + this.score * 0.008 });
          }
          if (this.target !== null) this.p.x += clamp(this.target - (this.p.x + this.p.w / 2), -2.2, 2.2);
          this.p.x = clamp(this.p.x, 1, W - this.p.w - 1);
          for (const it of this.items) {
            it.y += it.vy;
            if (overlap(it, this.p)) {
              it.gone = true;
              if (it.bad) { this.life--; this.hurt = 8; if (this.life <= 0) this.dead = true; } else this.score++;
            } else if (it.y > H) it.gone = true;
          }
          this.items = this.items.filter((it) => !it.gone);
          if (this.hurt) this.hurt--;
        },
        draw(g) {
          backdrop(g, W, H);
          if (this.hurt % 4 > 1) px(g, 0, 0, W, H, C.bad);
          this.items.forEach((it) => rowSprite(g, it.x, it.y, it.bad));
          floor(g, 52);
          tableSprite(g, this.p.x, this.p.y, this.p.w, this.p.h);
        },
        hud() { return `${"♥".repeat(this.life)}${"♡".repeat(3 - this.life)} ${this.score} linhas`; },
        input(b) { if (b === "left") { this.p.x -= 9; this.target = null; } if (b === "right") { this.p.x += 9; this.target = null; } },
        pointer(type, x) { if (type !== "up") this.target = x; }
      },
      {
        id: "pato", name: "Pato debugger", how: "Toque ou aperte A para o pato voar entre as barras do gráfico.",
        reset() { this.d = { x: 20, y: 24, vy: 0, w: 6, h: 5 }; this.bars = []; this.t = 0; this.score = 0; this.dead = false; },
        step() {
          const d = this.d;
          this.t++;
          d.vy = Math.min(d.vy + 0.11, 1.8);
          d.y += d.vy;
          if (this.t % 62 === 1) this.bars.push({ x: W, w: 8, gap: rand(20, 37), size: 23, passed: false });
          for (const b of this.bars) {
            b.x -= 0.75 + this.score * 0.012;
            if (!b.passed && b.x + b.w < d.x) { b.passed = true; this.score++; }
            const top = { x: b.x, y: 0, w: b.w, h: b.gap - b.size / 2 };
            const bottom = { x: b.x, y: b.gap + b.size / 2, w: b.w, h: 50 - (b.gap + b.size / 2) };
            if (overlap({ x: d.x + 1, y: d.y + 1, w: 4, h: 3 }, top) || overlap({ x: d.x + 1, y: d.y + 1, w: 4, h: 3 }, bottom)) this.dead = true;
          }
          this.bars = this.bars.filter((b) => b.x + b.w > -2);
          if (d.y < 0) { d.y = 0; d.vy = 0; }
          if (d.y + d.h >= 50) this.dead = true;
        },
        draw(g) {
          backdrop(g, W, H, 60);
          for (const b of this.bars) {
            const topH = b.gap - b.size / 2;
            const y2 = b.gap + b.size / 2;
            px(g, b.x, 0, b.w, topH, C.bar);
            px(g, b.x, topH - 1, b.w, 1, C["bar-top"]);
            px(g, b.x, y2, b.w, 50 - y2, C.bar);
            px(g, b.x, y2, b.w, 1, C["bar-top"]);
          }
          floor(g, 50);
          drawDuck(g, this.d.x, this.d.y, this.d.vy < 0 ? 1 : 0);
        },
        hud() { return `${this.score} barras`; },
        input(b) { if (["a", "up", "x", "plus"].includes(b)) this.d.vy = -1.45; },
        pointer(type) { if (type === "down") this.d.vy = -1.45; }
      },
      {
        id: "deploy", name: "Deploy em produção", how: "Pule os bugs com A ou um toque. A velocidade aumenta com o tempo.",
        reset() {
          this.d = { x: 12, y: 0, vy: 0, w: 6, h: 5 }; this.obs = []; this.t = 0; this.score = 0; this.speed = 0.95; this.next = 50; this.dead = false;
          this.line = Array.from({ length: 30 }, () => rand(16, 34));
        },
        step() {
          this.t++;
          this.speed = 0.95 + this.t / 2200;
          this.score = Math.floor(this.t / 5);
          const d = this.d;
          if (d.y < 0 || d.vy) { d.vy += 0.17; d.y += d.vy; if (d.y >= 0) { d.y = 0; d.vy = 0; } }
          if (--this.next <= 0) {
            const tall = Math.random() < 0.28;
            this.obs.push({ x: W, w: 6, h: tall ? 10 : 5 });
            this.next = Math.round(rand(50, 100) / (this.speed / 0.95));
          }
          const box = { x: d.x + 1, y: 42 + d.y, w: 4, h: 5 };
          for (const o of this.obs) {
            o.x -= this.speed;
            if (overlap(box, { x: o.x + 1, y: 47 - o.h, w: o.w - 2, h: o.h })) this.dead = true;
          }
          this.obs = this.obs.filter((o) => o.x > -8);
        },
        draw(g) {
          backdrop(g, W, H, 60);
          const travel = this.t * this.speed * 0.3;
          const off = travel % 6;
          const shift = Math.floor(travel / 6);
          for (let i = 0; i < 18; i++) {
            const a = this.line[(i + shift) % 30];
            const b = this.line[(i + shift + 1) % 30];
            for (let k = 0; k < 6; k++) px(g, i * 6 + k - off, a + ((b - a) * k) / 6, 1, 1, C.dot);
          }
          floor(g, 47);
          for (const o of this.obs) {
            drawBug(g, o.x, 47 - 5);
            if (o.h > 5) drawBug(g, o.x, 47 - 10);
          }
          drawDuck(g, this.d.x, 42 + this.d.y, this.t / 4);
        },
        hud() { return `v1.${this.score} no ar`; },
        input(b) { if (["a", "up", "x", "plus"].includes(b) && this.d.y === 0) this.d.vy = -2.25; },
        pointer(type) { if (type === "down" && this.d.y === 0) this.d.vy = -2.25; }
      },
      {
        id: "snake", name: "Snake do pipeline", how: "Guie o pipeline até as linhas de dados. Não bata nas bordas nem nele mesmo.",
        reset() {
          this.cols = 22; this.rows = 10; this.cell = 4; this.ox = 4; this.oy = 10;
          this.body = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }];
          this.dir = { x: 1, y: 0 }; this.next = this.dir; this.score = 0; this.t = 0; this.dead = false; this.place();
        },
        place() {
          do { this.food = { x: Math.floor(rand(0, this.cols)), y: Math.floor(rand(0, this.rows)) }; }
          while (this.body.some((p) => p.x === this.food.x && p.y === this.food.y));
        },
        turn(dx, dy) { if (dx !== -this.dir.x || dy !== -this.dir.y) this.next = { x: dx, y: dy }; },
        step() {
          this.t++;
          if (this.t % Math.max(3, 6 - Math.floor(this.score / 6)) !== 0) return;
          this.dir = this.next;
          const head = { x: this.body[0].x + this.dir.x, y: this.body[0].y + this.dir.y };
          const out = head.x < 0 || head.y < 0 || head.x >= this.cols || head.y >= this.rows;
          if (out || this.body.some((p) => p.x === head.x && p.y === head.y)) { this.dead = true; return; }
          this.body.unshift(head);
          if (head.x === this.food.x && head.y === this.food.y) { this.score++; this.place(); } else this.body.pop();
        },
        draw(g) {
          px(g, 0, 0, W, H, C.bg);
          const { cell, ox, oy } = this;
          px(g, ox - 1, oy - 1, this.cols * cell + 2, 1, C.ground);
          px(g, ox - 1, oy + this.rows * cell, this.cols * cell + 2, 1, C.ground);
          px(g, ox - 1, oy - 1, 1, this.rows * cell + 2, C.ground);
          px(g, ox + this.cols * cell, oy - 1, 1, this.rows * cell + 2, C.ground);
          px(g, ox + this.food.x * cell, oy + this.food.y * cell, cell - 1, cell - 1, C.block);
          this.body.forEach((p, i) => px(g, ox + p.x * cell, oy + p.y * cell, cell - 1, cell - 1, i === 0 ? C["bar-top"] : C.bar));
        },
        hud() { return `${this.score} linhas`; },
        input(b) {
          if (b === "up") this.turn(0, -1);
          if (b === "down") this.turn(0, 1);
          if (b === "left") this.turn(-1, 0);
          if (b === "right") this.turn(1, 0);
        },
        pointer(type, x, y, dx, dy) {
          if (type !== "up") return;
          let vx = dx, vy = dy;
          if (Math.hypot(dx, dy) < 4) {
            const h = this.body[0];
            vx = x - (this.ox + h.x * this.cell + 2);
            vy = y - (this.oy + h.y * this.cell + 2);
          }
          if (Math.abs(vx) > Math.abs(vy)) this.turn(Math.sign(vx), 0); else this.turn(0, Math.sign(vy) || 1);
        }
      }
    ];

    /* Ícones dos jogos no menu, desenhados com os mesmos sprites. */
    const ICONS_ART = {
      limpeza(g) { backdrop(g, 32, 32, 40); rowSprite(g, 4, 5, false); rowSprite(g, 19, 10, true); rowSprite(g, 11, 15, false); tableSprite(g, 7, 23, 18, 5); },
      pato(g) { backdrop(g, 32, 32, 40); px(g, 21, 0, 7, 9, C.bar); px(g, 21, 8, 7, 1, C["bar-top"]); px(g, 21, 21, 7, 11, C.bar); px(g, 21, 21, 7, 1, C["bar-top"]); drawDuck(g, 8, 13, 1); },
      deploy(g) { backdrop(g, 32, 32, 40); floor(g, 25, 32, 32); drawBug(g, 21, 20); drawDuck(g, 6, 13, 0); },
      snake(g) { px(g, 0, 0, 32, 32, C.bg); [[6, 18], [10, 18], [14, 18], [14, 14], [18, 14]].forEach(([x, y], i, a) => px(g, x, y, 3, 3, i === a.length - 1 ? C["bar-top"] : C.bar)); px(g, 24, 8, 3, 3, C.block); }
    };
    tilesEl.innerHTML = GAMES.map((g, i) => `<button class="scr-tile" type="button" data-tile="${i}" aria-label="${esc(g.name)}"><canvas width="32" height="32"></canvas></button>`).join("");
    $$("[data-tile]", tilesEl).forEach((t, i) => ICONS_ART[GAMES[i].id](t.querySelector("canvas").getContext("2d")));

    const records = store.get("pedro-recordes") || {};
    let state = "menu";
    let sel = 0;
    let game = null;

    function selectTile(i) {
      sel = (i + GAMES.length) % GAMES.length;
      $$("[data-tile]", tilesEl).forEach((t, k) => t.classList.toggle("sel", k === sel));
      $("[data-menu-name]").textContent = GAMES[sel].name;
      const best = records[GAMES[sel].id];
      $("[data-menu-best]").textContent = best ? `recorde ${best}` : "";
    }
    function card(title, text, hint) {
      $("[data-card-title]").textContent = title;
      $("[data-card-text]").textContent = text;
      $("[data-card-hint]").innerHTML = hint;
      cardEl.hidden = false;
    }
    function hud() {
      $("[data-hud-name]").textContent = game.name;
      $("[data-hud-score]").textContent = game.hud();
    }
    function showMenu() {
      state = "menu";
      game = null;
      menuEl.hidden = false;
      hudEl.hidden = true;
      cardEl.hidden = true;
      selectTile(sel);
    }
    function open(i) {
      selectTile(i);
      game = GAMES[sel];
      game.reset();
      state = "ready";
      menuEl.hidden = true;
      hudEl.hidden = false;
      hud();
      card(game.name, game.how, `${glyph("A")} ou toque para começar`);
      game.draw(ctx);
    }
    function begin() {
      state = "play";
      cardEl.hidden = true;
      toy.start();
    }
    function finish() {
      state = "over";
      const prev = records[game.id] || 0;
      if (game.score > prev) { records[game.id] = game.score; store.set("pedro-recordes", records); }
      const best = Math.max(prev, game.score);
      const recordText = game.score > prev && prev > 0 ? " · novo recorde!" : best > 0 ? ` · recorde ${best}` : "";
      card("Fim de jogo", `${game.score} ${game.score === 1 ? "ponto" : "pontos"}${recordText}`, `${glyph("A")} de novo ${glyph("B")} menu`);
    }

    function press(b) {
      if (state === "menu") {
        if (b === "left" || b === "up" || b === "y") selectTile(sel - 1);
        else if (b === "right" || b === "down" || b === "x") selectTile(sel + 1);
        else if (b === "a" || b === "plus") open(sel);
        return;
      }
      if (b === "home" || b === "b" || b === "minus") { showMenu(); return; }
      if (state === "ready") { begin(); game.input(b); return; }
      if (state === "over") { if (b === "a" || b === "plus") { game.reset(); hud(); begin(); } return; }
      game.input(b);
    }

    // Botões do console e do controle de toque. Segurar uma direção repete o comando.
    const REPEAT = new Set(["left", "right", "up", "down"]);
    $$("[data-btn]").forEach((el) => {
      const btn = el.dataset.btn;
      let wait = 0;
      let loop = 0;
      const stop = () => { clearTimeout(wait); clearInterval(loop); el.classList.remove("held"); };
      el.addEventListener("pointerdown", (e) => {
        if (e.button > 0) return;
        e.preventDefault();
        el.classList.add("held");
        press(btn);
        if (REPEAT.has(btn)) wait = setTimeout(() => { loop = setInterval(() => press(btn), 75); }, 260);
      });
      ["pointerup", "pointerleave", "pointercancel"].forEach((type) => el.addEventListener(type, stop));
      // Teclado (Enter/Espaço) gera clique sem ponteiro.
      el.addEventListener("click", (e) => { if (e.detail === 0) press(btn); });
      el.addEventListener("contextmenu", (e) => e.preventDefault());
    });
    tilesEl.addEventListener("click", (e) => {
      const t = e.target.closest("[data-tile]");
      if (t) open(Number(t.dataset.tile));
    });
    cardEl.addEventListener("click", () => press("a"));

    // Toques e arrastos na tela viram comandos do jogo.
    let down = null;
    const toCanvas = (e) => {
      const r = canvas.getBoundingClientRect();
      return [((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H];
    };
    canvas.addEventListener("pointerdown", (e) => {
      if (!game) return;
      e.preventDefault();
      const [x, y] = toCanvas(e);
      down = { x, y };
      canvas.setPointerCapture(e.pointerId);
      if (state === "ready") begin();
      if (state === "over") { game.reset(); hud(); begin(); }
      game.pointer("down", x, y, 0, 0);
    });
    canvas.addEventListener("pointermove", (e) => {
      if (!game || !down || state !== "play") return;
      const [x, y] = toCanvas(e);
      game.pointer("move", x, y, x - down.x, y - down.y);
    });
    canvas.addEventListener("pointerup", (e) => {
      if (!game || !down) return;
      const [x, y] = toCanvas(e);
      game.pointer("up", x, y, x - down.x, y - down.y);
      down = null;
    });

    // Com o foco no console, o teclado também joga.
    const KEYS = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down", a: "a", b: "b", x: "x", y: "y", Enter: "a", " ": "a", Escape: "home", Backspace: "b" };
    $("[data-console]").addEventListener("keydown", (e) => {
      const key = KEYS[e.key.length === 1 ? e.key.toLowerCase() : e.key];
      if (!key || e.metaKey || e.ctrlKey || e.altKey) return;
      if ((e.key === "Enter" || e.key === " ") && e.target.closest("button")) return;
      e.preventDefault();
      press(key);
    });

    const clockEl = $("[data-scr-clock]");
    const clockFmt = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: D.timeZone });
    const tickClock = () => { clockEl.textContent = clockFmt.format(new Date()); };
    tickClock();
    setInterval(tickClock, 15000);

    let raf = 0;
    let last = 0;
    let acc = 0;
    let visible = true;
    function frame(t) {
      raf = 0;
      if (state !== "play" || !toy.active || !visible || document.hidden) return;
      const dt = Math.min(100, t - (last || t));
      last = t;
      acc += dt;
      while (acc >= 1000 / 30 && state === "play") {
        game.step();
        acc -= 1000 / 30;
        if (game.dead) finish();
      }
      game.draw(ctx);
      hud();
      raf = requestAnimationFrame(frame);
    }
    toy.start = () => { if (!raf && state === "play") { last = 0; acc = 0; raf = requestAnimationFrame(frame); } };

    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) toy.start(); }).observe(canvas);
    document.addEventListener("visibilitychange", () => { if (!document.hidden) toy.start(); });
    px(ctx, 0, 0, W, H, C.bg);
    showMenu();
  }

  /* ---------- Projetos ---------- */
  function formatStat(s, v) {
    if (s.format === "dec") return v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const n = Math.round(v).toLocaleString("pt-BR");
    return s.format === "usd" ? `US$ ${n}` : s.format === "pct" ? `${n}%` : n;
  }
  let workTab = D.projectTabs[0].id;
  function renderWorks(animate = false) {
    $("[data-work-tabs]").innerHTML = D.projectTabs.map((tab) => {
      const n = D.projects.filter((p) => p.category === tab.id).length;
      return `<button class="works-tab" type="button" role="tab" id="tab-${tab.id}" data-work-tab="${tab.id}" aria-selected="${tab.id === workTab}" tabindex="${tab.id === workTab ? 0 : -1}">${esc(tab.label)}<span class="works-count">${n}</span></button>`;
    }).join("");
    const grid = $("[data-works]");
    grid.setAttribute("aria-labelledby", `tab-${workTab}`);
    grid.innerHTML = D.projects.filter((p) => p.category === workTab).map((p, i) => {
      let preview;
      if (p.cover && p.cover.logo) {
        preview = `<div class="work-logo" style="background:${p.cover.bg};--pad:${p.cover.pad || 0};--fit:${p.cover.fit || "contain"}"><img src="${p.cover.logo}" alt="${esc(p.cover.alt)}" loading="lazy" decoding="async"></div>`;
      } else if (p.stats) {
        preview = `<div class="work-stats" style="--tint:${p.tint || "#eef6f1"}">${p.stats.map((s) => `<div class="stat"><span class="stat-value" data-stat="${s.value}" data-format="${s.format}">${formatStat(s, s.value)}</span><span class="stat-label">${esc(s.label)}</span></div>`).join("")}</div>`;
      } else {
        preview = `<img src="${p.cover.src}" alt="" loading="lazy" decoding="async" style="object-position:${p.cover.position || "50% 50%"}">`;
      }
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
    if (animate && !reduceMotion) {
      grid.classList.remove("swap");
      void grid.offsetWidth;
      grid.classList.add("swap");
    }
  }

  function initWorkTabs() {
    const tabs = $("[data-work-tabs]");
    const select = (id, focus) => {
      if (id === workTab) return;
      workTab = id;
      renderWorks(true);
      countStats();
      if (focus) $(`[data-work-tab="${id}"]`).focus();
    };
    tabs.addEventListener("click", (e) => {
      const t = e.target.closest("[data-work-tab]");
      if (t) select(t.dataset.workTab, false);
    });
    tabs.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const ids = D.projectTabs.map((t) => t.id);
      const i = ids.indexOf(workTab);
      select(ids[(i + (e.key === "ArrowRight" ? 1 : -1) + ids.length) % ids.length], true);
    });
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
    if (p.category && p.category !== workTab) { workTab = p.category; renderWorks(); }
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
    initWorkTabs();
    renderLab();
    renderProfile();
    initBoard();
    initToy();
    initNav();
    route();
  }

  init();
})();
