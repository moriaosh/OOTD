# Purchase Advisor API - Test Guide

## API Endpoint
```
POST http://localhost:5000/api/purchase/analyze
```

## Authentication Required
You need a valid JWT token from login.

---

## How to Test

### Option 1: Using Postman

1. **Login First** to get token:
   - POST `http://localhost:5000/api/auth/login`
   - Body:
     ```json
     {
       "email": "user@example.com",
       "password": "password123"
     }
     ```
   - Copy the `token` from response

2. **Test Purchase Analysis**:
   - POST `http://localhost:5000/api/purchase/analyze`
   - Headers:
     ```
     Authorization: Bearer YOUR_TOKEN_HERE
     Content-Type: application/json
     ```
   - Body:
     ```json
     {
       "imageUrl": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
       "itemName": "חולצה כחולה",
       "itemType": "חולצה"
     }
     ```

---

### Option 2: Using curl (Command Line)

#### Step 1: Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"user@example.com\",\"password\":\"password123\"}"
```

Copy the token from response.

#### Step 2: Analyze Purchase
```bash
curl -X POST http://localhost:5000/api/purchase/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d "{\"imageUrl\":\"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab\",\"itemName\":\"חולצה כחולה\",\"itemType\":\"חולצה\"}"
```

---

## Request Format

### Required Fields:
```json
{
  "imageUrl": "https://example.com/image.jpg",  // Must be publicly accessible
  "itemName": "Blue Shirt",                      // Name of the item
  "itemType": "חולצה"                            // Category (חולצה, מכנס, שמלה, etc.)
}
```

### Field Validation:
- ✅ `imageUrl`: Must be a valid, publicly accessible image URL
- ✅ `itemName`: Required, any string
- ✅ `itemType`: Required, should match categories in your closet

---

## Response Format

### Success Response (200):
```json
{
  "score": 8,
  "explanation": "החולצה הכחולה משתלבת נהדר עם הג'ינסים והנעליים הלבנות שיש לך בארון. הצבע משלים את הפריטים הקיימים.",
  "recommendations": "מומלץ ללבוש עם המכנסיים השחורים או חצאית הג'ינס שלך. הנעליים הלבנות יהיו מושלמות לשילוב.",
  "warnings": null,
  "closetSize": 15
}
```

### Error Responses:

#### 400 - Missing Fields:
```json
{
  "message": "חסר קישור לתמונה (imageUrl)"
}
```

#### 400 - Invalid Image URL:
```json
{
  "message": "לא ניתן לטעון את התמונה. ודאי שהקישור תקין.",
  "error": "Failed to fetch image: 404"
}
```

#### 401 - Unauthorized:
```json
{
  "message": "No token provided"
}
```

#### 500 - Server Error:
```json
{
  "message": "שגיאה בניתוח הקנייה.",
  "error": "Error details here"
}
```

---

## Test Image URLs

Use these free image URLs for testing:

### Shirts:
- `https://images.unsplash.com/photo-1521572163474-6864f9cf17ab`
- `https://images.unsplash.com/photo-1596755094514-f87e34085b2c`

### Jeans:
- `https://images.unsplash.com/photo-1542272604-787c3835535d`
- `https://images.unsplash.com/photo-1582552938357-32b906d258d3`

### Dress:
- `https://images.unsplash.com/photo-1595777457583-95e059d581b8`

---

## Response Fields Explained

| Field | Type | Description |
|-------|------|-------------|
| `score` | Number (1-10) | Compatibility score. Higher = better match |
| `explanation` | String | Why this score? Color/style analysis |
| `recommendations` | String/null | Which items to pair with |
| `warnings` | String/null | Duplicate items or color clashes |
| `closetSize` | Number | How many items user has in closet |

---

## Example Full Test Flow

1. **Login**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com","password":"test123"}'
   ```

   Response:
   ```json
   {
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": {...}
   }
   ```

2. **Analyze Purchase** (with token):
   ```bash
   curl -X POST http://localhost:5000/api/purchase/analyze \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
     -d '{"imageUrl":"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab","itemName":"חולצה כחולה","itemType":"חולצה"}'
   ```

   Response:
   ```json
   {
     "score": 8,
     "explanation": "החולצה הכחולה...",
     "recommendations": "תלבשי עם...",
     "warnings": null,
     "closetSize": 6
   }
   ```

---

## Integration Notes for Frontend Team

### API Call Example (JavaScript/React):
```javascript
const analyzePurchase = async (imageUrl, itemName, itemType) => {
  const token = localStorage.getItem('ootd_authToken');

  const response = await fetch('http://localhost:5000/api/purchase/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      imageUrl,
      itemName,
      itemType
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return await response.json();
};

// Usage:
try {
  const result = await analyzePurchase(
    'https://example.com/shirt.jpg',
    'Blue Shirt',
    'חולצה'
  );

  console.log('Score:', result.score);
  console.log('Explanation:', result.explanation);
} catch (error) {
  console.error('Error:', error.message);
}
```

---

## Troubleshooting

### Issue: "Failed to fetch image"
- ✅ Ensure image URL is publicly accessible (not behind login)
- ✅ Check image URL is valid (test in browser)
- ✅ Image must be JPG, PNG, or WebP format

### Issue: "Gemini API key not configured"
- ✅ Check `.env` file has `GEMINI_API_KEY`
- ✅ Restart backend server after adding key

### Issue: "No token provided"
- ✅ Include `Authorization: Bearer TOKEN` header
- ✅ Make sure token is valid (not expired)

---

## Ready for Frontend Integration! 🚀

The backend is fully functional. Your frontend team can:
1. Build upload UI (file or URL input)
2. Call this API endpoint
3. Display the score, explanation, and recommendations

No backend changes needed!
