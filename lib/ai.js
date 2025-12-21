import { GoogleGenerativeAI } from "@google/generative-ai";

let cachedModel = null;
let cachedModelName = null;
let listedModels = null;

async function listAvailableModels(apiKey) {
  if (listedModels) return listedModels;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
  );
  if (!res.ok) throw new Error(`ListModels failed: ${res.status}`);
  const data = await res.json();
  listedModels = (data.models || []).map((m) => m.name);
  return listedModels;
}

function preferModel(models) {
  const candidates = [
    "models/gemini-2.5-flash",
    "models/gemini-flash-latest",
    "models/gemini-pro-latest",
  ];
  for (const name of candidates) {
    if (models.includes(name)) return name;
  }
  return models[0];
}

export async function getModel() {
  if (cachedModel) return cachedModel;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY missing");
  const genAI = new GoogleGenerativeAI(apiKey);
  const models = await listAvailableModels(apiKey);
  cachedModelName = preferModel(models);
  cachedModel = genAI.getGenerativeModel({ model: cachedModelName });
  return cachedModel;
}

export function stripCodeFences(text) {
  return text
    .replace(/```(?:json)?\n?/gi, "")
    .replace(/```/g, "")
    .trim();
}

async function generateRaw(prompt) {
  const model = await getModel();
  const result = await model.generateContent(prompt);
  return (
    result.response?.text?.() ??
    result.response?.candidates?.[0]?.content?.parts?.[0]?.text ??
    ""
  );
}

export async function aiText(prompt, { retries = 1 } = {}) {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try {
      const text = await generateRaw(prompt);
      return text.trim();
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw lastErr;
}

export async function aiJson(prompt, schema, { retries = 1 } = {}) {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try {
      const text = await generateRaw(prompt);
      const cleaned = stripCodeFences(text);
      const parsed = JSON.parse(cleaned);
      const result = schema.safeParse(parsed);
      if (!result.success) {
        throw new Error(
          "AI JSON validation failed: " + JSON.stringify(result.error.issues)
        );
      }
      return result.data;
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw lastErr;
}
