/**
 * UI Canvas Framework - Development Utilities
 * Tools for creating and debugging web components
 */

import { UICanvasComponent } from './component-base.js';
import { componentRegistry } from './component-registry.js';

export class ComponentGenerator {
  // Generate a new web component class
  static createComponent(name, options = {}) {
    const className = this.toPascalCase(name);
    const tagName = this.toKebabCase(name);
    
    return class extends UICanvasComponent {
      static get observedAttributes() {
        return options.props || [];
      }

      initialize() {
        this.adoptGlobalStyles();
        if (options.initialize) {
          options.initialize.call(this);
        }
      }

      render() {
        if (options.template) {
          this.shadowRoot.innerHTML = '';
          this.shadowRoot.appendChild(this.createTemplate(options.template));
        } else if (options.render) {
          options.render.call(this);
        } else {
          this.shadowRoot.innerHTML = `
            <div class="component-placeholder">
              <p>🧩 Component: ${tagName}</p>
              <p>Props: ${this.constructor.observedAttributes.join(', ')}</p>
            </div>
          `;
        }
      }

      cleanup() {
        if (options.cleanup) {
          options.cleanup.call(this);
        }
      }

      onPropChange(key, newValue, oldValue) {
        if (options.onPropChange) {
          options.onPropChange.call(this, key, newValue, oldValue);
        }
      }
    };
  }

  // Auto-register component with registry
  static defineComponent(name, options = {}) {
    const ComponentClass = this.createComponent(name, options);
    const tagName = this.toKebabCase(name);
    
    componentRegistry.register(tagName, ComponentClass, {
      layer: options.layer || 'component',
      metadata: options.metadata || {}
    });

    return ComponentClass;
  }

  // Generate component template from HTML file
  static async createFromTemplate(templatePath, name, options = {}) {
    try {
      const response = await fetch(templatePath);
      const html = await response.text();
      
      return this.defineComponent(name, {
        ...options,
        template: html
      });
    } catch (error) {
      console.error(`Failed to create component from template ${templatePath}:`, error);
      throw error;
    }
  }

  // Utility methods
  static toPascalCase(str) {
    return str.replace(/(^\w|[-_]\w)/g, match => 
      match.replace(/[-_]/, '').toUpperCase()
    );
  }

  static toKebabCase(str) {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }
}

export class ComponentDebugger {
  // Debug component rendering
  static debugComponent(element) {
    if (!(element instanceof UICanvasComponent)) {
      console.warn('Element is not a UICanvasComponent');
      return;
    }

    const info = {
      tagName: element.tagName.toLowerCase(),
      props: element.getAllProps(),
      metadata: element.getComponentMetadata(),
      shadowRoot: element.shadowRoot,
      connected: element.isConnected
    };

    console.group(`🔍 Component Debug: ${info.tagName}`);
    console.table(info.props);
    console.log('Metadata:', info.metadata);
    console.log('Shadow DOM:', info.shadowRoot);
    console.log('Connected:', info.connected);
    console.groupEnd();

    return info;
  }

  // Validate component architecture compliance
  static validateComponent(element) {
    const violations = [];
    
    if (!(element instanceof UICanvasComponent)) {
      violations.push('Not extending UICanvasComponent base class');
    }

    if (!element.tagName.includes('-')) {
      violations.push('Custom element name must contain hyphen');
    }

    if (element.innerHTML.includes('style=')) {
      violations.push('Contains inline styles - use main.css');
    }

    const shadowRoot = element.shadowRoot;
    if (shadowRoot) {
      const styleElements = shadowRoot.querySelectorAll('style');
      styleElements.forEach(style => {
        if (!style.textContent.includes('/* Component styles */')) {
          violations.push('Shadow DOM styles should be documented');
        }
      });
    }

    if (violations.length > 0) {
      console.warn(`❌ Component ${element.tagName} violations:`, violations);
      return false;
    }

    console.log(`✅ Component ${element.tagName} passes architecture validation`);
    return true;
  }

