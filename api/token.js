import express from "express";
import { AccessToken } from "livekit-server-sdk";

const app = express();
app.use(express.json());

// Test için root endpoint
app.get("/", (req, res) => {
  res.json({ status: "Vbizle Token Server Çalışıyor" });
});

app.post("/token", async (req, res) => {
  try {
    const { identity, room } = req.body;

    if (!identity || !room) {
      return res.status(400).json({ error: "identity ve room gerekli" });
    }

    // ENV değişkenleri Vercel'den çekiliyor
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const livekitUrl = process.env.LIVEKIT_URL;

    console.log("ENV KONTROL:", { apiKey, apiSecret, livekitUrl });

    if (!apiKey || !apiSecret || !livekitUrl) {
      return res.status(500).json({ error: "ENV eksik!" });
    }

    const at = new AccessToken(apiKey, apiSecret, { identity });

    at.addGrant({
      roomJoin: true,
      room,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();

    return res.json({ token, url: livekitUrl });
  } catch (err) {
    console.error("Token Hatası:", err);
    res.status(500).json({ error: "TOKEN_OLUSTURMA_HATASI" });
  }
});

export default app;
