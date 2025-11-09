const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
const levelName = process.env.LOG_LEVEL || 'info';
const minLevel = LEVELS[levelName] ?? LEVELS.info;

function safeMeta(meta) {
  try {
    return JSON.parse(JSON.stringify(meta || {}));
  } catch (_) {
    return { note: 'meta_not_serializable' };
  }
}

function log(level, message, meta) {
  const lvl = LEVELS[level] ?? LEVELS.info;
  if (lvl < minLevel) return;
  const entry = {
    ts: new Date().toISOString(),
    level,
    message,
    ...safeMeta(meta),
  };
  if (lvl >= LEVELS.error) {
    // eslint-disable-next-line no-console
    console.error(JSON.stringify(entry));
  } else {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(entry));
  }
}

module.exports = {
  log,
  info: (msg, meta) => log('info', msg, meta),
  warn: (msg, meta) => log('warn', msg, meta),
  error: (msg, meta) => log('error', msg, meta),
  debug: (msg, meta) => log('debug', msg, meta),
};
