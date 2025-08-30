#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class CSSTokenValidator {
  constructor(basePath = process.cwd()) {
    this.basePath = basePath;
    this.mainCSSPath = path.join(basePath, 'styles/main.css');
    this.tokens = new Map();
    this.violations = [];
  }

  async validateTokens() {
    console.log('🎨 Validating CSS tokens and design system consistency...');
    
    // Extract tokens from main.css
    await this.extractTokens();
    
    // Validate token usage across components
    await this.validateTokenUsage();
    
    // Check for hardcoded values
    await this.checkHardcodedValues();
    
    // Validate BEM naming consistency  
    await this.validateBEMNaming();
    
    this.printResults();
    
    return {
      tokensFound: this.tokens.size,
      violations: this.violations.length,
      issues: this.violations
    };
  }

  async extractTokens() {
    if (!fs.existsSync(this.mainCSSPath)) {
      this.violations.push({
        type: 'missing-file',
        message: 'styles/main.css not found',
        severity: 'error'
      });
      return;
    }
    
    const cssContent = fs.readFileSync(this.mainCSSPath, 'utf8');
    
    // Extract CSS custom properties (tokens)
    const tokenMatches = cssContent.match(/--[a-zA-Z0-9-]+:\s*[^;]+/g) || [];
    
    tokenMatches.forEach(token => {
      const [name, value] = token.split(':').map(s => s.trim());
      this.tokens.set(name, {
        value: value.replace(/;$/, ''),
        usageCount: 0,
        category: this.categorizeToken(name)
      });
    });
    
    console.log(`   🎯 Found ${this.tokens.size} design tokens`);
  }

  categorizeToken(tokenName) {
    if (tokenName.includes('color')) return 'color';
    if (tokenName.includes('spacing') || tokenName.includes('margin') || tokenName.includes('padding')) return 'spacing';
    if (tokenName.includes('font')) return 'typography';
    if (tokenName.includes('radius') || tokenName.includes('border')) return 'border';
    if (tokenName.includes('shadow')) return 'shadow';
    if (tokenName.includes('size') || tokenName.includes('width') || tokenName.includes('height')) return 'size';
    return 'other';
  }

  async validateTokenUsage() {
    // Find all CSS and HTML files
    const cssFiles = await this.findFiles('**/*.css', { exclude: ['node_modules', 'tests'] });
    const htmlFiles = await this.findFiles('**/*.html', { exclude: ['node_modules', 'tests'] });
    const jsFiles = await this.findFiles('**/*.js', { exclude: ['node_modules', 'tests'] });
    
    // Check token usage in all files
    [...cssFiles, ...htmlFiles, ...jsFiles].forEach(file => {
      this.checkTokenUsageInFile(file);
    });
    
    // Find unused tokens
    const unusedTokens = Array.from(this.tokens.entries())
      .filter(([name, data]) => data.usageCount === 0);
    
    if (unusedTokens.length > 0) {
      this.violations.push({
        type: 'unused-tokens',
        message: `${unusedTokens.length} unused design tokens`,
        severity: 'warning',
        details: unusedTokens.map(([name]) => name)
      });
    }
  }

  async findFiles(pattern, options = {}) {
    const { glob } = await import('glob');
    const files = await glob(pattern, { 
      cwd: this.basePath,
      ignore: options.exclude || []
    });
    return files.map(file => path.join(this.basePath, file));
  }

  checkTokenUsageInFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    
    const content = fs.readFileSync(filePath, 'utf8');
    const relativeFile = path.relative(this.basePath, filePath);
    
    // Count token usage
    this.tokens.forEach((data, tokenName) => {
      const regex = new RegExp(`var\\(${tokenName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g');
      const matches = content.match(regex) || [];
      data.usageCount += matches.length;
    });
    
    // Check for var() usage without tokens in our system
    const varUsage = content.match(/var\((--[a-zA-Z0-9-]+)/g) || [];
    varUsage.forEach(usage => {
      const tokenName = usage.match(/var\((--[a-zA-Z0-9-]+)/)[1];
      if (!this.tokens.has(tokenName)) {
        this.violations.push({
          type: 'unknown-token',
          message: `Unknown token ${tokenName} used`,
          severity: 'error',
          file: relativeFile,
          token: tokenName
        });
      }
    });
  }

  async checkHardcodedValues() {
    console.log('   🔍 Checking for hardcoded values...');
    
    const cssFiles = await this.findFiles('**/*.css', { exclude: ['node_modules', 'tests', 'styles/main.css'] });
    const jsFiles = await this.findFiles('components/**/*.js');
    
    const hardcodedPatterns = [
      { pattern: /#[0-9a-fA-F]{3,6}/, type: 'color', suggestion: 'Use --color-* tokens' },
      { pattern: /\b\d+px\b/, type: 'size', suggestion: 'Use --spacing-* or --size-* tokens' },
      { pattern: /\b\d+rem\b/, type: 'size', suggestion: 'Use --spacing-* tokens' },
      { pattern: /rgba?\(\d+,\s*\d+,\s*\d+/, type: 'color', suggestion: 'Use --color-* tokens' },
      { pattern: /font-family:\s*[^v]/, type: 'font', suggestion: 'Use --font-family-* tokens' }
    ];
    
    [...cssFiles, ...jsFiles].forEach(file => {
      this.checkHardcodedInFile(file, hardcodedPatterns);
    });
  }

  checkHardcodedInFile(filePath, patterns) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativeFile = path.relative(this.basePath, filePath);
    const lines = content.split('\n');
    
    patterns.forEach(({ pattern, type, suggestion }) => {
      lines.forEach((line, index) => {
        if (pattern.test(line) && !line.includes('var(--')) {
          // Skip comments and certain exceptions
          if (line.trim().startsWith('//') || line.trim().startsWith('/*')) return;
          if (line.includes('fallback') || line.includes('default')) return;
          
          this.violations.push({
            type: 'hardcoded-value',
            message: `Hardcoded ${type} value found`,
            severity: 'warning',
            file: relativeFile,
            line: index + 1,
            content: line.trim(),
            suggestion
          });
        }
      });
    });
  }

  async validateBEMNaming() {
    console.log('   🏗️ Validating BEM naming consistency...');
    
    const cssFiles = await this.findFiles('**/*.css', { exclude: ['node_modules', 'tests'] });
    const htmlFiles = await this.findFiles('**/*.html', { exclude: ['node_modules', 'tests'] });
    const jsFiles = await this.findFiles('components/**/*.js');
    
    const bemClasses = new Set();
    const invalidClasses = [];
    
    // Extract all class names
    [...cssFiles, ...htmlFiles, ...jsFiles].forEach(file => {
      this.extractBEMClasses(file, bemClasses, invalidClasses);
    });
    
    // Check for BEM violations
    invalidClasses.forEach(({ file, className, line }) => {
      this.violations.push({
        type: 'bem-violation',
        message: `Invalid BEM class name: ${className}`,
        severity: 'error',
        file,
        line,
        suggestion: 'Use block__element or block--modifier naming'
      });
    });
    
    console.log(`   📝 Found ${bemClasses.size} BEM classes`);
  }

  extractBEMClasses(filePath, bemClasses, invalidClasses) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativeFile = path.relative(this.basePath, filePath);
    const lines = content.split('\n');
    
    // Patterns to find class names
    const patterns = [
      /class="([^"]+)"/g,           // HTML class attributes
      /className\s*=\s*["']([^"']+)["']/g,  // JS className
      /\.([a-zA-Z][a-zA-Z0-9_-]*)/g,       // CSS selectors
    ];
    
    lines.forEach((line, index) => {
      patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(line)) !== null) {
          const classes = match[1].split(/\s+/);
          
          classes.forEach(className => {
            if (className && className.length > 0) {
              bemClasses.add(className);
              
              // Validate BEM naming
              if (!this.isValidBEMClass(className)) {
                invalidClasses.push({
                  file: relativeFile,
                  className,
                  line: index + 1
                });
              }
            }
          });
        }
      });
    });
  }

  isValidBEMClass(className) {
    // Skip utility classes, state classes, and framework classes
    if (className.startsWith('is-') || 
        className.startsWith('has-') ||
        className.startsWith('js-') ||
        className.length <= 2 ||
        /^[a-z]+$/.test(className) && className.length <= 4) {
      return true;
    }
    
    // Valid BEM patterns:
    // block
    // block__element
    // block--modifier
    // block__element--modifier
    const bemPattern = /^[a-z][a-z0-9-]*(__[a-z][a-z0-9-]*)?(--[a-z][a-z0-9-]*)?$/;
    return bemPattern.test(className);
  }

  generateTokenReport() {
    console.log('   📊 Generating token usage report...');
    
    const categories = {};
    this.tokens.forEach((data, name) => {
      if (!categories[data.category]) {
        categories[data.category] = [];
      }
      categories[data.category].push({ name, ...data });
    });
    
    return {
      summary: {
        totalTokens: this.tokens.size,
        categories: Object.keys(categories).length,
        mostUsedToken: this.getMostUsedToken(),
        leastUsedTokens: this.getLeastUsedTokens()
      },
      byCategory: categories
    };
  }

  getMostUsedToken() {
    let mostUsed = { name: null, count: 0 };
    this.tokens.forEach((data, name) => {
      if (data.usageCount > mostUsed.count) {
        mostUsed = { name, count: data.usageCount };
      }
    });
    return mostUsed;
  }

  getLeastUsedTokens() {
    return Array.from(this.tokens.entries())
      .filter(([name, data]) => data.usageCount <= 1)
      .map(([name, data]) => ({ name, count: data.usageCount }));
  }

  printResults() {
    console.log('\n🎨 CSS Token Validation Results:');
    console.log('==================================');
    
    const categories = ['error', 'warning'];
    const summary = { error: 0, warning: 0 };
    
    categories.forEach(severity => {
      const issues = this.violations.filter(v => v.severity === severity);
      summary[severity] = issues.length;
      
      if (issues.length > 0) {
        console.log(`\n${severity === 'error' ? '❌' : '⚠️'} ${severity.toUpperCase()} (${issues.length}):`);
        
        const grouped = this.groupViolationsByType(issues);
        Object.entries(grouped).forEach(([type, violations]) => {
          console.log(`\n  ${type} (${violations.length}):`);
          violations.slice(0, 5).forEach(v => {
            if (v.file) {
              console.log(`    ${v.file}${v.line ? `:${v.line}` : ''} - ${v.message}`);
            } else {
              console.log(`    ${v.message}`);
            }
            if (v.suggestion) {
              console.log(`      💡 ${v.suggestion}`);
            }
          });
          if (violations.length > 5) {
            console.log(`    ... and ${violations.length - 5} more`);
          }
        });
      }
    });
    
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ ${this.tokens.size} design tokens found`);
    console.log(`   ❌ ${summary.error} errors`);
    console.log(`   ⚠️ ${summary.warning} warnings`);
    
    if (summary.error === 0 && summary.warning === 0) {
      console.log('\n🎉 All token validations passed!');
    }
  }

  groupViolationsByType(violations) {
    const grouped = {};
    violations.forEach(violation => {
      if (!grouped[violation.type]) {
        grouped[violation.type] = [];
      }
      grouped[violation.type].push(violation);
    });
    return grouped;
  }
}

// CLI interface
export async function validateTokens(options = {}) {
  const validator = new CSSTokenValidator();
  
  try {
    const results = await validator.validateTokens();
    
    if (options.report) {
      const report = validator.generateTokenReport();
      fs.writeFileSync('css-token-report.json', JSON.stringify(report, null, 2));
      console.log('\n📋 Token report saved to css-token-report.json');
    }
    
    // Exit with error if there are violations
    if (results.violations > 0) {
      process.exit(1);
    }
    
    return results;
  } catch (error) {
    console.error('❌ Token validation failed:', error.message);
    process.exit(1);
  }
}