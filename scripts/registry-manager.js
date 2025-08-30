#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class RegistryManager {
  constructor(basePath = process.cwd()) {
    this.basePath = basePath;
    this.manifestPath = path.join(basePath, 'components/manifest.json');
    this.manifest = null;
  }

  async loadManifest() {
    try {
      if (fs.existsSync(this.manifestPath)) {
        const content = fs.readFileSync(this.manifestPath, 'utf8');
        this.manifest = JSON.parse(content);
      } else {
        this.manifest = {
          version: '1.0.0',
          framework: '@ui-canvas/framework',
          generated: new Date().toISOString(),
          components: {},
          layers: {
            component: {},
            page: {},
            workflow: {}
          },
          stats: {
            totalComponents: 0,
            lastUpdated: new Date().toISOString()
          }
        };
      }
    } catch (error) {
      throw new Error(`Failed to load manifest: ${error.message}`);
    }
  }

  async saveManifest() {
    try {
      // Update stats
      this.manifest.stats.totalComponents = Object.keys(this.manifest.components).length;
      this.manifest.stats.lastUpdated = new Date().toISOString();
      
      // Ensure directory exists
      const dir = path.dirname(this.manifestPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write with pretty formatting
      fs.writeFileSync(this.manifestPath, JSON.stringify(this.manifest, null, 2));
    } catch (error) {
      throw new Error(`Failed to save manifest: ${error.message}`);
    }
  }

  async scanComponents() {
    console.log('🔍 Scanning for components...');
    
    await this.loadManifest();
    
    // Find all component files
    const componentFiles = await glob('components/**/*.js', { cwd: this.basePath });
    const pageFiles = await glob('pages/**/*.js', { cwd: this.basePath });
    const workflowFiles = await glob('workflows/**/*.js', { cwd: this.basePath });
    
    let scanned = 0;
    let added = 0;
    let updated = 0;

    // Process each component file
    for (const file of [...componentFiles, ...pageFiles, ...workflowFiles]) {
      const result = await this.analyzeComponent(file);
      if (result) {
        const { name, metadata } = result;
        const existing = this.manifest.components[name];
        
        if (!existing) {
          this.manifest.components[name] = metadata;
          added++;
        } else if (JSON.stringify(existing) !== JSON.stringify(metadata)) {
          this.manifest.components[name] = metadata;
          updated++;
        }
        
        // Update layer index
        this.manifest.layers[metadata.layer][name] = {
          path: metadata.path,
          props: metadata.props,
          lastModified: metadata.lastModified
        };
      }
      scanned++;
    }

    await this.saveManifest();
    
    console.log(`✅ Scan complete:`);
    console.log(`   📁 ${scanned} files scanned`);
    console.log(`   ➕ ${added} components added`);
    console.log(`   📝 ${updated} components updated`);
    
    return { scanned, added, updated };
  }

  async analyzeComponent(filePath) {
    try {
      const fullPath = path.join(this.basePath, filePath);
      const content = fs.readFileSync(fullPath, 'utf8');
      const stats = fs.statSync(fullPath);
      
      // Extract component name from file path
      const name = path.basename(filePath, '.js');
      
      // Determine layer from path
      let layer = 'component';
      if (filePath.startsWith('pages/')) layer = 'page';
      if (filePath.startsWith('workflows/')) layer = 'workflow';
      
      // Extract metadata from component file
      const metadata = this.extractMetadata(content, filePath, stats);
      
      if (!metadata) return null;
      
      return {
        name,
        metadata: {
          name,
          path: filePath,
          layer,
          ...metadata,
          lastModified: stats.mtime.toISOString(),
          fileSize: stats.size
        }
      };
    } catch (error) {
      console.warn(`⚠️  Failed to analyze ${filePath}: ${error.message}`);
      return null;
    }
  }

  extractMetadata(content, filePath, stats) {
    const metadata = {
      props: [],
      description: '',
      version: '1.0.0',
      dependencies: [],
      examples: []
    };

    // Extract props from observedAttributes
    const observedMatch = content.match(/static get observedAttributes\(\)\s*\{\s*return\s*\[(.*?)\]/s);
    if (observedMatch) {
      const propsString = observedMatch[1];
      metadata.props = propsString
        .split(',')
        .map(prop => prop.trim().replace(/['"]/g, ''))
        .filter(prop => prop.length > 0);
    }

    // Extract description from JSDoc comment
    const descMatch = content.match(/\/\*\*\s*\n\s*\*\s*(.*?)\n/);
    if (descMatch) {
      metadata.description = descMatch[1].trim();
    }

    // Extract version from comment
    const versionMatch = content.match(/@version\s+(\d+\.\d+\.\d+)/);
    if (versionMatch) {
      metadata.version = versionMatch[1];
    }

    // Extract dependencies (imports)
    const imports = content.match(/import.*?from\s+['"](.*?)['"]/g) || [];
    metadata.dependencies = imports
      .map(imp => imp.match(/from\s+['"](.*?)['"]/)?.[1])
      .filter(dep => dep && dep.startsWith('./'))
      .map(dep => dep.replace('./', ''));

    // Extract BEM class names
    const bemClasses = content.match(/className\s*=\s*[`'"]([^`'"]+)[`'"]/g) || [];
    metadata.bemClasses = bemClasses
      .map(cls => cls.match(/[`'"]([^`'"]+)[`'"]/)?.[1])
      .filter(cls => cls)
      .map(cls => cls.split(' ')[0]); // Get base class

    return metadata;
  }

  async listComponents(options = {}) {
    await this.loadManifest();
    
    let components = Object.values(this.manifest.components);
    
    // Filter by layer
    if (options.layer) {
      components = components.filter(comp => comp.layer === options.layer);
    }
    
    // Filter by search term
    if (options.search) {
      const term = options.search.toLowerCase();
      components = components.filter(comp => 
        comp.name.toLowerCase().includes(term) ||
        comp.description.toLowerCase().includes(term)
      );
    }
    
    return components;
  }

  async getComponent(name) {
    await this.loadManifest();
    return this.manifest.components[name] || null;
  }

  async generateDocs(outputPath = 'docs/components') {
    console.log('📚 Generating component documentation...');
    
    await this.loadManifest();
    
    // Ensure output directory exists
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }
    
    // Generate index page
    await this.generateDocsIndex(outputPath);
    
    // Generate individual component pages
    let generated = 0;
    for (const [name, component] of Object.entries(this.manifest.components)) {
      await this.generateComponentDoc(component, outputPath);
      generated++;
    }
    
    console.log(`✅ Generated documentation for ${generated} components in ${outputPath}`);
    return { generated, outputPath };
  }

  async generateDocsIndex(outputPath) {
    const components = Object.values(this.manifest.components);
    const byLayer = {
      component: components.filter(c => c.layer === 'component'),
      page: components.filter(c => c.layer === 'page'),
      workflow: components.filter(c => c.layer === 'workflow')
    };
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Component Registry</title>
    <style>
        body { font-family: system-ui, sans-serif; line-height: 1.6; max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .header { border-bottom: 2px solid #e5e7eb; padding-bottom: 1rem; margin-bottom: 2rem; }
        .layer { margin-bottom: 3rem; }
        .layer h2 { color: #059669; border-bottom: 1px solid #d1d5db; padding-bottom: 0.5rem; }
        .component-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; }
        .component-card { border: 1px solid #d1d5db; border-radius: 0.5rem; padding: 1rem; }
        .component-card h3 { margin: 0 0 0.5rem 0; color: #1f2937; }
        .component-card p { color: #6b7280; margin: 0.5rem 0; }
        .props { font-size: 0.875rem; color: #374151; }
        .stats { background: #f9fafb; padding: 1rem; border-radius: 0.5rem; margin-bottom: 2rem; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
        .stat { text-align: center; }
        .stat-number { font-size: 2rem; font-weight: bold; color: #059669; }
        .stat-label { color: #6b7280; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📋 Component Registry</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
        <p>Framework: ${this.manifest.framework}</p>
    </div>
    
    <div class="stats">
        <div class="stats-grid">
            <div class="stat">
                <div class="stat-number">${this.manifest.stats.totalComponents}</div>
                <div class="stat-label">Total Components</div>
            </div>
            <div class="stat">
                <div class="stat-number">${byLayer.component.length}</div>
                <div class="stat-label">Components</div>
            </div>
            <div class="stat">
                <div class="stat-number">${byLayer.page.length}</div>
                <div class="stat-label">Pages</div>
            </div>
            <div class="stat">
                <div class="stat-number">${byLayer.workflow.length}</div>
                <div class="stat-label">Workflows</div>
            </div>
        </div>
    </div>
    
    ${Object.entries(byLayer).map(([layer, components]) => `
        <div class="layer">
            <h2>📁 ${layer.charAt(0).toUpperCase() + layer.slice(1)}s (${components.length})</h2>
            <div class="component-grid">
                ${components.map(comp => `
                    <div class="component-card">
                        <h3><a href="${comp.name}.html">${comp.name}</a></h3>
                        <p>${comp.description || 'No description provided'}</p>
                        <div class="props"><strong>Props:</strong> ${comp.props.join(', ') || 'None'}</div>
                        <div class="props"><strong>Version:</strong> ${comp.version}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('')}
</body>
</html>`;
    
    fs.writeFileSync(path.join(outputPath, 'index.html'), html);
  }

  async generateComponentDoc(component, outputPath) {
    // Read actual component file for examples
    const componentPath = path.join(this.basePath, component.path);
    let componentCode = '';
    try {
      componentCode = fs.readFileSync(componentPath, 'utf8');
    } catch (error) {
      console.warn(`Could not read component file: ${component.path}`);
    }
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${component.name} - Component Documentation</title>
    <style>
        body { font-family: system-ui, sans-serif; line-height: 1.6; max-width: 900px; margin: 0 auto; padding: 2rem; }
        .header { border-bottom: 2px solid #e5e7eb; padding-bottom: 1rem; margin-bottom: 2rem; }
        .nav { margin-bottom: 1rem; }
        .nav a { color: #059669; text-decoration: none; }
        .section { margin-bottom: 2rem; }
        .props-table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
        .props-table th, .props-table td { border: 1px solid #d1d5db; padding: 0.75rem; text-align: left; }
        .props-table th { background: #f9fafb; font-weight: 600; }
        code { background: #f3f4f6; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.875rem; }
        pre { background: #1f2937; color: #f9fafb; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; }
        .usage-example { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 0.5rem; padding: 1rem; margin: 1rem 0; }
        .meta { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; background: #f9fafb; padding: 1rem; border-radius: 0.5rem; }
        .meta-item { text-align: center; }
        .meta-label { font-size: 0.875rem; color: #6b7280; }
        .meta-value { font-weight: 600; color: #1f2937; }
    </style>
</head>
<body>
    <div class="nav">
        <a href="index.html">← Back to Component Registry</a>
    </div>
    
    <div class="header">
        <h1>🧩 ${component.name}</h1>
        <p>${component.description || 'No description provided'}</p>
    </div>
    
    <div class="meta">
        <div class="meta-item">
            <div class="meta-value">${component.layer}</div>
            <div class="meta-label">Layer</div>
        </div>
        <div class="meta-item">
            <div class="meta-value">${component.version}</div>
            <div class="meta-label">Version</div>
        </div>
        <div class="meta-item">
            <div class="meta-value">${component.props.length}</div>
            <div class="meta-label">Props</div>
        </div>
        <div class="meta-item">
            <div class="meta-value">${new Date(component.lastModified).toLocaleDateString()}</div>
            <div class="meta-label">Last Modified</div>
        </div>
    </div>
    
    <div class="section">
        <h2>Usage</h2>
        <div class="usage-example">
            <code>&lt;${component.name}${component.props.map(prop => ` ${prop}="value"`).join('')}&gt;&lt;/${component.name}&gt;</code>
        </div>
    </div>
    
    <div class="section">
        <h2>Properties</h2>
        <table class="props-table">
            <thead>
                <tr>
                    <th>Property</th>
                    <th>Type</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
                ${component.props.length > 0 ? component.props.map(prop => `
                    <tr>
                        <td><code>${prop}</code></td>
                        <td>string</td>
                        <td>Component ${prop}</td>
                    </tr>
                `).join('') : '<tr><td colspan="3">No properties</td></tr>'}
            </tbody>
        </table>
    </div>
    
    <div class="section">
        <h2>BEM Classes</h2>
        ${component.bemClasses && component.bemClasses.length > 0 ? `
            <ul>
                ${component.bemClasses.map(cls => `<li><code>.${cls}</code></li>`).join('')}
            </ul>
        ` : '<p>No BEM classes detected</p>'}
    </div>
    
    <div class="section">
        <h2>Source Code</h2>
        <p><strong>File:</strong> <code>${component.path}</code></p>
        <p><strong>Size:</strong> ${Math.round(component.fileSize / 1024 * 10) / 10} KB</p>
    </div>
</body>
</html>`;
    
    fs.writeFileSync(path.join(outputPath, `${component.name}.html`), html);
  }

  async validateRegistry() {
    console.log('🔍 Validating component registry...');
    
    await this.loadManifest();
    
    const issues = [];
    let valid = 0;
    
    for (const [name, component] of Object.entries(this.manifest.components)) {
      const componentIssues = [];
      
      // Check if file exists
      const filePath = path.join(this.basePath, component.path);
      if (!fs.existsSync(filePath)) {
        componentIssues.push(`File not found: ${component.path}`);
      }
      
      // Check naming convention
      if (!name.includes('-')) {
        componentIssues.push('Component name must contain hyphen (web component standard)');
      }
      
      // Check layer consistency
      const expectedLayer = component.path.startsWith('pages/') ? 'page' : 
                           component.path.startsWith('workflows/') ? 'workflow' : 'component';
      if (component.layer !== expectedLayer) {
        componentIssues.push(`Layer mismatch: expected ${expectedLayer}, got ${component.layer}`);
      }
      
      if (componentIssues.length > 0) {
        issues.push({ component: name, issues: componentIssues });
      } else {
        valid++;
      }
    }
    
    console.log(`✅ Registry validation complete:`);
    console.log(`   ✅ ${valid} components valid`);
    console.log(`   ❌ ${issues.length} components with issues`);
    
    if (issues.length > 0) {
      console.log('\n🚨 Issues found:');
      issues.forEach(({ component, issues }) => {
        console.log(`   ${component}:`);
        issues.forEach(issue => console.log(`     - ${issue}`));
      });
    }
    
    return { valid, issues };
  }
}

// CLI interface
export async function registryCommand(action, options = {}) {
  const registry = new RegistryManager();
  
  switch (action) {
    case 'init':
      await registry.loadManifest();
      await registry.saveManifest();
      console.log('✅ Component registry initialized');
      break;
      
    case 'scan':
      return await registry.scanComponents();
      
    case 'list':
      const components = await registry.listComponents(options);
      if (components.length === 0) {
        console.log('No components found');
        return;
      }
      
      console.log(`📋 Found ${components.length} components:\n`);
      components.forEach(comp => {
        console.log(`🧩 ${comp.name} (${comp.layer})`);
        if (comp.description) console.log(`   ${comp.description}`);
        if (comp.props.length > 0) console.log(`   Props: ${comp.props.join(', ')}`);
        console.log(`   File: ${comp.path}`);
        console.log('');
      });
      break;
      
    case 'info':
      const component = await registry.getComponent(options.name);
      if (!component) {
        console.log(`Component '${options.name}' not found`);
        return;
      }
      
      console.log(`🧩 ${component.name}`);
      console.log(`Description: ${component.description || 'No description'}`);
      console.log(`Layer: ${component.layer}`);
      console.log(`Version: ${component.version}`);
      console.log(`Props: ${component.props.join(', ') || 'None'}`);
      console.log(`File: ${component.path}`);
      console.log(`Last Modified: ${new Date(component.lastModified).toLocaleString()}`);
      break;
      
    case 'docs':
      return await registry.generateDocs(options.output);
      
    case 'validate':
      return await registry.validateRegistry();
      
    default:
      console.error(`Unknown registry action: ${action}`);
      process.exit(1);
  }
}