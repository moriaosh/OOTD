# OOTD Testing Suite 🧪

Welcome to the OOTD automated testing suite! This directory contains all End-to-End (E2E) tests using Selenium WebDriver.

## 📁 Directory Structure

```
tests/
├── e2e/
│   ├── ootd.test.js           # Core E2E tests (5 tests)
│   ├── registration.test.js   # Registration tests (4 tests)
│   ├── itemManagement.test.js # Item edit/delete tests (4 tests)
│   ├── backupRestore.test.js  # Backup & restore tests (4 tests)
│   ├── purchaseAdvisor.test.js # Purchase advisor tests (4 tests)
│   ├── favorites.test.js      # Favorites & outfit tests (5 tests)
│   ├── profile.test.js        # Profile page tests (5 tests)
│   └── helpers.js             # Reusable test utility functions
├── test-data/
│   └── sample-shirt.jpg       # Sample image for file upload tests
└── README.md                  # This file
```

**Total: 31 E2E Test Cases**

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install --save-dev selenium-webdriver chromedriver mocha chai
```

### 2. Start Servers
Terminal 1 (Backend):
```bash
cd backend
npm start
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

### 3. Run Tests
```bash
npm test
```

## 📋 Available Test Scripts

Add these to your `package.json`:

```json
{
  "scripts": {
    "test": "mocha tests/e2e/*.test.js --timeout 30000",
    "test:watch": "mocha tests/e2e/*.test.js --watch --timeout 30000",
    "test:verbose": "mocha tests/e2e/*.test.js --timeout 30000 --reporter spec"
  }
}
```

## 🧪 Test Cases Included

### Core Tests (ootd.test.js)

| Test ID | Name | Description |
|---------|------|-------------|
| TC-01 | User Login ✅ | Tests successful login flow and redirect to home page |
| TC-02 | Add Item to Closet ✅ | Tests adding a new clothing item with all required fields |
| TC-03 | Generate Outfit Suggestions 🤖 | Tests AI-powered outfit generation feature |
| TC-04 | Toggle Laundry Status 👕 | Tests marking items as in laundry and toggling back |
| TC-05 | Navigation Between Pages 🧭 | Tests all main navigation links work correctly |

### Registration Tests (registration.test.js)

| Test ID | Name | Description |
|---------|------|-------------|
| TC-06 | Valid Registration | Tests successful new user registration |
| TC-07 | Duplicate Email | Tests error handling for existing email |
| TC-08 | Invalid Email Format | Tests email validation |
| TC-09 | Weak Password | Tests password strength validation |

### Item Management Tests (itemManagement.test.js)

| Test ID | Name | Description |
|---------|------|-------------|
| TC-10 | Edit Item Details | Tests editing item's basic details |
| TC-11 | Edit Item Tags | Tests adding/removing tags from items |
| TC-12 | Delete Item | Tests removing item from closet |
| TC-13 | Laundry Visual Verification | Tests visual indicator for laundry status |

### Backup & Restore Tests (backupRestore.test.js)

| Test ID | Name | Description |
|---------|------|-------------|
| TC-14 | Backup Data Download | Tests downloading JSON backup from profile |
| TC-15 | Restore Data Interface | Tests restore upload interface |
| TC-16 | Bulk Upload Interface | Tests bulk upload from Excel feature |
| TC-17 | Wardrobe Statistics | Tests statistics display |

### Purchase Advisor Tests (purchaseAdvisor.test.js)

| Test ID | Name | Description |
|---------|------|-------------|
| TC-18 | Navigate to Purchase Advisor | Tests navigation to purchase advisor page |
| TC-19 | Submit Image for Analysis | Tests submitting image URL for AI analysis |
| TC-20 | View AI Recommendations | Tests display of AI recommendations |
| TC-21 | Error Handling | Tests handling of invalid inputs |

### Favorites Tests (favorites.test.js)

| Test ID | Name | Description |
|---------|------|-------------|
| TC-22 | Save Outfit from Suggestions | Tests saving outfit to favorites |
| TC-23 | View Saved Outfits | Tests viewing saved outfits on favorites page |
| TC-24 | Toggle Favorite Status | Tests marking outfit as favorite |
| TC-25 | Delete Saved Outfit | Tests removing outfit from favorites |
| TC-26 | Favorites Filtering | Tests filter/sort options |

### Profile Tests (profile.test.js)

| Test ID | Name | Description |
|---------|------|-------------|
| TC-27 | View Profile Information | Tests profile information display |
| TC-28 | Update Profile Name | Tests updating user profile |
| TC-29 | View Color Analysis | Tests color analysis results display |
| TC-30 | Logout Functionality | Tests user logout |
| TC-31 | Profile Picture Upload | Tests profile picture upload option |

