const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  const labels = ['Design graphique', 'UI/UX design', 'Audiovisuel'];
  const catLabel = document.getElementById('cat-label');
  let i = 0;
  setInterval(() => {
    slides[i].classList.remove('active');
    dots[i].classList.remove('active');
    i = (i + 1) % slides.length;
    slides[i].classList.add('active');
    dots[i].classList.add('active');
    catLabel.textContent = labels[i];
  }, 3000);

  const navbar = document.querySelector('.navbar');
  const statusTop = document.getElementById('status-top');
  function onScrollNav(){
    const scrolled = window.scrollY > 40;
    navbar.classList.toggle('scrolled', scrolled);
    statusTop.classList.toggle('scrolled', scrolled);
  }
  window.addEventListener('scroll', onScrollNav);
  onScrollNav();

  function updateHeaderOffset(){
    const offset = navbar.offsetHeight + statusTop.offsetHeight;
    document.documentElement.style.setProperty('--header-offset', offset + 'px');
  }
  updateHeaderOffset();
  const headerResizeObserver = new ResizeObserver(updateHeaderOffset);
  headerResizeObserver.observe(navbar);
  headerResizeObserver.observe(statusTop);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(updateHeaderOffset);
  }

  const backToTop = document.getElementById('back-to-top');
  function onScrollBackToTop(){
    const nearBottom = (window.innerHeight + window.scrollY) >= (document.body.scrollHeight - 40);
    backToTop.classList.toggle('visible', nearBottom);
  }
  window.addEventListener('scroll', onScrollBackToTop);
  onScrollBackToTop();

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal, .reveal-center').forEach(el => revealObserver.observe(el));

  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
    });
  });
// ==========================================================
// PROJETS RÉELS SUR L'ACCUEIL (même source que la page Projets)
// Remplit le grand projet + les 6 mini-cartes avec tes vraies
// données depuis content/projets/. Si l'API GitHub échoue, on
// se rabat sur le manifest.json local.
// ==========================================================
const GITHUB_USER_ACCUEIL = "armelinendombasipro-crypto";
const GITHUB_REPO_ACCUEIL = "portfolio2";
const PROJETS_PATH_ACCUEIL = "content/projets";

const LABELS_CATEGORIE = {
  graphisme: "Design graphique",
  "ui-ux": "UI/UX design",
  photographie: "Photographie",
  audiovisuel: "Audiovisuel"
};

async function chargerProjetsAccueil() {
  let projets = [];
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_USER_ACCUEIL}/${GITHUB_REPO_ACCUEIL}/contents/${PROJETS_PATH_ACCUEIL}`);
    if (!res.ok) throw new Error('API GitHub indisponible');
    const liste = await res.json();
    const urls = liste
      .filter(f => f.name.endsWith('.json') && f.name !== 'manifest.json')
      .map(f => f.download_url);
    projets = await Promise.all(urls.map(u => fetch(u).then(r => r.json())));
  } catch (e) {
    try {
      const manifest = await fetch(`${PROJETS_PATH_ACCUEIL}/manifest.json`).then(r => r.json());
      projets = await Promise.all(manifest.map(f => fetch(`${PROJETS_PATH_ACCUEIL}/${f}`).then(r => r.json())));
    } catch (e2) {
      console.error("Impossible de charger les projets sur l'accueil :", e2);
      return;
    }
  }

  projets.sort((a, b) => (a.ordre || 999) - (b.ordre || 999));
  if (projets.length === 0) return;

  const labelCategorie = (p) => {
    const cats = Array.isArray(p.categorie) ? p.categorie : [p.categorie];
    return LABELS_CATEGORIE[cats[0]] || cats[0] || '';
  };

  // Le grand projet vedette = le premier de la liste
  const vedette = projets[0];
  const featuredEl = document.querySelector('.featured-project');
  if (featuredEl && vedette) {
    featuredEl.href = `projets.html?projet=${vedette.slug}`;
    featuredEl.style.backgroundImage = `url('${vedette.vignette || ''}')`;
    featuredEl.style.backgroundSize = 'cover';
    featuredEl.style.backgroundPosition = 'center';
    const tagEl = featuredEl.querySelector('.mini-tag');
    const titreEl = featuredEl.querySelector('h3');
    const metaEl = featuredEl.querySelector('.meta');
    if (tagEl) tagEl.textContent = labelCategorie(vedette);
    if (titreEl) titreEl.textContent = vedette.titre || '';
    if (metaEl) metaEl.textContent = `PAR ARMELINE N.K. · ${vedette.annee || ''}`;
  }

  // Les 6 mini-cartes suivantes
  const miniCards = document.querySelectorAll('.mini-card');
  const suivants = projets.slice(1, 1 + miniCards.length);
  miniCards.forEach((card, i) => {
    const p = suivants[i];
    if (!p) { card.style.display = 'none'; return; }
    card.href = `projets.html?projet=${p.slug}`;
    const thumb = card.querySelector('.mini-thumb');
    const tag = card.querySelector('.mini-tag');
    const titre = card.querySelector('.mini-card-info h4');
    const meta = card.querySelector('.mini-card-info .meta');
    if (thumb) {
      thumb.className = 'mini-thumb';
      thumb.style.backgroundImage = `url('${p.vignette || ''}')`;
      thumb.style.backgroundSize = 'cover';
      thumb.style.backgroundPosition = 'center';
    }
    if (tag) tag.textContent = labelCategorie(p);
    if (titre) titre.textContent = p.titre || '';
    if (meta) meta.textContent = p.annee || '';
  });
}

document.addEventListener('DOMContentLoaded', chargerProjetsAccueil);
