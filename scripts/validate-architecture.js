#!/usr/bin/env node

/**
 * Architecture Validation Tool
 * Enforces single source of truth for both HTML and CSS
 */

import { promises as fs } from 'fs';
import { execSync } from 'child_process';
import path from 'path';

class ArchitectureValidator {
  constructor() {
    this.violations = [];
  }

  async validate() {
    console.log('🏗️  Validating Architecture - Single Source of Truth');
    console.log('================================================\n');

    await this.validateCssSingleSourceOfTruth();
    await this.validateWebComponentUsage();
    await this.validateLayerDependencies();

    this.generateReport();
    
    return this.violations.length === 0;
  }

  async validateCssSingleSourceOfTruth() {
    console.log('🎨 Validating CSS Single Source of Truth...');
    
    // 1. Check main.css exists
    try {
      await fs.access('styles/main.css');
      console.log('   ✅ styles/main.css found');
    } catch {
      this.addViolation(
        'MISSING_MAIN_CSS',
        'styles/main.css',
        'Main CSS file missing - create styles/main.css as single source of truth'
      );
      return; // Can't continue without main.css
    }

    // 2. Check for inline CSS in components
    const componentFiles = await this.findFiles('components/**/*.js');
    for (const file of componentFiles) {
      await this.checkForInlineCSS(file);
    }

    // 3. Check for CSS duplication
    await this.checkForCSSduplication();
    
    console.log('   🔍 CSS validation complete\n');
  }

  async checkForInlineCSS(file) {
    const content = await fs.readFile(file, 'utf-8');
    
    const violations = [];
    
    // Patterns that indicate inline CSS
    const patterns = [
      { pattern: /style\s*=\s*["'][^"']*["']/g, name: 'style attribute' },
      { pattern: /<style[^>]*>[\s\S]*?<\/style>/g, name: '<style> tag' },
      { pattern: /\.style\./g, name: 'element.style usage' },
      { pattern: /\.innerHTML\s*=.*style/g, name: 'innerHTML with style' }
    ];

    for (const { pattern, name } of patterns) {
      const matches = content.match(pattern);
      if (matches) {
        violations.push(`${name}: ${matches.join(', ')}`);
      }
    }

    if (violations.length > 0) {
      this.addViolation(
        'INLINE_CSS_DETECTED',
        file,
        `Component contains inline CSS: ${violations.join('; ')}. Move all styles to styles/main.css`
      );
    }
  }

  async checkForCSSduplication() {
    const filesToCheck = await this.findFiles('**/*.{css,js,html}');
    const mainCssPath = 'styles/main.css';
    
    // Skip main.css and node_modules
    const files = filesToCheck.filter(f => 
      !f.includes('main.css') && 
      !f.includes('node_modules') &&
      !f.includes('.git')
    );

    const forbiddenPatterns = [
      { pattern: /\.card-compact\s*{/g, name: '.card-compact styles' },
      { pattern: /\.card-embedded\s*{/g, name: '.card-embedded styles' },
      { pattern: /\.card-standard\s*{/g, name: '.card-standard styles' },
      { pattern: /background:\s*var\(--card-bg\)/g, name: 'card background styles' }
    ];

    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8');
      
      for (const { pattern, name } of forbiddenPatterns) {
        if (pattern.test(content)) {
          this.addViolation(
            'CSS_DUPLICATION',
            file,
            `Duplicate component styles found: ${name}. Move to ${mainCssPath}`
          );
        }
      }
    }
  }

  async validateWebComponentUsage() {
    console.log('🔧 Validating Web Component Usage...');
    
    const pageFiles = await this.findFiles('{pages,workflows}/**/*.html');
    
    for (const file of pageFiles) {
      await this.checkForRawHTML(file);
    }
    
    console.log('   🔍 Web component validation complete\n');
  }

  async checkForRawHTML(file) {
    const content = await fs.readFile(file, 'utf-8');
    
    const forbiddenPatterns = [
      { pattern: /<div class="bg-white rounded-xl shadow-sm/g, name: 'Raw card HTML' },
      { pattern: /<div class="card-compact/g, name: 'Raw card-compact HTML' },
      { pattern: /<div class="card-embedded/g, name: 'Raw card-embedded HTML' },
      { pattern: /<div class="card-standard/g, name: 'Raw card-standard HTML' }
    ];

    for (const { pattern, name } of forbiddenPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        this.addViolation(
          'RAW_HTML_DETECTED',
          file,
          `${name} found. Replace with <card-compact>, <card-embedded>, or <card-standard> web components`
        );
      }
    }
  }

  async validateLayerDependencies() {
    console.log('🏛️  Validating Layer Dependencies...');
    
    // Layer 1 (Components) cannot reference Layer 2 or 3
    const componentFiles = await this.findFiles('components/**/*.js');
    for (const file of componentFiles) {
      const content = await fs.readFile(file, 'utf-8');
      
      if (content.includes('../pages/') || content.includes('../workflows/')) {
        this.addViolation(
          'LAYER_VIOLATION',
          file,
          'Layer 1 (Components) cannot reference Layer 2 (Pages) or Layer 3 (Workflows)'
        );
      }
    }
    
    console.log('   🔍 Layer validation complete\n');
  }

  addViolation(type, file, description) {
    this.violations.push({ type, file, description });
  }

  generateReport() {
    if (this.violations.length === 0) {
      console.log('✅ ARCHITECTURE VALIDATION PASSED');
      console.log('✅ Single source of truth maintained');
      console.log('✅ No inline CSS detected');
      console.log('✅ Web components properly used');
      console.log('✅ Layer dependencies correct\n');
      return;
    }

    console.log(`❌ ${this.violations.length} ARCHITECTURE VIOLATIONS FOUND:\n`);
    
    const groupedViolations = this.groupViolationsByType();
    
    for (const [type, violations] of groupedViolations) {
      console.log(`🚨 ${type} (${violations.length} violations):`);
      console.log('----------------------------------------');
      
      violations.forEach(violation => {
        console.log(`❌ ${violation.file}`);
        console.log(`   ${violation.description}\n`);
      });
    }
    
    console.log('================================================');
    console.log('🔧 FIXES REQUIRED:');
    console.log('1. Move all CSS to styles/main.css');
    console.log('2. Replace raw HTML with web components'); 
    console.log('3. Fix layer dependency violations');
    console.log('================================================\n');
  }

  groupViolationsByType() {
    const grouped = new Map();
    this.violations.forEach(violation => {
      if (!grouped.has(violation.type)) {
        grouped.set(violation.type, []);
      }
      grouped.get(violation.type).push(violation);
    });
    return grouped;
  }

  async findFiles(pattern) {
    try {
      const output = execSync(`find . -path "./${pattern}" -type f`, { encoding: 'utf8' });
      return output.trim().split('\n').filter(f => f && !f.includes('node_modules'));
    } catch {
      return [];
    }
  }
}

// CLI interface
if (process.argv[1].endsWith('validate-architecture.js')) {
  const validator = new ArchitectureValidator();
  
  validator.validate().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Validation failed:', error);
    process.exit(1);
  });
}