## 📊 Current Test Results

```
  OOTD E2E Tests
    ✓ TC-01: User Login (3524ms)
    ✓ TC-02: Add Item to Closet (2156ms)
    ⚠ TC-03: Generate Outfit Suggestions (requires API key)
    ✓ TC-04: Toggle Laundry Status (1847ms)
    ✓ TC-05: Navigation Between Pages (1234ms)

  4 passing (14s)
  1 pending
```

## 🛠️ Helper Functions Available

Located in `helpers.js`:

- `waitForElement()` - Wait for element to be visible
- `login()` - Automated login helper
- `takeScreenshot()` - Capture screenshots
- `waitForPageLoad()` - Wait for page to fully load
- `scrollToElement()` - Scroll element into view
- `elementExists()` - Check if element exists
- `getBrowserLogs()` - Get browser console logs
- `clearLocalStorage()` - Clear local storage

**Usage Example**:
```javascript
const { login, takeScreenshot } = require('./helpers');

// Login helper
await login(driver, 'http://localhost:3000', 'test@ootd.com', 'Test1234');

// Screenshot on failure
if (testFailed) {
  await takeScreenshot(driver, 'test-failure');
}
```

## 🐛 Debugging Tests

### Enable Screenshots on Failure
Uncomment this code in `ootd.test.js`:

```javascript
afterEach(async function() {
  if (this.currentTest.state === 'failed') {
    const screenshot = await driver.takeScreenshot();
    const filename = `failure-${Date.now()}.png`;
    fs.writeFileSync(filename, screenshot, 'base64');
  }
});
```

### View Browser Console Logs
```javascript
const logs = await driver.manage().logs().get('browser');
console.log(logs);
```

### Slow Down Test Execution
```javascript
await driver.sleep(2000); // Wait 2 seconds
```

### Run Tests with Visible Browser
Make sure these lines are NOT in your code:
```javascript
// Don't use these for debugging:
// options.addArguments('--headless');
// options.addArguments('--disable-gpu');
```

## ⚙️ Configuration

### Test User Credentials
Default test user (create this user in your database):
```javascript
const TEST_USER = {
  email: 'test@ootd.com',
  password: 'Test1234',
  firstName: 'Test',
  lastName: 'User'
};
```

### URLs
```javascript
const BASE_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:5000';
```

### Timeouts
```javascript
this.timeout(15000); // 15 second timeout per test
```

## 🎯 Best Practices

1. **Always start with servers running** - Tests will fail if frontend/backend is down
2. **Use explicit waits** - Don't rely on `sleep()`, use `wait(until.elementLocated())`
3. **Clean test data** - Clear database between test runs for consistency
4. **Descriptive test names** - Make it clear what each test validates
5. **Independent tests** - Each test should be able to run standalone
6. **Handle async properly** - Always use `async/await`

## 📚 Documentation

- [Complete Test Plan](../TEST_PLAN.md) - All 10 test cases documented
- [Setup Guide](../SELENIUM_SETUP_GUIDE.md) - Detailed installation instructions
- [Bug Report Template](../BUG_REPORT_TEMPLATE.md) - How to report bugs
- [Test Summary Wiki](../TEST_SUMMARY_WIKI.md) - Test results and metrics

## 🆘 Troubleshooting

### "ECONNREFUSED localhost:3000"
**Problem**: Frontend is not running
**Solution**: Run `npm run dev` in frontend folder

### "ChromeDriver version mismatch"
**Problem**: Chrome browser version doesn't match driver
**Solution**:
```bash
npm install --save-dev chromedriver@latest
```

### "Element not found"
**Problem**: Element selector is wrong or page hasn't loaded
**Solution**:
1. Inspect element in Chrome DevTools
2. Use correct selector (id, class, css)
3. Add explicit wait: `await driver.wait(until.elementLocated(By.id('id')), 5000);`

### Tests pass locally but fail in CI
**Problem**: Different environment or timing issues
**Solution**:
1. Increase timeouts for CI environment
2. Use headless mode in CI
3. Add more explicit waits

## 🎓 Learning Resources

- [Selenium Documentation](https://www.selenium.dev/documentation/)
- [Mocha Documentation](https://mochajs.org/)
- [Chai Assertions](https://www.chaijs.com/)
- [WebDriver API](https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/)

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review test logs in terminal
3. Take screenshots to debug visually
4. Ask team for help with specific error messages

## 🚀 Next Steps

1. ✅ Run tests locally and verify they pass
2. ✅ Create test user account in database
3. ✅ Add sample clothing items to test closet
4. ✅ Document any bugs found using Bug Report Template
5. ✅ Add new test cases as features are added
6. ✅ Set up CI/CD to run tests automatically

Happy Testing! 🎉
