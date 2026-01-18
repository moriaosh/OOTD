const { PrismaClient } = require('@prisma/client');
const { GoogleGenAI } = require('@google/genai');
const prisma = new PrismaClient();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('⚠️ GEMINI_API_KEY is not configured in .env');
}

/**
 * Analyze uploaded selfie and determine best colors for the user
 * POST /api/color-analysis/analyze
 */
exports.analyzeColors = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Get uploaded image from request
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }

    // Memory storage doesn't have filename, use timestamp
    const imageUrl = `selfie-${Date.now()}.jpg`;
    const imageBuffer = req.file.buffer;
    const imageMimeType = req.file.mimetype;

    console.log('🎨 Analyzing colors for user:', userId);

    // Convert image to base64 for Gemini
    const base64Image = imageBuffer.toString('base64');

    // Call Gemini Vision API (using same pattern as other working AI features)
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    const prompt = `אתה מומחה מקצועי לניתוח צבעים וסטייליסט אופנה. נתח את תווי הפנים של האדם בתמונה כדי לקבוע את פלטת הצבעים האידיאלית שלו/ה.

אנא נתח:
1. **גוון עור**: קבע אם לעור יש גוון חם (תת-גוון צהוב/זהוב), קר (תת-גוון ורוד/כחול), או ניטרלי
2. **צבע עיניים**: זהה את צבע העיניים הדומיננטי
3. **צבע שיער**: זהה את צבע השיער הטבעי
4. **צבע שפתיים**: ציין את צבע השפתיים הטבעי
5. **פלטת צבעים עונתית**: קבע אם האדם הוא אביב (Spring), קיץ (Summer), סתיו (Autumn), או חורף (Winter) על בסיס תורת הצבעים

על בסיס הניתוח שלך, ספק:
- **צבעים מומלצים** (15 צבעים): קודי hex של צבעים שיגרמו לו/ה להיראות חיוני/ת ובריא/ה
- **צבעים להימנע** (10 צבעים): קודי hex של צבעים שעלולים לגרום לו/ה להיראות חיוור/ת
- **המלצות**: עצות אופנה מפורטות אילו צבעים ללבוש ולמה

החזר את התשובה בפורמט JSON הבא (כל הטקסטים בעברית):
{
  "skinTone": "חם|קר|ניטרלי",
  "skinToneDetails": "תיאור מפורט של תת-הגוון בעברית",
  "eyeColor": "צבע עיניים ספציפי בעברית",
  "hairColor": "צבע שיער ספציפי בעברית",
  "lipColor": "צבע שפתיים ספציפי בעברית",
  "season": "Spring|Summer|Autumn|Winter",
  "bestColors": ["#hexcode1", "#hexcode2", ...], // 15 צבעים
  "avoidColors": ["#hexcode1", "#hexcode2", ...], // 10 צבעים
  "recommendations": "המלצות צבעים מותאמות אישית לאופנה - בעברית, מפורט ומקצועי"
}

חשוב מאוד: החזר רקJSON תקין, ללא פורמט markdown או code blocks.`;

    console.log('Calling Gemini Vision API with model: gemini-2.5-flash');

    // Call Gemini API using the same pattern as other working AI features
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: imageMimeType,
                data: base64Image
              }
            }
          ]
        }
      ]
    });

    // Parse AI response
    let analysisData;
    try {
      const responseText = response.text;
      console.log('🤖 Gemini Response:', responseText);

      // Clean response (remove markdown code blocks if present)
      const cleanedText = responseText
        .replace(/```json\n/g, '')
        .replace(/```\n/g, '')
        .replace(/```/g, '')
        .trim();

      analysisData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      return res.status(500).json({
        success: false,
        message: 'שגיאה בעיבוד תשובת הבינה המלאכותית. נסי שוב.'
      });
    }

    // Validate and ensure we have arrays
    if (!Array.isArray(analysisData.bestColors)) {
      analysisData.bestColors = [];
    }
    if (!Array.isArray(analysisData.avoidColors)) {
      analysisData.avoidColors = [];
    }

    // Save to database
    const colorAnalysis = await prisma.colorAnalysis.create({
      data: {
        userId,
        imageUrl,
        skinTone: analysisData.skinTone || 'neutral',
        skinToneDetails: analysisData.skinToneDetails || '',
        eyeColor: analysisData.eyeColor || 'unknown',
        hairColor: analysisData.hairColor || 'unknown',
        lipColor: analysisData.lipColor || null,
        season: analysisData.season || 'Unknown',
        bestColors: analysisData.bestColors,
        avoidColors: analysisData.avoidColors,
        recommendations: analysisData.recommendations || ''
      }
    });

    console.log('✅ Color analysis saved:', colorAnalysis.id);

    res.status(200).json({
      success: true,
      analysis: colorAnalysis
    });

  } catch (error) {
    console.error('Color analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בניתוח הצבעים. נסי שוב.'
    });
  }
};

/**
 * Get user's color analysis history
 * GET /api/color-analysis/my-analyses
 */
exports.getMyAnalyses = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const analyses = await prisma.colorAnalysis.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      analyses
    });

  } catch (error) {
    console.error('Get analyses error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת הניתוחים.'
    });
  }
};

/**
 * Get latest color analysis
 * GET /api/color-analysis/latest
 */
exports.getLatestAnalysis = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const analysis = await prisma.colorAnalysis.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'No analysis found'
      });
    }

    res.status(200).json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error('Get latest analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בטעינת הניתוח האחרון.'
    });
  }
};

/**
 * Delete color analysis
 * DELETE /api/color-analysis/:id
 */
exports.deleteAnalysis = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Verify ownership
    const analysis = await prisma.colorAnalysis.findUnique({
      where: { id }
    });

    if (!analysis || analysis.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this analysis'
      });
    }

    await prisma.colorAnalysis.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message: 'Analysis deleted successfully'
    });

  } catch (error) {
    console.error('Delete analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה במחיקת הניתוח.'
    });
  }
};
