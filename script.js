document.addEventListener("DOMContentLoaded", () => {
  // Revelação suave dos blocos durante a rolagem.
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach((element) => observer.observe(element));
  } else {
    revealEls.forEach((element) => element.classList.add("visible"));
  }

  // Ripple dos botões mantido.
  document.querySelectorAll(".btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      const rect = button.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "btn-ripple";
      ripple.style.left = `${event.clientX - rect.left}px`;
      ripple.style.top = `${event.clientY - rect.top}px`;
      button.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), 600);
    });
  });

  // Fundo: poucos pontos, deslocamento lento e conexões finas.
  const canvas = document.getElementById("network-background");
  if (!canvas) return;
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pointer = { x: -1000, y: -1000, active: false };
  let particles = [];
  let width = 0;
  let height = 0;
  let dpr = 1;
  let raf = 0;
  let lastDraw = 0;

  const rand = (min, max) => Math.random() * (max - min) + min;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Aproximadamente metade da quantidade da versão anterior.
    const count = Math.max(22, Math.min(48, Math.round((width * height) / 36000)));
    particles = Array.from({ length: count }, () => ({
      x: rand(0, width),
      y: rand(0, height),
      vx: rand(-0.075, 0.075),
      vy: rand(-0.060, 0.060),
      radius: rand(0.7, 1.25),
      phase: rand(0, Math.PI * 2)
    }));
    draw(0, true);
  }

  function draw(time, staticFrame = false) {
    ctx.clearRect(0, 0, width, height);

    // Um halo muito suave, sem linhas puxadas até o cursor.
    if (pointer.active && !reduceMotion) {
      const halo = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 145);
      halo.addColorStop(0, "rgba(67,199,127,0.035)");
      halo.addColorStop(1, "rgba(67,199,127,0)");
      ctx.fillStyle = halo;
      ctx.fillRect(pointer.x - 145, pointer.y - 145, 290, 290);
    }

    const maxDistance = width < 700 ? 105 : 138;
    const maxDistanceSq = maxDistance * maxDistance;

    for (let i = 0; i < particles.length; i += 1) {
      const p = particles[i];
      if (!staticFrame && !reduceMotion) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -8) p.x = width + 8;
        if (p.x > width + 8) p.x = -8;
        if (p.y < -8) p.y = height + 8;
        if (p.y > height + 8) p.y = -8;
      }

      for (let j = i + 1; j < particles.length; j += 1) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const distanceSq = dx * dx + dy * dy;
        if (distanceSq < maxDistanceSq) {
          const distance = Math.sqrt(distanceSq);
          const alpha = (1 - distance / maxDistance) * 0.105;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(104,196,151,${alpha})`;
          ctx.lineWidth = 0.55;
          ctx.stroke();
        }
      }

      const pulse = 0.94 + Math.sin(time * 0.00045 + p.phase) * 0.06;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * pulse, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(125,205,165,0.48)";
      ctx.fill();
    }
  }

  function animate(time) {
    if (document.hidden) {
      raf = 0;
      return;
    }
    // Atualização lenta para que os pontos pareçam flutuar, não correr.
    if (time - lastDraw >= 40) {
      draw(time);
      lastDraw = time;
    }
    raf = window.requestAnimationFrame(animate);
  }

  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("pointermove", (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
  }, { passive: true });
  window.addEventListener("pointerleave", () => { pointer.active = false; }, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && raf) {
      window.cancelAnimationFrame(raf);
      raf = 0;
    } else if (!document.hidden && !raf && !reduceMotion) {
      raf = window.requestAnimationFrame(animate);
    }
  });

  resize();
  if (!reduceMotion) raf = window.requestAnimationFrame(animate);
});

/* ===== v6 — efeitos modernos e interações educativas ===== */
document.addEventListener("DOMContentLoaded", () => {
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FINE = matchMedia("(pointer:fine)").matches;
  const $ = (s) => [...document.querySelectorAll(s)];

  // 1. Barra de progresso de leitura
  const bar = document.querySelector(".scroll-progress");
  const onScroll = () => {
    const m = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.transform = `scaleX(${m > 0 ? Math.min(scrollY / m, 1) : 0})`;
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // 2. Revelação escalonada de grades
  $(".why-grid,.scenario-grid,.story-grid,.principles,.sources,.flow,.mini-grid,.defense-list,.stats,.cgrid,.bars").forEach((g) => {
    g.classList.add("reveal", "stg");
    [...g.children].forEach((c, i) => c.style.setProperty("--i", i));
  });

  // 3. Holofote que segue o cursor
  $(".scenario,.feature-card,.stat,.mini-grid div,.fake-message,.security-panel,.quizbox,.sources div").forEach((e) => e.classList.add("spot"));
  document.addEventListener("pointermove", (e) => {
    const el = e.target.closest && e.target.closest(".spot");
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", e.clientX - r.left + "px");
    el.style.setProperty("--my", e.clientY - r.top + "px");
  }, { passive: true });

  // 4. Inclinação 3D suave e botões magnéticos (só com mouse)
  if (!RM && FINE) {
    $(".security-panel,.large-book,.book").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        el.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
    $(".btn,.nav-cta").forEach((b) => {
      b.addEventListener("pointermove", (e) => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px,${(e.clientY - r.top - r.height / 2) * .28}px)`;
      });
      b.addEventListener("pointerleave", () => { b.style.transform = ""; });
    });
  }

  // 5. Contadores e texto "decifrando"
  const CH = "!<>-_/[]{}=+*^?#01";
  const scramble = (el) => {
    const t = el.textContent; let f = 0; const total = 24;
    const id = setInterval(() => {
      f++;
      el.textContent = [...t].map((c, i) => (c === " " || i < t.length * f / total) ? c : CH[Math.floor(Math.random() * CH.length)]).join("");
      if (f >= total) { clearInterval(id); el.textContent = t; }
    }, 38);
  };
  const count = (el) => {
    const to = +el.dataset.count, suf = el.dataset.suffix || "", pre = el.dataset.prefix || "";
    if (RM) { el.textContent = pre + to + suf; return; }
    const t0 = performance.now();
    const step = (n) => {
      const p = Math.min((n - t0) / 1400, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = pre + Math.round(to * e).toLocaleString("pt-BR") + suf;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (!en.isIntersecting) return;
    const el = en.target; io.unobserve(el);
    if (el.classList.contains("stg")) el.classList.add("visible");
    if (el.classList.contains("meter")) el.classList.add("on");
    if (el.dataset.count) count(el);
    if (el.hasAttribute("data-scramble") && !RM) scramble(el);
  }), { threshold: .25 });
  $(".stg,.meter,[data-count],[data-scramble]").forEach((e) => io.observe(e));

  // 6. Índice do e-book acompanha a leitura
  const links = $(".reader aside a");
  if (links.length) {
    const so = new IntersectionObserver((es) => es.forEach((en) => {
      if (en.isIntersecting) links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + en.target.id));
    }), { rootMargin: "-30% 0px -60% 0px" });
    $(".chapter").forEach((c) => so.observe(c));
  }

  // 7. Mensagem falsa: encontre os sinais de alerta
  const flags = document.getElementById("flags"), fcount = document.getElementById("fcount");
  $(".hot").forEach((h) => h.addEventListener("click", () => {
    if (h.classList.contains("found")) return;
    h.classList.add("found");
    const li = document.createElement("li");
    li.textContent = h.dataset.why;
    flags.appendChild(li);
    fcount.textContent = flags.children.length;
  }));

  // 8. Cartas de persuasão
  $(".cc").forEach((c) => c.addEventListener("click", () => c.classList.toggle("flip")));

  // 9. Quiz
  const qz = document.getElementById("quiz");
  if (qz) {
    const Q = [
      ["Chega um SMS do “banco” com um link: sua conta será bloqueada em 1 hora. O que fazer?",
        ["Clicar rápido para resolver", "Abrir o aplicativo oficial do banco ou ligar para o número do cartão", "Responder o SMS pedindo mais detalhes"], 1,
        "Pressa é o gatilho de escassez. Sair da mensagem e procurar o banco por um canal que você já conhece interrompe o golpe."],
      ["Em https://banco.com.br.confirmar-dados.xyz/login, qual é o domínio verdadeiro?",
        ["banco.com.br", "confirmar-dados.xyz", "login"], 1,
        "O domínio real fica logo antes da primeira barra, lido de trás para frente. “banco.com.br” aqui é só um enfeite para enganar."],
      ["Qual destes é um sinal clássico de engenharia social?",
        ["Alguém pede o código que chegou por SMS", "Uma notificação do app do banco que você abriu sozinho", "Um amigo combinando um café pessoalmente"], 0,
        "Códigos de verificação são pessoais. Nenhuma empresa séria pede esse código por mensagem ou telefone."],
      ["Um áudio com a voz do seu filho, de um número novo, pede um Pix urgente. Melhor atitude?",
        ["Fazer o Pix e perguntar depois", "Ligar para o número antigo dele ou fazer uma chamada de vídeo antes de pagar", "Mandar metade do valor"], 1,
        "Hoje a IA consegue imitar vozes. Confirmar por outro canal, ou com uma pergunta que só ele saberia, é a defesa mais simples."]
    ];
    let i = 0, s = 0;
    const render = () => {
      if (i >= Q.length) {
        const msg = s === Q.length ? "Radar afiado! Você interrompeu todos os ataques." : s >= 2 ? "Bom resultado. Releia os capítulos das perguntas que errou." : "Vale reler o e-book: o golpe só funciona quando passa despercebido.";
        qz.innerHTML = `<div class="quizbox"><div class="qmeta">RESULTADO</div><h3>${s} de ${Q.length} acertos</h3><p class="qexp">${msg}</p><button class="btn primary qnext">Refazer o teste</button></div>`;
        qz.querySelector(".qnext").onclick = () => { i = 0; s = 0; render(); };
        return;
      }
      const [q, opts, ok, why] = Q[i];
      qz.innerHTML = `<div class="quizbox"><div class="qmeta">PERGUNTA ${i + 1} DE ${Q.length}</div><h3>${q}</h3>${opts.map((o, k) => `<button class="qopt" data-k="${k}">${o}</button>`).join("")}<div class="qexp" hidden></div></div>`;
      qz.querySelectorAll(".qopt").forEach((b) => b.onclick = () => {
        const k = +b.dataset.k;
        qz.querySelectorAll(".qopt").forEach((x) => { x.disabled = true; });
        qz.querySelectorAll(".qopt")[ok].classList.add("ok");
        if (k === ok) s++; else b.classList.add("no");
        const ex = qz.querySelector(".qexp");
        ex.hidden = false;
        ex.innerHTML = `${k === ok ? "Correto. " : "Quase. "}${why}<br><button class="btn primary qnext">${i + 1 < Q.length ? "Próxima" : "Ver resultado"}</button>`;
        ex.querySelector(".qnext").onclick = () => { i++; render(); };
      });
    };
    render();
  }
});

