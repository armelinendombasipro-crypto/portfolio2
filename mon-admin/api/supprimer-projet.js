const { verifierMotDePasse, supprimerProjet } = require('./_supabase');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const { motDePasse, slug } = req.body || {};
  if (!verifierMotDePasse(motDePasse)) {
    return res.status(401).json({ error: 'Mot de passe incorrect' });
  }
  if (!slug) return res.status(400).json({ error: 'Identifiant manquant.' });

  try {
    await supprimerProjet(slug);
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
