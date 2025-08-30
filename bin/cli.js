#!/usr/bin/env node

import { program } from 'commander';
import { fileURLToPath } from 'url';
import path from 'path';
import { execSync } from 'child_process';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scriptsDir = path.join(__dirname, '../scripts');

program
  .name('ui-canvas')
  .description('Three-Layer Architecture & Reusable Web Components Framework')
  .version('0.1.0');

// Canvas staging commands
const canvasCmd = program
  .command('canvas')
  .description('Canvas staging for SuperDesign mockups');

canvasCmd
  .command('stage <mockup>')
  .description('Stage mockup for development')
  .action((mockup) => {
    console.log('🎨 Staging mockup:', mockup);
    execSync(`bash ${scriptsDir}/canvas.sh stage "${mockup}"`, { stdio: 'inherit' });
  });

canvasCmd
  .command('list')
  .description('List staged mockups')
  .action(() => {
    execSync(`bash ${scriptsDir}/canvas.sh list`, { stdio: 'inherit' });
  });

canvasCmd
  .command('archive <file> <name>')
  .description('Archive approved mockup')
  .action((file, name) => {
    console.log('📁 Archiving:', file, 'as', name);
    execSync(`bash ${scriptsDir}/canvas.sh archive "${file}" "${name}"`, { stdio: 'inherit' });
  });

canvasCmd
  .command('clear')
  .description('Clear staging area')
  .action(() => {
    execSync(`bash ${scriptsDir}/canvas.sh clear`, { stdio: 'inherit' });
  });

canvasCmd
  .command('status')
  .description('Show canvas status')
  .action(() => {
    execSync(`bash ${scriptsDir}/canvas.sh status`, { stdio: 'inherit' });
  });

// Architecture validation
program
  .command('validate')
  .description('Validate three-layer architecture compliance')
  .action(() => {
    console.log('🔍 Validating architecture...');
    execSync(`node ${scriptsDir}/validate-architecture.js`, { stdio: 'inherit' });
  });

// Development server
program
  .command('serve')
  .description('Start development server with canvas preview')
  .option('-p, --port <port>', 'Port number', '3000')
  .action(() => {
    console.log('🚀 Starting development server...');
    execSync(`node ${scriptsDir}/dev-server.js`, { stdio: 'inherit' });
  });

// Screenshot command
program
  .command('screenshot <file>')
  .description('Take reference screenshot')
  .action((file) => {
    console.log('📸 Taking screenshot:', file);
    execSync(`node ${scriptsDir}/mockup-tools.js screenshot "${file}"`, { stdio: 'inherit' });
  });

// Initialize project
program
  .command('init')
  .argument('[project-name]', 'Project name')
  .description('Initialize three-layer architecture project (no AI prompts modified)')
  .action((projectName) => {
    console.log('🚀 Initializing UI Canvas Framework project...');
    if (projectName) {
      console.log(`📁 Project: ${projectName}`);
    }
    
    try {
      // Create directories
      execSync('mkdir -p components/cards components/sections pages workflows mockups/approved mockups/iterations mockups/screenshots styles', { stdio: 'inherit' });
      
      // Create basic files if they don't exist
      if (!fs.existsSync('styles/main.css')) {
        fs.writeFileSync('styles/main.css', `/* ${projectName || 'Project'} - Main CSS (Single Source of Truth) */\n\n/* Add your styles here */\n`);
      }
      
      if (!fs.existsSync('package.json')) {
        const packageJson = {
          name: projectName || 'ui-canvas-project',
          version: '1.0.0',
          scripts: {
            validate: 'npx ui-canvas validate',
            serve: 'npx ui-canvas serve',
            canvas: 'npx ui-canvas canvas'
          }
        };
        fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
      }
      
      console.log('✅ Project structure initialized');
      console.log('');
      console.log('📋 Next Steps:');
      console.log('1. Run: npx ui-canvas check-prompts    # Analyze your AI setup');
      console.log('2. Run: npx ui-canvas setup-prompts    # Choose AI integration');
      console.log('3. Run: npx ui-canvas validate         # Check architecture');
    } catch (error) {
      console.log('❌ Failed to initialize project:', error.message);
    }
  });

