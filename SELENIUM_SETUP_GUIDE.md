# Selenium WebDriver Setup Guide for OOTD Testing

## 📋 Prerequisites
- Node.js installed (v16 or higher)
- Chrome browser installed
- Backend and Frontend servers running

---

## 🚀 Step 1: Install Required Packages

Open your terminal in the OOTD project root directory and run:

```bash
npm install --save-dev selenium-webdriver chromedriver mocha chai
```

### Package Explanations:
- **selenium-webdriver**: Main Selenium library for browser automation
- **chromedriver**: Chrome browser driver (manages Chrome for testing)
- **mocha**: Test framework for organizing and running tests
- **chai**: Assertion library for test validations

---

## 🛠️ Step 2: Project Structure

Create the following folder structure:

```
OOTD/
├── tests/
│   ├── e2e/
│   │   ├── ootd.test.js          (Main test file)
│   │   └── helpers.js             (Helper functions)
│   └── test-data/
│       └── sample-shirt.jpg       (Test image for uploads)
└── package.json
```

---

## 📦 Step 3: Update package.json

Add this test script to your `package.json`:

```json
{
  "scripts": {
    "test": "mocha tests/e2e/*.test.js --timeout 30000",
    "test:watch": "mocha tests/e2e/*.test.js --watch --timeout 30000"
  }
}
```

---

## ⚙️ Step 4: ChromeDriver Setup

ChromeDriver is automatically managed by the `chromedriver` npm package. No manual download needed!

**Troubleshooting ChromeDriver Issues:**

If you get an error about ChromeDriver version mismatch:

```bash
# Check your Chrome version
# Chrome Menu → Help → About Google Chrome

# Install specific chromedriver version
npm install --save-dev chromedriver@<version-matching-your-chrome>
```

---

## 🏃 Step 5: Running the Tests

### Before Running Tests:
1. **Start Backend Server**:
   ```bash
   cd backend
   npm start
   # Should run on http://localhost:5000
   ```

2. **Start Frontend Server**:
   ```bash
   cd frontend
   npm run dev
   # Should run on http://localhost:3000
   ```

3. **Ensure Database is Running**:
   - PostgreSQL should be running
   - Database should have test data

### Run All Tests:
```bash
npm test
```

### Run Tests in Watch Mode (auto-rerun on changes):
```bash
npm run test:watch
```

### Run Specific Test File:
```bash
npx mocha tests/e2e/ootd.test.js --timeout 30000
```

---

## 🎯 What to Expect

When tests run, you'll see:
1. **Chrome browser opens automatically** (you can see it happening!)
2. **Test actions execute** (clicks, typing, navigation)
3. **Test results** in terminal (✓ for pass, ✗ for fail)
4. **Browser closes** after tests complete

**Example Output:**
```
  OOTD E2E Tests
    ✓ TC-01: User Login (3524ms)
    ✓ TC-02: Add Item to Closet (2156ms)
    ✓ TC-03: Generate Packing List (4892ms)
    ✓ TC-04: Toggle Laundry Status (1847ms)
    ✓ TC-05: Navigation Between Pages (1234ms)

  5 passing (14s)
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "ChromeDriver version mismatch"
**Solution**: Update chromedriver to match your Chrome version
```bash
npm install --save-dev chromedriver@latest
```

### Issue 2: "ECONNREFUSED localhost:3000"
**Solution**: Frontend server is not running. Start with `npm run dev`

### Issue 3: "Element not found"
**Solution**:
- Page may load slowly - increase timeout
- Element selector may be wrong - inspect element in Chrome DevTools

### Issue 4: Tests fail randomly
**Solution**: Add explicit waits in test code
```javascript
await driver.wait(until.elementLocated(By.id('element')), 5000);
```

### Issue 5: "Session not created"
**Solution**: Chrome browser not installed or wrong version
- Install/Update Chrome browser
- Match ChromeDriver version to Chrome version

---

## 📸 Headless Mode (Optional)

To run tests without opening browser window (faster, good for CI/CD):

```javascript
let options = new chrome.Options();
options.addArguments('--headless');
options.addArguments('--disable-gpu');
let driver = new Builder()
  .forBrowser('chrome')
  .setChromeOptions(options)
  .build();
```

---

## 🎓 Tips for Beginners

1. **Start Simple**: Run one test at a time first
2. **Watch It Run**: Don't use headless mode initially - watch what happens!
3. **Use Console Logs**: Add `console.log()` to debug test flow
4. **Take Screenshots**: Capture screenshots on failures (code in helpers.js)
5. **Read Error Messages**: Selenium errors are usually descriptive

---

## 📚 Useful Selenium Commands Reference

```javascript
// Navigation
await driver.get('http://localhost:3000/login');

// Finding Elements
await driver.findElement(By.id('email'));
await driver.findElement(By.className('login-btn'));
await driver.findElement(By.css('.nav-links a[href="/closet"]'));

// Interacting with Elements
await element.click();
await element.sendKeys('text to type');
await element.clear();

// Waiting
await driver.wait(until.elementLocated(By.id('id')), 5000);
await driver.sleep(1000); // Wait 1 second

// Getting Text/Attributes
let text = await element.getText();
let value = await element.getAttribute('value');

// Assertions (using Chai)
assert.equal(actualValue, expectedValue);
assert.include(text, 'expected substring');
```

---

## 🎬 Next Steps

1. ✅ Install all packages
2. ✅ Create test file structure
3. ✅ Start servers (backend & frontend)
4. ✅ Run your first test: `npm test`
5. ✅ Watch the magic happen! 🪄

Good luck with your testing! 🚀
