// Packing List AI Service - Gemini Integration
// Generates smart packing lists based on trip details, weather, and user's wardrobe

const { GoogleGenAI } = require('@google/genai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Generate packing list using Gemini AI
 * @param {Object} tripDetails - Trip information
 * @returns {Object} Structured packing list with categories
 */
const generatePackingList = async (tripDetails) => {
  const {
    destination,
    startDate,
    endDate,
    duration,
    activities,
    packingStyle,
    weatherData,
    userWardrobe
  } = tripDetails;

  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    throw new Error('Gemini API key not configured. Cannot generate packing list.');
  }

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    // Build prompt for Gemini
    const prompt = buildPackingPrompt({
      destination,
      startDate,
      endDate,
      duration,
      activities,
      packingStyle,
      weatherData,
      userWardrobe
    });

    console.log('Calling Gemini AI for packing list generation...');

    // Call Gemini API
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Fast and cost-effective
      contents: prompt
    });

    console.log('Gemini API Success - Packing list generated');

    const aiResponse = response.text;

    if (!aiResponse) {
      throw new Error('No response from Gemini API');
    }

    console.log('AI Response (first 300 chars):', aiResponse.substring(0, 300));

    // Parse AI response into structured packing list
    const packingList = parsePackingList(aiResponse, userWardrobe);

    return packingList;

  } catch (error) {
    console.error('Gemini packing list error:', error);
    throw error;
  }
};

/**
 * Build prompt for Gemini to generate packing list
 */
const buildPackingPrompt = (tripDetails) => {
  const {
    destination,
    startDate,
    endDate,
    duration,
    activities,
    packingStyle,
    weatherData,
    userWardrobe
  } = tripDetails;

  // Format wardrobe items
  const wardrobeList = userWardrobe.map((item, idx) =>
    `${idx + 1}. ${item.name} (ID: ${item.id})
   קטגוריה: ${item.category}
   צבע: ${item.color}${item.season ? `
   עונה: ${item.season}` : ''}${item.occasion ? `
   אירוע: ${item.occasion}` : ''}`
  ).join('\n\n');

  // Format activities
  const activitiesText = Array.isArray(activities) ? activities.join(', ') : activities;

  let prompt = `אתה מומחה לתכנון טיולים ואריזה חכמה. תפקידך לייצר רשימת אריזה מותאמת אישית.

**פרטי הטיול:**
📍 יעד: ${destination}
📅 תאריכים: ${startDate.toLocaleDateString('he-IL')} - ${endDate.toLocaleDateString('he-IL')}
⏱️ משך: ${duration} ימים
🎯 פעילויות: ${activitiesText}
🎒 סגנון אריזה: ${packingStyle}`;

  if (weatherData) {
    prompt += `
🌤️ מזג אוויר צפוי: ${weatherData.temperature}°C, ${weatherData.description}
   לחות: ${weatherData.humidity}%`;
  }

  prompt += `

**הארון של המשתמש (${userWardrobe.length} פריטים):**
${wardrobeList}

**הנחיות חשובות:**
1. **עדיפות לפריטים מהארון:** בחר קודם פריטים שהמשתמש כבר בעלות! זה החלק הכי חשוב!
2. **פריטים חסרים:** אם חסר פריט חיוני (מעיל גשם, נעלי הליכה וכו'), הוסף אותו עם הסבר למה הוא נחוץ.
3. **כמויות:** התחשב במשך הטיול (${duration} ימים) וסגנון האריזה (${packingStyle}).
   - Minimalist: מינימום פריטים, מקסימום שילובים
   - Standard: כמות מאוזנת, כולל עתודות
   - Extended: יותר אופציות וגיוון
4. **מזג אוויר:** התחשב במזג האוויר הצפוי בחירת הפריטים.
5. **פעילויות:** ודא שיש ציוד מתאים לכל פעילות (${activitiesText}).

**פורמט פלט - JSON בלבד:**
{
  "categories": [
    {
      "name": "חולצות וטופים",
      "items": [
        {
          "name": "שם הפריט כפי שהוא בארון",
          "isOwned": true,
          "itemId": "ID מהארון בדיוק כפי שהוא!",
          "quantity": 2,
          "reason": "למה נבחר הפריט הזה"
        },
        {
          "name": "שם פריט חסר",
          "isOwned": false,
          "suggestion": "המלצה מפורטת - איזה פריט לקנות/לשאול",
          "quantity": 1,
          "reason": "למה הפריט הזה חיוני"
        }
      ]
    },
    {
      "name": "מכנסיים וחצאיות",
      "items": [...]
    },
    {
      "name": "נעליים",
      "items": [...]
    },
    {
      "name": "אביזרים",
      "items": [...]
    },
    {
      "name": "טואלטיקה ואחרים",
      "items": [
        {
          "name": "משחת שיניים",
          "isOwned": false,
          "suggestion": "מיני טובה לטיול",
          "quantity": 1
        }
      ]
    }
  ],
  "tips": [
    "טיפ 1: כדאי לארוז את הבגדים הכבדים על הגוף במטוס",
    "טיפ 2: השתמשי בשקיות ואקום לחסוך מקום"
  ]
}

**חשוב מאוד:**
- העתק את ה-ID של הפריטים בדיוק כפי שהם מופיעים למעלה! אל תשני אף תו!
- אם הפריט שייך למשתמש (isOwned: true), חייב להיות itemId מדויק!
- אל תמציא ID-ים חדשים!

צור עכשיו רשימת אריזה מושלמת עבור הטיול הזה:`;

  return prompt;
};

/**
 * Parse Gemini's JSON response into structured packing list
 */
const parsePackingList = (aiResponse, userWardrobe) => {
  try {
    // Remove markdown code blocks if present
    let jsonText = aiResponse.trim();
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    console.log('Parsing packing list JSON...');

    // Parse JSON
    const packingData = JSON.parse(jsonText);

    if (!packingData.categories || !Array.isArray(packingData.categories)) {
      throw new Error('Invalid packing list format - missing categories array');
    }

    console.log(`Parsed ${packingData.categories.length} categories`);

    // Validate item IDs and ensure they exist in wardrobe
    packingData.categories.forEach((category, catIdx) => {
      console.log(`Category ${catIdx + 1}: ${category.name} - ${category.items.length} items`);

      category.items = category.items.map((item, itemIdx) => {
        if (item.isOwned && item.itemId) {
          // Verify the item exists in wardrobe
          const wardrobeItem = userWardrobe.find(w => w.id === item.itemId);
          if (!wardrobeItem) {
            console.warn(`Item ID ${item.itemId} not found in wardrobe for "${item.name}"`);
            // Mark as not owned if ID is invalid
            return {
              ...item,
              isOwned: false,
              itemId: null,
              suggestion: `פריט דומה ל-${item.name}`
            };
          }
        }
        return item;
      });
    });

    return packingData;

  } catch (parseError) {
    console.error('Failed to parse packing list:', parseError);
    console.log('AI Response:', aiResponse);
    throw new Error('Failed to parse packing list from AI response');
  }
};

module.exports = {
  generatePackingList
};
