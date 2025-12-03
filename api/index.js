import http from "http";
import url from "url";
import jwt from "jsonwebtoken";

// ENV
const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;
const livekitUrl = process.env.LIVEKIT_URL;

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
      livekitUrl: livekitUrl || null,
    })
  );
}

/* --------------------------------------------------------
   SERVER
-------------------------------------------------------- */
const server = http.createServer((req, res) => {
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

  // TOKEN ENDPOINT
  if (q.pathname === "/token") {
    applyCORS(res);

    const identity = q.query.identity;
    const room = q.query.room;

    if (!identity || !room) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "identity & room required" }));
    }

    // 🔥 LIVEKIT 2024 UYUMLU PAYLOAD
    const payload = {
      iss: apiKey,
      sub: identity,
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 saat
      nbf: Math.floor(Date.now() / 1000) - 10,
      grants: {
        video: {
          room,
          roomJoin: true,
          canPublish: true,
          canSubscribe: true,
        },
      },
    };

    const token = jwt.sign(payload, apiSecret, {
      algorithm: "HS256",
    });

    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ token }));
  }

  // NOT FOUND
  applyCORS(res);
  res.writeHead(404);
  res.end("Not Found");
});

/* --------------------------------------------------------
   LISTEN
-------------------------------------------------------- */
server.listen(3000, () => {
  console.log("LiveKit Token Server running on port 3000");
});  bu şuan mevcutta olan bunu gerekli şekilde düzenle tam kod ver çalışsın artık
