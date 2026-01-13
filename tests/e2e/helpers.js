/**
 * Helper Functions for Selenium Tests
 * Reusable utilities for OOTD E2E testing
 */

const { By, until } = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');

/**
 * Wait for element to be visible and clickable
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {By} locator - Element locator
 * @param {number} timeout - Timeout in milliseconds
 */
async function waitForElement(driver, locator, timeout = 5000) {
  await driver.wait(until.elementLocated(locator), timeout);
  const element = await driver.findElement(locator);
  await driver.wait(until.elementIsVisible(element), timeout);
  return element;
}

/**
 * Login helper function
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {string} baseUrl - Base URL of the application
 * @param {string} email - User email
 * @param {string} password - User password
 */
async function login(driver, baseUrl, email, password) {
  await driver.get(`${baseUrl}/login`);
  await driver.wait(until.elementLocated(By.css('input[type="email"]')), 5000);

  const emailInput = await driver.findElement(By.css('input[type="email"]'));
  const passwordInput = await driver.findElement(By.css('input[type="password"]'));

  await emailInput.clear();
  await emailInput.sendKeys(email);
  await passwordInput.clear();
  await passwordInput.sendKeys(password);

  const loginButton = await driver.findElement(By.css('button[type="submit"]'));
  await loginButton.click();

  // Wait for redirect
  await driver.wait(async () => {
    const currentUrl = await driver.getCurrentUrl();
    return !currentUrl.includes('/login');
  }, 10000);
}

/**
 * Take screenshot and save to file
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {string} filename - Name of the screenshot file
 */
async function takeScreenshot(driver, filename) {
  const screenshot = await driver.takeScreenshot();
  const dir = path.join(__dirname, '../../screenshots');

  // Create screenshots directory if it doesn't exist
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filepath = path.join(dir, `${filename}.png`);
  fs.writeFileSync(filepath, screenshot, 'base64');
  console.log(`📸 Screenshot saved: ${filepath}`);
  return filepath;
}

/**
 * Wait for page to finish loading
 * @param {WebDriver} driver - Selenium WebDriver instance
 */
async function waitForPageLoad(driver) {
  await driver.wait(async () => {
    const readyState = await driver.executeScript('return document.readyState');
    return readyState === 'complete';
  }, 10000);
}

/**
 * Scroll element into view
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {WebElement} element - Element to scroll to
 */
async function scrollToElement(driver, element) {
  await driver.executeScript('arguments[0].scrollIntoView(true);', element);
  await driver.sleep(500); // Wait for scroll animation
}

/**
 * Check if element exists (without throwing error)
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {By} locator - Element locator
 * @returns {boolean} - True if element exists, false otherwise
 */
async function elementExists(driver, locator) {
  try {
    await driver.findElement(locator);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Get all console logs from browser
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @returns {Array} - Array of log entries
 */
async function getBrowserLogs(driver) {
  try {
    const logs = await driver.manage().logs().get('browser');
    return logs.filter(log => log.level.name === 'SEVERE'); // Only errors
  } catch (e) {
    console.log('Could not fetch browser logs:', e.message);
    return [];
  }
}

/**
 * Clear local storage
 * @param {WebDriver} driver - Selenium WebDriver instance
 */
async function clearLocalStorage(driver) {
  await driver.executeScript('window.localStorage.clear();');
}

/**
 * Get current URL path (without domain)
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @returns {string} - URL path
 */
async function getCurrentPath(driver) {
  const url = await driver.getCurrentUrl();
  return new URL(url).pathname;
}

/**
 * Wait for element to disappear
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {By} locator - Element locator
 * @param {number} timeout - Timeout in milliseconds
 */
async function waitForElementToDisappear(driver, locator, timeout = 5000) {
  await driver.wait(async () => {
    try {
      const elements = await driver.findElements(locator);
      return elements.length === 0;
    } catch (e) {
      return true;
    }
  }, timeout);
}

/**
 * Click element with retry on failure
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {By} locator - Element locator
 * @param {number} retries - Number of retries
 */
async function clickWithRetry(driver, locator, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const element = await driver.findElement(locator);
      await element.click();
      return;
    } catch (e) {
      if (i === retries - 1) throw e;
      await driver.sleep(500);
    }
  }
}

/**
 * Wait for network idle (no pending requests)
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {number} timeout - Timeout in milliseconds
 */
async function waitForNetworkIdle(driver, timeout = 5000) {
  await driver.sleep(1000); // Simple approach - wait for typical request completion
}

/**
 * Get text content of element safely
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {By} locator - Element locator
 * @returns {string|null} - Text content or null if not found
 */
