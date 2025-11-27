import { AccessToken } from "livekit-server-sdk";
import http from "http";
import url from "url";

const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;
const livekitUrl = process.env.LIVEKIT_URL;

// DEBUG ENDPOINT
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

  // 👇 DEBUG TEST
  if (parsedUrl.pathname === "/debug") {
    return debugOutput(res);
  }

  if (parsedUrl.pathname === "/token") {
    const room = parsedUrl.query.room;
    const identity = parsedUrl.query.identity;

    if (!room || !identity) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "room and identity required" }));
    }

    const at = new AccessToken(apiKey, apiSecret, { identity });
    at.addGrant({ room, roomJoin: true });

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
