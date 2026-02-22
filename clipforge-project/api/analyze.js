export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { transcript, duration } = req.body;

  if (!transcript || !transcript.trim()) {
    return res.status(400).json({ error: "Transcript is required" });
  }

  // Your Anthropic API key — stored as an environment variable in Vercel
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured. Add ANTHROPIC_API_KEY in Vercel environment variables." });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: `You are a professional video editor AI. Analyze this transcript and identify the 4-8 most clip-worthy moments — segments that would make the best standalone short clips for social media or highlights.

For each clip, provide:
- start: timestamp in M:SS or H:MM:SS format
- end: timestamp
- category: one of: key_insight, emotional, actionable, viral_potential, story, quotable
- reason: 1 sentence why this is clip-worthy
- quote: the key phrase from that moment (keep short)

Total video duration is approximately ${duration}.

Respond ONLY with a JSON array. No markdown, no backticks.
Example: [{"start":"1:23","end":"2:05","category":"key_insight","reason":"Explains the core concept","quote":"This changes everything"}]

TRANSCRIPT:
${transcript}`,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "API request failed",
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message || "Server error" });
  }
}
