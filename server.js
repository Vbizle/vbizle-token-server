import cors from "cors";
import express from "express";
import { AccessToken } from "livekit-server-sdk";

const app = express();
app.use(cors());
app.use(express.json());

// LIVEKIT PROD BİLGİLERİN (BUNLARI AZ SONRA DOLDURACAĞIZ)
const LIVEKIT_URL = "wss://vbizle-prod-r93ayg9w.livekit.cloud";
const LIVEKIT_API_KEY = "APIQHTG3MP3gvHF";
const LIVEKIT_API_SECRET = "GMQ2f7aNOfkvsyKMedFv0PIOfzQkauWnzKpo3IHYldjD";

app.get("/token", async (req, res) => {
  try {
    const roomName = "vbizle-room";
    const participantName = "user-" + Math.floor(Math.random() * 999999);

    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: participantName,
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();
    res.json({ token, url: LIVEKIT_URL });
  } catch (error) {
    console.error("TOKEN OLUŞTURMA HATASI:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log("ONLINE TOKEN SERVER ÇALIŞIYOR");
});
