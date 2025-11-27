import { AccessToken } from "livekit-server-sdk";
import http from "http";
import url from "url";

const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;
const livekitUrl = process.env.LIVEKIT_URL;

// 🔍 DEBUG ENDPOINT
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
  const parsedUrl = url.parse(req.url, true);

  // /debug → env test
  if (parsedUrl.pathname === "/debug") {
    return debugOutput(res);
  }

  // /token → asıl iş
  if (parsedUrl.pathname === "/token") {
    const room = parsedUrl.query.room;
    const identity = parsedUrl.query.identity;

    if (!room || !identity) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({ error: "room and identity required" })
      );
    }

    try {
      // 🔥 AccessToken oluştur
      const at = new AccessToken(apiKey, apiSecret, {
        identity,
        ttl: 60 * 60, // 1 saat
      });

      // 🔥 Odaya katılma izni ver
      at.addGrant({
        room,
        roomJoin: true,
      });

      // 🔥 JWT string üret
      const jwt = at.toJwt();

      res.writeHead(200, { "Content-Type": "application/json" });
      // 🔥 Burada artık string dönüyoruz, nesne değil
      return res.end(JSON.stringify({ token: jwt }));
    } catch (err) {
      console.error("token error:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: err.message }));
    }
  }

  // Diğer tüm URL’ler
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not Found");
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log("Token server running on port " + PORT);
});
