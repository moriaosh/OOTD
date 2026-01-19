// Gemini AI Service - Google Gemini API Integration
// Powers AI-driven outfit suggestions with color matching and fashion knowledge

const { GoogleGenAI } = require('@google/genai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Generate AI-powered outfit suggestions using Gemini
 * @param {Array} clothes - User's clothing items with metadata
 * @param {Object} weatherData - Optional weather context
 * @returns {Array} AI-curated outfit suggestions
 */
const generateAIOutfits = async (clothes, weatherData = null) => {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    throw new Error('Gemini API key not configured. Using basic suggestions instead.');
  }

  try {
    // Initialize Gemini AI client
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    // OPTIMIZATION: Limit wardrobe size to prevent token limit issues
    // Prioritize: shoes first (required), then most recent uploads
    const MAX_ITEMS = 40;
    let limitedClothes = clothes;

    if (clothes.length > MAX_ITEMS) {
      console.log(`Large wardrobe detected (${clothes.length} items). Limiting to ${MAX_ITEMS} for AI processing.`);

      // Ensure we have shoes (critical for outfits)
      const shoes = clothes.filter(c => c.category === 'נעל');
      const nonShoes = clothes.filter(c => c.category !== 'נעל');

      // Take all shoes + most recent non-shoes up to MAX_ITEMS
      const remainingSlots = MAX_ITEMS - shoes.length;
      const selectedNonShoes = nonShoes
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, remainingSlots);

      limitedClothes = [...shoes, ...selectedNonShoes];
      console.log(`Using ${shoes.length} shoes + ${selectedNonShoes.length} other items`);
    }

    // Prepare clothing data for AI analysis
    const clothingList = limitedClothes.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      color: item.color,
      season: item.season,
      occasion: item.occasion
    }));

    // Build prompt for Gemini
    const prompt = buildOutfitPrompt(clothingList, weatherData);

    console.log('Calling Gemini AI with model: gemini-2.5-flash');

    // Call Gemini API using official SDK
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    console.log('Gemini API Success - Response received');

    const aiResponse = response.text;

    if (!aiResponse) {
      console.error('Gemini API returned no text');
      throw new Error('No response from Gemini API');
    }

    console.log('AI Response (first 500 chars):', aiResponse.substring(0, 500));

    // Parse AI response into structured outfits
    const outfits = parseAIOutfits(aiResponse, clothes);
    console.log(`Parsed ${outfits.length} outfits from AI response`);

    return outfits;

  } catch (error) {
    console.error('Gemini AI Error:', error);
    throw error;
  }
};

/**
 * Build prompt for Gemini to generate fashion-forward outfits
 */
const buildOutfitPrompt = (clothingList, weatherData) => {
  let prompt = `You are a professional fashion stylist. Given the following wardrobe items, create 3 stylish outfit combinations.

**CRITICAL: Copy item IDs EXACTLY as shown below. Do not modify or retype them - copy and paste them EXACTLY.**

**IMPORTANT RULES:**
1. **Color Harmony:** Use color theory (complementary, analogous, monochromatic). Avoid clashing colors (e.g., red + pink, orange + purple).
2. **Fashion Trends:** Follow current fashion trends and Pinterest-style combinations.
3. **Balance:** Mix patterns, textures, and proportions thoughtfully.
4. **Completeness:** Each outfit MUST include at minimum: top/dress + bottom (if not dress) + shoes.
5. **Practicality:** Consider the occasion and season.
6. **EXACT IDs:** Copy the ID values EXACTLY character-by-character. Even one wrong character will break the outfit.

**Wardrobe Items:**
${clothingList.map((item, idx) =>
  `${idx + 1}. ${item.name}
   ID: ${item.id}
   Category: ${item.category}
   Color: ${item.color}${item.season ? `
   Season: ${item.season}` : ''}${item.occasion ? `
   Occasion: ${item.occasion}` : ''}`
).join('\n\n')}
`;

  if (weatherData) {
    prompt += `\n**Current Weather:** ${weatherData.temperature}°C, ${weatherData.condition} in ${weatherData.city}. Prioritize weather-appropriate items.`;
  }

  prompt += `\n
**Output Format (JSON):**
Return ONLY a valid JSON array with exactly 3 outfits. Each outfit should have:
- "name": A catchy outfit name (in Hebrew if possible)
- "itemIds": Array of item IDs from the list above
- "explanation": Why this outfit works (color harmony, style, weather, etc.)
- "styleNotes": Fashion tips (e.g., "tuck the shirt", "add a belt")

Example:
[
  {
    "name": "לוק קז'ואל שיק",
    "itemIds": ["uuid1", "uuid2", "uuid3"],
    "explanation": "שילוב של צבעים נייטרליים עם אקסנט צבעוני. הצבעים משלימים זה את זה ויוצרים לוק מאוזן.",
    "styleNotes": "מומלץ להכניס את החולצה למכנסיים לסילואט מחמיא יותר"
  }
]

Generate 3 complete outfits now:`;

  return prompt;
};

