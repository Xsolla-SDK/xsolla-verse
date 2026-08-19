const hubStore = require('../services/hubStore');

function parseGames(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return String(value)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function queryFromReq(req) {
  return {
    studio: req.query.studio || '',
    buyer: req.query.buyer || req.query.tester || '',
    games: parseGames(req.query.games),
  };
}

function sendError(res, err) {
  const status = err.status || 500;
  return res.status(status).json({ ok: false, error: err.message || 'Hub error' });
}

const postPlaytest = (req, res) => {
  try {
    const row = hubStore.addPlaytest(req.body || {});
    return res.status(201).json({ ok: true, playtest: row });
  } catch (err) {
    return sendError(res, err);
  }
};

const getPlaytests = (req, res) => {
  try {
    return res.json({ ok: true, playtests: hubStore.listPlaytests(queryFromReq(req)) });
  } catch (err) {
    return sendError(res, err);
  }
};

const postGrant = (req, res) => {
  try {
    const row = hubStore.addGrant(req.body || {});
    return res.status(201).json({ ok: true, grant: row });
  } catch (err) {
    return sendError(res, err);
  }
};

const getGrants = (req, res) => {
  try {
    return res.json({ ok: true, grants: hubStore.listGrants(queryFromReq(req)) });
  } catch (err) {
    return sendError(res, err);
  }
};

module.exports = {
  postPlaytest,
  getPlaytests,
  postGrant,
  getGrants,
};
