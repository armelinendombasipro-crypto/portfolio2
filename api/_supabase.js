// Fonctions partagées pour communiquer avec Supabase depuis nos fonctions serveur.
// La clé secrète (SUPABASE_SECRET_KEY) est lue depuis les variables d'environnement
// Vercel, elle n'est JAMAIS envoyée au navigateur.

const SUPABASE_URL = "https://lcizfpythfvoqpwvgudd.supabase.co";

function headers() {
  return {
    "apikey": process.env.SUPABASE_SECRET_KEY,
    "Authorization": `Bearer ${process.env.SUPABASE_SECRET_KEY}`,
    "Content-Type": "application/json"
  };
}

function verifierMotDePasse(motDePasseEnvoye) {
  return motDePasseEnvoye && motDePasseEnvoye === process.env.ADMIN_PASSWORD;
}

// ----- Table "projets" -----

async function listerProjets() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/projets?select=*&order=ordre.asc`, {
    headers: headers()
  });
  if (!res.ok) throw new Error(`Erreur lecture projets: ${res.status} ${await res.text()}`);
  return res.json();
}

async function enregistrerProjet(projet) {
  // On tente d'abord une mise à jour ; si aucune ligne n'existe avec ce slug,
  // Supabase "upsert" (on_conflict) crée la ligne à la place.
  const res = await fetch(`${SUPABASE_URL}/rest/v1/projets`, {
    method: "POST",
    headers: { ...headers(), "Prefer": "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(projet)
  });
  if (!res.ok) throw new Error(`Erreur enregistrement: ${res.status} ${await res.text()}`);
  return res.json();
}

async function supprimerProjet(slug) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/projets?slug=eq.${encodeURIComponent(slug)}`, {
    method: "DELETE",
    headers: headers()
  });
  if (!res.ok) throw new Error(`Erreur suppression: ${res.status} ${await res.text()}`);
  return true;
}

// ----- Table "reglages" (photo à propos, diapositives accueil) -----

async function lireReglage(cle) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/reglages?cle=eq.${encodeURIComponent(cle)}&select=*`, {
    headers: headers()
  });
  if (!res.ok) throw new Error(`Erreur lecture réglage: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data[0] || null;
}

async function ecrireReglage(cle, valeur) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/reglages`, {
    method: "POST",
    headers: { ...headers(), "Prefer": "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify({ cle, valeur })
  });
  if (!res.ok) throw new Error(`Erreur écriture réglage: ${res.status} ${await res.text()}`);
  return res.json();
}

// ----- Stockage (upload d'images/vidéos) -----

async function uploaderFichier(cheminDansLeBucket, buffer, typeContenu) {
  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/images/${cheminDansLeBucket}`,
    {
      method: "POST",
      headers: {
        "apikey": process.env.SUPABASE_SECRET_KEY,
        "Authorization": `Bearer ${process.env.SUPABASE_SECRET_KEY}`,
        "Content-Type": typeContenu || "application/octet-stream"
      },
      body: buffer
    }
  );
  if (!res.ok) throw new Error(`Erreur upload: ${res.status} ${await res.text()}`);
  return `${SUPABASE_URL}/storage/v1/object/public/images/${cheminDansLeBucket}`;
}

module.exports = {
  verifierMotDePasse,
  listerProjets,
  enregistrerProjet,
  supprimerProjet,
  lireReglage,
  ecrireReglage,
  uploaderFichier
};
