# Testing Quick Reference Guide 🚀

## 📦 Installation (One-Time Setup)

```bash
# Install all testing dependencies
npm install --save-dev selenium-webdriver chromedriver mocha chai
```

## 🏃 Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Run specific test file
npx mocha tests/e2e/ootd.test.js --timeout 30000
```

## 📝 Add to package.json

Add these scripts to your `package.json`:

```json
{
  "devDependencies": {
    "selenium-webdriver": "^4.16.0",
    "chromedriver": "^120.0.0",
    "mocha": "^10.2.0",
    "chai": "^4.3.10"
  },
  "scripts": {
    "test": "mocha tests/e2e/*.test.js --timeout 30000",
    "test:watch": "mocha tests/e2e/*.test.js --watch --timeout 30000"
  }
}
```

## ✅ Pre-Test Checklist

Before running tests, ensure:

- [ ] Backend server running (`cd backend && npm start`)
- [ ] Frontend server running (`cd frontend && npm run dev`)
- [ ] PostgreSQL database is running
- [ ] Test user exists: `test@ootd.com` / `Test1234`
- [ ] Chrome browser is installed
- [ ] You're in the project root directory

## 📋 Test Cases Summary

| ID | Test Case | Status |
|----|-----------|--------|
| TC-01 | User Login | ✅ Ready |
| TC-02 | Add Item to Closet | ✅ Ready |
| TC-03 | Generate Suggestions | ⚠️ Needs API Key |
| TC-04 | Toggle Laundry | ✅ Ready |
| TC-05 | Navigation | ✅ Ready |

## 🐛 Reporting Bugs

1. Copy template from `BUG_REPORT_TEMPLATE.md`
2. Fill in all sections
3. Create Work Item in Azure DevOps
4. Assign severity and priority

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `TEST_PLAN.md` | Complete test strategy with 10 test cases |
| `SELENIUM_SETUP_GUIDE.md` | Step-by-step installation guide |
| `tests/e2e/ootd.test.js` | 5 automated E2E tests |
| `tests/e2e/helpers.js` | Reusable test utilities |
| `BUG_REPORT_TEMPLATE.md` | Template for logging bugs |
| `TEST_SUMMARY_WIKI.md` | Complete test results & analysis |
| `tests/README.md` | Testing suite overview |

## 🎯 Quick Commands

```bash
# Install dependencies
npm install --save-dev selenium-webdriver chromedriver mocha chai

# Start backend (Terminal 1)
cd backend && npm start

# Start frontend (Terminal 2)
cd frontend && npm run dev

# Run tests (Terminal 3)
npm test

# Run with verbose output
npm test -- --reporter spec

# Run single test
npx mocha tests/e2e/ootd.test.js --grep "User Login"
```

## 🔧 Common Issues & Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| ChromeDriver mismatch | `npm install --save-dev chromedriver@latest` |
| ECONNREFUSED 3000 | Start frontend: `cd frontend && npm run dev` |
| ECONNREFUSED 5000 | Start backend: `cd backend && npm start` |
| Element not found | Add wait: `await driver.wait(until.elementLocated(...), 5000)` |
| Test timeout | Increase: `this.timeout(30000)` |

## 📊 Expected Output

When tests run successfully, you'll see:

```
  OOTD E2E Tests
    TC-01: User Login
      ✓ should login successfully and redirect to home page (3524ms)
    TC-02: Add Item to Closet
      ✓ should add a new item to the closet successfully (2156ms)
    TC-03: Generate Outfit Suggestions
      ✓ should generate outfit suggestions from AI (4892ms)
    TC-04: Toggle Laundry Status
      ✓ should toggle laundry status for an item (1847ms)
    TC-05: Navigation Between Pages
      ✓ should navigate between main pages successfully (1234ms)

  5 passing (14s)
```

## 🎓 Next Steps After Setup

1. ✅ Run tests to verify everything works
2. ✅ Read `TEST_PLAN.md` for full test scenarios
3. ✅ Practice using `BUG_REPORT_TEMPLATE.md` for any bugs found
4. ✅ Fill out `TEST_SUMMARY_WIKI.md` with your results
5. ✅ Add more test cases as you find edge cases
6. ✅ Set up automated testing in CI/CD pipeline

## 💡 Pro Tips

- **Watch tests run**: Don't use headless mode at first - watch the browser!
- **Start simple**: Run one test at a time initially
- **Use console.log()**: Add logs to understand test flow
- **Take screenshots**: Capture failures for debugging
- **Read error messages**: Selenium errors are usually clear

## 📞 Get Help

If stuck:
1. Check troubleshooting in `SELENIUM_SETUP_GUIDE.md`
2. Review test logs in terminal
3. Google the specific error message
4. Ask team members for help

---

**Remember**: Testing is an iterative process. Don't worry if tests fail at first - that's how we find bugs! 🐛➡️🔧➡️✅

Good luck with your testing! 🚀
