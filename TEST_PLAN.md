# OOTD - Comprehensive Test Plan

## Project Overview
**Project Name**: OOTD (Outfit Of The Day)
**Tech Stack**: React (Frontend), Node.js + Express (Backend), PostgreSQL + Prisma (Database)
**Testing Tool**: Selenium WebDriver (JavaScript/Node.js)
**Testing Phase**: System Testing & Bug Fixes

---

## Test Strategy
- **Objective**: Validate all critical user flows and edge cases
- **Scope**: End-to-end testing of core features
- **Approach**: Automated testing using Selenium WebDriver
- **Environment**: Local development (localhost:3000 frontend, localhost:5000 backend)

---

## Test Cases

### 🎯 Happy Path Scenarios (Success Cases)

#### TC-01: User Registration and Login
**Test Scenario**: New user registers and logs into the system successfully
**Steps**:
1. Navigate to registration page
2. Fill in email, password, first name, last name
3. Click "הרשמה" (Register) button
4. Verify redirect to login page
5. Login with the same credentials
6. Verify redirect to home page with user name displayed

**Expected Result**:
- Registration successful with confirmation message
- Login successful, user redirected to home page
- User name appears in header/profile section

---

#### TC-02: Add Item to Closet
**Test Scenario**: User uploads a clothing item to their digital closet
**Steps**:
1. Login to the application
2. Navigate to "הארון שלי" (My Closet) page
3. Click "הוסף פריט" (Add Item) button
4. Fill in item details (category, color, season, occasion)
5. Upload an image file (JPG/PNG)
6. Click "שמור" (Save) button
7. Verify item appears in closet grid

**Expected Result**:
- Modal opens with empty form
- All fields accept valid input
- Image preview shows selected file
- Item successfully saved and visible in closet
- Success message displays

---

#### TC-03: Edit and Delete Closet Item
**Test Scenario**: User modifies and removes an item from closet
**Steps**:
1. Login and navigate to closet
2. Click edit icon on an existing item
3. Change item color to "כחול" (Blue)
4. Save changes and verify color updated
5. Click delete icon on the same item
6. Confirm deletion in modal
7. Verify item no longer appears in closet

**Expected Result**:
- Edit modal pre-fills with existing data
- Changes are saved and reflected immediately
- Delete confirmation modal appears
- Item removed from database and UI

---

#### TC-04: Toggle Laundry Status
**Test Scenario**: User marks items as in laundry and back
**Steps**:
1. Login and navigate to closet
2. Find an item not in laundry
3. Click laundry icon (droplet icon)
4. Verify icon changes to indicate "בכביסה" (In Laundry)
5. Click laundry icon again to toggle back
6. Verify icon returns to normal state

**Expected Result**:
- Icon toggles state on each click
- Visual indicator changes (color/style)
- Status persists after page refresh
- Item availability updates in suggestions

---

#### TC-05: Generate Outfit Suggestions
**Test Scenario**: AI generates outfit recommendations from closet
**Steps**:
1. Login and ensure closet has at least 5 items
2. Navigate to "המלצות לוקים" (Suggestions) page
3. Click "קבל המלצות" (Get Suggestions) button
4. Wait for AI processing (loading indicator)
5. Verify 3 outfit suggestions appear
6. Click "שמור ללוקים שלי" on one suggestion
7. Verify success message

**Expected Result**:
- Loading indicator appears during processing
- At least 1-3 outfit suggestions generated
- Each suggestion shows multiple clothing items
- Save functionality works correctly
- Suggestions are relevant to user's closet

---

#### TC-06: Create and View Post in Feed
**Test Scenario**: User creates a public outfit post
**Steps**:
1. Login to application
2. Navigate to home page / feed
3. Click "צור פוסט חדש" (Create New Post) button
4. Select 2-3 items from closet for the outfit
5. Add description text
6. Set post as public
7. Click publish button
8. Verify post appears in feed with correct items and description

**Expected Result**:
- Modal shows user's closet items for selection
- Selected items highlighted
- Post successfully created
- Post visible in public feed
- Other users can see the post

---

#### TC-07: Favorite Items and Outfits
**Test Scenario**: User marks items and outfits as favorites
**Steps**:
1. Login and navigate to closet
2. Click heart icon on 2 different items
3. Navigate to "מועדפים" (Favorites) page
4. Verify 2 items appear in favorites tab
5. Switch to outfits tab
6. Click heart on one outfit
7. Verify outfit appears in favorite outfits section

**Expected Result**:
- Heart icon fills/changes color when favorited
- Favorites page correctly displays favorited items
- Tabs switch between items and outfits
- Favorite status persists across sessions

---

### ⚠️ Edge Case Scenarios (Failure/Boundary Cases)

#### TC-08: Upload Invalid File Type
**Test Scenario**: System rejects non-image file upload
**Steps**:
1. Login and navigate to add item page
2. Attempt to upload a PDF or TXT file
3. Try to save the item

**Expected Result**:
- Error message: "יש להעלות קובץ תמונה בלבד" (Please upload image file only)
- File input rejects non-image formats
- Save button disabled or shows validation error
- Item is NOT added to closet

---

#### TC-09: Generate Suggestions with Empty Closet
**Test Scenario**: AI handles empty or minimal closet gracefully
**Steps**:
1. Create new account with empty closet
2. Navigate to suggestions page
3. Click "קבל המלצות" (Get Suggestions)

**Expected Result**:
- Friendly error message: "אין מספיק פריטים בארון ליצירת המלצות" (Not enough items in closet to generate suggestions)
- Suggestion to add more items with link to closet page
- No crash or blank screen
- Minimum 3-5 items required message

---

#### TC-10: Login with Invalid Credentials
**Test Scenario**: System prevents unauthorized access
**Steps**:
1. Navigate to login page
2. Enter incorrect email: "wrong@email.com"
3. Enter incorrect password: "wrongpass123"
4. Click login button
5. Try SQL injection: `' OR '1'='1`
6. Try empty fields

**Expected Result**:
- Error message: "אימייל או סיסמה שגויים" (Email or password incorrect)
- User stays on login page
- No sensitive error details exposed
- SQL injection attempts blocked
- Form validation prevents empty submission
- Rate limiting after 5 failed attempts (if implemented)

---

## Test Coverage Summary

| Feature | Test Cases | Coverage |
|---------|-----------|----------|
| Authentication | TC-01, TC-10 | 2 tests |
| Closet Management | TC-02, TC-03, TC-04, TC-08 | 4 tests |
| AI Suggestions | TC-05, TC-09 | 2 tests |
| Social Feed | TC-06 | 1 test |
| Favorites | TC-07 | 1 test |

**Total Test Cases**: 10 (7 Happy Paths + 3 Edge Cases)

---

## Test Execution Notes

### Prerequisites
- Backend server running on localhost:5000
- Frontend server running on localhost:3000
- Database seeded with test data (optional)
- ChromeDriver installed and configured

### Test Data Requirements
- Valid test user: `test@ootd.com` / `Test1234`
- Sample clothing images in `/test-data/images/`
- At least 5 test items for suggestion generation

### Known Limitations
- AI suggestions require Gemini API key
- File uploads limited to 5MB
- Tests assume Hebrew UI language

---

## Success Criteria
✅ All 7 happy path tests pass
✅ All 3 edge cases handled gracefully
✅ No critical bugs found
✅ Response times under 3 seconds
✅ No console errors during test execution
