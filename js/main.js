// ConvivApp · sitio web
(() => {
  const root = document.documentElement;

  // ---- Tema claro / oscuro (se recuerda en este navegador) ----
  try {
    const saved = localStorage.getItem('theme');
    if (saved) root.dataset.theme = saved;
  } catch (_) {}
  document.getElementById('theme').addEventListener('click', () => {
    const dark = root.dataset.theme
      ? root.dataset.theme === 'dark'
      : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    try { localStorage.setItem('theme', root.dataset.theme); } catch (_) {}
  });

  // ---- Menú en teléfonos ----
  const nav = document.querySelector('.nav');
  const menu = document.getElementById('menu');
  menu.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('.links a').forEach((a) => a.addEventListener('click', () => {
    nav.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
  }));

  // ---- Aparecer al hacer scroll ----
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    }
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 60}ms`;
    io.observe(el);
  });

  // ---- Teléfonos de la portada que siguen al mouse ----
  const art = document.querySelector('.hero-art');
  if (art && matchMedia('(pointer: fine)').matches) {
    const front = art.querySelector('.phone-front'), back = art.querySelector('.phone-back');
    art.addEventListener('mousemove', (e) => {
      const r = art.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      front.style.transform = `rotate(-5deg) translate(${x * 18}px, ${y * 14}px)`;
      back.style.transform = `rotate(7deg) translate(${x * -12}px, ${y * -10}px)`;
    });
    art.addEventListener('mouseleave', () => { front.style.transform = ''; back.style.transform = ''; });
  }

  // ---- Convi: se copia el dibujo en cada lugar para poder animarlo ----
  const art0 = document.getElementById('convi-art');
  document.querySelectorAll('svg.convi').forEach((svg) => { svg.innerHTML = art0.innerHTML; });

  const big = document.getElementById('convi-svg');
  const bubble = document.getElementById('convi-bubble');
  const phrases = [
    '¡Hola! Soy Convi 👋',
    'Si algo te preocupa, cuéntalo. Aquí te escuchamos 💚',
    '¿Una carrera? ¡Cuidado con los meteoritos! ☄️',
    'Mi sombrero de paja es mi tesoro 👒',
    'Respetar es la mejor forma de convivir 🤝',
    '¿Sabías que estoy hecho solo de código? 🤖',
    '¡Sube de nivel y te celebro con confeti! 🎉',
    'Dibuja y Adivina: ¡yo siempre dibujo robots! 🎨',
  ];
  let phrase = 0, moodTimer = 0;
  const say = (text) => {
    bubble.textContent = text;
    bubble.classList.remove('pop');
    void bubble.offsetWidth;
    bubble.classList.add('pop');
  };
  const setMood = (mood, ms = 2600) => {
    big.classList.remove('mood-happy', 'mood-love', 'mood-wave', 'mood-sleep', 'tickle');
    if (mood) big.classList.add(`mood-${mood}`);
    clearTimeout(moodTimer);
    if (mood && ms) moodTimer = setTimeout(() => setMood(null), ms);
  };
  document.getElementById('convi').addEventListener('click', () => {
    phrase = (phrase + 1) % phrases.length;
    say(phrases[phrase]);
    setMood('happy', 1800);
    big.classList.add('tickle');
  });
  document.querySelectorAll('.moods button').forEach((b) => b.addEventListener('click', () => {
    const mood = b.dataset.mood;
    setMood(mood, mood === 'sleep' ? 6000 : 3500);
    say({
      happy: '¡Qué buen día para convivir! 😊',
      love: 'Te quiero mucho, amigo 💗',
      wave: '¡Holaaa! 👋',
      sleep: 'Zzz… cinco minutitos más… 😴',
    }[mood]);
  }));

  // Los ojos miran hacia el mouse (o el dedo).
  const eyes = big.querySelector('.c-eyes');
  const look = (x, y) => {
    const r = big.getBoundingClientRect();
    const dx = Math.max(-1, Math.min(1, (x - (r.left + r.width / 2)) / (r.width * 1.2)));
    const dy = Math.max(-1, Math.min(1, (y - (r.top + r.height * 0.42)) / (r.height * 1.2)));
    eyes.style.transform = `translate(${dx * 7}px, ${dy * 5}px)`;
  };
  addEventListener('pointermove', (e) => look(e.clientX, e.clientY), { passive: true });

  // Saluda la primera vez que aparece.
  const convIo = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      setMood('wave', 2400);
      convIo.disconnect();
    }
  }, { threshold: 0.5 });
  convIo.observe(big);

  // ---- Versión actual y tamaño de las descargas (desde GitHub) ----
  const mb = (bytes) => `${(bytes / 1048576).toFixed(0)} MB`;
  fetch('https://api.github.com/repos/convivsolutions/convivapp-descargas/releases/latest')
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((rel) => {
      const version = (rel.tag_name || '').replace(/^v/, '');
      const date = new Date(rel.published_at).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' });
      document.getElementById('version-chip').textContent = `Versión ${version} disponible`;
      document.getElementById('download-version').textContent = `Versión ${version} · publicada el ${date}.`;
      document.getElementById('release-info').textContent = `Versión ${version} · gratis · Android, Windows y cualquier navegador (también iPhone).`;
      for (const el of document.querySelectorAll('[data-asset]')) {
        const asset = (rel.assets || []).find((a) => a.name === el.dataset.asset);
        if (asset) el.textContent += ` · ${mb(asset.size)}`;
      }
    })
    .catch(() => {});
})();
