/**
 * UI Canvas Framework - Web Component Base Class
 * Provides foundation for all three-layer architecture components
 */

export class UICanvasComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._props = new Map();
    this._initialized = false;
  }

  // Component lifecycle
  connectedCallback() {
    if (!this._initialized) {
      this.initialize();
      this._initialized = true;
    }
    this.render();
  }

  disconnectedCallback() {
    this.cleanup();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this.setProp(name, newValue);
    if (this._initialized) {
      this.render();
    }
  }

  // Props management
  setProp(key, value) {
    const oldValue = this._props.get(key);
    this._props.set(key, value);
    this.onPropChange(key, value, oldValue);
  }

  getProp(key, defaultValue = null) {
    return this._props.get(key) ?? defaultValue;
  }

  getAllProps() {
    return Object.fromEntries(this._props);
  }

  // Event handling
  emit(eventName, detail = {}) {
    this.dispatchEvent(new CustomEvent(eventName, {
      detail,
      bubbles: true,
      cancelable: true
    }));
  }

  on(eventName, handler) {
    this.addEventListener(eventName, handler);
    return () => this.removeEventListener(eventName, handler);
  }

  // CSS utilities
  adoptGlobalStyles() {
    // Link to main.css for single source of truth (if it exists)
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = '/styles/main.css';
    linkElement.onerror = () => {
      console.log('main.css not found - continuing without global styles');
    };
    this.shadowRoot.appendChild(linkElement);
  }

  createStyle(css) {
    const style = document.createElement('style');
    style.textContent = css;
    return style;
  }

  // Template utilities
  createTemplate(html) {
    const template = document.createElement('template');
    template.innerHTML = html;
    return template.content.cloneNode(true);
  }

  querySelector(selector) {
    return this.shadowRoot.querySelector(selector);
  }

  querySelectorAll(selector) {
    return this.shadowRoot.querySelectorAll(selector);
  }

  // Override these in your components
  initialize() {
    // Component initialization logic
  }

  render() {
    // Component rendering logic
    throw new Error('Component must implement render() method');
  }

  cleanup() {
    // Component cleanup logic
  }

  onPropChange(key, newValue, oldValue) {
    // Handle prop changes
  }

  // Architecture compliance helpers
  validateArchitecture() {
    // Ensure component follows three-layer architecture
    if (this.innerHTML.includes('style=')) {
      console.warn(`Component ${this.tagName} has inline styles - use main.css instead`);
    }
  }

  // Canvas integration
  getComponentMetadata() {
    return {
      name: this.tagName.toLowerCase(),
      props: this.constructor.observedAttributes || [],
      layer: this.dataset.layer || 'component',
      version: '1.0.0'
    };
  }
}

// Export the class
export { UICanvasComponent };