import express from "express";
import { AccessToken } from "livekit-server-sdk";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "Vbizle Token Server Çalışıyor" });
});

app.post("/token", async (req, res) => {
  try {
    const { identity, room } = req.body;

    if (!identity || !room) {
      return res.status(400).json({ error: "identity ve room gerekli" });
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const livekitUrl = process.env.LIVEKIT_URL;

    const at = new AccessToken(apiKey, apiSecret, { identity });
    at.addGrant({
      roomJoin: true,
      room,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true
    });

    const token = await at.toJwt();

    res.json({ token, livekitUrl });
  } catch (err) {
    console.error("Token Hatası:", err);
    res.status(500).json({ error: "TOKEN_OLUSTURMA_HATASI" });
  }
});

export default app;
