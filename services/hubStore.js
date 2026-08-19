const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const HUB_DIR = path.join(__dirname, '..', 'uploads', 'hub');
const PLAYTESTS_FILE = path.join(HUB_DIR, 'playtests.json');
const GRANTS_FILE = path.join(HUB_DIR, 'grants.json');
const MAX_ROWS = 200;

function ensureDir() {
  fs.mkdirSync(HUB_DIR, { recursive: true });
}

function readList(file) {
  ensureDir();
  if (!fs.existsSync(file)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

function writeList(file, rows) {
  ensureDir();
  fs.writeFileSync(file, JSON.stringify(rows.slice(0, MAX_ROWS), null, 2));
}

function normAddr(value) {
  return String(value || '').trim().toLowerCase();
}

function id(prefix) {
  return `${prefix}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
}

function gameKey(row) {
  return String((row && row.game) || '').trim().toLowerCase();
}

function matchesQuery(row, { studio, games, buyer }) {
  if (buyer) {
    if (normAddr(row.buyer) !== normAddr(buyer) && normAddr(row.tester) !== normAddr(buyer)) {
      return false;
    }
  }
  const studioMatch = studio && normAddr(row.studio) === normAddr(studio);
  const gameList = (games || [])
    .map((g) => String(g || '').trim().toLowerCase())
    .filter(Boolean);
  const gameMatch = gameList.length > 0 && gameList.includes(gameKey(row));
  if (studio || gameList.length) {
    return Boolean(studioMatch || gameMatch);
  }
  return true;
}

function addPlaytest(entry) {
  const row = {
    id: id('pt'),
    at: new Date().toISOString(),
    game: String(entry.game || '').trim(),
    gameId: entry.gameId || null,
    studio: entry.studio || '',
    tester: entry.tester || '',
    category: String(entry.category || 'gameplay').trim(),
    rating: Math.max(1, Math.min(5, Number(entry.rating) || 3)),
    details: String(entry.details || '').trim().slice(0, 600),
    suggestion: String(entry.suggestion || '').trim().slice(0, 400),
    // Retained so existing demo data remains readable.
    fun: entry.fun || '',
    price: entry.price || '',
    buy: entry.buy || '',
    certified: !!entry.certified,
  };
  if (!row.game) {
    const err = new Error('Game required');
    err.status = 400;
    throw err;
  }
  if (!row.details) {
    const err = new Error('Feedback details required');
    err.status = 400;
    throw err;
  }
  const list = [row, ...readList(PLAYTESTS_FILE)];
  writeList(PLAYTESTS_FILE, list);
  return row;
}

function listPlaytests(query) {
  return readList(PLAYTESTS_FILE).filter((row) => matchesQuery(row, query));
}

function addGrant(entry) {
  const row = {
    id: id('gr'),
    at: new Date().toISOString(),
    itemId: entry.itemId != null ? String(entry.itemId) : '',
    itemName: String(entry.itemName || '').trim(),
    game: String(entry.game || '').trim(),
    gameId: entry.gameId || null,
    buyer: entry.buyer || '',
    studio: entry.studio || '',
    kind: entry.kind || 'pack',
    status: 'granted',
    note: entry.note || `Granted in ${entry.game || 'title'} (stub webhook)`,
  };
  if (!row.itemName && !row.itemId) {
    const err = new Error('Item required');
    err.status = 400;
    throw err;
  }
  const list = [row, ...readList(GRANTS_FILE)];
  writeList(GRANTS_FILE, list);
  return row;
}

function listGrants(query) {
  return readList(GRANTS_FILE).filter((row) => matchesQuery(row, query));
}

module.exports = {
  addPlaytest,
  listPlaytests,
  addGrant,
  listGrants,
};
