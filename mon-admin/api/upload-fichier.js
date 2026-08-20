const { verifierMotDePasse, uploaderFichier } = require('./_supabase');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const { motDePasse, nomFichier, contenuBase64, typeContenu } = req.body || {};
  if (!verifierMotDePasse(motDePasse)) {
    return res.status(401).json({ error: 'Mot de passe incorrect' });
  }
  if (!nomFichier || !contenuBase64) {
    return res.status(400).json({ error: 'Fichier manquant.' });
  }

  const nomPropre = nomFichier
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '-');

  const chemin = `${Date.now()}-${nomPropre}`;
  const buffer = Buffer.from(contenuBase64, 'base64');

  try {
    const url = await uploaderFichier(chemin, buffer, typeContenu);
    res.status(200).json({ ok: true, url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports.config = {
  api: {
    bodyParser: {
      sizeLimit: '25mb'
    }
  }
};
