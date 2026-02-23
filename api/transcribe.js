export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: "OpenAI API key not configured. Add OPENAI_API_KEY to environment variables." });
  }

  try {
    const { audio, offset = 0 } = req.body;
    if (!audio) return res.status(400).json({ error: "No audio data provided" });

    // Decode base64 audio
    const audioBuffer = Buffer.from(audio, "base64");

    // Build multipart form data manually
    const boundary = "----FormBoundary" + Math.random().toString(36).substr(2);

    const formParts = [];

    // File part
    formParts.push(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="audio.mp3"\r\n` +
      `Content-Type: audio/mpeg\r\n\r\n`
    );

    // Model part
    const modelPart =
      `\r\n--${boundary}\r\n` +
      `Content-Disposition: form-data; name="model"\r\n\r\n` +
      `whisper-1`;

    // Response format part
    const formatPart =
      `\r\n--${boundary}\r\n` +
      `Content-Disposition: form-data; name="response_format"\r\n\r\n` +
      `verbose_json`;

    // Timestamp granularities part
    const granPart =
      `\r\n--${boundary}\r\n` +
      `Content-Disposition: form-data; name="timestamp_granularities[]"\r\n\r\n` +
      `segment`;

    const ending = `\r\n--${boundary}--\r\n`;

    // Combine into single buffer
    const beforeFile = Buffer.from(formParts[0], "utf-8");
    const afterFile = Buffer.from(modelPart + formatPart + granPart + ending, "utf-8");
    const body = Buffer.concat([beforeFile, audioBuffer, afterFile]);

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
        "Content-Length": body.length.toString(),
      },
      body: body,
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Whisper API error:", response.status, errText);
      return res.status(response.status).json({
        error: `Whisper API error: ${response.status} - ${errText.substring(0, 200)}`
      });
    }

    const data = await response.json();

    // Apply time offset to segments (for chunked audio)
    const segments = (data.segments || []).map((seg) => ({
      start: seg.start + offset,
      end: seg.end + offset,
      text: seg.text,
    }));

    return res.status(200).json({
      text: data.text || "",
      segments: segments,
      duration: data.duration || 0,
    });

  } catch (err) {
    console.error("Transcription error:", err);
    return res.status(500).json({ error: err.message || "Transcription failed" });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "25mb",
    },
  },
};
