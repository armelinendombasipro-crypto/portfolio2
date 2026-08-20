const { verifierMotDePasse, lireReglage, ecrireReglage } = require('./_supabase');

module.exports = async (req, res) => {
  const motDePasse = (req.body || {}).motDePasse || req.query.motDePasse;
  if (!verifierMotDePasse(motDePasse)) {
    return res.status(401).json({ error: 'Mot de passe incorrect' });
  }

  try {
    if (req.method === 'GET') {
      const cle = req.query.cle;
      if (!cle) return res.status(400).json({ error: 'Clé manquante.' });
      const reglage = await lireReglage(cle);
      return res.status(200).json({ reglage });
    }

    if (req.method === 'POST') {
      const { cle, valeur } = req.body || {};
      if (!cle) return res.status(400).json({ error: 'Clé manquante.' });
      await ecrireReglage(cle, valeur);
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Méthode non autorisée' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
