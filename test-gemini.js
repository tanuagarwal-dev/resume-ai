const fs = require("fs");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Minimal .env loader to avoid adding a dependency
function loadEnv() {
  if (process.env.GEMINI_API_KEY) return;

  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.trim().startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line
      .slice(idx + 1)
      .trim()
      .replace(/^['"]|['"]$/g, "");
    if (key && value && !process.env[key]) process.env[key] = value;
  }
}

async function listModels() {
  loadEnv();
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error(
      "GEMINI_API_KEY is not set. Add it to your environment or .env file."
    );
    process.exit(1);
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  try {
    console.log("Listing available models for this API key...\n");
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`Request failed: ${res.status} ${res.statusText}`);
      const body = await res.text();
      console.error(body);
      process.exit(1);
    }

    const data = await res.json();
    const models = data.models || [];

    if (!models.length) {
      console.log(
        "No models returned. Ensure the API key has access to Gemini."
      );
      return;
    }

    models.forEach((m) => {
      console.log(
        `${m.name} -> ${
          m.supportedGenerationMethods?.join(", ") || "(no methods)"
        }`
      );
    });
  } catch (error) {
    console.error("listModels failed:", error?.message || error);
    process.exit(1);
  }
}

listModels();
