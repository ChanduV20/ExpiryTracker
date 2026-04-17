// src/services/aiRecipeService.js
import { API_KEYS } from '../config/apiKeys';

const GROQ_API_KEY = API_KEYS?.GROQ;
const GROQ_MODEL = 'llama-3.1-8b-instant'; // ✅ Free, fast, reliable

// 📝 Prompt optimized for JSON output
const buildPrompt = (productNames) => `You are a helpful cooking assistant. Create a simple, realistic recipe using ONLY these ingredients: ${productNames.join(', ')}.

Respond with VALID JSON only. Do not include markdown, code blocks, or extra text. Use this exact format:
{
  "title": "Recipe Name",
  "prepTime": "15 mins",
  "ingredients": ["${productNames.join('", "')}"],
  "steps": ["Step 1 instruction", "Step 2 instruction", "Step 3"],
  "tip": "One quick cooking tip"
}`;

// 🧪 Polished mock fallback (for demo/offline)
const generateMockRecipe = (productNames) => {
  const templates = [
    {
      title: `Quick ${productNames[0]} Bowl`,
      prepTime: '12 mins',
      ingredients: productNames.map(p => `• 1 cup ${p.toLowerCase()}`),
      steps: [
        `Wash and prepare ${productNames[0]}`,
        productNames[1] ? `Combine ${productNames[0]} and ${productNames[1]} in a pan` : `Season ${productNames[0]} with salt & pepper`,
        'Cook over medium heat for 5-7 minutes',
        'Serve warm and enjoy!'
      ],
      tip: 'Add a splash of lemon juice for freshness!'
    },
    {
      title: `${productNames[0]} & ${productNames[1] || 'Mix'} Delight`,
      prepTime: '18 mins',
      ingredients: productNames.map(p => `• 1 cup ${p.toLowerCase()}`),
      steps: [
        `Chop ${productNames[0]} into bite-sized pieces`,
        'Heat oil in a pan over medium heat',
        productNames[1] ? `Add ${productNames[1]} and stir-fry for 3 minutes` : 'Sauté until golden',
        'Combine all ingredients and season to taste'
      ],
      tip: 'Garnish with fresh herbs for extra flavor!'
    }
  ];
  return templates[Math.floor(Math.random() * templates.length)];
};

// 🎯 Call Groq API
const callGroq = async (productNames) => {
  if (!GROQ_API_KEY || !GROQ_API_KEY.startsWith('gsk_')) {
    throw new Error('Missing or invalid Groq API key');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: 'You are a JSON-only response assistant. Return valid JSON matching the exact schema provided.' },
        { role: 'user', content: buildPrompt(productNames) }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  let text = data.choices[0].message.content.trim();
  
  // Clean markdown if Groq/Llama wraps it
  text = text.replace(/```json\s*|\s*```/g, '').trim();
  
  // Extract JSON block if extra text exists
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) text = jsonMatch[0];
  
  return JSON.parse(text);
};

// 🚀 Main export with graceful fallback
export const generateRecipe = async (productNames) => {
  if (!GROQ_API_KEY) {
    console.log("🧪 No Groq API key → Using mock");
    await new Promise(r => setTimeout(r, 1000));
    return generateMockRecipe(productNames);
  }

  console.log("🤖 Calling Groq AI (Llama 3.1)...");
  
  try {
    const result = await callGroq(productNames);
    console.log("✅ Groq success:", result.title);
    return result;
  } catch (error) {
    console.warn("⚠️ Groq failed:", error.message);
    console.log("🔄 Falling back to mock recipe");
    await new Promise(r => setTimeout(r, 800));
    return generateMockRecipe(productNames);
  }
};

// 🔍 Debug helper
export const debugGroq = async () => {
  if (!GROQ_API_KEY?.startsWith('gsk_')) return console.log("❌ No valid Groq token");
  try {
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { Authorization: `Bearer ${GROQ_API_KEY}` }
    });
    if (res.ok) {
      const data = await res.json();
      const freeModels = data.data.filter(m => m.id.includes('8b') || m.id.includes('free'));
      console.log("✅ Groq Token valid! Available free models:", freeModels.map(m => m.id));
    } else {
      console.log("❌ Groq Token invalid");
    }
  } catch (e) {
    console.log("⚠️ Groq debug failed:", e.message);
  }
};