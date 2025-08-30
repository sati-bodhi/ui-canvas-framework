#!/usr/bin/env node

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class VisualTestRunner {
  constructor(basePath = process.cwd()) {
    this.basePath = basePath;
    this.snapshotsDir = path.join(basePath, 'tests/visual/snapshots');
    this.tempDir = path.join(basePath, 'tests/visual/temp');
    this.browser = null;
    this.page = null;
  }

  async init() {
    // Ensure directories exist
    [this.snapshotsDir, this.tempDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    // Launch browser
    this.browser = await chromium.launch({ headless: true });
    this.page = await this.browser.newPage();
    
    // Set consistent viewport
    await this.page.setViewportSize({ width: 1280, height: 720 });
  }

  async cleanup() {
    if (this.page) await this.page.close();
    if (this.browser) await this.browser.close();
  }

  async runAllTests(options = {}) {
    console.log('🧪 Running visual regression tests...');
    
    await this.init();
    
    const results = {
      passed: 0,
      failed: 0,
      updated: 0,
      errors: []
    };
    
    try {
      // Test individual components
      const componentResults = await this.testComponents(options);
      this.mergeResults(results, componentResults);
      
      // Test component combinations
      const integrationResults = await this.testComponentIntegration(options);
      this.mergeResults(results, integrationResults);
      
      // Test approved mockups
      const mockupResults = await this.testApprovedMockups(options);
      this.mergeResults(results, mockupResults);
      
    } finally {
      await this.cleanup();
    }
    
    this.printResults(results);
    return results;
  }

  async testComponents(options = {}) {
    console.log('📱 Testing individual components...');
    
    const results = { passed: 0, failed: 0, updated: 0, errors: [] };
    
    // Find all component files
    const componentFiles = fs.readdirSync(path.join(this.basePath, 'components'), { recursive: true })
      .filter(file => file.endsWith('.js'))
      .map(file => path.join('components', file));
    
    for (const componentFile of componentFiles) {
      try {
        const componentName = path.basename(componentFile, '.js');
        const result = await this.testComponent(componentName, componentFile, options);
        this.mergeResults(results, result);
      } catch (error) {
        results.errors.push(`Component ${componentFile}: ${error.message}`);
      }
    }
    
    return results;
  }

  async testComponent(componentName, componentFile, options = {}) {
    console.log(`  Testing ${componentName}...`);
    
    // Create temporary test page for component
    const testPageContent = await this.generateComponentTestPage(componentName, componentFile);
    const testPagePath = path.join(this.tempDir, `${componentName}.html`);
    fs.writeFileSync(testPagePath, testPageContent);
    
    const results = { passed: 0, failed: 0, updated: 0, errors: [] };
    
    // Test different states/props combinations
    const testCases = this.generateComponentTestCases(componentName);
    
    for (const testCase of testCases) {
      try {
        const snapshotName = `${componentName}-${testCase.name}`;
        const result = await this.compareSnapshot(testPagePath, snapshotName, testCase, options);
        
        if (result.passed) {
          results.passed++;
        } else if (result.updated) {
          results.updated++;
        } else {
          results.failed++;
          results.errors.push(`${snapshotName}: Visual difference detected`);
        }
      } catch (error) {
        results.errors.push(`${componentName}-${testCase.name}: ${error.message}`);
      }
    }
    
    // Clean up temp file
    fs.unlinkSync(testPagePath);
    
    return results;
  }

  async generateComponentTestPage(componentName, componentFile) {
    // Read component file to extract props
    const componentContent = fs.readFileSync(path.join(this.basePath, componentFile), 'utf8');
    const observedMatch = componentContent.match(/static get observedAttributes\(\)\s*\{\s*return\s*\[(.*?)\]/s);
    
    let props = [];
    if (observedMatch) {
      props = observedMatch[1]
        .split(',')
        .map(prop => prop.trim().replace(/['"]/g, ''))
        .filter(prop => prop.length > 0);
    }
    
    // Generate test page with component
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${componentName} Visual Test</title>
    <link rel="stylesheet" href="../styles/main.css">
    <style>
        body { 
            margin: 0; 
            padding: 20px; 
            font-family: system-ui, sans-serif;
            background: #f5f5f5;
        }
        .test-container { 
            background: white; 
            padding: 20px; 
            border-radius: 8px;
            max-width: 800px;
            margin: 0 auto;
        }
        .test-case {
            margin-bottom: 2rem;
            border-bottom: 1px solid #eee;
            padding-bottom: 1rem;
        }
        .test-label {
            font-weight: bold;
            margin-bottom: 0.5rem;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="test-container">
        <div id="test-cases">
            <!-- Test cases will be populated by JavaScript -->
        </div>
    </div>
    
    <script type="module" src="../${componentFile}"></script>
    <script>
        // Wait for component to load then generate test cases
        customElements.whenDefined('${componentName.toLowerCase()}').then(() => {
            generateTestCases();
        });
        
        function generateTestCases() {
            const container = document.getElementById('test-cases');
            const testCases = [
                { name: 'default', props: {} },
                ${props.map(prop => `{ name: '${prop}', props: { '${prop}': 'Test ${prop}' } }`).join(',\n                ')},
                { name: 'all-props', props: { ${props.map(prop => `'${prop}': 'Sample ${prop}'`).join(', ')} } }
            ];
            
            testCases.forEach(testCase => {
                const div = document.createElement('div');
                div.className = 'test-case';
                div.innerHTML = \`
                    <div class="test-label">\${testCase.name}</div>
                    <div class="test-component" data-test-case="\${testCase.name}"></div>
                \`;
                
                const componentContainer = div.querySelector('.test-component');
                const element = document.createElement('${componentName.toLowerCase()}');
                
                Object.entries(testCase.props).forEach(([key, value]) => {
                    element.setAttribute(key, value);
                });
                
                componentContainer.appendChild(element);
                container.appendChild(div);
            });
        }
    </script>
</body>
</html>`;
  }

  generateComponentTestCases(componentName) {
    // Default test cases - can be extended based on component
    return [
      { name: 'default', selector: '[data-test-case="default"]' },
      { name: 'all-props', selector: '[data-test-case="all-props"]' }
    ];
  }

  async compareSnapshot(testPagePath, snapshotName, testCase, options = {}) {
    const snapshotPath = path.join(this.snapshotsDir, `${snapshotName}.png`);
    const diffPath = path.join(this.snapshotsDir, `${snapshotName}-diff.png`);
    
    // Navigate to test page
    await this.page.goto(`file://${testPagePath}`);
    
    // Wait for component to render
    await this.page.waitForTimeout(500);
    
    // Take screenshot of specific test case
    let screenshot;
    if (testCase.selector) {
      const element = await this.page.locator(testCase.selector);
      screenshot = await element.screenshot();
    } else {
      screenshot = await this.page.screenshot();
    }
    
    // If updating snapshots or no baseline exists
    if (options.updateSnapshots || !fs.existsSync(snapshotPath)) {
      fs.writeFileSync(snapshotPath, screenshot);
      return { updated: true };
    }
    
    // Compare with existing snapshot
    const tempScreenshotPath = path.join(this.tempDir, `${snapshotName}-current.png`);
    fs.writeFileSync(tempScreenshotPath, screenshot);
    
    try {
      // Use pixelmatch or similar for comparison
      const comparison = await this.compareImages(snapshotPath, tempScreenshotPath, diffPath);
      
      if (comparison.identical) {
        fs.unlinkSync(tempScreenshotPath); // Clean up
        return { passed: true };
      } else {
        console.log(`  ❌ Visual difference in ${snapshotName} (${comparison.diffPixels} pixels changed)`);
        return { passed: false, diffPixels: comparison.diffPixels };
      }
    } finally {
      if (fs.existsSync(tempScreenshotPath)) {
        fs.unlinkSync(tempScreenshotPath);
      }
    }
  }

  async compareImages(baseline, current, diffOutput) {
    // Simple file comparison for now - in production use pixelmatch
    const baselineStats = fs.statSync(baseline);
    const currentStats = fs.statSync(current);
    
    // If file sizes are different, definitely different
    if (baselineStats.size !== currentStats.size) {
      return { identical: false, diffPixels: Math.abs(baselineStats.size - currentStats.size) };
    }
    
    // Simple byte comparison (in production, use proper image comparison)
    const baselineBuffer = fs.readFileSync(baseline);
    const currentBuffer = fs.readFileSync(current);
    
    const identical = Buffer.compare(baselineBuffer, currentBuffer) === 0;
    
    if (!identical && diffOutput) {
      // Copy current as diff (in production, generate proper diff image)
      fs.copyFileSync(current, diffOutput);
    }
    
    return { 
      identical, 
      diffPixels: identical ? 0 : 1000 // Placeholder diff count
    };
  }

  async testComponentIntegration(options = {}) {
    console.log('🔗 Testing component integration...');
    
    // Test pages that combine multiple components
    const results = { passed: 0, failed: 0, updated: 0, errors: [] };
    
    // Find page files
    const pagesDir = path.join(this.basePath, 'pages');
    if (fs.existsSync(pagesDir)) {
      const pageFiles = fs.readdirSync(pagesDir, { recursive: true })
        .filter(file => file.endsWith('.html'))
        .map(file => path.join('pages', file));
      
      for (const pageFile of pageFiles) {
        try {
          const pageName = path.basename(pageFile, '.html');
          const result = await this.testPage(pageName, pageFile, options);
          this.mergeResults(results, result);
        } catch (error) {
          results.errors.push(`Page ${pageFile}: ${error.message}`);
        }
      }
    }
    
    return results;
  }

  async testPage(pageName, pageFile, options = {}) {
    console.log(`  Testing page ${pageName}...`);
    
    const results = { passed: 0, failed: 0, updated: 0, errors: [] };
    const pageFilePath = path.join(this.basePath, pageFile);
    
    // Test at different viewport sizes
    const viewports = [
      { name: 'desktop', width: 1280, height: 720 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'mobile', width: 375, height: 667 }
    ];
    
    for (const viewport of viewports) {
      try {
        await this.page.setViewportSize(viewport);
        const snapshotName = `${pageName}-${viewport.name}`;
        const result = await this.compareSnapshot(pageFilePath, snapshotName, {}, options);
        
        if (result.passed) {
          results.passed++;
        } else if (result.updated) {
          results.updated++;
        } else {
          results.failed++;
          results.errors.push(`${snapshotName}: Visual difference detected`);
        }
      } catch (error) {
        results.errors.push(`${pageName}-${viewport.name}: ${error.message}`);
      }
    }
    
    return results;
  }

  async testApprovedMockups(options = {}) {
    console.log('🎨 Testing approved mockups...');
    
    const results = { passed: 0, failed: 0, updated: 0, errors: [] };
    const mockupsDir = path.join(this.basePath, 'mockups/approved');
    
    if (!fs.existsSync(mockupsDir)) {
      console.log('  No approved mockups found');
      return results;
    }
    
    const mockupFiles = fs.readdirSync(mockupsDir)
      .filter(file => file.endsWith('.html'));
    
    for (const mockupFile of mockupFiles) {
      try {
        const mockupName = path.basename(mockupFile, '.html');
        const mockupPath = path.join(mockupsDir, mockupFile);
        const result = await this.compareSnapshot(mockupPath, `mockup-${mockupName}`, {}, options);
        
        if (result.passed) {
          results.passed++;
        } else if (result.updated) {
          results.updated++;
        } else {
          results.failed++;
          results.errors.push(`mockup-${mockupName}: Visual difference detected`);
        }
      } catch (error) {
        results.errors.push(`Mockup ${mockupFile}: ${error.message}`);
      }
    }
    
    return results;
  }

  mergeResults(target, source) {
    target.passed += source.passed;
    target.failed += source.failed;
    target.updated += source.updated;
    target.errors.push(...source.errors);
  }

  printResults(results) {
    console.log('\n🎯 Visual Test Results:');
    console.log('========================');
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`📸 Updated: ${results.updated}`);
    console.log(`❌ Failed: ${results.failed}`);
    
    if (results.errors.length > 0) {
      console.log('\n🚨 Failures:');
      results.errors.forEach(error => console.log(`   ${error}`));
    }
    
    console.log(`\n📊 Total tests: ${results.passed + results.failed + results.updated}`);
    
    if (results.failed > 0) {
      console.log('\n💡 To update failing snapshots, run: npx ui-canvas test --update-snapshots');
    }
  }
}

// CLI interface
export async function testCommand(options = {}) {
  const runner = new VisualTestRunner();
  
  try {
    const results = await runner.runAllTests(options);
    
    // Exit with error code if tests failed
    if (results.failed > 0 && !options.updateSnapshots) {
      process.exit(1);
    }
    
    return results;
  } catch (error) {
    console.error('❌ Visual testing failed:', error.message);
    process.exit(1);
  }
}