// UI Canvas Framework Documentation JavaScript

document.addEventListener('DOMContentLoaded', function() {
  // Initialize demo navigation
  initDemoNavigation();
  
  // Initialize smooth scrolling
  initSmoothScrolling();
  
  // Initialize animations
  initScrollAnimations();
});

function initDemoNavigation() {
  const demoNavItems = document.querySelectorAll('.demo-nav-item');
  const demoPanels = document.querySelectorAll('.demo-panel');
  
  demoNavItems.forEach(item => {
    item.addEventListener('click', function() {
      const targetDemo = this.getAttribute('data-demo');
      
      // Remove active class from all nav items and panels
      demoNavItems.forEach(nav => nav.classList.remove('active'));
      demoPanels.forEach(panel => panel.classList.remove('active'));
      
      // Add active class to clicked nav item and corresponding panel
      this.classList.add('active');
      document.getElementById(`demo-${targetDemo}`).classList.add('active');
    });
  });
}

function initSmoothScrolling() {
  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

function initScrollAnimations() {
  // Create intersection observer for fade-in animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  // Observe elements that should animate on scroll
  const animateElements = document.querySelectorAll('.feature-card, .timeline-item, .doc-section, .test-result');
  animateElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

// Demo interaction handlers
function simulateCanvasStaging() {
  const output = document.getElementById('canvas-output');
  const steps = [
    '🎨 Staging mockup: garden-dashboard',
    '📁 Created: .superdesign/design_iterations/garden-dashboard.html',
    '🌐 Available at: http://localhost:3000/canvas/garden-dashboard.html',
    '✅ Ready for development iteration'
  ];
  
  output.innerHTML = '';
  steps.forEach((step, index) => {
    setTimeout(() => {
      const stepEl = document.createElement('div');
      stepEl.className = 'terminal-line';
      stepEl.textContent = step;
      output.appendChild(stepEl);
    }, index * 800);
  });
}

function simulateComponentGeneration() {
  const output = document.getElementById('component-output');
  const steps = [
    '🔧 Generating web component: task-card',
    '📝 Created: components/cards/task_card_compact.html',
    '🎨 Applied CSS from: styles/main.css',
    '🧪 Generated test: tests/task-card.spec.js',
    '✅ Component ready for use'
  ];
  
  output.innerHTML = '';
  steps.forEach((step, index) => {
    setTimeout(() => {
      const stepEl = document.createElement('div');
      stepEl.className = 'terminal-line';
      stepEl.textContent = step;
      output.appendChild(stepEl);
    }, index * 600);
  });
}

function simulateArchitectureValidation() {
  const output = document.getElementById('validation-output');
  const steps = [
    '🔍 Validating three-layer architecture...',
    '✅ Layer 1: 24 components validated',
    '✅ Layer 2: 8 pages validated',
    '✅ Layer 3: 3 workflows validated',
    '✅ No inline CSS detected',
    '✅ No component duplication found',
    '✅ All component references valid',
    '🎉 Architecture compliance: PASSED'
  ];
  
  output.innerHTML = '';
  steps.forEach((step, index) => {
    setTimeout(() => {
      const stepEl = document.createElement('div');
      stepEl.className = 'terminal-line';
      stepEl.textContent = step;
      output.appendChild(stepEl);
    }, index * 400);
  });
}

function simulateVisualTesting() {
  const output = document.getElementById('testing-output');
  const steps = [
    '🧪 Running visual regression tests...',
    '📸 Taking screenshots: task-card-compact',
    '📸 Taking screenshots: plant-card-embedded',
    '📸 Taking screenshots: dashboard-mobile',
    '🔍 Comparing with baselines...',
    '✅ task-card-compact: PASSED',
    '✅ plant-card-embedded: PASSED',
    '✅ dashboard-mobile: PASSED',
    '📊 Tests: 3 passed, 0 failed',
    '🎉 Visual consistency: MAINTAINED'
  ];
  
  output.innerHTML = '';
  steps.forEach((step, index) => {
    setTimeout(() => {
      const stepEl = document.createElement('div');
      stepEl.className = 'terminal-line';
      stepEl.textContent = step;
      output.appendChild(stepEl);
    }, index * 500);
  });
}

// Utility functions
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied to clipboard!');
  }).catch(() => {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showToast('Copied to clipboard!');
  });
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: var(--color-gray-900);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 500;
    z-index: 1000;
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.3s ease;
  `;
  
  document.body.appendChild(toast);
  
  // Trigger animation
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  }, 10);
  
  // Remove after delay
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}

// Add click handlers for code blocks to copy content
document.addEventListener('click', function(e) {
  if (e.target.closest('.code-block') || e.target.closest('.code-example')) {
    const codeEl = e.target.closest('.code-block') || e.target.closest('.code-example');
    const code = codeEl.textContent.trim();
    copyToClipboard(code);
  }
});

// Add tooltips to interactive elements
function initTooltips() {
  const tooltipElements = document.querySelectorAll('[data-tooltip]');
  
  tooltipElements.forEach(el => {
    el.addEventListener('mouseenter', function(e) {
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip';
      tooltip.textContent = this.getAttribute('data-tooltip');
      tooltip.style.cssText = `
        position: absolute;
        background: var(--color-gray-900);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        font-weight: 500;
        z-index: 1000;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s ease;
        white-space: nowrap;
      `;
      
      document.body.appendChild(tooltip);
      
      const rect = this.getBoundingClientRect();
      tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
      tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
      
      setTimeout(() => tooltip.style.opacity = '1', 10);
      
      this.tooltipEl = tooltip;
    });
    
    el.addEventListener('mouseleave', function() {
      if (this.tooltipEl) {
        this.tooltipEl.style.opacity = '0';
        setTimeout(() => {
          if (this.tooltipEl && this.tooltipEl.parentNode) {
            document.body.removeChild(this.tooltipEl);
          }
        }, 200);
      }
    });
  });
}

// Initialize tooltips after DOM is loaded
document.addEventListener('DOMContentLoaded', initTooltips);

// Keyboard navigation
document.addEventListener('keydown', function(e) {
  // Press 'g' to go to GitHub
  if (e.key === 'g' && !e.ctrlKey && !e.metaKey) {
    window.open('https://github.com/sati-bodhi/ui-canvas-framework', '_blank');
  }
  
  // Press 's' to go to SuperDesign
  if (e.key === 's' && !e.ctrlKey && !e.metaKey) {
    window.open('https://github.com/superdesigndev/superdesign', '_blank');
  }
  
  // Press '/' to focus search (if implemented)
  if (e.key === '/') {
    e.preventDefault();
    // Focus search input if it exists
    const searchInput = document.querySelector('#search');
    if (searchInput) {
      searchInput.focus();
    }
  }
});

// Add CSS for terminal output styling
const terminalStyles = `
  .terminal-line {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
    color: var(--color-gray-700);
    animation: fadeInUp 0.3s ease;
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Inject terminal styles
const styleSheet = document.createElement('style');
styleSheet.textContent = terminalStyles;
document.head.appendChild(styleSheet);