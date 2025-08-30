#!/usr/bin/env node

/**
 * Mockup Tools - Screenshot and Archive Automation
 * Integrates with Playwright for visual reference generation
 */

import { chromium } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';

class MockupTools {
  constructor() {
    this.browser = null;
  }

  async init() {
    this.browser = await chromium.launch();
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  /**
   * Take a reference screenshot of a mockup file
   */
  async takeScreenshot(mockupPath, outputPath, options = {}) {
    if (!this.browser) {
      throw new Error('Browser not initialized. Call init() first.');
    }

    const page = await this.browser.newPage();
    
    // Set consistent viewport for mockups
    await page.setViewportSize({ 
      width: options.width || 375, 
      height: options.height || 667 
    });

    try {
      // Determine URL based on file location
      let url;
      if (mockupPath.includes('approved/')) {
        const filename = path.basename(mockupPath);
        url = `http://localhost:3000/mockups/approved/${filename}`;
      } else if (mockupPath.includes('design_iterations/')) {
        const filename = path.basename(mockupPath);
        url = `http://localhost:3000/canvas/${filename}`;
      } else {
        // Assume it's a direct file path
        url = `file://${path.resolve(mockupPath)}`;
      }

      console.log(`📸 Taking screenshot: ${mockupPath} -> ${outputPath}`);
      console.log(`   URL: ${url}`);

      await page.goto(url, { waitUntil: 'networkidle' });
      
      // Wait for any animations to settle
      await page.waitForTimeout(500);

      // Take screenshot
      await page.screenshot({
        path: outputPath,
        fullPage: options.fullPage || true,
        animations: 'disabled',
        ...options
      });

      console.log(`✅ Screenshot saved: ${outputPath}`);
      
    } finally {
      await page.close();
    }
  }

  /**
   * Take multiple screenshots at different viewport sizes
   */
  async takeResponsiveScreenshots(mockupPath, baseOutputPath) {
    const viewports = [
      { width: 320, height: 568, suffix: 'mobile-small' },
      { width: 375, height: 667, suffix: 'mobile-medium' },
      { width: 414, height: 896, suffix: 'mobile-large' },
      { width: 768, height: 1024, suffix: 'tablet' }
    ];

    const baseName = path.parse(baseOutputPath).name;
    const dir = path.dirname(baseOutputPath);
    const ext = path.parse(baseOutputPath).ext;

    for (const viewport of viewports) {
      const outputPath = path.join(dir, `${baseName}-${viewport.suffix}${ext}`);
      
      await this.takeScreenshot(mockupPath, outputPath, {
        width: viewport.width,
        height: viewport.height,
        fullPage: true
      });
    }
  }

  /**
   * Archive a mockup with automatic screenshot generation
   */
  async archiveMockup(sourcePath, archiveName) {
    // Ensure directories exist
    await fs.mkdir('mockups/approved', { recursive: true });
    await fs.mkdir('mockups/screenshots', { recursive: true });

    // Copy mockup to approved directory
    const approvedPath = `mockups/approved/${archiveName}.html`;
    await fs.copyFile(sourcePath, approvedPath);

    console.log(`✅ Archived mockup: ${approvedPath}`);

    // Generate reference screenshot
    const screenshotPath = `mockups/screenshots/${archiveName}.png`;
    await this.takeScreenshot(approvedPath, screenshotPath);

    // Generate responsive screenshots
    await this.takeResponsiveScreenshots(approvedPath, `mockups/screenshots/${archiveName}-responsive.png`);

    return {
      approved: approvedPath,
      screenshot: screenshotPath,
      mockupName: archiveName
    };
  }

  /**
   * Compare two mockups visually
   */
  async compareMockups(mockup1Path, mockup2Path, outputDiffPath) {
    if (!this.browser) {
      throw new Error('Browser not initialized. Call init() first.');
    }

    console.log(`🔍 Comparing: ${mockup1Path} vs ${mockup2Path}`);

    // Take screenshots of both mockups
    const temp1 = 'temp-comparison-1.png';
    const temp2 = 'temp-comparison-2.png';

    await this.takeScreenshot(mockup1Path, temp1);
    await this.takeScreenshot(mockup2Path, temp2);

    // TODO: Implement actual visual diffing
    // For now, just copy one of the screenshots as placeholder
    await fs.copyFile(temp1, outputDiffPath);

    // Clean up temp files
    await fs.unlink(temp1);
    await fs.unlink(temp2);

    console.log(`📊 Visual diff saved: ${outputDiffPath}`);
    console.log(`   Note: Full visual diff implementation pending`);
  }

  /**
   * Validate all approved mockups still load correctly
   */
  async validateApprovedMockups() {
    const approvedDir = 'mockups/approved';
    let files = [];
    
    try {
      files = await fs.readdir(approvedDir);
    } catch (error) {
      console.log('No approved mockups directory found');
      return { valid: true, errors: [] };
    }

    const htmlFiles = files.filter(f => f.endsWith('.html'));
    const errors = [];

    console.log(`🔍 Validating ${htmlFiles.length} approved mockups...`);

    for (const file of htmlFiles) {
      try {
        const mockupPath = path.join(approvedDir, file);
        const tempScreenshot = `temp-validation-${file.replace('.html', '.png')}`;
        
        await this.takeScreenshot(mockupPath, tempScreenshot);
        
        // Clean up temp screenshot
        await fs.unlink(tempScreenshot);
        
        console.log(`   ✅ ${file}`);
      } catch (error) {
        errors.push({ file, error: error.message });
        console.log(`   ❌ ${file}: ${error.message}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      total: htmlFiles.length,
      passed: htmlFiles.length - errors.length
    };
  }
}

// CLI interface
async function main() {
  const command = process.argv[2];
  const tools = new MockupTools();

  try {
    await tools.init();

    switch (command) {
      case 'screenshot':
        const mockupFile = process.argv[3];
        const outputFile = process.argv[4] || `${path.parse(mockupFile).name}.png`;
        
        if (!mockupFile) {
          console.error('Usage: node mockup-tools.js screenshot <mockup-file> [output-file]');
          process.exit(1);
        }
        
        await tools.takeScreenshot(mockupFile, outputFile);
        break;

      case 'archive':
        const sourceFile = process.argv[3];
        const archiveName = process.argv[4];
        
        if (!sourceFile || !archiveName) {
          console.error('Usage: node mockup-tools.js archive <source-file> <archive-name>');
          process.exit(1);
        }
        
        await tools.archiveMockup(sourceFile, archiveName);
        break;

      case 'compare':
        const file1 = process.argv[3];
        const file2 = process.argv[4];
        const diffFile = process.argv[5] || 'comparison-diff.png';
        
        if (!file1 || !file2) {
          console.error('Usage: node mockup-tools.js compare <file1> <file2> [diff-output]');
          process.exit(1);
        }
        
        await tools.compareMockups(file1, file2, diffFile);
        break;

      case 'validate':
        const result = await tools.validateApprovedMockups();
        
        if (result.valid) {
          console.log(`✅ All ${result.total} approved mockups are valid`);
          process.exit(0);
        } else {
          console.log(`❌ ${result.errors.length}/${result.total} mockups failed validation`);
          result.errors.forEach(({ file, error }) => {
            console.log(`   ${file}: ${error}`);
          });
          process.exit(1);
        }
        break;

      default:
        console.log('Mockup Tools');
        console.log('============');
        console.log('');
        console.log('Usage: node mockup-tools.js <command> [options]');
        console.log('');
        console.log('Commands:');
        console.log('  screenshot <mockup-file> [output]  Take reference screenshot');
        console.log('  archive <source> <name>            Archive mockup with screenshots');
        console.log('  compare <file1> <file2> [output]   Visual comparison');
        console.log('  validate                           Validate all approved mockups');
        console.log('');
        process.exit(command ? 1 : 0);
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await tools.close();
  }
}

// Run CLI if called directly
if (process.argv[1].endsWith('mockup-tools.js')) {
  main();
}

export default MockupTools;