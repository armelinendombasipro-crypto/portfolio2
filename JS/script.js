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