// Va chercher la photo réglée dans le back-office (table "reglages" de Supabase)
// et remplace le fond violet par la vraie image.
const SUPABASE_URL_APROPOS = "https://lcizfpythfvoqpwvgudd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY_APROPOS = "sb_publishable_drHbLNFAe1CGItoded5GZA_s39AGJc0";

async function chargerPhotoApropos() {
  try {
    const res = await fetch(`${SUPABASE_URL_APROPOS}/rest/v1/reglages?cle=eq.apropos&select=valeur`, {
      headers: {
        "apikey": SUPABASE_PUBLISHABLE_KEY_APROPOS,
        "Authorization": `Bearer ${SUPABASE_PUBLISHABLE_KEY_APROPOS}`
      }
    });
    const data = await res.json();
    const photo = data[0] && data[0].valeur && data[0].valeur.photo;
    if (photo) {
      const photoSide = document.querySelector('.about-photo-side');
      const img = photoSide ? photoSide.querySelector('img') : null;
      if (img) {
        img.src = photo;
        photoSide.style.background = 'none'; // on retire le placeholder violet
      }
    }
  } catch (e) {
    console.warn("Impossible de charger la photo de la page à propos :", e);
  }
}
document.addEventListener('DOMContentLoaded', chargerPhotoApropos);

const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.2 });
    document.querySelectorAll('.reveal, .reveal-center').forEach(el => revealObserver.observe(el));

    // Paragraphes "à propos" : sur ordinateur, un seul visible à la fois au même endroit
    // (fondu enchaîné selon l'avancement du scroll). Sur mobile, ils apparaissent l'un
    // après l'autre normalement, avec un petit délai de 2s avant chaque apparition.
    // La taille d'écran est revérifiée à chaque déclenchement (pas juste au chargement),
    // pour rester fiable même si la fenêtre est redimensionnée après coup.
    const aboutTrack = document.getElementById('about-text-track');
    const aboutBlocks = document.querySelectorAll('.about-block');
    function estMobileAbout(){
      return window.matchMedia('(max-width: 760px)').matches;
    }

    const mobileAboutObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!estMobileAbout()) return;
        if (entry.isIntersecting && !entry.target.dataset.shown) {
          entry.target.dataset.shown = "1";
          setTimeout(() => {
            if (estMobileAbout()) entry.target.classList.add('visible');
          }, 2000);
        }
      });
    }, { threshold: 0.3 });
    aboutBlocks.forEach(block => mobileAboutObserver.observe(block));

    function updateAboutBlocks(){
      if (estMobileAbout() || !aboutTrack) return;
      const rect = aboutTrack.getBoundingClientRect();
      const total = aboutBlocks.length;
      const progress = Math.min(0.999, Math.max(0, -rect.top / (rect.height - window.innerHeight)));
      const activeIndex = Math.floor(progress * total);
      aboutBlocks.forEach((block, i) => {
        block.classList.toggle('visible', i === activeIndex);
      });
    }
    window.addEventListener('scroll', updateAboutBlocks);
    window.addEventListener('resize', updateAboutBlocks);
    updateAboutBlocks();

    const navbar = document.querySelector('.navbar');
    const statusTop = document.getElementById('status-top');
    function onScrollNav(){
      const scrolled = window.scrollY > 40;
      navbar.classList.toggle('scrolled', scrolled);
      statusTop.classList.toggle('scrolled', scrolled);
    }
    window.addEventListener('scroll', onScrollNav);
    onScrollNav();

    const backToTop = document.getElementById('back-to-top');
    function onScrollBackToTop(){
      const nearBottom = (window.innerHeight + window.scrollY) >= (document.body.scrollHeight - 40);
      backToTop.classList.toggle('visible', nearBottom);
    }
    window.addEventListener('scroll', onScrollBackToTop);
    onScrollBackToTop();

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