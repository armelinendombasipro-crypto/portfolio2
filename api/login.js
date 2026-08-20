const { verifierMotDePasse } = require('./_supabase');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const { motDePasse } = req.body || {};
  if (verifierMotDePasse(motDePasse)) {
    return res.status(200).json({ ok: true });
  }
  return res.status(401).json({ ok: false, error: 'Mot de passe incorrect' });
};
