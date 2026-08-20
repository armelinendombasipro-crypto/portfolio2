const SUPABASE_URL_ACCUEIL = "https://lcizfpythfvoqpwvgudd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY_ACCUEIL = "sb_publishable_drHbLNFAe1CGItoded5GZA_s39AGJc0";

const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  let labels = ['Design graphique', 'UI/UX design', 'Audiovisuel'];
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

  // Va chercher les 3 diapositives réglées dans le back-office (Supabase),
  // et remplace le contenu par défaut si des fichiers ont été ajoutés.
  (async function chargerHeroAccueil() {
    try {
      const res = await fetch(`${SUPABASE_URL_ACCUEIL}/rest/v1/reglages?cle=eq.accueil_hero&select=valeur`, {
        headers: {
          "apikey": SUPABASE_PUBLISHABLE_KEY_ACCUEIL,
          "Authorization": `Bearer ${SUPABASE_PUBLISHABLE_KEY_ACCUEIL}`
        }
      });
      const data = await res.json();
      const reglageSlides = data[0] && data[0].valeur && data[0].valeur.slides;
      if (!reglageSlides) return;

      reglageSlides.forEach((s, idx) => {
        if (!slides[idx]) return;
        if (s.label) labels[idx] = s.label;
        if (idx === 0 && s.label) catLabel.textContent = s.label;
        if (!s.media) return;

        slides[idx].style.backgroundImage = 'none';
        slides[idx].innerHTML = '';
        if (/\.(mp4|mov|webm)$/i.test(s.media)) {
          const video = document.createElement('video');
          video.src = s.media;
          video.autoplay = true; video.muted = true; video.loop = true; video.playsInline = true;
          video.style.cssText = 'width:100%; height:100%; object-fit:cover;';
          slides[idx].appendChild(video);
        } else {
          slides[idx].style.backgroundImage = `url('${s.media}')`;
          slides[idx].style.backgroundSize = 'cover';
          slides[idx].style.backgroundPosition = 'center';
        }
      });
    } catch (e) {
      console.warn("Impossible de charger les diapositives de l'accueil :", e);
    }
  })();

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
// Les projets sont stockés dans Supabase (table "projets").
// ==========================================================
const LABELS_CATEGORIE = {
  graphisme: "Design graphique",
  "ui-ux": "UI/UX design",
  photographie: "Photographie",
  audiovisuel: "Audiovisuel"
};

async function chargerProjetsAccueil() {
  let projets = [];
  try {
    const res = await fetch(`${SUPABASE_URL_ACCUEIL}/rest/v1/projets?select=*&order=ordre.asc`, {
      headers: {
        "apikey": SUPABASE_PUBLISHABLE_KEY_ACCUEIL,
        "Authorization": `Bearer ${SUPABASE_PUBLISHABLE_KEY_ACCUEIL}`
      }
    });
    if (!res.ok) throw new Error('Supabase indisponible');
    projets = await res.json();
  } catch (e) {
    console.error("Impossible de charger les projets sur l'accueil :", e);
    return;
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
