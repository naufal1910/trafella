const Redis = require('ioredis');

let client;
function getClient() {
  if (!client) {
    const url = process.env.REDIS_URL;
    client = url ? new Redis(url) : new Redis();
  }
  return client;
}

async function get(key) {
  const c = getClient();
  const val = await c.get(key);
  return val ? JSON.parse(val) : null;
}

async function set(key, value, ttlSeconds) {
  const c = getClient();
  const str = JSON.stringify(value);
  if (ttlSeconds && ttlSeconds > 0) {
    await c.set(key, str, 'EX', ttlSeconds);
  } else {
    await c.set(key, str);
  }
}

module.exports = { get, set, getClient };