// AI prompt analysis
program
  .command('check-prompts')
  .description('Analyze current AI prompt setup and suggest integration options')
  .action(() => {
    console.log('🔍 AI Prompt Analysis');
    console.log('==================');
    console.log('');
    
    // Check if CLAUDE.md exists
    const claudePath = 'CLAUDE.md';
    if (fs.existsSync(claudePath)) {
      const content = fs.readFileSync(claudePath, 'utf8');
      
      // Check for SuperDesign indicators
      const hasSuperDesign = /superdesign|SuperDesign|Super Design/.test(content);
      const hasFramework = /three-layer|architecture|components\/cards/.test(content);
      
      if (hasSuperDesign) {
        console.log('✅ SuperDesign detected in CLAUDE.md');
        console.log(`   - Contains SuperDesign workflow definitions`);
        console.log(`   - File size: ${Math.round(content.length / 1024 * 10) / 10}KB`);
        console.log(`   - Compatible with UI Canvas Framework`);
      }
      
      if (hasFramework) {
        console.log('✅ Framework definitions detected in CLAUDE.md');
      }
      
      console.log('');
    } else {
      console.log('❌ No CLAUDE.md found');
      console.log('');
    }
    
    // Check for other AI config files
    const otherConfigs = ['.claude/CLAUDE.md', '.cursor/CLAUDE.md', 'system-prompt.md'];
    for (const config of otherConfigs) {
      if (fs.existsSync(config)) {
        console.log(`📄 Found AI config: ${config}`);
      }
    }
    
    console.log('📋 Integration Options:');
    console.log('');
    console.log('1. Keep Current Setup');
    console.log('   - Continue using existing configuration');
    console.log('   - Add framework commands manually when needed');
    console.log('');
    console.log('2. Framework Only Mode');
    console.log('   - Replace with production component workflow');
    console.log('   - ⚠️  Will backup existing files');
    console.log('');
    console.log('3. Integrated Mode (Recommended)');
    console.log('   - Context switching between SuperDesign + Framework');
    console.log('   - Preserves existing SuperDesign configuration');
    console.log('   - Automatic mode detection');
    console.log('');
    console.log('Choose integration: npx ui-canvas setup-prompts [1|2|3]');
  });

// AI prompt setup
program
  .command('setup-prompts')
  .argument('[mode]', 'Integration mode: 1=keep, 2=framework, 3=integrated')
  .description('Setup AI prompt integration')
  .action((mode) => {
    if (!mode) {
      console.log('❌ Please specify mode: npx ui-canvas setup-prompts [1|2|3]');
      console.log('Run "npx ui-canvas check-prompts" to see options');
      return;
    }
    
    const templateDir = path.join(__dirname, '../templates');
    
    switch (mode) {
      case '1':
        console.log('✅ Keeping current setup');
        console.log('💡 Framework commands available: npx ui-canvas validate, serve, canvas');
        break;
        
      case '2':
        console.log('🔧 Setting up Framework Only mode...');
        
        // Backup existing CLAUDE.md if it exists
        if (fs.existsSync('CLAUDE.md')) {
          fs.copyFileSync('CLAUDE.md', 'CLAUDE.md.backup');
          console.log('📦 Backed up existing CLAUDE.md → CLAUDE.md.backup');
        }
        
        // Copy framework template
        fs.copyFileSync(path.join(templateDir, 'CLAUDE-framework.md'), 'CLAUDE.md');
        console.log('✅ Framework mode configured');
        console.log('📁 AI workflow: CLAUDE.md (three-layer architecture)');
        break;
        
      case '3':
        console.log('🔧 Setting up Integrated mode...');
        
        // Handle existing CLAUDE.md with SuperDesign
        if (fs.existsSync('CLAUDE.md')) {
          const content = fs.readFileSync('CLAUDE.md', 'utf8');
          if (/superdesign|SuperDesign/.test(content)) {
            fs.copyFileSync('CLAUDE.md', 'CLAUDE-superdesign.md');
            console.log('📦 Moved SuperDesign config → CLAUDE-superdesign.md');
          } else {
            fs.copyFileSync('CLAUDE.md', 'CLAUDE.md.backup');
            console.log('📦 Backed up existing CLAUDE.md → CLAUDE.md.backup');
          }
        }
        
        // Copy templates
        fs.copyFileSync(path.join(templateDir, 'CLAUDE-integrated.md'), 'CLAUDE.md');
        fs.copyFileSync(path.join(templateDir, 'CLAUDE-framework.md'), 'CLAUDE-framework.md');
        
        console.log('✅ Integrated mode configured');
        console.log('📁 Context switching: CLAUDE.md');
        console.log('📁 SuperDesign workflow: CLAUDE-superdesign.md');
        console.log('📁 Framework workflow: CLAUDE-framework.md');
        break;
        
      default:
        console.log('❌ Invalid mode. Use 1, 2, or 3');
        return;
    }
    
    console.log('');
    console.log('🎉 Setup complete! Try:');
    console.log('- npx ui-canvas validate    # Check architecture');
    console.log('- npx ui-canvas serve       # Start dev server');
    console.log('- npx ui-canvas canvas stage mockup-name  # Create mockup');
  });

// Web components scaffolding
program
  .command('create-component')
  .description('Create a new web component')
  .argument('<name>', 'Component name (e.g., task-card)')
  .option('--layer <layer>', 'Architecture layer', 'component')
  .option('--props <props>', 'Comma-separated props list', '')
  .action(async (name, options) => {
    const { createComponent } = await import('../scripts/component-generator.js');
    await createComponent(name, options);
  });

// Initialize web components in project
program
  .command('init-components')
  .description('Set up web components infrastructure in project')
  .action(async () => {
    const { initializeWebComponents } = await import('../scripts/component-generator.js');
    await initializeWebComponents();
  });

program.parse();