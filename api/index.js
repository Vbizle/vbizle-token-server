import http from "http";
import url from "url";
import jwt from "jsonwebtoken";

const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;
const livekitUrl = process.env.LIVEKIT_URL;

// CORS headers
function applyCORS(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

const server = http.createServer((req, res) => {
  const q = url.parse(req.url, true);

  // Preflight
  if (req.method === "OPTIONS") {
    applyCORS(res);
    res.writeHead(200);
    return res.end();
  }

  // Debug
  if (q.pathname === "/debug") {
    applyCORS(res);
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({
        key: apiKey ? "OK" : "MISSING",
        secret: apiSecret ? "OK" : "MISSING",
        url: livekitUrl || null,
      })
    );
  }

  // TOKEN
  if (q.pathname === "/token") {
    applyCORS(res);

    const identity = q.query.identity;
    const room = q.query.room;

    if (!identity || !room) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({ error: "identity & room required" })
      );
    }

    const payload = {
      iss: apiKey,
      sub: identity,
      video: {
        room: room,
        roomJoin: true,
        roomList: true,
        canPublish: true,
        canSubscribe: true
      }
    };

    const token = jwt.sign(payload, apiSecret, {
      algorithm: "HS256",
      expiresIn: "1h",
    });

    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ token }));
  }

  applyCORS(res);
  res.writeHead(404);
  res.end("Not Found");
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log("Token server running on port " + PORT);
});
