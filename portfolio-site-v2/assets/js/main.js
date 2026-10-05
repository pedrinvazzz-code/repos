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

    $("[data-stack]").innerHTML = D.homeStack.map((key, i) => {
      const t = D.tools[key];
      return t ? `<li class="key" style="--c:${t.color};--i:${i}"><span class="key-cap">${icon(t.icon)}</span><span class="key-label">${esc(t.label)}</span></li>` : "";
    }).join("");

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
    const W = 96, H = 72;
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
        reset() { this.p = { x: W / 2 - 9, y: 62, w: 18, h: 5 }; this.items = []; this.t = 0; this.score = 0; this.life = 3; this.hurt = 0; this.target = null; this.dead = false; },
        step() {
          this.t++;
          const every = Math.max(14, 36 - Math.floor(this.score / 2));
          if (this.t % every === 0) {
            const bad = Math.random() < Math.min(0.5, 0.28 + this.score / 90);
            this.items.push({ x: rand(2, W - 10), y: 10, w: 8, h: 3, bad, vy: 0.5 + Math.random() * 0.25 + this.score * 0.009 });
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
          floor(g, 68);
          tableSprite(g, this.p.x, this.p.y, this.p.w, this.p.h);
        },
        hud() { return `${"♥".repeat(this.life)}${"♡".repeat(3 - this.life)} ${this.score} linhas`; },
        input(b) { if (b === "left") { this.p.x -= 9; this.target = null; } if (b === "right") { this.p.x += 9; this.target = null; } },
        pointer(type, x) { if (type !== "up") this.target = x; }
      },
      {
        id: "pato", name: "Pato debugger", how: "Toque ou aperte A para o pato voar entre as barras do gráfico.",
        reset() { this.d = { x: 20, y: 32, vy: 0, w: 6, h: 5 }; this.bars = []; this.t = 0; this.score = 0; this.dead = false; },
        step() {
          const d = this.d;
          this.t++;
          d.vy = Math.min(d.vy + 0.11, 1.8);
          d.y += d.vy;
          if (this.t % 62 === 1) this.bars.push({ x: W, w: 8, gap: rand(22, 50), size: 26, passed: false });
          for (const b of this.bars) {
            b.x -= 0.75 + this.score * 0.012;
            if (!b.passed && b.x + b.w < d.x) { b.passed = true; this.score++; }
            const top = { x: b.x, y: 0, w: b.w, h: b.gap - b.size / 2 };
            const bottom = { x: b.x, y: b.gap + b.size / 2, w: b.w, h: 66 - (b.gap + b.size / 2) };
            if (overlap({ x: d.x + 1, y: d.y + 1, w: 4, h: 3 }, top) || overlap({ x: d.x + 1, y: d.y + 1, w: 4, h: 3 }, bottom)) this.dead = true;
          }
          this.bars = this.bars.filter((b) => b.x + b.w > -2);
          if (d.y < 0) { d.y = 0; d.vy = 0; }
          if (d.y + d.h >= 66) this.dead = true;
        },
        draw(g) {
          backdrop(g, W, H, 60);
          for (const b of this.bars) {
            const topH = b.gap - b.size / 2;
            const y2 = b.gap + b.size / 2;
            px(g, b.x, 0, b.w, topH, C.bar);
            px(g, b.x, topH - 1, b.w, 1, C["bar-top"]);
            px(g, b.x, y2, b.w, 66 - y2, C.bar);
            px(g, b.x, y2, b.w, 1, C["bar-top"]);
          }
          floor(g, 66);
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
          this.line = Array.from({ length: 30 }, () => rand(20, 46));
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
          const box = { x: d.x + 1, y: 58 + d.y, w: 4, h: 5 };
          for (const o of this.obs) {
            o.x -= this.speed;
            if (overlap(box, { x: o.x + 1, y: 63 - o.h, w: o.w - 2, h: o.h })) this.dead = true;
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
          floor(g, 63);
          for (const o of this.obs) {
            drawBug(g, o.x, 63 - 5);
            if (o.h > 5) drawBug(g, o.x, 63 - 10);
          }
          drawDuck(g, this.d.x, 58 + this.d.y, this.t / 4);
        },
        hud() { return `v1.${this.score} no ar`; },
        input(b) { if (["a", "up", "x", "plus"].includes(b) && this.d.y === 0) this.d.vy = -2.25; },
        pointer(type) { if (type === "down" && this.d.y === 0) this.d.vy = -2.25; }
      },
      {
        id: "snake", name: "Snake do pipeline", how: "Guie o pipeline até as linhas de dados. Não bata nas bordas nem nele mesmo.",
        reset() {
          this.cols = 22; this.rows = 14; this.cell = 4; this.ox = 4; this.oy = 11;
          this.body = [{ x: 5, y: 7 }, { x: 4, y: 7 }, { x: 3, y: 7 }];
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
      let viaPointer = false;
      const stop = () => { clearTimeout(wait); clearInterval(loop); el.classList.remove("held"); };
      el.addEventListener("pointerdown", (e) => {
        if (e.button > 0) return;
        e.preventDefault();
        viaPointer = true;
        el.classList.add("held");
        press(btn);
        if (REPEAT.has(btn)) wait = setTimeout(() => { loop = setInterval(() => press(btn), 75); }, 260);
      });
      ["pointerup", "pointerleave", "pointercancel"].forEach((type) => el.addEventListener(type, stop));
      // O clique que vem depois de um toque já foi contado; só o do teclado (Enter/Espaço) aciona aqui.
      el.addEventListener("click", () => {
        if (viaPointer) { viaPointer = false; return; }
        press(btn);
      });
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

  /* ---------- Chaveiro do console ---------- */
  // Um pêndulo amortecido: o mouse passando empurra, dá para puxar e soltar, e os botões do console chacoalham.
  function initKeychain() {
    const swing = $("[data-keychain]");
    const anchor = $("[data-kc-anchor]");
    if (!swing || !anchor) return;
    const rest = () => (parseFloat(getComputedStyle(swing).getPropertyValue("--kc-rest")) || 0) * Math.PI / 180;
    let a = rest(), v = 0, raf = 0, last = 0, drag = null;
    const set = () => { swing.style.transform = `rotate(${a.toFixed(4)}rad)`; };
    function frame(t) {
      const dt = Math.min(0.033, (t - (last || t)) / 1000) || 0.016;
      last = t;
      const r = rest();
      if (drag) {
        // Segurando: o chaveiro segue o dedo, com um pouco de mola.
        v += ((drag.target - a) * 260 - v * 18) * dt;
      } else {
        v += (-46 * Math.sin(a - r) - 1.5 * v) * dt;
      }
      a += v * dt;
      set();
      if (drag || Math.abs(a - r) > 0.0006 || Math.abs(v) > 0.002) raf = requestAnimationFrame(frame);
      else { raf = 0; last = 0; a = r; set(); }
    }
    const kick = (dv) => {
      if (reduceMotion) return;
      v += dv;
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const pivot = () => { const p = anchor.getBoundingClientRect(); return { x: p.left, y: p.top }; };
    const angleTo = (x, y) => { const p = pivot(); return Math.atan2(p.x - x, y - p.y); };

    swing.addEventListener("pointermove", (e) => {
      if (e.pointerType === "mouse" && !drag) kick(Math.max(-1.2, Math.min(1.2, -e.movementX * 0.05)));
    });
    swing.addEventListener("pointerdown", (e) => {
      if (reduceMotion || e.button > 0) return;
      e.preventDefault();
      try { swing.setPointerCapture(e.pointerId); } catch { /* segue sem captura */ }
      drag = { offset: a - angleTo(e.clientX, e.clientY), target: a };
      kick(0);
    });
    swing.addEventListener("pointermove", (e) => {
      if (!drag) return;
      drag.target = Math.max(-1.3, Math.min(1.3, angleTo(e.clientX, e.clientY) + drag.offset));
    });
    const release = () => { if (drag) { drag = null; kick(0); } };
    swing.addEventListener("pointerup", release);
    swing.addEventListener("pointercancel", release);
    // Apertar os botões do console chacoalha as chaves.
    $("[data-console]").addEventListener("pointerdown", (e) => { if (e.target.closest("[data-btn]")) kick((Math.random() < 0.5 ? -1 : 1) * (0.9 + Math.random() * 0.6)); });
    window.addEventListener("keydown", (e) => { if (toy.active && !e.repeat && /^Arrow|^[zxas ]$|Enter/i.test(e.key)) kick((Math.random() < 0.5 ? -1 : 1) * 0.7); });
    window.addEventListener("resize", () => { if (!raf) { a = rest(); set(); } });
    set();
  }

  /* ---------- Artes do fundo, reveladas pelo mouse ou pelo dedo ---------- */
  // Cada painel tem uma camada de artes escondida; um círculo em volta do mouse (ou do dedo) mostra o que está embaixo.
  // No celular, sem toque, o círculo passeia sozinho de arte em arte.
  const onPanel = [];
  function initArts() {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const radius = () => Math.round(Math.min(230, Math.max(130, window.innerWidth * 0.15)));

    $$("[data-arts]").forEach((layer) => {
      const panel = layer.closest(".panel");
      const name = panel.dataset.panel;
      let x = 0, y = 0, r = 0, tx = 0, ty = 0, tr = 0;
      let raf = 0, wait = 0, touching = false, stop = -1, nextAt = 0, last = null;
      const touring = () => !finePointer && !reduceMotion && !touching && current === name;

      // Pontos focais das artes visíveis agora (--fx e --fy no CSS dizem onde fica o "rosto" de cada uma).
      function spots() {
        const box = panel.getBoundingClientRect();
        return $$(".art", layer).map((a) => {
          const b = a.getBoundingClientRect();
          if (!b.width) return null;
          const cs = getComputedStyle(a);
          const fx = parseFloat(cs.getPropertyValue("--fx")), fy = parseFloat(cs.getPropertyValue("--fy"));
          const px = b.left + b.width * (isNaN(fx) ? 0.5 : fx);
          const py = b.top + b.height * (isNaN(fy) ? 0.4 : fy);
          if (py < 40 || py > window.innerHeight - 120) return null;
          return { x: px - box.left, y: py - box.top };
        }).filter(Boolean);
      }
      function paint() {
        layer.style.setProperty("--x", `${x.toFixed(1)}px`);
        layer.style.setProperty("--y", `${y.toFixed(1)}px`);
        layer.style.setProperty("--r", `${Math.max(0, r).toFixed(1)}px`);
      }
      function frame(t) {
        raf = 0;
        if (touring() && t >= nextAt) {
          const list = spots();
          if (list.length) {
            stop = (stop + 1) % list.length;
            tx = list[stop].x; ty = list[stop].y; tr = Math.min(radius(), 170);
            if (r < 2) { x = tx; y = ty; }
          } else tr = 0;
          nextAt = t + 3600;
        }
        const k = touring() ? 0.045 : 0.14;
        x += (tx - x) * k;
        y += (ty - y) * k;
        r += (tr - r) * 0.1;
        paint();
        const settling = Math.abs(tx - x) > 0.4 || Math.abs(ty - y) > 0.4 || Math.abs(tr - r) > 0.4;
        if (settling) raf = requestAnimationFrame(frame);
        else if (touring()) { clearTimeout(wait); wait = setTimeout(kick, Math.max(60, nextAt - performance.now())); }
      }
      const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
      const aim = (cx, cy) => {
        const box = panel.getBoundingClientRect();
        tx = cx - box.left;
        ty = cy - box.top;
        if (r < 2) { x = tx; y = ty; }
        tr = radius();
      };

      if (finePointer) {
        panel.addEventListener("pointermove", (e) => { if (e.pointerType === "mouse") { last = e; aim(e.clientX, e.clientY); kick(); } });
        panel.addEventListener("pointerleave", () => { last = null; tr = 0; kick(); });
        // Rolando sem mexer o mouse, o círculo continua embaixo do cursor.
        window.addEventListener("scroll", () => { if (last && current === name) { aim(last.clientX, last.clientY); kick(); } }, { passive: true });
      } else {
        const touch = (e) => { const p = e.touches[0]; if (!p) return; touching = true; aim(p.clientX, p.clientY); kick(); };
        panel.addEventListener("touchstart", touch, { passive: true });
        panel.addEventListener("touchmove", touch, { passive: true });
        const release = () => { touching = false; nextAt = performance.now() + 1400; kick(); };
        panel.addEventListener("touchend", release, { passive: true });
        panel.addEventListener("touchcancel", release, { passive: true });
      }
      onPanel.push((now) => {
        if (now !== name) { tr = 0; r = 0; paint(); return; }
        if (!finePointer && reduceMotion) {
          // Sem animação: deixa um pedaço da primeira arte visível, parado.
          requestAnimationFrame(() => { const s = spots()[0]; if (s) { x = tx = s.x; y = ty = s.y; r = tr = Math.min(radius(), 170); paint(); } });
          return;
        }
        stop = -1; nextAt = 0; kick();
      });
    });
  }

  /* ---------- Projetos ---------- */
  function formatStat(s, v) {
    if (s.format === "dec") return v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const n = Math.round(v).toLocaleString("pt-BR");
    return s.format === "usd" ? `US$ ${n}` : s.format === "pct" ? `${n}%` : n;
  }
  /* Chips de ferramentas: ícone colorido + nome. */
  const TOOL_BY_LABEL = Object.fromEntries(Object.entries(D.tools).map(([k, t]) => [t.label.toLowerCase(), k]));
  function toolChip(key) {
    const t = D.tools[key];
    if (!t) return "";
    return `<li class="chip" style="--c:${t.color}">${icon(t.icon)}<span>${esc(t.label)}</span></li>`;
  }
  function stackChip(name) {
    const key = TOOL_BY_LABEL[name.toLowerCase()];
    return key ? toolChip(key) : `<li class="chip chip--plain"><span>${esc(name)}</span></li>`;
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
      } else if (p.cover && p.cover.icon) {
        preview = `<div class="work-mark" style="background:${p.cover.bg};--c:${p.cover.color}">${icon(p.cover.icon)}<span>${esc(p.cover.label)}</span></div>`;
      } else {
        preview = `<img src="${p.cover.src}" alt="" loading="lazy" decoding="async" style="object-position:${p.cover.position || "50% 50%"}">`;
      }
      return `
        <a class="work-card" href="#projetos/${p.id}" data-case-open="${p.id}" style="--i:${i}">
          <div class="work-preview">${preview}</div>
          <div class="work-meta">
            <div class="work-meta-row">
              <span class="work-company">${esc(p.company)}</span>
              ${p.status ? `<span class="status">${icon("check-circle-fill")}${esc(p.status)}</span>` : ""}
            </div>
            <h2 class="work-title">${esc(p.title)}</h2>
            <ul class="chips" aria-label="Ferramentas">${(p.tools || []).map(toolChip).join("")}</ul>
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

  // Toda imagem de projeto leva o aviso de dados fictícios, junto da legenda.
  // O projeto pode trocar o aviso (por exemplo, quando os dados são públicos e reais).
  const fakeTag = (p = {}) => {
    const text = p.mediaNote || D.mediaNote;
    return text ? `<span class="fake-tag${p.realData ? " fake-tag--real" : ""}">${icon("info-fill")}${esc(text)}</span>` : "";
  };
  const caption = (m, p) => `<figcaption>${fakeTag(p)}${m.caption ? `<span>${esc(m.caption)}</span>` : ""}</figcaption>`;
  function renderMedia(m, p) {
    if (m.type === "phones") {
      return `<figure class="case-figure"><div class="case-phones">${m.items.map((it) =>
        `<img src="${it.src}" width="${it.width}" height="${it.height}" alt="${esc(it.alt)}" loading="lazy" decoding="async">`).join("")}</div>${caption(m, p)}</figure>`;
    }
    return `<figure class="case-figure"><img src="${m.src}" width="${m.width}" height="${m.height}" alt="${esc(m.alt)}" loading="lazy" decoding="async">${caption(m, p)}</figure>`;
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
          <ul class="chips case-chips" aria-label="Ferramentas">${p.stack.map(stackChip).join("")}</ul>
          ${first ? renderMedia(first, p) : ""}
          <div class="case-secs">${p.sections.map((s) => `<section class="case-sec"><h2>${esc(s.heading)}</h2><p>${esc(s.body)}</p></section>`).join("")}</div>
          ${rest.map((m) => renderMedia(m, p)).join("")}
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
    onPanel.forEach((fn) => fn(name));
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

  const ARROW = `<svg viewBox="0 0 56 28" aria-hidden="true"><path d="M53 5C38 1 18 4 6 19" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M5 9.5 6 19l9.5-.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  function renderLab() {
    const L = D.lab;
    $("[data-lab-title]").textContent = L.title;
    $("[data-lab-sub]").textContent = L.sub;
    const win = (f, url) => {
      const media = f.image
        ? `<span class="tile-img"><img src="${f.image.src}" width="${f.image.width}" height="${f.image.height}" alt="${esc(f.image.alt)}" loading="lazy" decoding="async">${fakeTag()}</span>`
        : `<pre class="tile-code"><code>${highlight(f.code, f.lang)}</code></pre>`;
      return `<a class="tile" href="${url}" target="_blank" rel="noopener" aria-label="${esc(f.name)}, abrir no GitHub">
        <span class="tile-bar"><span class="tile-dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="tile-name">${esc(f.name)}</span><span class="tile-open">${icon("arrow-up-right")}</span></span>
        ${media}
      </a>`;
    };
    $("[data-lab-projects]").innerHTML = L.projects.map((p, i) => `
      <article class="lab-project" data-anchor="lab-${p.id}" aria-labelledby="lp-${p.id}">
        <header class="lp-head">
          <span class="lp-num" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>
          <h2 class="lp-name" id="lp-${p.id}">${esc(p.name)}</h2>
          <span class="lp-origin">${esc(p.origin)}</span>
        </header>
        <div class="lp-body">
          <div class="lp-files">${p.files.map((f) => win(f, p.url)).join("")}</div>
          <aside class="lp-note" aria-label="Anotação sobre ${esc(p.name)}">
            <span class="lp-arrow">${ARROW}</span>
            <p class="lp-text">${esc(p.note.text)}</p>
            <ul class="lp-points">${p.note.points.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
            <a class="lp-link" href="${p.url}" target="_blank" rel="noopener">ver no GitHub ${icon("arrow-up-right")}</a>
          </aside>
        </div>
      </article>`).join("");
  }

  /* ---------- Adesivos ---------- */
  // Cada adesivo da cartela descola de verdade: a borda puxada dobra por cima dele (o verso aparece),
  // e quando quase tudo soltou ele vira e vai para o cursor. Dá para colar em qualquer lugar do laboratório.
  function initBoard() {
    const B = D.board;
    const lab = $("[data-lab]");
    const paper = $("[data-paper]");
    const sheet = $(".board-sheet");
    const host = $("[data-stickers]");
    const byId = Object.fromEntries(B.stickers.map((s) => [s.id, s]));
    $("[data-board-title]").textContent = B.title;
    $("[data-todo]").innerHTML = B.todo.map((t) => `<li${t.done ? ' class="done"' : ""}><span>${esc(t.text)}</span>${t.done ? '<span class="sr-only"> (feito)</span>' : ""}</li>`).join("");
    const face = (s) => `<span class="st-face">${icon(s.id)}</span>`;
    host.innerHTML = B.stickers.map((s) => `
      <button class="sticker" type="button" data-sticker="${s.id}" style="--c:${s.color}" aria-label="Adesivo ${esc(s.label)}: colar no papel">
        <span class="peel" aria-hidden="true">
          <span class="peel-hole"></span>
          <span class="peel-front">${face(s)}</span>
          <span class="peel-shade"><span class="peel-flap"><span class="peel-back"></span></span></span>
        </span>
      </button>`).join("");

    const KEY = "pedro-adesivos-v3";
    const MAX = 40;
    let items = (store.get(KEY) || []).filter((it) => it && byId[it.k]);
    const save = () => store.set(KEY, items);

    /* --- Geometria da dobra --- */
    // Quadrado do adesivo (com folga) cortado pela reta da dobra. side = 1: parte ainda colada; -1: parte solta.
    function cut(S, o, n, side) {
      const m = 8, box = [[-m, -m], [S + m, -m], [S + m, S + m], [-m, S + m]], out = [];
      const f = (p) => side * ((p[0] - o[0]) * n[0] + (p[1] - o[1]) * n[1]);
      for (let i = 0; i < 4; i++) {
        const a = box[i], b = box[(i + 1) % 4], fa = f(a), fb = f(b);
        if (fa >= 0) out.push(a);
        if ((fa >= 0) !== (fb >= 0)) { const t = fa / (fa - fb); out.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]); }
      }
      return out;
    }
    const poly = (pts, off = 0) => pts.length > 2
      ? `polygon(${pts.map((p) => `${(p[0] + off).toFixed(1)}px ${(p[1] + off).toFixed(1)}px`).join(", ")})`
      : "polygon(0 0, 0 0, 0 0)";
    // O que sobra colado, em fração da área do círculo.
    function stuck(S, o, n) {
      const R = S / 2;
      const g = Math.max(-R, Math.min(R, (R - o[0]) * n[0] + (R - o[1]) * n[1]));
      const cap = R * R * Math.acos(g / R) - g * Math.sqrt(R * R - g * g);
      return 1 - cap / (Math.PI * R * R);
    }

    const states = new Map();
    function state(btn) {
      if (!states.has(btn)) {
        states.set(btn, {
          btn, s: byId[btn.dataset.sticker], u: [Math.SQRT1_2, Math.SQRT1_2], v: [0, 0], tw: 0, busy: false,
          peel: $(".peel", btn), front: $(".peel-front", btn), shade: $(".peel-shade", btn), flap: $(".peel-flap", btn), back: $(".peel-back", btn)
        });
      }
      return states.get(btn);
    }
    // u: direção (do centro para fora) da borda que está sendo puxada.
    function grabDir(st, cx, cy) {
      const r = st.peel.getBoundingClientRect();
      const dx = cx - (r.left + r.width / 2), dy = cy - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy);
      st.u = d < r.width * 0.12 ? [Math.SQRT1_2, Math.SQRT1_2] : [dx / d, dy / d];
    }
    const inward = (st, k) => { const S = st.peel.offsetWidth; return [-st.u[0] * k * S, -st.u[1] * k * S]; };

    function geometry(st) {
      const S = st.peel.offsetWidth;
      const L = Math.hypot(st.v[0], st.v[1]);
      if (L < 0.5 || !S) return null;
      const n = [st.v[0] / L, st.v[1] / L];
      const edge = [S / 2 + st.u[0] * S / 2, S / 2 + st.u[1] * S / 2];
      const o = [edge[0] + st.v[0] / 2, edge[1] + st.v[1] / 2];
      return { S, L, n, o };
    }
    function draw(st) {
      const g = geometry(st);
      if (!g) {
        st.front.style.clipPath = st.front.style.webkitClipPath = "";
        st.shade.style.visibility = "hidden";
        st.btn.classList.remove("is-peeling");
        return 1;
      }
      const { S, L, n, o } = g;
      st.btn.classList.add("is-peeling");
      const reflect = (p) => { const d = 2 * ((p[0] - o[0]) * n[0] + (p[1] - o[1]) * n[1]); return [p[0] - d * n[0], p[1] - d * n[1]]; };
      st.front.style.clipPath = st.front.style.webkitClipPath = poly(cut(S, o, n, 1));
      st.flap.style.clipPath = st.flap.style.webkitClipPath = poly(cut(S, o, n, -1).map(reflect), S);
      st.shade.style.visibility = "visible";
      // O verso é o círculo espelhado na reta da dobra: p' = (I - 2nnᵀ)p + 2(o·n)n.
      const k = 2 * (o[0] * n[0] + o[1] * n[1]);
      st.back.style.transform = `matrix(${1 - 2 * n[0] * n[0]}, ${-2 * n[0] * n[1]}, ${-2 * n[0] * n[1]}, ${1 - 2 * n[1] * n[1]}, ${k * n[0]}, ${k * n[1]})`;
      // Sombra da dobra no verso, mais forte perto do vinco.
      const ang = Math.atan2(-n[0], n[1]);
      const len = S * (Math.abs(n[0]) + Math.abs(n[1]));
      const at = ((o[0] - S / 2) * -n[0] + (o[1] - S / 2) * -n[1]) / len + 0.5;
      const w = Math.max(3, Math.min(L * 0.35, S * 0.3)) / len;
      st.back.style.backgroundImage = `linear-gradient(${(ang * 180 / Math.PI).toFixed(1)}deg, rgb(0 0 0 / 0.16) ${(at * 100).toFixed(1)}%, rgb(0 0 0 / 0.05) ${((at + w * 0.4) * 100).toFixed(1)}%, rgb(0 0 0 / 0) ${((at + w) * 100).toFixed(1)}%)`;
      const lift = Math.min(1, L / S);
      st.shade.style.filter = `drop-shadow(${(n[0] * (1 + lift * 3)).toFixed(1)}px ${(n[1] * (1 + lift * 3) + 1).toFixed(1)}px ${(1.2 + lift * 5).toFixed(1)}px rgb(0 0 0 / ${(0.22 - lift * 0.06).toFixed(3)}))`;
      return stuck(S, o, n);
    }
    function tween(st, target, dur, each) {
      cancelAnimationFrame(st.tw);
      if (reduceMotion) { st.v = target.slice(); draw(st); return; }
      const from = st.v.slice(), t0 = performance.now();
      const step = (t) => {
        const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        st.v = [from[0] + (target[0] - from[0]) * e, from[1] + (target[1] - from[1]) * e];
        const left = draw(st);
        if (each && each(left) === false) return;
        if (k < 1) st.tw = requestAnimationFrame(step);
      };
      st.tw = requestAnimationFrame(step);
    }

    /* --- Adesivo solto, voando na tela --- */
    const ease = (k) => 1 - Math.pow(1 - k, 3);
    function makeGhost(s, size) {
      const el = document.createElement("span");
      el.className = "sticker-ghost";
      el.style.cssText = `--c:${s.color};width:${size}px;height:${size}px`;
      el.innerHTML = `<span class="ghost-flip"><span class="ghost-back"></span>${face(s)}</span>`;
      document.body.appendChild(el);
      const flip = $(".ghost-flip", el);
      const g = { el, x: 0, y: 0, rot: 0, anim: 0 };
      g.set = (x, y, rot, axis, deg) => {
        g.x = x; g.y = y;
        el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -50%) rotate(${rot.toFixed(2)}deg)`;
        flip.style.transform = deg ? `rotate3d(${axis[0].toFixed(3)}, ${axis[1].toFixed(3)}, 0, ${deg.toFixed(1)}deg)` : "none";
      };
      // Anima de onde está até "to()" (que pode mudar a cada quadro, como o cursor), virando de costas para frente.
      g.fly = (from, to, rot, axis, dur, done) => {
        cancelAnimationFrame(g.anim);
        if (reduceMotion) { const p = to(); g.set(p.x, p.y, rot); g.rot = rot; done && done(); return; }
        const t0 = performance.now();
        const step = (t) => {
          const k = Math.min(1, (t - t0) / dur), e = ease(k), p = to();
          g.set(from.x + (p.x - from.x) * e, from.y + (p.y - from.y) * e, from.rot + (rot - from.rot) * e, axis, axis ? 180 * (1 - e) : 0);
          if (k < 1) g.anim = requestAnimationFrame(step);
          else { g.rot = rot; g.anim = 0; done && done(); }
        };
        g.anim = requestAnimationFrame(step);
      };
      g.follow = (x, y) => { if (!g.anim) g.set(x, y, g.rot); };
      return g;
    }

    // Solta o adesivo da cartela: ele aparece virado no lugar da aba e gira de volta enquanto vai até o alvo.
    function detach(st, to, dur, done) {
      const g0 = geometry(st);
      const r = st.peel.getBoundingClientRect();
      const S = r.width;
      let start = { x: r.left + S / 2, y: r.top + S / 2, rot: 0 }, axis = null;
      if (g0) {
        const { n, o } = g0;
        const d = 2 * ((S / 2 - o[0]) * n[0] + (S / 2 - o[1]) * n[1]);
        start = { x: r.left + S / 2 - d * n[0], y: r.top + S / 2 - d * n[1], rot: 0 };
        axis = [-n[1], n[0]];
      }
      cancelAnimationFrame(st.tw);
      st.btn.classList.add("is-peeled");
      st.v = [0, 0];
      draw(st);
      const g = makeGhost(st.s, S);
      const rot = Math.round(Math.random() * 28 - 14);
      g.set(start.x, start.y, 0, axis, axis ? 180 : 0);
      g.fly(start, to, rot, axis, dur, done);
      return g;
    }
    function regrow(st) {
      st.btn.classList.remove("is-peeled");
      st.busy = false;
    }

    /* --- Adesivos colados --- */
    const anchorOf = (id) => (id === "lab" ? lab : $(`[data-anchor="${id}"]`, lab));
    function placedEl(it, slap) {
      const s = byId[it.k];
      const el = document.createElement("span");
      el.className = `placed${slap ? " slap" : ""}`;
      el.dataset.placed = it.k;
      el.setAttribute("role", "img");
      el.setAttribute("aria-label", `Adesivo ${s.label}`);
      el.style.cssText = `--c:${s.color};--rot:${it.r}deg;left:${(it.x * 100).toFixed(2)}%;top:${(it.y * 100).toFixed(2)}%`;
      el.innerHTML = face(s);
      el._item = it;
      return el;
    }
    function renderPlaced() {
      $$(".placed", lab).forEach((el) => el.remove());
      items.forEach((it) => { const a = anchorOf(it.a); if (a) a.appendChild(placedEl(it)); });
    }
    function stick(it) {
      items.push(it);
      if (items.length > MAX) { const old = items.shift(); $$(".placed", lab).find((el) => el._item === old)?.remove(); }
      save();
      const a = anchorOf(it.a);
      if (a) a.appendChild(placedEl(it, !reduceMotion));
    }
    const near = (el, x, y, pad) => { const r = el.getBoundingClientRect(); return x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad; };
    // Onde o adesivo caiu: no elemento marcado mais próximo (projeto, papel, mesa) ou no laboratório.
    function spotAt(x, y) {
      if (near(sheet, x, y, 12)) return null;
      const under = document.elementFromPoint(x, y);
      if (!under || !lab.contains(under)) return null;
      const a = under.closest("[data-anchor]") || lab;
      const r = a.getBoundingClientRect();
      return { a: a.dataset.anchor, x: (x - r.left) / r.width, y: (y - r.top) / r.height };
    }
    function randomOnPaper() {
      return { a: "paper", x: 0.18 + Math.random() * 0.64, y: 0.3 + Math.random() * 0.55 };
    }
    // Ponto na tela de um lugar salvo (âncora + fração).
    function screenOf(spot) {
      const r = anchorOf(spot.a).getBoundingClientRect();
      return { x: r.left + spot.x * r.width, y: r.top + spot.y * r.height };
    }

    /* --- Cartela: passar o mouse, puxar, tocar --- */
    host.addEventListener("pointerover", (e) => {
      const btn = e.target.closest("[data-sticker]");
      if (!btn || e.pointerType !== "mouse" || btn.contains(e.relatedTarget)) return;
      const st = state(btn);
      if (st.busy) return;
      grabDir(st, e.clientX, e.clientY);
      tween(st, inward(st, 0.2), 300);
    });
    host.addEventListener("pointerout", (e) => {
      const btn = e.target.closest("[data-sticker]");
      if (!btn || e.pointerType !== "mouse" || btn.contains(e.relatedTarget)) return;
      const st = state(btn);
      if (!st.busy) tween(st, [0, 0], 350);
    });

    // Toque ou teclado: descola sozinho e voa para o papel.
    function autoPlace(st) {
      st.busy = true;
      const spot = randomOnPaper();
      const target = () => screenOf(spot);
      let done = false;
      const go = () => {
        if (done) return;
        done = true;
        const g = detach(st, target, 560, () => {
          g.el.remove();
          stick({ k: st.s.id, ...spot, r: Math.round(g.rot) });
          regrow(st);
        });
      };
      tween(st, inward(st, 1.8), 360, (left) => { if (left <= 0.2) { go(); return false; } });
      setTimeout(go, reduceMotion ? 0 : 420);
    }

    host.addEventListener("pointerdown", (e) => {
      const btn = e.target.closest("[data-sticker]");
      if (!btn || e.button > 0) return;
      const st = state(btn);
      if (st.busy) return;
      e.preventDefault();
      st.busy = true;
      try { btn.setPointerCapture(e.pointerId); } catch { /* segue sem captura */ }
      if (Math.hypot(st.v[0], st.v[1]) < 1) grabDir(st, e.clientX, e.clientY);
      tween(st, inward(st, 0.3), 220);
      const t0 = performance.now();
      let from = null, base = null, ghost = null, pointer = { x: e.clientX, y: e.clientY };
      const move = (ev) => {
        pointer = { x: ev.clientX, y: ev.clientY };
        if (ghost) { ghost.follow(pointer.x, pointer.y); return; }
        if (!from) {
          if (Math.hypot(ev.clientX - e.clientX, ev.clientY - e.clientY) < 5) return;
          cancelAnimationFrame(st.tw);
          from = pointer; base = st.v.slice();
        }
        // A ponta da aba segue o dedo.
        st.v = [base[0] + pointer.x - from.x, base[1] + pointer.y - from.y];
        if (draw(st) <= 0.18) ghost = detach(st, () => pointer, 260);
      };
      const up = (ev) => {
        btn.removeEventListener("pointermove", move);
        btn.removeEventListener("pointerup", up);
        btn.removeEventListener("pointercancel", up);
        if (ghost) {
          const g = ghost;
          cancelAnimationFrame(g.anim); g.anim = 0;
          g.el.style.visibility = "hidden";
          const spot = ev.type === "pointerup" ? spotAt(ev.clientX, ev.clientY) : null;
          g.el.style.visibility = "";
          if (spot) { g.el.remove(); stick({ k: st.s.id, ...spot, r: Math.round(g.rot) }); regrow(st); }
          else {
            // Fora da página: volta para a cartela.
            const r = st.peel.getBoundingClientRect();
            g.fly({ x: g.x, y: g.y, rot: g.rot }, () => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 }), 0, null, 280, () => { g.el.remove(); regrow(st); });
          }
        } else if (!from && ev.type === "pointerup" && performance.now() - t0 < 600) {
          autoPlace(st);
        } else {
          tween(st, [0, 0], 400);
          st.busy = false;
        }
      };
      btn.addEventListener("pointermove", move);
      btn.addEventListener("pointerup", up);
      btn.addEventListener("pointercancel", up);
    });
    host.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-sticker]");
      if (btn && e.detail === 0 && !state(btn).busy) { grabDir(state(btn), 0, 0); autoPlace(state(btn)); }
    });

    /* --- Adesivos colados: dá para levantar e mudar de lugar (ou devolver à cartela) --- */
    lab.addEventListener("pointerdown", (e) => {
      const el = e.target.closest(".placed");
      if (!el || e.button > 0) return;
      e.preventDefault();
      const it = el._item;
      const s = byId[it.k];
      el.classList.remove("slap");
      el.classList.add("lifted");
      let ghost = null;
      const sx = e.clientX, sy = e.clientY;
      const move = (ev) => {
        if (!ghost) {
          if (Math.hypot(ev.clientX - sx, ev.clientY - sy) < 5) return;
          const r = el.getBoundingClientRect();
          ghost = makeGhost(s, el.offsetWidth);
          ghost.rot = it.r;
          ghost.set(r.left + r.width / 2, r.top + r.height / 2, it.r);
          el.remove();
          ghost.ox = ghost.x - sx; ghost.oy = ghost.y - sy;
        }
        ghost.follow(ev.clientX + ghost.ox, ev.clientY + ghost.oy);
      };
      const up = (ev) => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        window.removeEventListener("pointercancel", up);
        el.classList.remove("lifted");
        if (!ghost) return;
        const x = ghost.x, y = ghost.y;
        ghost.el.style.visibility = "hidden";
        const onSheet = near(sheet, x, y, 12);
        const spot = ev.type === "pointerup" && !onSheet ? spotAt(x, y) : null;
        items = items.filter((i) => i !== it);
        if (spot) { ghost.el.remove(); stick({ k: it.k, ...spot, r: it.r }); return; }
        if (onSheet) {
          // Devolvido à cartela.
          const slot = $(`[data-sticker="${it.k}"] .peel`, host).getBoundingClientRect();
          ghost.el.style.visibility = "";
          ghost.fly({ x, y, rot: it.r }, () => ({ x: slot.left + slot.width / 2, y: slot.top + slot.height / 2 }), 0, null, 260, () => ghost.el.remove());
          save();
          return;
        }
        // Caiu fora: volta para onde estava.
        ghost.el.remove();
        stick(it);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      window.addEventListener("pointercancel", up);
    });

    $("[data-board-reset]").addEventListener("click", () => {
      items = [];
      save();
      $$(".placed", lab).forEach((el) => el.remove());
    });

    // Os colados têm o mesmo tamanho dos da cartela.
    const fit = () => { const w = $(".peel", host)?.offsetWidth; if (w) lab.style.setProperty("--s", `${w}px`); };
    new ResizeObserver(fit).observe(host);
    renderPlaced();
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
    initArts();
    initKeychain();
    initNav();
    route();
  }

  init();
})();
