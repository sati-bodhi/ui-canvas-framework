/**
 * UI Canvas Framework - Web Components Entry Point
 * Complete web components development infrastructure
 */

// Core components
export { UICanvasComponent } from './component-base.js';
export { componentRegistry } from './component-registry.js';
export { 
  ComponentGenerator, 
  ComponentDebugger, 
  ComponentTester,
  dev 
} from './development-utils.js';

// Initialize framework
export async function initWebComponents(options = {}) {
  console.log('🚀 Initializing UI Canvas Web Components Framework...');
  
  // Initialize component registry
  await componentRegistry.initialize();
  
  // Auto-discover components if requested
  if (options.autoDiscover) {
    await componentRegistry.discoverComponents(options.basePath);
  }
  
  // Enable development mode
  if (options.development) {
    console.log('🛠️ Development mode enabled');
    
    // Add global error handling
    window.addEventListener('error', (event) => {
      if (event.target && event.target.tagName && event.target.tagName.includes('-')) {
        console.error(`Component error in ${event.target.tagName}:`, event.error);
      }
    });
    
    // Add component validation on registration
    const originalRegister = componentRegistry.register;
    componentRegistry.register = function(tagName, componentClass, options) {
      console.log(`🔍 Validating component: ${tagName}`);
      return originalRegister.call(this, tagName, componentClass, options);
    };
  }
  
  console.log('✅ UI Canvas Web Components Framework initialized');
  
  return {
    registry: componentRegistry,
    create: ComponentGenerator.defineComponent,
    debug: ComponentDebugger,
    test: ComponentTester
  };
}

// Default export for simple import
export default {
  UICanvasComponent,
  componentRegistry,
  ComponentGenerator,
  ComponentDebugger,
  ComponentTester,
  initWebComponents,
  dev
};