/**
 * Parse Gemini's JSON response into outfit objects
 */
const parseAIOutfits = (aiResponse, allClothes) => {
  try {
    // Extract JSON from response (handle markdown code blocks)
    let jsonText = aiResponse.trim();

    console.log('Parsing AI response... Original length:', jsonText.length);

    // Remove markdown code blocks if present
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    console.log('After removing markdown, length:', jsonText.length);
    console.log('JSON to parse (first 300 chars):', jsonText.substring(0, 300));

    // Parse JSON
    const outfits = JSON.parse(jsonText);
    console.log('Successfully parsed JSON. Number of outfits:', outfits.length);

    // Validate and map item IDs to actual items
    const validOutfits = outfits.map((outfit, idx) => {
      console.log(`Processing outfit ${idx + 1}:`, outfit.name);
      console.log(`  Item IDs requested:`, outfit.itemIds);

      const items = outfit.itemIds
        .map(id => allClothes.find(item => item.id === id))
        .filter(item => item !== undefined); // Remove invalid IDs

      console.log(`  Found ${items.length} matching items out of ${outfit.itemIds.length} requested`);

      return {
        name: outfit.name || 'לוק מומלץ',
        items: items,
        explanation: outfit.explanation || null,
        styleNotes: outfit.styleNotes || null
      };
    }).filter(outfit => {
      const isValid = outfit.items.length >= 2;
      if (!isValid) {
        console.log(`Filtering out outfit "${outfit.name}" - only has ${outfit.items.length} items`);
      }
      return isValid;
    });

    console.log(`Returning ${validOutfits.length} valid outfits after filtering`);
    return validOutfits;

  } catch (parseError) {
    console.error('Failed to parse AI response:', parseError);
    console.log('AI Response:', aiResponse);
    throw new Error('Failed to parse outfit suggestions from AI');
  }
};

/**
 * Analyze if a specific outfit combination is fashionable
 * Used for validating color matches and style
 */
