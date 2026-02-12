const express = require("express");
const pool = require("./db");
const sseManager = require("./sseManager");

const router = express.Router();

/* HEALTH */
router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/* SUBSCRIBE */
router.post("/api/events/channels/subscribe", async (req, res) => {
  const { userId, channel } = req.body;

  await pool.query(
    "INSERT INTO user_subscriptions (user_id, channel) VALUES ($1,$2) ON CONFLICT DO NOTHING",
    [userId, channel]
  );

  res.status(201).json({ status: "subscribed", userId, channel });
});

/* UNSUBSCRIBE */
router.post("/api/events/channels/unsubscribe", async (req, res) => {
  const { userId, channel } = req.body;

  await pool.query(
    "DELETE FROM user_subscriptions WHERE user_id=$1 AND channel=$2",
    [userId, channel]
  );

  res.json({ status: "unsubscribed", userId, channel });
});

/* PUBLISH */
router.post('/api/events/publish', async (req, res) => {
    try {
      const { channel, event_type, message } = req.body;
  
      if (!channel || !event_type || !message) {
        return res.status(400).json({ error: "Missing required fields" });
      }
  
      await pool.query(
        `INSERT INTO events (channel, event_type, payload)
         VALUES ($1, $2, $3)`,
        [channel, event_type, JSON.stringify({ message })]
      );
  
      res.json({ success: true });
  
    } catch (err) {
      console.error(err);
      res.status(500).send(err.message);
    }
  });
  
/* SSE STREAM */
router.get("/api/events/stream", async (req, res) => {
  const userId = parseInt(req.query.userId);
  const channels = req.query.channels.split(",");

  const subCheck = await pool.query(
    "SELECT channel FROM user_subscriptions WHERE user_id=$1",
    [userId]
  );

  const subscribedChannels = subCheck.rows.map(r => r.channel);

  const allowedChannels = channels.filter(c =>
    subscribedChannels.includes(c)
  );

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.flushHeaders();

  const lastEventId = req.header("Last-Event-ID");

  if (lastEventId) {
    const replay = await pool.query(
      `SELECT * FROM events 
       WHERE channel = ANY($1) AND id > $2 
       ORDER BY id ASC`,
      [allowedChannels, lastEventId]
    );

    replay.rows.forEach(event => {
      res.write(`id: ${event.id}\n`);
      res.write(`event: ${event.event_type}\n`);
      res.write(`data: ${JSON.stringify(event.payload)}\n\n`);
    });
  }

  sseManager.addConnection(userId, res, allowedChannels);
});

/* HISTORY */
router.get("/api/events/history", async (req, res) => {
  const { channel, afterId = 0, limit = 50 } = req.query;

  const result = await pool.query(
    `SELECT * FROM events
     WHERE channel=$1 AND id>$2
     ORDER BY id ASC
     LIMIT $3`,
    [channel, afterId, limit]
  );

  res.json({ events: result.rows });
});

module.exports = router;
