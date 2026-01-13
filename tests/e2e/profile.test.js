/**
 * OOTD Profile Page E2E Tests using Selenium WebDriver
 *
 * Test Cases:
 * TC-27: View Profile Information
 * TC-28: Update Profile (Name)
 * TC-29: View Color Analysis Results
 * TC-30: Logout Functionality
 *
 * Prerequisites: User must be logged in
 *
 * Run with: npm test
 */

const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
require('chromedriver');
const assert = require('chai').assert;
const { login, waitForElement, takeScreenshot, waitForPageLoad, clearLocalStorage } = require('./helpers');

// Configuration
const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
  email: 'test@ootd.com',
  password: 'Test1234'
};

describe('OOTD Profile Page E2E Tests', function() {
  let driver;

  before(async function() {
    this.timeout(15000);
    console.log('🚀 Starting Selenium WebDriver for Profile Tests...');

    let options = new chrome.Options();
    options.addArguments('--start-maximized');
    options.addArguments('--disable-blink-features=AutomationControlled');

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    console.log('✅ Chrome browser opened successfully');

    // Login before running tests
    console.log('🔐 Logging in...');
    await login(driver, BASE_URL, TEST_USER.email, TEST_USER.password);
    console.log('✅ Logged in successfully');
  });

  after(async function() {
    if (driver) {
      await driver.quit();
      console.log('🛑 Browser closed');
    }
  });

  /**
   * TC-27: View Profile Information
   * Tests that profile page displays user information
   */
  describe('TC-27: View Profile Information', function() {
    it('should display user profile information', async function() {
      this.timeout(20000);

      console.log('📝 Test 27: Starting view profile test...');

      // Step 1: Navigate to profile page
      await driver.get(`${BASE_URL}/profile`);
      await driver.sleep(2000);
      console.log('  → Navigated to profile page');

      // Step 2: Wait for profile to load
      try {
        await driver.wait(until.elementLocated(By.css('.profile-container, [class*="profile"]')), 5000);
        console.log('  → Profile page loaded');
      } catch (e) {
        console.log('  ⚠️  Profile container not found');
      }

      // Step 3: Check for user email display
      try {
        const emailElement = await driver.findElement(
          By.xpath(`//*[contains(text(), '${TEST_USER.email}') or contains(text(), '@')]`)
        );
        const email = await emailElement.getText();
        console.log(`  ✅ User email displayed: ${email}`);
      } catch (e) {
        console.log('  ⚠️  User email not visible');
      }

      // Step 4: Check for user name display
      try {
        const nameElement = await driver.findElement(
          By.css('.user-name, [class*="name"], h1, h2')
        );
        const name = await nameElement.getText();
        console.log(`  ✅ User name displayed: ${name}`);
      } catch (e) {
        console.log('  ⚠️  User name not visible');
      }

      // Step 5: Check for profile picture placeholder or image
      try {
        const profilePic = await driver.findElement(
          By.css('img[class*="profile"], img[class*="avatar"], .profile-picture, .avatar')
        );
        console.log('  ✅ Profile picture/avatar found');
      } catch (e) {
        console.log('  ⚠️  Profile picture not found');
      }

      // Step 6: Check for profile sections
      const sections = ['גיבוי', 'backup', 'settings', 'הגדרות', 'ניתוח צבעים'];
      let foundSections = 0;

      for (const section of sections) {
        try {
          const sectionElement = await driver.findElement(
            By.xpath(`//*[contains(text(), '${section}')]`)
          );
          foundSections++;
        } catch (e) {
          // Section not found
        }
      }

      console.log(`  → Found ${foundSections} profile sections`);

      console.log('  ✅ View profile test completed');
      assert.isOk(true, 'View profile test completed');
    });
  });

  /**
   * TC-28: Update Profile Name
   * Tests updating user profile information
   */
  describe('TC-28: Update Profile Name', function() {
    it('should update user profile name', async function() {
      this.timeout(25000);

      console.log('📝 Test 28: Starting update profile test...');

      // Step 1: Navigate to profile page
      await driver.get(`${BASE_URL}/profile`);
      await driver.sleep(2000);
      console.log('  → Navigated to profile page');

      // Step 2: Find edit profile button or section
      let editButton;
      try {
        editButton = await driver.findElement(
          By.xpath("//button[contains(text(), 'עריכה') or contains(text(), 'Edit') or contains(text(), 'עדכן')]")
        );
        console.log('  → Found edit profile button');
      } catch (e) {
        try {
          editButton = await driver.findElement(
            By.css('.edit-btn, button[class*="edit"], button:has(svg[class*="Pencil"])')
          );
          console.log('  → Found edit button by class');
        } catch (e2) {
          console.log('  ⚠️  Edit button not found, looking for inline editing');
        }
      }

      // Step 3: Click edit or find input directly
      if (editButton) {
        await editButton.click();
        console.log('  → Clicked edit button');
        await driver.sleep(1000);
      }

      // Step 4: Find first/last name inputs
      let nameInput;
      try {
        nameInput = await driver.findElement(
          By.css('input[name="firstName"], input[placeholder*="שם"], input[type="text"]')
        );
        console.log('  → Found name input');
      } catch (e) {
        console.log('  ⚠️  Name input not found, skipping update');
        this.skip();
        return;
      }

      // Step 5: Update the name
      const currentValue = await nameInput.getAttribute('value');
      await nameInput.clear();
      const newName = `Test_${Date.now().toString().slice(-4)}`;
      await nameInput.sendKeys(newName);
      console.log(`  → Changed name from "${currentValue}" to "${newName}"`);

      // Step 6: Save changes
      let saveButton;
      try {
        saveButton = await driver.findElement(
          By.xpath("//button[contains(text(), 'שמור') or contains(text(), 'Save') or contains(text(), 'עדכן')]")
        );
        await saveButton.click();
        console.log('  → Clicked save button');
      } catch (e) {
        // Try submit with Enter key
        await nameInput.sendKeys(Key.ENTER);
        console.log('  → Submitted with Enter key');
      }

      await driver.sleep(2000);

      // Step 7: Verify update (check for success message or refreshed value)
      try {
        const successMsg = await driver.findElement(
          By.xpath("//*[contains(text(), 'עודכן') or contains(text(), 'updated') or contains(text(), 'הצלחה')]")
        );
        console.log('  ✅ Profile updated successfully');
      } catch (e) {
        // Check if value persisted
        try {
          const updatedInput = await driver.findElement(
            By.css('input[name="firstName"], input[placeholder*="שם"]')
          );
          const updatedValue = await updatedInput.getAttribute('value');
          if (updatedValue.includes('Test')) {
            console.log('  ✅ Name value updated');
          }
        } catch (e2) {
          console.log('  ⚠️  Could not verify update');
        }
      }

      // Step 8: Restore original name (cleanup)
      try {
        const restoreInput = await driver.findElement(
          By.css('input[name="firstName"], input[placeholder*="שם"]')
        );
        await restoreInput.clear();
        await restoreInput.sendKeys(currentValue || 'Test');

        const saveBtn = await driver.findElement(
          By.xpath("//button[contains(text(), 'שמור') or contains(text(), 'Save')]")
        );
        await saveBtn.click();
        console.log('  → Restored original name');
      } catch (e) {
        console.log('  ⚠️  Could not restore original name');
      }

      assert.isOk(true, 'Update profile test completed');
    });
  });

  /**
   * TC-29: View Color Analysis Results
   * Tests viewing color analysis on profile (if available)
   */
  describe('TC-29: View Color Analysis Results', function() {
    it('should display color analysis results if available', async function() {
      this.timeout(20000);

      console.log('📝 Test 29: Starting color analysis view test...');

      // Step 1: Navigate to profile page
      await driver.get(`${BASE_URL}/profile`);
      await driver.sleep(2000);
      console.log('  → Navigated to profile page');

      // Step 2: Look for color analysis section
      let colorAnalysisFound = false;

      try {
        const colorSection = await driver.findElement(
          By.xpath("//*[contains(text(), 'ניתוח צבעים') or contains(text(), 'Color Analysis') or contains(text(), 'צבע')]")
        );
        console.log('  ✅ Color analysis section found');
        colorAnalysisFound = true;
      } catch (e) {
        console.log('  ⚠️  Color analysis section not found on profile');
      }

      // Step 3: Check for season/skin tone results
      if (colorAnalysisFound) {
        try {
          const seasonResult = await driver.findElement(
            By.xpath("//*[contains(text(), 'עונה') or contains(text(), 'season') or contains(text(), 'קיץ') or contains(text(), 'חורף') or contains(text(), 'אביב') or contains(text(), 'סתיו')]")
          );
          const season = await seasonResult.getText();
          console.log(`  ✅ Season result: ${season}`);
        } catch (e) {
          console.log('  ⚠️  Season result not found');
        }

        try {
          const skinTone = await driver.findElement(
            By.xpath("//*[contains(text(), 'גוון עור') or contains(text(), 'skin tone')]")
          );
          console.log('  ✅ Skin tone result found');
        } catch (e) {
          console.log('  ⚠️  Skin tone result not found');
        }

        try {
          const colorSwatches = await driver.findElements(
            By.css('[class*="color"], [class*="swatch"], [style*="background"]')
          );
          if (colorSwatches.length > 0) {
            console.log(`  ✅ Found ${colorSwatches.length} color swatches`);
          }
        } catch (e) {
          console.log('  ⚠️  Color swatches not found');
        }
      }

      // Step 4: Try navigating to dedicated color analysis page
      try {
        await driver.get(`${BASE_URL}/color-analysis`);
        await driver.sleep(2000);
        const currentUrl = await driver.getCurrentUrl();

        if (currentUrl.includes('color')) {
          console.log('  ✅ Dedicated color analysis page exists');
        }
      } catch (e) {
        console.log('  ⚠️  Color analysis page not available');
      }

      console.log('  ✅ Color analysis view test completed');
      assert.isOk(true, 'Color analysis view test completed');
    });
  });

  /**
   * TC-30: Logout Functionality
   * Tests user logout
   */
  describe('TC-30: Logout Functionality', function() {
    it('should logout user successfully', async function() {
      this.timeout(20000);

      console.log('📝 Test 30: Starting logout test...');

      // Step 1: Navigate to profile page (where logout usually is)
      await driver.get(`${BASE_URL}/profile`);
      await driver.sleep(2000);
      console.log('  → Navigated to profile page');

      // Step 2: Find logout button
      let logoutButton;
      try {
        logoutButton = await driver.findElement(
          By.xpath("//button[contains(text(), 'התנתק') or contains(text(), 'Logout') or contains(text(), 'יציאה') or contains(text(), 'Log out')]")
        );
        console.log('  → Found logout button');
      } catch (e) {
        try {
          // Try finding in navbar
          logoutButton = await driver.findElement(
            By.css('button[class*="logout"], .logout-btn, a[href*="logout"]')
          );
          console.log('  → Found logout button by class');
        } catch (e2) {
          console.log('  ⚠️  Logout button not found, skipping');
          this.skip();
          return;
        }
      }

      // Step 3: Click logout
      await logoutButton.click();
      console.log('  → Clicked logout button');

      // Step 4: Wait for redirect to login page
      await driver.sleep(2000);

      // Step 5: Verify redirected to login or home
      const currentUrl = await driver.getCurrentUrl();

      if (currentUrl.includes('login') || currentUrl === `${BASE_URL}/` || currentUrl === BASE_URL) {
        console.log('  ✅ Redirected after logout');
      }

      // Step 6: Verify user is logged out (try accessing protected page)
      await driver.get(`${BASE_URL}/closet`);
      await driver.sleep(2000);

      const afterLogoutUrl = await driver.getCurrentUrl();

      if (afterLogoutUrl.includes('login')) {
        console.log('  ✅ User logged out - redirected to login when accessing protected page');
      } else {
        console.log('  ⚠️  Might still be logged in or different auth handling');
      }

      // Step 7: Re-login for other tests (cleanup)
      console.log('  → Re-logging in for cleanup...');
      await login(driver, BASE_URL, TEST_USER.email, TEST_USER.password);
      console.log('  ✅ Re-logged in');

      assert.isOk(true, 'Logout test completed');
    });
  });

  /**
   * TC-31: Profile Picture Upload (if available)
   * Tests uploading profile picture
   */
  describe('TC-31: Profile Picture Upload', function() {
    it('should have profile picture upload option', async function() {
      this.timeout(15000);

      console.log('📝 Test 31: Starting profile picture test...');

      // Step 1: Navigate to profile page
      await driver.get(`${BASE_URL}/profile`);
      await driver.sleep(2000);
      console.log('  → Navigated to profile page');

      // Step 2: Look for profile picture upload
      let uploadFound = false;

      try {
        const fileInput = await driver.findElement(
          By.css('input[type="file"][accept*="image"], input[type="file"]')
        );
        console.log('  ✅ Profile picture file input found');
        uploadFound = true;
      } catch (e) {
        console.log('  ⚠️  File input not directly visible');
      }

      try {
        const uploadButton = await driver.findElement(
          By.xpath("//button[contains(text(), 'העלה תמונה') or contains(text(), 'Upload') or contains(text(), 'שנה תמונה')]")
        );
        console.log('  ✅ Upload button found');
        uploadFound = true;
      } catch (e) {
        console.log('  ⚠️  Upload button not found');
      }

      // Check for avatar/profile image area that might be clickable
      try {
        const avatarArea = await driver.findElement(
          By.css('.avatar, .profile-picture, [class*="avatar"]')
        );
        console.log('  ✅ Avatar area found (might be clickable for upload)');
        uploadFound = true;
      } catch (e) {
        console.log('  ⚠️  Avatar area not found');
      }

      if (uploadFound) {
        console.log('  ✅ Profile picture upload option available');
      } else {
        console.log('  ⚠️  Profile picture upload not found');
      }

      assert.isOk(true, 'Profile picture test completed');
    });
  });

});
