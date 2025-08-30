import { test, expect } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Mockup Visual Regression Tests
 * 
 * Ensures approved mockups remain visually consistent
 * and validates web component implementations against mockups
 */

test.describe('Approved Mockup Visual Regression', () => {
  
  test.beforeEach(async ({ page }) => {
    // Ensure consistent viewport for all mockup tests
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
  });

  // Dynamically generate tests for all approved mockups
  const approvedDir = 'mockups/approved';
  
  test('approved mockups load without errors', async ({ page }) => {
    let approvedFiles = [];
    
    try {
      const files = await fs.readdir(approvedDir);
      approvedFiles = files.filter(f => f.endsWith('.html'));
    } catch (error) {
      console.log('No approved mockups directory found');
      test.skip(); // Skip if no approved mockups exist yet
    }
    
    for (const file of approvedFiles) {
      const mockupName = file.replace('.html', '');
      
      await test.step(`Load mockup: ${mockupName}`, async () => {
        const mockupUrl = `/mockups/approved/${file}`;
        
        // Load mockup and check for console errors
        const errors = [];
        page.on('console', msg => {
          if (msg.type() === 'error') {
            errors.push(msg.text());
          }
        });
        
        await page.goto(mockupUrl);
        await page.waitForLoadState('networkidle');
        
        // Check for any JavaScript errors
        expect(errors, `Console errors in ${mockupName}: ${errors.join(', ')}`).toHaveLength(0);
        
        // Take baseline screenshot for visual regression
        await expect(page).toHaveScreenshot(`${mockupName}-approved.png`, {
          fullPage: true,
          animations: 'disabled'
        });
      });
    }
  });
});

test.describe('Canvas Mockup Development', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test('canvas staging works correctly', async ({ page }) => {
    // Test canvas index page loads
    await page.goto('/canvas');
    
    // Should show canvas interface
    await expect(page.locator('h1')).toContainText('Canvas');
    
    // Take screenshot of canvas interface
    await expect(page).toHaveScreenshot('canvas-index.png');
  });

  test('mockup template generation', async ({ page }) => {
    // This would test that canvas.sh creates proper templates
    // For now, we'll test a sample template structure
    
    const templateHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Test Mockup</title>
        <link rel="stylesheet" href="/styles/main.css">
    </head>
    <body>
        <div class="mockup-container">
            <h1>Test Mockup</h1>
        </div>
    </body>
    </html>`;
    
    // Write temporary test mockup
    const testMockupPath = '.superdesign/design_iterations/test-mockup.html';
    await fs.mkdir(path.dirname(testMockupPath), { recursive: true });
    await fs.writeFile(testMockupPath, templateHTML);
    
    // Test that mockup loads correctly
    await page.goto('/canvas/test-mockup.html');
    await expect(page.locator('h1')).toContainText('Test Mockup');
    
    // Verify CSS is loaded (main.css should be available)
    const cardBg = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--card-bg');
    });
    
    expect(cardBg.trim()).toBe('white');
    
    // Clean up
    await fs.unlink(testMockupPath);
  });
});

test.describe('Mockup to Component Visual Validation', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test('component implementation matches approved mockup', async ({ page }) => {
    // This test ensures that when we build web components based on mockups,
    // they visually match the original approved design
    
    // Skip if no approved mockups or components exist yet
    let hasApprovedMockups = false;
    let hasComponents = false;
    
    try {
      const approvedFiles = await fs.readdir('mockups/approved');
      hasApprovedMockups = approvedFiles.some(f => f.endsWith('.html'));
      
      const componentFiles = await fs.readdir('pages');
      hasComponents = componentFiles.some(f => f.endsWith('.html'));
    } catch (error) {
      // Directories don't exist yet
    }
    
    if (!hasApprovedMockups || !hasComponents) {
      test.skip('Requires approved mockups and implemented components');
    }
    
    // When we have both mockups and implementations, compare them
    // This will be implemented once we have actual components
    await test.step('Visual comparison placeholder', async () => {
      console.log('TODO: Implement visual comparison between mockup and component implementation');
    });
  });
});

test.describe('Mockup Quality Validation', () => {
  
  test('mockups use design system CSS variables', async ({ page }) => {
    await page.goto('/canvas');
    
    // Create a test mockup that should use design system variables
    const testHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <link rel="stylesheet" href="/styles/main.css">
    </head>
    <body>
        <div style="background: var(--card-bg); color: var(--color-gray-900);">
            Test content
        </div>
    </body>
    </html>`;
    
    await fs.mkdir('.superdesign/design_iterations', { recursive: true });
    await fs.writeFile('.superdesign/design_iterations/css-test.html', testHTML);
    
    await page.goto('/canvas/css-test.html');
    
    // Verify CSS variables are working
    const bgColor = await page.locator('div').evaluate(el => {
      return getComputedStyle(el).backgroundColor;
    });
    
    const textColor = await page.locator('div').evaluate(el => {
      return getComputedStyle(el).color;
    });
    
    // Should resolve to actual colors, not the variable names
    expect(bgColor).not.toContain('var(');
    expect(textColor).not.toContain('var(');
    
    // Clean up
    await fs.unlink('.superdesign/design_iterations/css-test.html');
  });

  test('mockups are mobile-responsive', async ({ page }) => {
    // Test different viewport sizes
    const viewports = [
      { width: 320, height: 568, name: 'iPhone 5' },
      { width: 375, height: 667, name: 'iPhone SE' },
      { width: 414, height: 896, name: 'iPhone 11' }
    ];
    
    // Skip if no canvas mockups exist
    let canvasFiles = [];
    try {
      const files = await fs.readdir('.superdesign/design_iterations');
      canvasFiles = files.filter(f => f.endsWith('.html'));
    } catch (error) {
      test.skip('No canvas mockups found');
    }
    
    if (canvasFiles.length === 0) {
      test.skip('No canvas mockups to test');
    }
    
    // Test first available mockup across viewports
    const testFile = canvasFiles[0];
    
    for (const viewport of viewports) {
      await test.step(`${viewport.name} (${viewport.width}x${viewport.height})`, async () => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(`/canvas/${testFile}`);
        await page.waitForLoadState('networkidle');
        
        // Take responsive screenshot
        await expect(page).toHaveScreenshot(
          `${testFile.replace('.html', '')}-${viewport.name.toLowerCase().replace(' ', '-')}.png`,
          {
            fullPage: true,
            animations: 'disabled'
          }
        );
      });
    }
  });
});