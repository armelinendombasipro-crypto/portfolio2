// Cette fonction ne fait qu'une chose : dire "bonjour" à Supabase pour compter
// comme de l'activité et l'empêcher de se mettre en pause après 7 jours d'inactivité.
// Elle est déclenchée automatiquement une fois par jour (voir vercel.json).

module.exports = async (req, res) => {
  try {
    const SUPABASE_URL = "https://lcizfpythfvoqpwvgudd.supabase.co";
    await fetch(`${SUPABASE_URL}/rest/v1/reglages?select=cle&limit=1`, {
      headers: {
        "apikey": process.env.SUPABASE_SECRET_KEY,
        "Authorization": `Bearer ${process.env.SUPABASE_SECRET_KEY}`
      }
    });
    res.status(200).json({ ok: true, date: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
