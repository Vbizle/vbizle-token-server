import http from "http";
import url from "url";
import { AccessToken } from "livekit-server-sdk";

// ENV
const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;

/* --------------------------------------------------------
   CORS
-------------------------------------------------------- */
function applyCORS(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

/* --------------------------------------------------------
   DEBUG
-------------------------------------------------------- */
function debugOutput(res) {
  applyCORS(res);
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      apiKey: apiKey ? "OK" : "MISSING",
      apiSecret: apiSecret ? "OK" : "MISSING",
    })
  );
}

/* --------------------------------------------------------
   SERVER
-------------------------------------------------------- */
const server = http.createServer(async (req, res) => {
  const q = url.parse(req.url, true);

  // Preflight
  if (req.method === "OPTIONS") {
    applyCORS(res);
    res.writeHead(200);
    return res.end();
  }

  // DEBUG
  if (q.pathname === "/debug") {
    return debugOutput(res);
  }

  // TOKEN
  if (q.pathname === "/token") {
    applyCORS(res);

    const identity = q.query.identity;
    const room = q.query.room;

    if (!identity || !room) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "identity & room required" }));
    }

    try {
      // RESMİ LiveKit token oluşturma
      const at = new AccessToken(apiKey, apiSecret, {
        identity,
        ttl: 60 * 60, // 1 saat
      });

      at.addGrant({
        room,
        roomJoin: true,
        canPublish: true,
        canSubscribe: true,
      });

      const token = await at.toJwt();

      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ token }));

    } catch (e) {
      console.error("Token create error:", e);
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "token_create_failed" }));
    }
  }

  // 404
  applyCORS(res);
  res.writeHead(404);
  res.end("Not Found");
});

/* --------------------------------------------------------
   LISTEN
-------------------------------------------------------- */
server.listen(3000, () => {
  console.log("LiveKit Token Server running on port 3000");
});
