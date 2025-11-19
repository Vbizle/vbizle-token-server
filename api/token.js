import { AccessToken } from "livekit-server-sdk";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Sadece POST destekleniyor" });
  }

  try {
    const { identity, room } = req.body;

    if (!identity || !room) {
      return res.status(400).json({ error: "identity ve room gerekli" });
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const livekitUrl = process.env.LIVEKIT_URL;

    // **name eklendi (zorunlu)**
    const at = new AccessToken(apiKey, apiSecret, {
      identity,
      name: identity,
    });

    at.addGrant({
      roomJoin: true,
      room,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      canPublishSources: true,
    });

    const token = await at.toJwt();

    return res.json({ token, url: livekitUrl });
  } catch (err) {
    console.error("Token Hatası:", err);
    res.status(500).json({ error: "TOKEN_OLUSTURMA_HATASI" });
  }
}
