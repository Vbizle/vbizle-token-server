import { AccessToken } from "livekit-server-sdk";
import http from "http";
import url from "url";

const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;
const livekitHost = process.env.LIVEKIT_HOST;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);

  if (parsedUrl.pathname === "/token") {
    const room = parsedUrl.query.room;
    const identity = parsedUrl.query.identity;

    if (!room || !identity) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "room and identity required" }));
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity,
    });
    at.addGrant({ room });

    const token = at.toJwt();

    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ token }));
  }

  res.writeHead(404);
  res.end("Not Found");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Token server running on port " + PORT);
});