const analyzeOutfitMatch = async (items) => {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    return { score: 7, feedback: 'AI analysis unavailable' };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    const itemDescriptions = items.map(item =>
      `${item.category}: ${item.color} (${item.name})`
    ).join(', ');

    const prompt = `Rate this outfit combination on a scale of 1-10 for fashion compatibility:

Items: ${itemDescriptions}

Consider:
- Color harmony and contrast
- Style coherence
- Fashion trends
- Practical wearability

Respond with ONLY a JSON object:
{
  "score": <number 1-10>,
  "feedback": "<brief explanation in Hebrew>"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const aiResponse = response.text;

    if (aiResponse) {
      const jsonText = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(jsonText);
    }

    return { score: 7, feedback: 'לא ניתן לנתח' };

  } catch (error) {
    console.error('Outfit analysis error:', error);
    return { score: 7, feedback: 'שגיאה בניתוח' };
  }
};

/**
 * Analyze purchase compatibility using Gemini Vision
 * @param {string} imageUrl - URL of the item to purchase
 * @param {Array} userCloset - User's existing clothing items
 * @param {string} itemName - Name of the item
 * @param {string} itemType - Category/type of the item
 * @returns {Object} Score, explanation, and recommendations
 */
const analyzePurchaseCompatibility = async (imageUrl, userCloset, itemName, itemType) => {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    throw new Error('Gemini API key not configured');
  }

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    // Format closet list for prompt
    const closetList = userCloset.map((item, idx) =>
      `${idx + 1}. ${item.name} - ${item.category}, צבע: ${item.color}${item.season ? `, עונה: ${item.season}` : ''}`
    ).join('\n');

    const prompt = `אני רוצה לקנות ${itemName} (${itemType}). הנה תמונה של הפריט.

**הארון שלי כרגע:**
${closetList}

**בבקשה תן לי:**
1. **ציון התאמה** (1-10): עד כמה הפריט מתאים לארון שלי?
2. **הסבר קצר**: למה הציון הזה? (התחשב בצבעים, סגנון, ומה שכבר יש לי)
3. **המלצות**: עם איזה פריטים מהארון שלי כדאי ללבוש את זה?
4. **אזהרות** (אם יש): האם יש משהו דומה מדי בארון? או צבע שמתנגש?

**פורמט תשובה - JSON בלבד:**
{
  "score": <מספר 1-10>,
  "explanation": "<הסבר בעברית>",
  "recommendations": "<המלצות שילוב>",
  "warnings": "<אזהרות או null>"
}`;

    console.log('Analyzing purchase with Gemini Vision...');
    console.log('Image URL:', imageUrl);

    let base64Image, contentType;

    // Check if imageUrl is already a base64 data URL
    if (imageUrl.startsWith('data:image/')) {
      // Extract base64 from data URL
      const matches = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) {
        throw new Error('Invalid base64 image format');
      }
      contentType = matches[1];
      base64Image = matches[2];
      console.log('Using provided base64 image');
    } else {
      // Fetch image from URL with timeout
      console.log('Fetching image from URL...');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      try {
        const imageResponse = await fetch(imageUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; OOTD-App/1.0)'
          }
        });
        clearTimeout(timeoutId);

        if (!imageResponse.ok) {
          if (imageResponse.status === 403) {
            throw new Error('Image blocked by website (403 Forbidden). Try copying the image and uploading directly.');
          } else if (imageResponse.status === 404) {
            throw new Error('Image not found (404). Check if the URL is correct.');
          } else {
            throw new Error(`Failed to fetch image: ${imageResponse.status}`);
          }
        }

        const imageBuffer = await imageResponse.arrayBuffer();
        base64Image = Buffer.from(imageBuffer).toString('base64');
        contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

        // Validate it's actually an image
        if (!contentType.startsWith('image/')) {
          throw new Error('URL does not point to a valid image');
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('Image download timed out. The URL may be too slow or blocked.');
        }
        throw fetchError;
      }
    }

    // Call Gemini Vision API with image
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Using same model as other AI features
      contents: [
        {
          parts: [
            {
              text: prompt
            },
            {
              inlineData: {
                mimeType: contentType,
                data: base64Image
              }
            }
          ]
        }
      ]
    });

    console.log('Gemini Vision API Success');

    const aiResponse = response.text;

    if (!aiResponse) {
      throw new Error('No response from Gemini Vision API');
    }

    console.log('AI Response (first 500 chars):', aiResponse.substring(0, 500));

    // Parse JSON response
    let jsonText = aiResponse.trim();
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    try {
      const result = JSON.parse(jsonText);

      return {
        score: result.score || 5,
        explanation: result.explanation || 'לא ניתן לנתח',
        recommendations: result.recommendations || null,
        warnings: result.warnings || null
      };
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', parseError);
      console.error('Raw response:', aiResponse);
      throw new Error('AI returned invalid response format. Please try again.');
    }

  } catch (error) {
    console.error('Purchase analysis error:', error.message);
    console.error('Full error:', error);
    throw error;
  }
};

/**
 * Calendar-based outfit recommendation
 */
const analyzeCalendarOutfit = async (userCloset, calendarContext) => {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    throw new Error('Gemini API key not configured');
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  const closetList = userCloset.map((item, idx) =>
    `${idx + 1}. ${item.name} - ${item.category}, צבע: ${item.color}, עונה: ${item.season || 'כללי'}, אירוע: ${item.occasion || 'יומי'}`
  ).join('\n');

  const prompt = `
יש לי אירוע ביומן ואני רוצה לוק מתאים.

📅 תאריך: ${calendarContext.date}
🎉 אירוע: ${calendarContext.event}
📍 מיקום: ${calendarContext.location || 'לא צוין'}
🌦 מזג אוויר: ${calendarContext.weather || 'לא ידוע'}

👗 הארון שלי:
${closetList}

תן:
1. לוק מומלץ
2. הסבר
3. ציון ביטחון 1–10
4. אזהרות או null

JSON בלבד:
{
  "outfit": "<תיאור>",
  "explanation": "<הסבר>",
  "confidence": <1-10>,
  "warnings": "<טקסט או null>"
}
`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  const text = response.text.replace(/```json|```/g, '').trim();
  return JSON.parse(text);
};


module.exports = {
  generateAIOutfits,
  analyzeOutfitMatch,
  analyzePurchaseCompatibility,
  analyzeCalendarOutfit
};
