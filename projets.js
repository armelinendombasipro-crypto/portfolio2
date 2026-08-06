

// ==========================================================
// CHARGEMENT DYNAMIQUE DES PROJETS
// Chaque projet est un fichier JSON dans content/projets/.
// Sveltia CMS crée/modifie/supprime ces fichiers -> ils apparaissent
// ici automatiquement au chargement de la page, sans toucher au code.
// ==========================================================

// ⚠️ À REMPLIR une fois le dépôt GitHub créé (voir instructions fournies)
const GITHUB_USER = "armelinendombasipro-crypto";
const GITHUB_REPO = "portfolio2";
const PROJETS_PATH = "content/projets";

let dataProjets = {};

async function chargerListeFichiers() {
  // 1. Essaie l'API GitHub (fonctionne pour un dépôt public, liste le dossier
  //    automatiquement -> aucune maintenance manuelle nécessaire).
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${PROJETS_PATH}`);
    if (!res.ok) throw new Error('API GitHub indisponible');
    const liste = await res.json();
    return liste
      .filter(f => f.name.endsWith('.json') && f.name !== 'manifest.json')
      .map(f => f.download_url);
  } catch (e) {
    // 2. Solution de secours : le manifest.json local (utile si l'API GitHub
    //    est hors service, ou en attendant que le dépôt soit configuré).
    console.warn("Chargement via l'API GitHub impossible, utilisation du manifest local.", e);
    const manifest = await fetch(`${PROJETS_PATH}/manifest.json`).then(r => r.json());
    return manifest.map(f => `${PROJETS_PATH}/${f}`);
  }
}

async function chargerProjets() {
  try {
    const urls = await chargerListeFichiers();
    const projets = await Promise.all(urls.map(u => fetch(u).then(r => r.json())));
    projets.forEach(p => { dataProjets[p.slug] = p; });
  } catch (e) {
    console.error("Impossible de charger les projets :", e);
  }
  genererGrille();
  initFiltres();
  initReveal();
  ouvrirDepuisURL();
}

function genererGrille() {
  const grid = document.querySelector('#projects-grid-section .projects-grid');
  if (!grid) return;
  const projetsTries = Object.values(dataProjets).sort((a, b) => (a.ordre || 999) - (b.ordre || 999));
  grid.innerHTML = projetsTries.map(p => {
    const categories = Array.isArray(p.categorie) ? p.categorie.join(' ') : (p.categorie || '');
    return `
    <a href="javascript:void(0)" class="project-card-link" onclick="ouvrirProjet('${p.slug}'); return false;" data-category="${categories}" data-project="${p.slug}">
        <div class="project-tag tag-uni">${p.type || 'UNIVERSITAIRE'}</div>
        <div class="project-box">
          <div class="project-box-img" style="background-image:url('${p.vignette || ''}');"></div>
        </div>
        <div class="project-tag tag-year">${p.annee || ''}</div>
    </a>
  `}).join('');
}

  
  // Construit un accordéon (fermé par défaut) à partir de la description qui contient
  // les balises <b>TITRE</b><br> comme séparateurs de section (Contexte, Réalisations, Bilan...)
  function formatTitreAccordeon(str) {
    const clean = str.trim();
    return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
  }

  function buildAccordeonDescription(html) {
    if (Array.isArray(html)) html = html.join('');
    const parts = html.split(/<b>(.*?)<\/b>\s*<br\s*\/?>/i).filter(p => p !== "");
    if (parts.length < 2) {
      return `<p>${html}</p>`;
    }
    let sections = [];
    for (let i = 0; i < parts.length; i += 2) {
      if (parts[i + 1] !== undefined) {
        let body = parts[i + 1].replace(/^(<br\s*\/?>)+/i, '').replace(/(<br\s*\/?>)+$/i, '');
        sections.push({ titre: formatTitreAccordeon(parts[i]), corps: body });
      }
    }
    return sections.map(s => `
      <div class="detail-acc-item">
        <div class="detail-acc-header" onclick="toggleDetailAccordeon(this)">
          <h3>${s.titre}</h3>
          <span class="detail-acc-icon">+</span>
        </div>
        <div class="detail-acc-body"><p>${s.corps}</p></div>
      </div>
    `).join('');
  }

  function toggleDetailAccordeon(header) {
    header.parentElement.classList.toggle('is-active');
  }

  function estVideo(url) {
    return /\.(mp4|mov|webm|ogg)$/i.test(url.trim());
  }

  // Les images/vidéos ajoutées à la main dans le code sont de simples chaînes ("chemin.jpg"),
  // mais celles ajoutées depuis le back-office Sveltia sont enregistrées comme des objets
  // ({item: "chemin.jpg"}) à cause du champ "field:" utilisé dans admin/config.yml.
  // Cette fonction accepte les deux formats pour ne rien casser.
  function extraireURL(entree) {
    if (typeof entree === 'string') return entree;
    if (entree && typeof entree === 'object') return entree.item || entree.url || entree.image || entree.file || '';
    return '';
  }

  function ouvrirProjet(id) {
      const projet = dataProjets[id];
      if(!projet) return;
  
      // 1. Déclarations
      const titreHeader = document.getElementById('display-title');
      const displayTagType = document.getElementById('display-tag-type');
      const displayTagYear = document.getElementById('display-tag-year');
      const displayDesc = document.getElementById('display-desc');
      const containerImages = document.querySelector('.project-images-col'); // Colonne de gauche
      const content = document.querySelector('.detail-content');
      const galerieDiv = document.getElementById('detail-galerie');
      const voirAussiSection = document.getElementById('voir-aussi-section'); // Nécessaire pour le point 7
      const voirAussiGrid = document.getElementById('voir-aussi-grid');       // Nécessaire pour le point 7
  
      // 2. Reset animation
      if (content) {
          content.style.opacity = "0";
          content.style.transform = "translateY(30px)";
          content.style.transition = "none";
      }
  
       //  bouton projet
   const ancienBouton = document.querySelector('.conteneur-bouton');
   if(ancienBouton) {
       ancienBouton.remove();
   }
  
   // On place le bouton JUSTE APRÈS le paragraphe (et pas dedans !)
   if(projet.urlProjet && displayDesc) {
       displayDesc.insertAdjacentHTML('afterend', `
           <div class="conteneur-bouton">
               <a href="${projet.urlProjet}" target="_blank" class="btn-lien">Voir le projet</a>
           </div>
       `);
   }
  
      // 3. Remplissage Texte
      if(titreHeader) titreHeader.innerText = projet.titre;
      if(displayTagType) displayTagType.innerText = projet.type || "UNIVERSITAIRE";
      if(displayTagYear) displayTagYear.innerText = projet.annee || "2025";
      if(displayDesc) displayDesc.innerHTML = buildAccordeonDescription(projet.description);
  
      // 4. Badges (Compétences & Outils)
      const compDiv = document.getElementById('display-competences');
      if(compDiv) {
          compDiv.innerHTML = "";
          if(projet.competences) {
              projet.competences.forEach(comp => {
                  compDiv.innerHTML += `<span class="badge">${comp}</span>`;
              });
          }
      }
      const outilsDiv = document.getElementById('display-outils');
      if(outilsDiv) {
          outilsDiv.innerHTML = "";
          if(projet.outils) {
              projet.outils.forEach(outil => {
                  outilsDiv.innerHTML += `<span class="badge">${outil}</span>`;
              });
          }
      }
  
      // 5. Remplissage Images + FIGMA (Colonne de gauche)
      if(containerImages) {
          containerImages.innerHTML = ""; // On vide tout
          
          // On ajoute les images d'abord
          if (projet.imagesPrincipales) {
              projet.imagesPrincipales.forEach(entree => {
                  const url = extraireURL(entree);
                  if (!url) return;
                  if (estVideo(url)) {
                      // Création d'un lecteur vidéo
                      const video = document.createElement('video');
                      video.src = url;
                      video.controls = true; // Pour avoir Play/Pause
                      video.muted = true;    // Optionnel : évite que ça hurle au chargement
                      video.style.width = "100%";
                      video.style.marginBottom = "40px"; // Même gap que tes images
                      containerImages.appendChild(video);
                  } else {
                      // Création d'une image classique
                      const img = document.createElement('img');
                      img.src = url;
                      img.style.width = "100%";
                      img.style.marginBottom = "40px";
                      containerImages.appendChild(img);
                  }
              });
          }
  // --- CARROUSEL CHARTE GRAPHIQUE (optionnel) ---
  if (projet.carousselPrefixe && projet.carousselTotalPages > 0) {
    let currentIndex = 0;
    const totalImages = projet.carousselTotalPages;

    const wrapperCarrousel = document.createElement('div');
    wrapperCarrousel.style.cssText = "border: 1.5px solid #4D3053; border-radius: 22px; width: 100%; height: 500px; overflow: hidden; background-color: #fff; display: flex; flex-direction: column; margin-bottom: 40px;";

    const zoneImage = document.createElement('div');
    zoneImage.style.cssText = "flex: 1; display: flex; justify-content: center; align-items: center;";

    for (let i = 1; i <= totalImages; i++) {
        const img = document.createElement('img');
        img.src = `${projet.carousselPrefixe}${i}.jpg`;
        img.style.cssText = "max-height: 100%; max-width: 95%; object-fit: contain; display: block; margin: auto; padding: 20px 0";
        img.style.display = (i === 1) ? "block" : "none";
        img.className = "carousel-page-slide";
        zoneImage.appendChild(img);
    }

    const navCarrousel = document.createElement('div');
    navCarrousel.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 15px 25px; border-top: 1px solid rgba(77, 48, 83, 0.2); background-color: #DBDBDB; flex-shrink: 0;";
    navCarrousel.innerHTML = `
        <button id="prev-btn" style="background:transparent; color:#4D3053; border:1.5px solid #4D3053; border-radius:30px; padding:8px 22px; cursor:pointer; font-size:0.9rem; transition: all 0.2s;">❮ Précédent</button>
        <div style="display: flex; flex-direction: column; align-items: center; gap: 3px;">
            <span style="font-family: 'DM Serif Display', serif; font-size: 1rem; letter-spacing: 1px; text-transform: uppercase; color: #4D3053; font-weight: bold;">Charte Graphique</span>
            <span id="carousel-index" style="font-family: 'DM Serif Display', serif; font-weight: bold; color: #4D3053; font-size: 1.1rem;">1 / ${totalImages}</span>
        </div>
        <button id="next-btn" style="background:transparent; color:#4D3053; border:1.5px solid #4D3053; border-radius:30px; padding:8px 22px; cursor:pointer; font-size:0.9rem; transition: all 0.2s;">Suivant ❯</button>
    `;

    wrapperCarrousel.appendChild(zoneImage);
    wrapperCarrousel.appendChild(navCarrousel);
    containerImages.appendChild(wrapperCarrousel);

    const prevBtn = navCarrousel.querySelector('#prev-btn');
    const nextBtn = navCarrousel.querySelector('#next-btn');
    const indexLabel = navCarrousel.querySelector('#carousel-index');

    // Hover sur les boutons
    [prevBtn, nextBtn].forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.background = '#4D3053';
            btn.style.color = '#fff';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.background = 'transparent';
            btn.style.color = '#4D3053';
        });
    });

    const updateCarousel = () => {
        zoneImage.querySelectorAll('.carousel-page-slide').forEach((slide, idx) => {
            slide.style.display = (idx === currentIndex) ? "block" : "none";
        });
        if (indexLabel) indexLabel.innerText = `${currentIndex + 1} / ${totalImages}`;
    };

    nextBtn.onclick = () => { currentIndex = (currentIndex + 1) % totalImages; updateCarousel(); };
    prevBtn.onclick = () => { currentIndex = (currentIndex - 1 + totalImages) % totalImages; updateCarousel(); };
}


         // --- GALERIE ---
         if (projet.galerie && galerieDiv) {
          galerieDiv.innerHTML = ""; // On vide la galerie aussi
          projet.galerie.forEach(entree => {
              const url = extraireURL(entree);
              if (!url) return;
              if (estVideo(url)) {
                  // Création d'un lecteur vidéo (comme dans la colonne principale)
                  const video = document.createElement('video');
                  video.src = url;
                  video.className = "galerie-img";
                  video.controls = true;
                  video.muted = true;
                  galerieDiv.appendChild(video);
              } else {
                  const img = document.createElement('img');
                  img.src = url;
                  img.className = "galerie-img";

                  // C'est ICI que la magie opère :
                  // On ajoute le clic directement sur l'image quand on la crée.
                  img.onclick = function() {
                      const lightbox = document.getElementById('lightbox');
                      const lightboxImg = document.getElementById('lightbox-img');

                      if(lightbox && lightboxImg) {
                          // On déplace la lightbox directement dans <body>, au cas où un
                          // élément parent l'empêcherait de se positionner par-dessus tout.
                          if (lightbox.parentElement !== document.body) {
                              document.body.appendChild(lightbox);
                          }
                          lightboxImg.src = this.src;

                          // Styles forcés en JS pour garantir le bon rendu (plein écran,
                          // centré, au-dessus de tout) même si le CSS n'est pas à jour.
                          Object.assign(lightbox.style, {
                              display: 'flex',
                              position: 'fixed',
                              top: '0', left: '0',
                              width: '100vw', height: '100vh',
                              alignItems: 'center',
                              justifyContent: 'center',
                              zIndex: '99999'
                          });
                          window.scrollTo({ top: window.scrollY, behavior: 'instant' });
                          requestAnimationFrame(() => lightbox.classList.add('visible'));
                      }
                  };

                  galerieDiv.appendChild(img);
              }
          });
      }
  
          // AJOUT DU FIGMA : On l'ajoute à la suite des images
          if(projet.figmaUrl) {
              const figmaDiv = document.createElement('div');
              figmaDiv.style.marginTop = "20px";
              figmaDiv.style.width = "100%";
              figmaDiv.innerHTML = `
                  <iframe 
                      style="border: 1.5px solid #4D3053; border-radius: 22px; width: 100%; height: 450px;" 
                      src="${projet.figmaUrl}" 
                      allowfullscreen>
                  </iframe>`;
              containerImages.appendChild(figmaDiv);
          }
      }
  
      // 7. GESTION DU "VOIR AUSSI" (Corrigé avec la boucle for)
      if (voirAussiSection && voirAussiGrid) {
          voirAussiGrid.innerHTML = ""; 
          let compteSuggestions = 0;
  
          for (const [key, autreProjet] of Object.entries(dataProjets)) {
              if (autreProjet.categorie === projet.categorie && key !== id) {
                  compteSuggestions++;
                  const thumbUrl = autreProjet.vignette || extraireURL(autreProjet.imagesPrincipales ? autreProjet.imagesPrincipales[0] : '');
                  const typeTexte = autreProjet.type || '';
                  const anneeTexte = autreProjet.annee || '';
                  
                  const cardHTML = `
                      <a href="#" class="project-card-link" onclick="ouvrirProjet('${key}'); return false;">
                          <div class="project-box">
                              <div class="project-box-img" style="background-image:url('${thumbUrl}');"></div>
                              <div class="project-tag tag-uni">${typeTexte}</div>
                              <div class="project-tag tag-year">${anneeTexte}</div>
                          </div>
                      </a>
                  `;
                  voirAussiGrid.innerHTML += cardHTML;
              }
          }
          voirAussiSection.style.display = (compteSuggestions > 0) ? 'block' : 'none';
      }
  
      // 6. Affichage final
      document.getElementById('projects-grid-section').style.display = 'none';
      document.getElementById('project-details').style.display = 'block';
  
      if (content) {
          setTimeout(() => {
              content.style.transition = "all 0.9s cubic-bezier(0.25, 1, 0.5, 1)";
              content.style.opacity = "1";
              content.style.transform = "translateY(0)";
          }, 10);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
  
  }
  
  
  

  /* --- AUTO-OUVERTURE DEPUIS L'ACCUEIL --- */
  function ouvrirDepuisURL() {
      // 1. On récupère les paramètres de l'URL (ex: projets.html?projet=302)
      const params = new URLSearchParams(window.location.search);
      const projetId = params.get('projet');

      // 2. Si un ID est présent dans l'URL...
      if (projetId) {
          // ... on vérifie qu'il existe bien dans tes données
          if (dataProjets[projetId]) {
              // 3. On lance la fonction d'ouverture automatiquement
              ouvrirProjet(projetId);
          }
      }
  }



  /* =========================================
     GESTION DES FILTRES
     ========================================= */
  function initFiltres() {
      const filterButtons = document.querySelectorAll('.filter-btn');
      const projectCards = document.querySelectorAll('.project-card-link');

      filterButtons.forEach(button => {
          button.addEventListener('click', () => {
              // 1. On gère l'apparence du bouton (le violet)
              // On enlève la classe 'active' de l'ancien bouton
              document.querySelector('.filter-btn.active').classList.remove('active');
              // On l'ajoute au bouton cliqué
              button.classList.add('active');

              // 2. On récupère la catégorie demandée
              const filterValue = button.getAttribute('data-filter');

              // 3. On trie les cartes
              projectCards.forEach(card => {
                  // On récupère les catégories de la carte (ex: "ui-ux graphisme")
                  const cardCategory = card.getAttribute('data-category');

                  if (filterValue === 'all' || cardCategory.includes(filterValue)) {
                      // Si c'est "Tout" OU que la catégorie correspond : On affiche
                      card.style.display = 'flex'; 
                      // Petit effet d'apparition fluide (optionnel)
                      card.style.opacity = '1';
                      card.style.transform = 'scale(1)';
                  } else {
                      // Sinon : On cache
                      card.style.display = 'none';
                      card.style.opacity = '0';
                      card.style.transform = 'scale(0.9)';
                  }
              });
          });
      });
  }

  /* =========================================
     EFFET RIDEAU (chaque carte se révèle de gauche à droite au scroll)
     ========================================= */
  function initReveal() {
      const projectCards = document.querySelectorAll('.project-card-link');
      const projectRevealObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
              if (entry.isIntersecting) {
                  const delay = Array.from(projectCards).indexOf(entry.target) % 3 * 120;
                  setTimeout(() => entry.target.classList.add('reveal-in'), delay);
                  projectRevealObserver.unobserve(entry.target);
              }
          });
      }, { threshold: 0.2 });
      projectCards.forEach(card => projectRevealObserver.observe(card));
  }

  document.addEventListener('DOMContentLoaded', chargerProjets);
