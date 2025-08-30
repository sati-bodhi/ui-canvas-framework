import { test, expect } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Architecture Tests - Single Source of Truth Enforcement
 * 
 * These tests ensure:
 * 1. All components use main.css (no inline styles)
 * 2. No CSS duplication across files
 * 3. Web components only (no raw HTML cards)
 * 4. Three-layer architecture compliance
 */

test.describe('CSS Single Source of Truth', () => {
  
  test('No component should have inline CSS styles', async () => {
    const componentFiles = await findFiles('components/**/*.js');
    
    for (const file of componentFiles) {
      const content = await fs.readFile(file, 'utf-8');
      
      // Check for inline styles in template literals
      const inlineStylePatterns = [
        /style\s*=\s*["'][^"']*["']/g,        // style="..."
        /<style[^>]*>[\s\S]*?<\/style>/g,      // <style>...</style>
        /\.style\./g,                          // element.style.
        /style:\s*{/g,                         // style: { ... }
        /\.innerHTML\s*=.*style/g              // innerHTML with style
      ];
      
      for (const pattern of inlineStylePatterns) {
        const matches = content.match(pattern);
        if (matches) {
          throw new Error(
            `❌ INLINE CSS DETECTED in ${file}:\n` +
            `Violations: ${matches.join(', ')}\n` +
            `🔧 Fix: Use CSS classes from styles/main.css instead`
          );
        }
      }
    }
  });

  test('Only main.css should contain component styles', async () => {
    const allFiles = await findFiles('**/*.{css,js,html}');
    const mainCssPath = 'styles/main.css';
    
    // Skip main.css itself
    const filesToCheck = allFiles.filter(f => !f.includes('main.css'));
    
    const forbiddenCssPatterns = [
      /\.card-compact\s*{/g,
      /\.card-embedded\s*{/g, 
      /\.card-standard\s*{/g,
      /\.component-/g,
      /background:\s*var\(--card-bg\)/g,
      /border-radius:\s*var\(--card-radius\)/g
    ];
    
    for (const file of filesToCheck) {
      const content = await fs.readFile(file, 'utf-8');
      
      for (const pattern of forbiddenCssPatterns) {
        const matches = content.match(pattern);
        if (matches) {
          throw new Error(
            `❌ DUPLICATE CSS DETECTED in ${file}:\n` +
            `Component styles found: ${matches.join(', ')}\n` +
            `🔧 Fix: Move all component styles to ${mainCssPath}`
          );
        }
      }
    }
  });

  test('main.css must exist and contain all component styles', async () => {
    const mainCssPath = 'styles/main.css';
    
    // Check file exists
    try {
      await fs.access(mainCssPath);
    } catch {
      throw new Error(
        `❌ MISSING: ${mainCssPath}\n` +
        `🔧 Fix: Create styles/main.css with all component styles`
      );
    }
    
    const content = await fs.readFile(mainCssPath, 'utf-8');
    
    // Required component styles
    const requiredStyles = [
      '.card-compact',
      '.card-embedded', 
      '.card-standard',
      ':root'  // CSS variables
    ];
    
    for (const style of requiredStyles) {
      if (!content.includes(style)) {
        throw new Error(
          `❌ MISSING STYLE: ${style} not found in ${mainCssPath}\n` +
          `🔧 Fix: Add ${style} styles to main.css`
        );
      }
    }
  });
});

test.describe('Web Component Architecture', () => {
  
  test('All card elements must use web components (no raw HTML)', async () => {
    const pageFiles = await findFiles('{pages,workflows}/**/*.html');
    
    const forbiddenHtmlPatterns = [
      /<div class="bg-white rounded-xl shadow-sm/g,  // Raw card HTML
      /<div class="card-compact/g,                   // Should use <card-compact>
      /<div class="card-embedded/g,                  // Should use <card-embedded>
      /<div class="card-standard/g,                  // Should use <card-standard>
      /<div[^>]*class="[^"]*card[^"]*"/g            // Any div with card class
    ];
    
    for (const file of pageFiles) {
      const content = await fs.readFile(file, 'utf-8');
      
      for (const pattern of forbiddenHtmlPatterns) {
        const matches = content.match(pattern);
        if (matches) {
          throw new Error(
            `❌ RAW HTML CARD DETECTED in ${file}:\n` +
            `Violations: ${matches.join(', ')}\n` +
            `🔧 Fix: Replace with <card-compact>, <card-embedded>, or <card-standard>`
          );
        }
      }
    }
  });

  test('Web components must be properly registered', async () => {
    const componentFiles = await findFiles('components/**/*.js');
    
    for (const file of componentFiles) {
      const content = await fs.readFile(file, 'utf-8');
      
      // Check for proper web component structure
      const hasCustomElement = /extends HTMLElement/.test(content);
      const hasDefinition = /customElements\.define/.test(content);
      const hasConnectedCallback = /connectedCallback/.test(content);
      
      if (hasCustomElement) {
        if (!hasDefinition) {
          throw new Error(
            `❌ MISSING REGISTRATION: ${file}\n` +
            `Web component class found but no customElements.define()\n` +
            `🔧 Fix: Add customElements.define('tag-name', ClassName)`
          );
        }
        
        if (!hasConnectedCallback) {
          throw new Error(
            `❌ MISSING LIFECYCLE: ${file}\n` +
            `Web component without connectedCallback()\n` +
            `🔧 Fix: Add connectedCallback() method`
          );
        }
      }
    }
  });
});

test.describe('Three-Layer Architecture', () => {
  
  test('Layer dependencies are correct', async () => {
    // Layer 1 (Components) - should not reference other layers
    const componentFiles = await findFiles('components/**/*.js');
    for (const file of componentFiles) {
      const content = await fs.readFile(file, 'utf-8');
      
      if (content.includes('../pages/') || content.includes('../workflows/')) {
        throw new Error(
          `❌ LAYER VIOLATION: ${file}\n` +
          `Layer 1 (Components) cannot reference Layer 2 (Pages) or Layer 3 (Workflows)\n` +
          `🔧 Fix: Remove references to pages/ or workflows/`
        );
      }
    }
    
    // Layer 2 (Pages) - can reference components only
    const pageFiles = await findFiles('pages/**/*.html');
    for (const file of pageFiles) {
      const content = await fs.readFile(file, 'utf-8');
      
      if (content.includes('../workflows/')) {
        throw new Error(
          `❌ LAYER VIOLATION: ${file}\n` +
          `Layer 2 (Pages) cannot reference Layer 3 (Workflows)\n` +
          `🔧 Fix: Remove references to workflows/`
        );
      }
    }
  });
});

// Helper function to find files with glob patterns
async function findFiles(pattern) {
  // Simple implementation - in real usage, use a proper glob library
  const { execSync } = await import('child_process');
  try {
    const output = execSync(`find . -path "./${pattern}" -type f`, { encoding: 'utf8' });
    return output.trim().split('\n').filter(f => f && !f.includes('node_modules'));
  } catch {
    return [];
  }
}