document.addEventListener('DOMContentLoaded', () => {
  const AUTH_REDIRECT = '/login';

  function hasAuthToken() {
    return Boolean(localStorage.getItem('megaSoatToken'));
  }

  function requireAuth(redirectTo = AUTH_REDIRECT) {
    if (hasAuthToken()) return true;
    window.location.replace(redirectTo);
    return false;
  }

  window.requireAuth = requireAuth;

  // ══════════════════════════════════════
  // INYECTAR SISTEMA DE FONDO (4 capas)
  // ══════════════════════════════════════
  (function injectBackground() {
    const bgBase = document.createElement('div');
    bgBase.className = 'bg-base';
    document.body.insertBefore(bgBase, document.body.firstChild);

    const aurora = document.createElement('div');
    aurora.className = 'aurora-bg';
    aurora.innerHTML = `
      <div class="aurora-blob aurora-1"></div>
      <div class="aurora-blob aurora-2"></div>
      <div class="aurora-blob aurora-3"></div>
      <div class="aurora-blob aurora-4"></div>`;
    document.body.insertBefore(aurora, document.body.firstChild);

    const grid = document.createElement('div');
    grid.className = 'dot-grid';
    document.body.insertBefore(grid, document.body.firstChild);

    const vignette = document.createElement('div');
    vignette.className = 'vignette';
    document.body.insertBefore(vignette, document.body.firstChild);
  })();

  // ══════════════════════════════════════
  // NAV DINÁMICA + HAMBURGER MÓVIL
  // ══════════════════════════════════════
  (function initNav() {
    const token = localStorage.getItem('megaSoatToken');
    const user  = localStorage.getItem('megaSoatUser');

    if (document.body?.dataset.requiresAuth === 'true' && !token) {
      window.location.replace(AUTH_REDIRECT);
      return;
    }

    // Mostrar/ocultar items según auth
    document.querySelectorAll('.nav-auth').forEach(el => {
      el.style.display = token ? (el.tagName === 'A' ? 'inline-flex' : 'flex') : 'none';
    });
    document.querySelectorAll('.nav-guest').forEach(el => {
      el.style.display = token ? 'none' : '';
    });

    // Nombre de usuario
    document.querySelectorAll('#userLabel').forEach(el => { if (user) el.textContent = user; });

    // Marcar enlace activo
    const path = window.location.pathname;
    function markActive(a) {
      const href = a.getAttribute('href');
      if (!href) return;
      const isHome  = href === '/' && (path === '/' || path === '/index.html');
      const isOther = href !== '/' && path.includes(href.replace('.html','').replace('/',''));
      if (isHome || isOther) a.classList.add('active');
    }
    document.querySelectorAll('.nav-links a').forEach(markActive);

    // ── HAMBURGER MENU ──
    const topbar = document.querySelector('.topbar');
    if (!topbar) return;

    // Crear botón hamburger
    const burger = document.createElement('button');
    burger.className = 'nav-hamburger';
    burger.setAttribute('aria-label', 'Menú');
    burger.innerHTML = '<span class="bar"></span><span class="bar"></span><span class="bar"></span>';
    topbar.appendChild(burger);

    // Construir drawer móvil
    const drawer = document.createElement('div');
    drawer.className = 'mobile-drawer';

    // Cabecera del drawer
    const drawerHeader = document.createElement('div');
    drawerHeader.className = 'mobile-drawer-header';
    drawerHeader.innerHTML = `<span class="brand" style="font-size:1.1rem">Mega<span style="color:var(--accent)">SOAT</span></span>`;
    const closeBtn = document.createElement('button');
    closeBtn.className = 'mobile-drawer-close';
    closeBtn.setAttribute('aria-label', 'Cerrar');
    closeBtn.innerHTML = '×';
    drawerHeader.appendChild(closeBtn);
    drawer.appendChild(drawerHeader);

    // Links del drawer (copiados de nav-links)
    const linksContainer = document.createElement('div');
    linksContainer.className = 'mobile-drawer-links';

    // Todos los posibles links de navegación
    const allLinks = [
      { href: '/',                label: '🏠 Inicio' },
      { href: '/portal.html',     label: '🔍 Verificar SOAT' },
      { href: '/ranking.html',    label: '🏆 Ranking' },
      { href: '/observatorio.html', label: '🗺️ Observatorio' },
      { href: '/dashboard.html',  label: '📊 Dashboard',     auth: true },
      { href: '/admin.html',      label: '⚙️ Administración', auth: true },
    ];

    allLinks.forEach(item => {
      if (item.auth && !token) return;
      const a = document.createElement('a');
      a.href = item.href;
      a.textContent = item.label;
      markActive(a);
      linksContainer.appendChild(a);
    });

    // Acción de sesión justo debajo de los links
    if (token) {
      const logoutBtn = document.createElement('button');
      logoutBtn.className = 'btn-danger mobile-drawer-logout';
      logoutBtn.textContent = 'Cerrar sesión';
      logoutBtn.onclick = () => window.logout();
      linksContainer.appendChild(logoutBtn);
    } else {
      const loginLink = document.createElement('a');
      loginLink.href = '/login';
      loginLink.className = 'primary-button mobile-drawer-login';
      loginLink.textContent = 'Ingresar al portal';
      linksContainer.appendChild(loginLink);
    }

    drawer.appendChild(linksContainer);
    // Overlay semitransparente (backdrop)
    const overlay = document.createElement('div');
    overlay.className = 'mobile-overlay';
    document.body.appendChild(overlay);
    document.body.appendChild(drawer);

    // Toggle drawer
    function openDrawer() {
      drawer.classList.add('open');
      overlay.classList.add('open');
      burger.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeDrawer() {
      drawer.classList.remove('open');
      overlay.classList.remove('open');
      burger.classList.remove('open');
      document.body.style.overflow = '';
    }

    burger.addEventListener('click', () => drawer.classList.contains('open') ? closeDrawer() : openDrawer());
    closeBtn.addEventListener('click', closeDrawer);
    overlay.addEventListener('click', closeDrawer);

    // Cerrar al hacer clic en un link
    linksContainer.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => closeDrawer());
    });

    // Cerrar con Escape
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });
  })();

  // logout global
  window.logout = function() {
    localStorage.removeItem('megaSoatToken');
    localStorage.removeItem('megaSoatUser');
    window.location.replace(AUTH_REDIRECT);
  };

  window.addEventListener('storage', event => {
    if (event.key === 'megaSoatToken' && !event.newValue && document.body?.dataset.requiresAuth === 'true') {
      window.location.replace(AUTH_REDIRECT);
    }
  });

  window.addEventListener('pageshow', () => {
    if (document.body?.dataset.requiresAuth === 'true') {
      requireAuth();
    }
  });

  // ══════════════════════════════════════
  // ANIMACIONES DE ENTRADA (feature cards)
  // ══════════════════════════════════════
  const panel = document.querySelector('.panel');
  if (panel) {
    panel.querySelectorAll('.feature, .stagger').forEach((el, i) => {
      el.style.animation = `fadeUp .55s ${0.07 + 0.08 * i}s both`;
    });
  }

  // ══════════════════════════════════════
  // TOPBAR — sombra al hacer scroll
  // ══════════════════════════════════════
  const topbar = document.querySelector('.topbar');
  if (topbar) {
    window.addEventListener('scroll', () => {
      topbar.style.boxShadow = window.scrollY > 30 ? '0 4px 28px rgba(0,0,0,0.5)' : 'none';
    }, { passive: true });
  }

  // ══════════════════════════════════════
  // OVERLAY DE CARGA
  // ══════════════════════════════════════
  function createLoadingOverlay() {
    let ex = document.querySelector('.loading-overlay');
    if (ex) return ex;
    const ov = document.createElement('div');
    ov.className = 'loading-overlay';
    const c = document.createElement('div');
    c.className = 'loading-dots';
    for (let i = 0; i < 3; i++) {
      const d = document.createElement('div');
      d.className = 'dot-loading';
      d.style.animationDelay = (i * 0.15) + 's';
      c.appendChild(d);
    }
    ov.appendChild(c);
    document.body.appendChild(ov);
    return ov;
  }

  // ══════════════════════════════════════
  // TRANSICIONES ENTRE PÁGINAS
  // ══════════════════════════════════════
  document.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('javascript')) return;
    a.addEventListener('click', e => {
      e.preventDefault();
      const loading = createLoadingOverlay();
      requestAnimationFrame(() => loading.classList.add('show'));
      document.body.classList.add('page-exit');
      setTimeout(() => { window.location.href = href; }, 380);
    });
  });

  // ══════════════════════════════════════
  // ANIMACIÓN DE ENTRADA DE PÁGINA
  // ══════════════════════════════════════
  requestAnimationFrame(() => document.body.classList.add('page-enter'));
});
