/**
 * Example: Simple Card Component
 * Basic web component demonstrating the framework
 */

import { UICanvasComponent } from './web-components/index.js';

export class SimpleCard extends UICanvasComponent {
  static get observedAttributes() {
    return ['title', 'content'];
  }

  initialize() {
    this.adoptGlobalStyles();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <div class="card">
        <h3>${this.getProp('title', 'Card Title')}</h3>
        <p>${this.getProp('content', 'Card content goes here.')}</p>
      </div>
    `;
  }
}

// Register the component
customElements.define('simple-card', SimpleCard);