async function getTextSafe(driver, locator) {
  try {
    const element = await driver.findElement(locator);
    return await element.getText();
  } catch (e) {
    return null;
  }
}

/**
 * Navigate and wait for page load
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {string} url - URL to navigate to
 */
async function navigateTo(driver, url) {
  await driver.get(url);
  await waitForPageLoad(driver);
}

/**
 * Fill form field
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {By} locator - Element locator
 * @param {string} value - Value to enter
 */
async function fillField(driver, locator, value) {
  const element = await driver.findElement(locator);
  await element.clear();
  await element.sendKeys(value);
}

/**
 * Check if user is logged in by looking for authenticated elements
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {string} baseUrl - Base URL of the application
 * @returns {boolean} - True if logged in
 */
async function isLoggedIn(driver, baseUrl) {
  try {
    // Check for closet link which only appears when logged in
    const closetLink = await driver.findElement(By.css('a[href="/closet"]'));
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Logout user
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {string} baseUrl - Base URL of the application
 */
async function logout(driver, baseUrl) {
  await driver.get(`${baseUrl}/profile`);
  await driver.sleep(1000);

  try {
    const logoutBtn = await driver.findElement(
      By.xpath("//button[contains(text(), 'התנתק') or contains(text(), 'Logout')]")
    );
    await logoutBtn.click();
    await driver.sleep(2000);
  } catch (e) {
    // Clear localStorage as fallback
    await clearLocalStorage(driver);
    await driver.get(baseUrl);
  }
}

/**
 * Hover over element
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {WebElement} element - Element to hover over
 */
async function hoverElement(driver, element) {
  await driver.actions().move({ origin: element }).perform();
  await driver.sleep(300);
}

/**
 * Wait for modal to appear
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {number} timeout - Timeout in milliseconds
 */
async function waitForModal(driver, timeout = 5000) {
  await driver.wait(
    until.elementLocated(By.css('.modal-overlay, [class*="modal"], [role="dialog"]')),
    timeout
  );
}

/**
 * Close modal (by clicking close button or pressing Escape)
 * @param {WebDriver} driver - Selenium WebDriver instance
 */
async function closeModal(driver) {
  try {
    const closeBtn = await driver.findElement(
      By.css('.close-btn, button[class*="close"], button[aria-label="close"], .modal-close')
    );
    await closeBtn.click();
  } catch (e) {
    // Press Escape as fallback
    const { Key } = require('selenium-webdriver');
    await driver.findElement(By.css('body')).sendKeys(Key.ESCAPE);
  }
  await driver.sleep(500);
}

/**
 * Count elements matching locator
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {By} locator - Element locator
 * @returns {number} - Count of matching elements
 */
async function countElements(driver, locator) {
  const elements = await driver.findElements(locator);
  return elements.length;
}

/**
 * Generate unique test email
 * @returns {string} - Unique email address
 */
function generateTestEmail() {
  return `test_${Date.now()}@ootd.com`;
}

/**
 * Register new user
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {string} baseUrl - Base URL of the application
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} firstName - Optional first name
 * @param {string} lastName - Optional last name
 */
async function register(driver, baseUrl, email, password, firstName = 'Test', lastName = 'User') {
  await driver.get(`${baseUrl}/register`);
  await driver.wait(until.elementLocated(By.css('input[type="email"]')), 5000);

  const emailInput = await driver.findElement(By.css('input[type="email"]'));
  const passwordInput = await driver.findElement(By.css('input[type="password"]'));

  await emailInput.clear();
  await emailInput.sendKeys(email);
  await passwordInput.clear();
  await passwordInput.sendKeys(password);

  // Try to fill optional fields
  try {
    const fnInput = await driver.findElement(By.css('input[name="firstName"]'));
    await fnInput.sendKeys(firstName);
  } catch (e) {}

  try {
    const lnInput = await driver.findElement(By.css('input[name="lastName"]'));
    await lnInput.sendKeys(lastName);
  } catch (e) {}

  const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
  await submitBtn.click();

  await driver.wait(async () => {
    const currentUrl = await driver.getCurrentUrl();
    return !currentUrl.includes('/register');
  }, 10000);
}

module.exports = {
  waitForElement,
  login,
  takeScreenshot,
  waitForPageLoad,
  scrollToElement,
  elementExists,
  getBrowserLogs,
  clearLocalStorage,
  getCurrentPath,
  waitForElementToDisappear,
  clickWithRetry,
  waitForNetworkIdle,
  getTextSafe,
  navigateTo,
  fillField,
  isLoggedIn,
  logout,
  hoverElement,
  waitForModal,
  closeModal,
  countElements,
  generateTestEmail,
  register
};
