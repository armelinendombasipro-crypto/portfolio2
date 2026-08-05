const buttons = document.querySelectorAll('.filter-btn');

buttons.forEach(button => {
    button.addEventListener('click', () => {
// 1. CACHE les détails du projet (au cas où un projet est ouvert)
const zoneDetails = document.getElementById('project-details');
if (zoneDetails) zoneDetails.style.display = 'none';

// 2. AFFICHE la grille des projets
const zoneGrille = document.getElementById('projects-grid-section');
if (zoneGrille) zoneGrille.style.display = 'block';


        // Enlève la classe active de tous les boutons
        buttons.forEach(btn => btn.classList.remove('active'));
        // Ajoute la classe active au bouton cliqué
        button.classList.add('active');
    });
});