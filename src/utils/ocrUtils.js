import Tesseract from 'tesseract.js';

export const captureAndExtractExpiry = async (imageUri) => {
  try {
    // Run OCR on-device (no API key!)
    const { data: { text } } = await Tesseract.recognize(
      imageUri,
      'eng', // Language: English
      {
        logger: (m) => console.log('OCR Progress:', m), // Optional: track progress
        errorHandler: (err) => console.error('OCR Error:', err)
      }
    );

    if (!text.trim()) {
      return { success: false, error: 'No text detected. Try better lighting.' };
    }

    // Extract date via regex
    const parsedDate = parseExpiryDate(text);
    return { 
      success: true, 
      text: text.substring(0, 100), // Show first 100 chars
      date: parsedDate,
      fullText: text 
    };
  } catch (error) {
    console.error('Tesseract Error:', error);
    return { success: false, error: error.message };
  }
};

// Regex patterns for common packaging formats
const parseExpiryDate = (text) => {
  const patterns = [
    /(?:EXP|Best\s*Before|BB|Use\s*By|Expiry)\s*[:\-]?\s*(\d{1,2}[\/\-\.]\d{1,2}(?:[\/\-\.]\d{2,4})?)/i,
    /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/,
    /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s*\d{2,4})/i,
    /(\d{4}[\/\-\.]\d{2}[\/\-\.]\d{2})/
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return normalizeDate(match[1]);
  }
  return null;
};

// Convert messy formats to YYYY-MM-DD
const normalizeDate = (raw) => {
  const cleaned = raw.replace(/[\/\-\.]/g, '-');
  const parts = cleaned.split('-').map(p => parseInt(p, 10));
  if (parts.length !== 3) return raw;

  let [a, b, c] = parts;
  
  // Heuristic: >31 is likely year
  if (c > 31) return `${c}-${String(a).padStart(2, '0')}-${String(b).padStart(2, '0')}`;
  if (a > 31) return `${a}-${String(b).padStart(2, '0')}-${String(c).padStart(2, '0')}`;
  if (b > 31) return `${b}-${String(a).padStart(2, '0')}-${String(c).padStart(2, '0')}`;

  // Fallback: Assume DD-MM-YYYY
  if (c < 100) c += c < 50 ? 2000 : 1900;
  return `${c}-${String(a).padStart(2, '0')}-${String(b).padStart(2, '0')}`;
};