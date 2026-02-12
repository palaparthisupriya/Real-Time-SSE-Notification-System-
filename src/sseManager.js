const activeConnections = new Map();

function addConnection(userId, res, channels) {
  activeConnections.set(userId, { res, channels });

  reqCleanup(res, userId);

  startHeartbeat(res);
}

function removeConnection(userId) {
  activeConnections.delete(userId);
}

function sendEvent(userId, event) {
  const connection = activeConnections.get(userId);
  if (!connection) return;

  const { res } = connection;

  res.write(`id: ${event.id}\n`);
  res.write(`event: ${event.event_type}\n`);
  res.write(`data: ${JSON.stringify(event.payload)}\n\n`);
}

function broadcast(channel, event) {
  for (const [userId, connection] of activeConnections.entries()) {
    if (connection.channels.includes(channel)) {
      sendEvent(userId, event);
    }
  }
}

function startHeartbeat(res) {
  const interval = setInterval(() => {
    res.write(`: heartbeat\n\n`);
  }, 30000);

  res.on("close", () => clearInterval(interval));
}

function reqCleanup(res, userId) {
  res.on("close", () => {
    removeConnection(userId);
  });
}

module.exports = {
  addConnection,
  removeConnection,
  broadcast,
};
