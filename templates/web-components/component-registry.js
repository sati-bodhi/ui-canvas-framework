/**
 * UI Canvas Framework - Component Registry
 * Manages component registration and discovery for three-layer architecture
 */

class ComponentRegistry {
  constructor() {
    this.components = new Map();
    this.templates = new Map();
    this.initialized = false;
  }

  // Register a web component
  register(tagName, componentClass, options = {}) {
    if (customElements.get(tagName)) {
      console.warn(`Component ${tagName} already registered`);
      return;
    }

    // Validate architecture compliance
    if (!componentClass.prototype.render) {
      throw new Error(`Component ${tagName} must implement render() method`);
    }

    // Register with browser
    customElements.define(tagName, componentClass);

    // Store in registry
    this.components.set(tagName, {
      class: componentClass,
      options,
      layer: options.layer || 'component',
      registered: Date.now()
    });

    console.log(`✅ Registered component: ${tagName} (${options.layer || 'component'} layer)`);
  }

  // Register HTML template for component references
  registerTemplate(componentName, templatePath, metadata = {}) {
    this.templates.set(componentName, {
      path: templatePath,
      metadata,
      loaded: false
    });
  }

  // Get registered component
  get(tagName) {
    return this.components.get(tagName);
  }

  // Get all components by layer
  getByLayer(layer) {
    return Array.from(this.components.entries())
      .filter(([_, config]) => config.layer === layer)
      .map(([tagName, config]) => ({ tagName, ...config }));
  }

  // Load component from HTML template
  async loadTemplate(componentName) {
    const template = this.templates.get(componentName);
    if (!template) {
      throw new Error(`Template not found: ${componentName}`);
    }

    if (template.loaded) {
      return template;
    }

    try {
      const response = await fetch(template.path);
      const html = await response.text();
      template.html = html;
      template.loaded = true;
      return template;
    } catch (error) {
      throw new Error(`Failed to load template ${componentName}: ${error.message}`);
    }
  }

  // Auto-discover components in directory
  async discoverComponents(basePath = '/components') {
    try {
      // This would typically be done by the build system
      // For now, manual registration is recommended
      console.log(`🔍 Component discovery from ${basePath} - implement via build system`);
    } catch (error) {
      console.warn('Component discovery failed:', error.message);
    }
  }

  // Initialize registry with framework components
  async initialize() {
    if (this.initialized) return;

    // Register common component templates
    this.registerTemplate('card-base', '/components/sections/card_base.html', {
      layer: 'component',
      type: 'section'
    });

    this.registerTemplate('location-selector', '/components/sections/card_location_section.html', {
      layer: 'component', 
      type: 'section'
    });

    this.registerTemplate('status-badges', '/components/sections/card_status_badges.html', {
      layer: 'component',
      type: 'section'
    });

    this.initialized = true;
    console.log('🎯 Component registry initialized');
  }

  // Development utilities
  listAll() {
    console.table(
      Array.from(this.components.entries()).map(([tagName, config]) => ({
        tagName,
        layer: config.layer,
        registered: new Date(config.registered).toLocaleTimeString()
      }))
    );
  }

  // Architecture validation
  validateArchitecture() {
    let violations = 0;
    
    this.components.forEach((config, tagName) => {
      // Check if component follows naming conventions
      if (!tagName.includes('-')) {
        console.warn(`❌ ${tagName}: Custom elements must contain a hyphen`);
        violations++;
      }

      // Check layer compliance
      const validLayers = ['component', 'page', 'workflow'];
      if (!validLayers.includes(config.layer)) {
        console.warn(`❌ ${tagName}: Invalid layer '${config.layer}'. Use: ${validLayers.join(', ')}`);
        violations++;
      }
    });

    return violations === 0;
  }

  // Canvas integration
  getCanvasManifest() {
    return {
      components: Array.from(this.components.entries()).map(([tagName, config]) => ({
        tagName,
        layer: config.layer,
        metadata: config.options.metadata || {}
      })),
      templates: Array.from(this.templates.entries()).map(([name, template]) => ({
        name,
        path: template.path,
        metadata: template.metadata
      }))
    };
  }
}

// Export singleton instance
export const componentRegistry = new ComponentRegistry();

// Auto-initialize when imported
componentRegistry.initialize().catch(console.error);

// Global access for debugging
if (typeof window !== 'undefined') {
  window.componentRegistry = componentRegistry;
}