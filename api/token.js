// api/token.js
import { AccessToken } from "livekit-server-sdk";
import http from "http";
import url from "url";

// Ortam değişkenlerini al
const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;
const livekitUrl = process.env.LIVEKIT_URL; // şu an kullanmıyoruz ama dursun

if (!apiKey || !apiSecret) {
  console.error("❌ LIVEKIT_API_KEY veya LIVEKIT_API_SECRET tanımlı değil!");
  process.exit(1);
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);

  // Sadece /token endpoint
  if (parsedUrl.pathname === "/token") {
    const room = parsedUrl.query.room;
    const identity = parsedUrl.query.identity;

    if (!room || !identity) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({ error: "room and identity query param required" })
      );
    }

    try {
      // AccessToken oluştur
      const at = new AccessToken(apiKey, apiSecret, {
        identity, // kullanıcı id
      });

      // Odaya katılma izni ver
      at.addGrant({
        room,
        roomJoin: true,
        canPublish: true,
        canSubscribe: true,
      });

      // JWT token string üret
      const jwt = at.toJwt();

      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ token: jwt }));
    } catch (err) {
      console.error("❌ Token oluştururken hata:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "failed to create token" }));
    }
  }

  // Diğer tüm path'ler 404
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not Found");
});

// Render PORT değişkenini kullanır, yoksa 10000
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log("✅ Token server running on port " + PORT);
});
