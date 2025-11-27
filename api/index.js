import http from "http";
import url from "url";
import jwt from "jsonwebtoken";

const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;
const livekitUrl = process.env.LIVEKIT_URL;

// DEBUG endpoint
function debugOutput(res) {
  res.writeHead(200, { "Content-Type": "application/json" });
  return res.end(
    JSON.stringify({
      key: apiKey ? "OK" : "MISSING",
      secret: apiSecret ? "OK" : "MISSING",
      url: livekitUrl || null,
    })
  );
}

const server = http.createServer((req, res) => {
  const q = url.parse(req.url, true);

  // Debug test
  if (q.pathname === "/debug") {
    return debugOutput(res);
  }

  // Token üret
  if (q.pathname === "/token") {
    const identity = q.query.identity;
    const room = q.query.room;

    if (!identity || !room) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({ error: "identity & room required" })
      );
    }

    // JWT payload
    const payload = {
      iss: apiKey,
      sub: identity,
      video: {
        room: room,
        roomJoin: true
      }
    };

    // JWT oluştur (HS256)
    const token = jwt.sign(payload, apiSecret, {
      algorithm: "HS256",
      expiresIn: "1h"
    });

    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ token }));
  }

  res.writeHead(404);
  res.end("Not Found");
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log("Token server running on port " + PORT);
});
