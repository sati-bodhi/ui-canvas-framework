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
  
  // Generate CSS template to add to main.css
  const cssContent = generateComponentCSS(name, props, layer);
  const cssPath = path.join(targetDir, `${name}.css`);
  fs.writeFileSync(cssPath, cssContent);
  console.log(`✅ Created: ${cssPath} (add to styles/main.css)`);
  
  console.log('');
  console.log('📋 Usage:');
  console.log(`<${name}${props.map(p => ` ${p}="value"`).join('')}></${name}>`);
  console.log('');
  console.log('🔧 Next steps:');
  console.log('1. Import component: <script src="' + componentPath + '"></script>');
  console.log('2. Add CSS from ' + cssPath + ' to styles/main.css');
  if (layer === 'component') {
    const templatePath = path.join(targetDir, `${name}.html`);
    console.log('3. Test with: npx ui-canvas canvas stage ' + templatePath);
  } else {
    console.log('3. Test with: npx ui-canvas canvas stage ' + componentPath);
  }
}

// Generate BEM-compliant CSS for the component
function generateComponentCSS(name, props, layer) {
  const bemBase = name;
  
  return `/* ${name} Component Styles (BEM)
 * Add this to styles/main.css to maintain single source of truth
 * Layer: ${layer}
 */

/* Block: Main component container */
.${bemBase} {
  /* Structure */
  display: block;
  padding: var(--spacing-md, 1rem);
  margin-bottom: var(--spacing-sm, 0.5rem);
  
  /* Visual */
  background: var(--color-surface, #ffffff);
  border-radius: var(--radius-md, 0.5rem);
  border: 1px solid var(--color-border, #e5e7eb);
  
  /* Transitions */
  transition: all 0.2s ease;
}

/* Elements: Component parts */
.${bemBase}__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm, 0.5rem);
}

.${bemBase}__title {
  font-size: var(--font-size-lg, 1.125rem);
  font-weight: var(--font-weight-semibold, 600);
  color: var(--color-heading, #111827);
  margin: 0;
}

.${bemBase}__content {
  color: var(--color-text, #4b5563);
  line-height: var(--line-height-relaxed, 1.625);
}

${props.includes('footer') || props.length > 3 ? `.${bemBase}__footer {
  margin-top: var(--spacing-sm, 0.5rem);
  padding-top: var(--spacing-sm, 0.5rem);
  border-top: 1px solid var(--color-border, #e5e7eb);
}` : ''}

/* Modifiers: Component variations */
${generateCSSModifiers(name, props)}

/* Interactive states */
.${bemBase}:hover {
  box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
  transform: translateY(-2px);
}

/* Focus state for accessibility */
.${bemBase}:focus-within {
  outline: 2px solid var(--color-primary, #059669);
  outline-offset: 2px;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .${bemBase} {
    padding: var(--spacing-sm, 0.5rem);
  }
  
  .${bemBase}__title {
    font-size: var(--font-size-base, 1rem);
  }
}
`;
}

// Generate CSS modifiers based on props
function generateCSSModifiers(name, props) {
  const modifiers = [];
  
  if (props.includes('status')) {
    modifiers.push(`/* Status modifiers */
.${name}--active,
.${name}--open {
  border-left: 3px solid var(--color-primary, #059669);
}

.${name}--completed,
.${name}--closed {
  opacity: 0.7;
  background: var(--color-muted, #f9fafb);
}

.${name}--urgent,
.${name}--error {
  border-left: 3px solid var(--color-danger, #dc2626);
  background: var(--color-danger-light, #fef2f2);
}`);
  }
  
  if (props.includes('priority')) {
    modifiers.push(`/* Priority modifiers */
.${name}--priority-high {
  border-color: var(--color-danger, #dc2626);
}

.${name}--priority-medium {
  border-color: var(--color-warning, #f59e0b);
}

.${name}--priority-low {
  border-color: var(--color-muted, #9ca3af);
}`);
  }
  
  if (props.includes('size')) {
    modifiers.push(`/* Size modifiers */
.${name}--size-small {
  padding: var(--spacing-sm, 0.5rem);
  font-size: var(--font-size-sm, 0.875rem);
}

.${name}--size-large {
  padding: var(--spacing-lg, 1.5rem);
  font-size: var(--font-size-lg, 1.125rem);
}`);
  }
  
  return modifiers.join('\n\n');
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
  const bemBase = name; // e.g., 'task-card'
  
  return `/**
 * ${className} Component
 * Production-ready web component with BEM styling
 * Layer: ${layer}
 */

export class ${className} extends HTMLElement {
  static get observedAttributes() {
    return ${propsArray};
  }

  constructor() {
    super();
    this._props = new Map();
  }

  connectedCallback() {
    this.render();
    this._setupEventListeners();
  }

  disconnectedCallback() {
    this._cleanupEventListeners();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this._props.set(name, newValue);
      this.render();
    }
  }

  getProp(key, defaultValue = '') {
    return this.getAttribute(key) || this._props.get(key) || defaultValue;
  }

  render() {
    // Get component state from props
    ${props.map(prop => `const ${prop} = this.getProp('${prop}');`).join('\n    ')}
    
    // Apply BEM classes based on state
    const modifiers = [];
    ${generateModifierLogic(props)}
    
    // Set component base class with modifiers
    this.className = '${bemBase}' + modifiers.map(m => ' ${bemBase}--' + m).join('');
    
    // Render component structure with BEM elements
    this.innerHTML = \`
      ${generateBEMTemplate(name, props)}
    \`;
    
    // Optional debug validation (only in development)
    if (window.DEBUG || window.location.hostname === 'localhost') {
      this._validateBEM();
    }
  }

  _setupEventListeners() {
    // Add event listeners if needed
  }

  _cleanupEventListeners() {
    // Remove event listeners if needed
  }

  _validateBEM() {
    // Development-only BEM validation
    const elements = this.querySelectorAll('[class]');
    elements.forEach(el => {
      const classes = el.className.split(' ');
      classes.forEach(cls => {
        if (cls && !cls.startsWith('${bemBase}')) {
          console.warn(\`[${name}] Non-BEM class detected: \${cls}\`);
        }
      });
    });
  }
}

// Register the component
customElements.define('${name}', ${className});

// Export for ES modules
export default ${className};
`;
}

// Helper function to generate modifier logic based on props
function generateModifierLogic(props) {
  const modifierLogic = [];
  
  if (props.includes('status')) {
    modifierLogic.push(`if (status) modifiers.push(status);`);
  }
  
  if (props.includes('priority')) {
    modifierLogic.push(`if (priority) modifiers.push('priority-' + priority);`);
  }
  
  if (props.includes('size')) {
    modifierLogic.push(`if (size) modifiers.push('size-' + size);`);
  }
  
  if (props.includes('variant')) {
    modifierLogic.push(`if (variant) modifiers.push(variant);`);
  }
  
  if (props.includes('state')) {
    modifierLogic.push(`if (state) modifiers.push(state);`);
  }
  
  return modifierLogic.join('\n    ') || '// No automatic modifiers';
}

// Helper function to generate BEM template structure
function generateBEMTemplate(name, props) {
  const bemBase = name;
  const title = props.includes('title') ? 'title' : (props[0] || 'name');
  
  let template = `<div class="${bemBase}__header">
        <h3 class="${bemBase}__title">\${this.getProp('${title}', '${name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}')}</h3>`;
  
  if (props.includes('status')) {
    template += `
        <span class="${bemBase}__status">\${status}</span>`;
  }
  
  template += `
      </div>`;
  
  template += `
      <div class="${bemBase}__content">`;
  
  if (props.includes('content') || props.includes('description')) {
    const contentProp = props.includes('content') ? 'content' : 'description';
    template += `
        <p>\${this.getProp('${contentProp}', '')}</p>`;
  }
  
  // Add other props as data display
  const displayProps = props.filter(p => !['title', 'content', 'description', 'status'].includes(p));
  if (displayProps.length > 0) {
    displayProps.forEach(prop => {
      template += `
        <div class="${bemBase}__${prop}">\${this.getProp('${prop}', '')}</div>`;
    });
  }
  
  template += `
        <slot></slot>
      </div>`;
  
  // Add footer if there are many props or actions
  if (props.includes('actions') || props.length > 3) {
    template += `
      <div class="${bemBase}__footer">
        <slot name="footer"></slot>
      </div>`;
  }
  
  return template;
}

function generateHTMLTemplate(name, props) {
  const propsComment = props.length > 0 
    ? `<!-- Props: ${props.join(', ')} -->`
    : '<!-- No props -->';
  
  // Generate a simple HTML template for reference
  const bemBase = name;
  
  return `${propsComment}
<!-- BEM Structure Reference -->
<div class="${bemBase}">
  <div class="${bemBase}__header">
    <h3 class="${bemBase}__title">{{title}}</h3>
    ${props.includes('status') ? `<span class="${bemBase}__status">{{status}}</span>` : ''}
  </div>
  <div class="${bemBase}__content">
    ${props.filter(p => p !== 'title' && p !== 'status').map(prop => `<div class="${bemBase}__${prop}">{{${prop}}}</div>`).join('\n    ')}
  </div>
  ${props.length > 3 ? `<div class="${bemBase}__footer"><!-- Footer content --></div>` : ''}
</div>`;
}