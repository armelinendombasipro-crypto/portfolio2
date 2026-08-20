const { verifierMotDePasse, enregistrerProjet } = require('./_supabase');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const { motDePasse, projet } = req.body || {};
  if (!verifierMotDePasse(motDePasse)) {
    return res.status(401).json({ error: 'Mot de passe incorrect' });
  }
  if (!projet || !projet.slug) {
    return res.status(400).json({ error: "Le projet doit avoir un identifiant (slug)." });
  }

  try {
    await enregistrerProjet(projet);
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
