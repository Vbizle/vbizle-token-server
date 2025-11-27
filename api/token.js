import { AccessToken } from "livekit-server-sdk";
import http from "http";
import url from "url";

const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;
const livekitUrl = process.env.LIVEKIT_URL; // 🔥 DÜZELTİLDİ

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);

  if (parsedUrl.pathname === "/token") {
    const room = parsedUrl.query.room;
    const identity = parsedUrl.query.identity;

    if (!room || !identity) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "room and identity required" }));
    }

    // ✔ Token oluştur
    const at = new AccessToken(apiKey, apiSecret, {
      identity,
    });

    // ✔ Room grant ekle
    at.addGrant({
      room,
      roomJoin: true,
    });

    // ✔ Token üret
    const token = at.toJwt();

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