  // Performance monitoring
  static monitorComponent(element) {
    if (!(element instanceof UICanvasComponent)) return;

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name.includes(element.tagName.toLowerCase())) {
          console.log(`⚡ ${element.tagName} performance:`, {
            operation: entry.name,
            duration: `${entry.duration.toFixed(2)}ms`,
            startTime: entry.startTime
          });
        }
      });
    });

    observer.observe({ entryTypes: ['measure'] });
    
    // Mark render start/end
    const originalRender = element.render;
    element.render = function() {
      performance.mark(`${this.tagName}-render-start`);
      const result = originalRender.call(this);
      performance.mark(`${this.tagName}-render-end`);
      performance.measure(
        `${this.tagName}-render`,
        `${this.tagName}-render-start`,
        `${this.tagName}-render-end`
      );
      return result;
    };

    return () => observer.disconnect();
  }
}

export class ComponentTester {
  // Create test instance of component
  static createTestInstance(tagName, props = {}) {
    const element = document.createElement(tagName);
    
    Object.entries(props).forEach(([key, value]) => {
      if (typeof value === 'string') {
        element.setAttribute(key, value);
      } else {
        element.setProp(key, value);
      }
    });

    // Add to DOM for testing
    document.body.appendChild(element);
    
    return element;
  }

  // Run component test suite
  static async testComponent(tagName, tests = {}) {
    console.group(`🧪 Testing component: ${tagName}`);
    
    const results = {
      passed: 0,
      failed: 0,
      errors: []
    };

    // Test instantiation
    try {
      const element = this.createTestInstance(tagName);
      console.log('✅ Component instantiation');
      results.passed++;
      
      // Test rendering
      if (element.shadowRoot && element.shadowRoot.children.length > 0) {
        console.log('✅ Component renders');
        results.passed++;
      } else {
        console.warn('❌ Component does not render');
        results.failed++;
        results.errors.push('Component does not render');
      }

      // Test architecture compliance
      if (ComponentDebugger.validateComponent(element)) {
        console.log('✅ Architecture compliance');
        results.passed++;
      } else {
        console.warn('❌ Architecture compliance failed');
        results.failed++;
        results.errors.push('Architecture compliance failed');
      }

      // Custom tests
      if (tests.custom) {
        for (const [testName, testFn] of Object.entries(tests.custom)) {
          try {
            await testFn(element);
            console.log(`✅ ${testName}`);
            results.passed++;
          } catch (error) {
            console.warn(`❌ ${testName}:`, error.message);
            results.failed++;
            results.errors.push(`${testName}: ${error.message}`);
          }
        }
      }

      // Cleanup
      element.remove();
      
    } catch (error) {
      console.error('❌ Component instantiation failed:', error);
      results.failed++;
      results.errors.push(`Instantiation failed: ${error.message}`);
    }

    console.groupEnd();
    return results;
  }

  // Visual regression testing
  static async takeScreenshot(tagName, props = {}, options = {}) {
    const element = this.createTestInstance(tagName, props);
    
    // Wait for rendering
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Use html2canvas or similar for screenshot
    console.log(`📸 Screenshot capability for ${tagName} - implement with html2canvas`);
    
    element.remove();
    return { element, screenshot: 'implement-with-html2canvas' };
  }
}

// Development console commands
export const dev = {
  // Quick component creation
  create: ComponentGenerator.defineComponent,
  
  // Debug any element
  debug: ComponentDebugger.debugComponent,
  
  // Validate architecture
  validate: ComponentDebugger.validateComponent,
  
  // Test component
  test: ComponentTester.testComponent,
  
  // List all registered components
  list: () => componentRegistry.listAll(),
  
  // Registry access
  registry: componentRegistry
};

// Make available globally for development
if (typeof window !== 'undefined') {
  window.UICanvasDev = dev;
  console.log('🛠️ UI Canvas development tools loaded. Use UICanvasDev.* in console.');
}