/* ===== v7 — chuva de código ao fundo + títulos de seção decifrando ===== */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".section-label").forEach((el) => {
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) el.setAttribute("data-scramble", "");
  });
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const cv = document.createElement("canvas");
  cv.className = "rain-bg"; cv.setAttribute("aria-hidden", "true");
  document.body.appendChild(cv);
  const ctx = cv.getContext("2d");
  if (!ctx) return;
  const GL = "01010101ABCDEF<>/{}";
  const SIZE = 15;
  let w, h, cols, drops, raf = 0, last = 0;
  const init = () => {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    w = innerWidth; h = innerHeight;
    cv.width = w * dpr; cv.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.floor(w / (SIZE * 1.8));
    drops = Array.from({ length: cols }, () => ({ y: Math.random() * -h / SIZE, v: .25 + Math.random() * .45 }));
  };
  const frame = (t) => {
    raf = requestAnimationFrame(frame);
    if (t - last < 50) return;
    last = t;
    // apaga o quadro anterior aos poucos, criando o rastro
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0,0,0,.11)";
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "source-over";
    ctx.font = `${SIZE}px JetBrains Mono, monospace`;
    drops.forEach((d, i) => {
      const x = i * SIZE * 1.8, y = d.y * SIZE;
      ctx.fillStyle = "rgba(190,255,220,.95)";
      ctx.fillText(GL[Math.floor(Math.random() * GL.length)], x, y);
      ctx.fillStyle = "rgba(67,199,127,.6)";
      ctx.fillText(GL[Math.floor(Math.random() * GL.length)], x, y - SIZE);
      d.y += d.v;
      if (y > h && Math.random() > .975) { d.y = Math.random() * -20; d.v = .25 + Math.random() * .45; }
    });
  };
  const start = () => { if (!raf) raf = requestAnimationFrame(frame); };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; };
  addEventListener("resize", init, { passive: true });
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  init(); start();
});

