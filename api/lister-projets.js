const { verifierMotDePasse, listerProjets } = require('./_supabase');

module.exports = async (req, res) => {
  const motDePasse = req.method === 'POST' ? (req.body || {}).motDePasse : req.query.motDePasse;
  if (!verifierMotDePasse(motDePasse)) {
    return res.status(401).json({ error: 'Mot de passe incorrect' });
  }
  try {
    const projets = await listerProjets();
    res.status(200).json({ projets });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
