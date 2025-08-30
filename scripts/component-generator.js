#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templatesDir = path.join(__dirname, '../templates');

export async function createComponent(name, options) {
  console.log(`🧩 Creating component: ${name}`);
  
  // Validate component name
  if (!name.includes('-')) {
    console.error('❌ Component name must contain a hyphen (e.g., my-component)');
    process.exit(1);
  }
  
  const layer = options.layer || 'component';
  const props = options.props ? options.props.split(',').map(p => p.trim()) : [];
  
  // Determine file paths
  let targetDir;
  switch (layer) {
    case 'component':
      targetDir = name.includes('card') ? 'components/cards' : 'components/sections';
      break;
    case 'page':
      targetDir = 'pages';
      break;
    case 'workflow':
      targetDir = 'workflows';
      break;
    default:
      console.error(`❌ Invalid layer: ${layer}. Use: component, page, workflow`);
      process.exit(1);
  }
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  // Generate component class name
  const className = name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
  
  // Create component file
  const componentPath = path.join(targetDir, `${name}.js`);
  const componentContent = generateComponentContent(name, className, props, layer);
  
  fs.writeFileSync(componentPath, componentContent);
  console.log(`✅ Created: ${componentPath}`);
  
  // Create HTML template for component references
  if (layer === 'component') {
    const templatePath = path.join(targetDir, `${name}.html`);
    const templateContent = generateHTMLTemplate(name, props);
    fs.writeFileSync(templatePath, templateContent);
    console.log(`✅ Created: ${templatePath}`);
  }
  
  console.log('');
  console.log('📋 Usage:');
  console.log(`<${name}${props.map(p => ` ${p}="value"`).join('')}></${name}>`);
  console.log('');
  console.log('🔧 Next steps:');
  console.log('1. Import and register the component');
  console.log('2. Add styles to styles/main.css');
  console.log('3. Test with: npx ui-canvas canvas stage ' + (layer === 'component' ? templatePath : componentPath));
}

export async function initializeWebComponents() {
  console.log('🚀 Initializing Web Components infrastructure...');
  
  // Copy web components framework
  const webComponentsDir = 'scripts/web-components';
  if (!fs.existsSync(webComponentsDir)) {
    fs.mkdirSync(webComponentsDir, { recursive: true });
  }
  
  // Copy framework files
  const frameworkFiles = [
    'web-components/index.js',
    'web-components/component-base.js', 
    'web-components/component-registry.js',
    'web-components/development-utils.js',
    'example-component.js'
  ];
  
  for (const file of frameworkFiles) {
    const srcPath = path.join(templatesDir, file);
    const destPath = path.join(webComponentsDir, path.basename(file));
    
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`✅ Copied: ${destPath}`);
    }
  }
  
  // Create main entry point
  const mainEntry = `/**
 * Web Components Entry Point
 * Import this to initialize the framework
 */

import { initWebComponents } from './web-components/index.js';

// Initialize framework
const framework = await initWebComponents({
  development: true,
  autoDiscover: false
});

console.log('🎯 Web Components Framework ready');
export { framework };
`;
  
  fs.writeFileSync('scripts/components.js', mainEntry);
  console.log('✅ Created: scripts/components.js');
  
  // Update package.json if it exists
  if (fs.existsSync('package.json')) {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    packageJson.scripts = packageJson.scripts || {};
    packageJson.scripts['create-component'] = 'npx ui-canvas create-component';
    packageJson.scripts['init-components'] = 'npx ui-canvas init-components';
    
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
    console.log('✅ Updated package.json scripts');
  }
  
  console.log('');
  console.log('🎉 Web Components infrastructure ready!');
  console.log('');
  console.log('📋 Quick start:');
  console.log('1. npx ui-canvas create-component my-card --props "title,content"');
  console.log('2. Add <script type="module" src="scripts/components.js"></script> to HTML');
  console.log('3. Use <my-card title="Hello" content="World"></my-card>');
}

function generateComponentContent(name, className, props, layer) {
  const propsArray = props.length > 0 ? `['${props.join("', '")}']` : '[]';
  
  return `/**
 * ${className} Component
 * Layer: ${layer}
 */

import { UICanvasComponent } from '../scripts/web-components/component-base.js';

export class ${className} extends UICanvasComponent {
  static get observedAttributes() {
    return ${propsArray};
  }

  initialize() {
    this.adoptGlobalStyles();
  }

  render() {
    this.shadowRoot.innerHTML = \`
      <div class="${name}">
        <h3>\${this.getProp('${props[0] || 'title'}', '${className}')}</h3>
        ${props.slice(1).map(prop => `<p>\${this.getProp('${prop}', 'Default ${prop}')}</p>`).join('\n        ')}
      </div>
    \`;
  }
}

// Register the component
customElements.define('${name}', ${className});
`;
}

function generateHTMLTemplate(name, props) {
  const propsComment = props.length > 0 
    ? `<!-- Props: ${props.join(', ')} -->`
    : '<!-- No props -->';
  
  return `${propsComment}
<div class="${name}">
  <h3>{{title}}</h3>
  ${props.slice(1).map(prop => `<p>{{${prop}}}</p>`).join('\n  ')}
</div>`;
}