/* ===== v8 — versão final: título em palavras, brilho do cursor, rótulos e menu ===== */
document.addEventListener("DOMContentLoaded", () => {
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FINE = matchMedia("(pointer:fine)").matches;

  // Menu do celular
  const hd = document.querySelector(".navbar"), nv = hd && hd.querySelector("nav");
  if (nv) {
    const mb = document.createElement("button");
    mb.className = "menu-btn"; mb.type = "button";
    mb.setAttribute("aria-label", "Abrir menu"); mb.setAttribute("aria-expanded", "false");
    mb.innerHTML = "<span></span><span></span><span></span>";
    hd.appendChild(mb);
    const close = () => { nv.classList.remove("open"); mb.classList.remove("open"); mb.setAttribute("aria-expanded", "false"); };
    mb.addEventListener("click", () => {
      const o = nv.classList.toggle("open");
      mb.classList.toggle("open", o); mb.setAttribute("aria-expanded", String(o));
    });
    nv.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
    addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  }

  // Rótulos de seção: linha que se desenha e texto que decifra
  const CH = "!<>-_/[]{}=+*^?#01";
  const scr = (el) => {
    const t = el.textContent; let f = 0;
    const id = setInterval(() => {
      f++;
      el.textContent = [...t].map((c, i) => (c === " " || i < t.length * f / 20) ? c : CH[Math.floor(Math.random() * CH.length)]).join("");
      if (f >= 20) { clearInterval(id); el.textContent = t; }
    }, 40);
  };
  const lio = new IntersectionObserver((es) => es.forEach((en) => {
    if (!en.isIntersecting) return;
    lio.unobserve(en.target);
    en.target.classList.add("on");
    if (!RM) scr(en.target);
  }), { threshold: .6 });
  document.querySelectorAll(".section-label").forEach((l) => lio.observe(l));

  if (RM) return;

  // Títulos entram palavra por palavra
  document.querySelectorAll(".hero h1,.page-hero h1,.ebook-hero h1").forEach((h) => {
    let n = 0;
    const walk = (node) => [...node.childNodes].forEach((c) => {
      if (c.nodeType === 3) {
        const frag = document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach((t) => {
          if (!t) return;
          if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(t)); return; }
          const s = document.createElement("span");
          s.className = "w"; s.style.setProperty("--d", 150 + n++ * 90 + "ms"); s.textContent = t;
          frag.appendChild(s);
        });
        c.replaceWith(frag);
      } else if (c.nodeType === 1 && c.tagName !== "BR") walk(c);
    });
    walk(h);
  });

  // Luz ambiente que segue o cursor
  if (FINE) {
    const g = document.createElement("div");
    g.className = "cursor-glow"; g.setAttribute("aria-hidden", "true");
    document.body.appendChild(g);
    let tx = innerWidth / 2, ty = innerHeight / 3, x = tx, y = ty;
    addEventListener("pointermove", (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    const loop = () => {
      x += (tx - x) * .12; y += (ty - y) * .12;
      g.style.transform = `translate3d(${x}px,${y}px,0)`;
      requestAnimationFrame(loop);
    };
    loop();
  }
});
