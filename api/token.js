import { AccessToken } from "livekit-server-sdk";

export default async function handler(req, res) {
  try {
    const { roomName, participantName } = req.query;

    if (!roomName || !participantName) {
      return res.status(400).json({ error: "roomName and participantName required" });
    }

    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      { identity: participantName }
    );

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = at.toJwt();
    return res.status(200).json({ token });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
