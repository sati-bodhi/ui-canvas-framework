# UI Canvas Framework

> **Three-Layer Architecture & Reusable Web Components Framework**
> 
> Production infrastructure that extends [SuperDesign](https://github.com/superdesigndev/superdesign) workflows with structured component development, canvas staging, and automated testing.

## Overview

The **UI Canvas Framework** provides essential production infrastructure for AI-assisted UI/UX development. While SuperDesign generates beautiful mockups from natural language prompts, this framework adds the missing pieces needed for scalable, maintainable UI development:

- **🏗️ Three-Layer Architecture** - Enforced separation: Components → Pages → Workflows
- **🔧 Reusable Web Components** - Single source of truth component system
- **🎨 Canvas Staging System** - Production workflow for SuperDesign mockups
- **🧪 Visual Testing Pipeline** - Automated regression testing with Playwright
- **📋 Architecture Enforcement** - Prevents design inconsistency and technical debt

## How It Works with SuperDesign

### SuperDesign (Design Generation)
1. Install [SuperDesign VS Code extension](https://marketplace.visualstudio.com/items?itemName=iganbold.superdesign)
2. Generate UI mockups from natural language prompts
3. Designs are saved in `.superdesign/design_iterations/`

### UI Canvas Framework (Production Infrastructure)
4. Stage SuperDesign mockups for development
5. Enforce three-layer architecture standards
6. Convert mockups to reusable web components
7. Run visual regression tests
8. Archive approved designs as permanent references

```
SuperDesign → Generate mockups
     ↓
UI Canvas → Stage & develop
     ↓  
Production → Reusable components
```

## 🚀 Quick Start

### Installation

```bash
npm install @ui-canvas/framework
```

### Initialize Project

```bash
npx ui-canvas init my-project
cd my-project
npm install
```

**🎯 New to the framework?** Follow our [**Recommended Workflow Guide**](./WORKFLOW.md) for step-by-step guidance through the complete development process.

This creates the three-layer architecture:

```
my-project/
├── components/          # Layer 1: Reusable web components
│   ├── cards/          # Card components (compact, embedded, standard)
│   ├── sections/       # Reusable sections
│   └── elements/       # Basic UI elements
├── pages/              # Layer 2: Component compositions  
│   ├── dashboards/     # Dashboard layouts
│   └── workflows/      # Page compositions
├── workflows/          # Layer 3: Multi-step user journeys
├── styles/main.css     # Single source of truth CSS
├── .superdesign/       # SuperDesign canvas staging area
├── mockups/            # Approved mockup archive
└── tests/              # Visual regression tests
```

### AI Integration Setup

The framework provides smart context switching between SuperDesign mockup creation and framework component development:

```bash
# 1. Analyze existing AI prompt setup
npx ui-canvas check-prompts

# 2. Choose integration level
npx ui-canvas setup-prompts 3
```

**Integration Options:**
- **Option 1: Keep Current Setup** - Preserve existing AI configuration
- **Option 2: Framework Only** - Pure three-layer architecture workflow  
- **Option 3: Integrated Mode** ⭐ - Context switching between SuperDesign + Framework

**Integrated Mode provides:**
- 🎨 **SuperDesign Mode** - Creative mockup generation in `.superdesign/` folder
- 🏗️ **Framework Mode** - Production component development with architecture validation
- 🧠 **Smart Context Detection** - Automatically switches based on your request and file location

### Start Development

```bash
npm run dev
```

- **Canvas**: http://localhost:3000/canvas
- **Approved Mockups**: http://localhost:3000/mockups/approved
- **Development Dashboard**: http://localhost:3000

## Core Features

### 🏗️ Three-Layer Architecture

Enforced separation of concerns prevents code duplication and ensures maintainability:

**Layer 1: Components** (Atomic, reusable)
```html
<!-- components/cards/user_card_compact.html -->
<div class="card-compact user-card">
  <img src="{{avatar}}" alt="{{name}}">
  <h3>{{name}}</h3>
  <span class="role">{{role}}</span>
</div>
```

**Layer 2: Pages** (Component compositions)
```html
<!-- pages/dashboard.html -->
<!-- @component: components/cards/user_card_compact.html -->
<!-- @props: { name: "John Doe", role: "Admin", avatar: "/avatars/john.jpg" } -->
```

**Layer 3: Workflows** (Multi-step user journeys)
```html
<!-- workflows/onboarding/step_1_welcome.html -->
Multiple pages connected into complete user experiences
```

### 🔧 Reusable Web Components

Single source of truth system prevents style duplication:

```css
/* styles/main.css - Single source of truth */
.card-compact {
  background: var(--card-bg);
  border-radius: 0.75rem;
  padding: 1rem;
  box-shadow: var(--card-shadow);
}
```

```javascript
// Components automatically use main.css
class UserCardCompact extends HTMLElement {
  connectedCallback() {
    this.className = 'card-compact user-card';
    this.innerHTML = this.template;
  }
}
```

### 🎨 Canvas Staging System

Production workflow for SuperDesign mockups:

```bash
# Stage SuperDesign mockup for development
npx ui-canvas canvas stage dashboard-mobile

# Work on staged mockup at:
# http://localhost:3000/canvas/dashboard-mobile.html

# Archive when approved
npx ui-canvas canvas archive dashboard-mobile.html dashboard-v1

# Automatically generates reference screenshots
```

### 🧪 Visual Testing Pipeline

Prevent design regression with automated testing:

```bash
# Run visual regression tests
npm run test:visual

# Update baseline screenshots
npm run test:visual -- --update-snapshots

# Test specific browsers
npm run test:visual -- --project=webkit,firefox
```

### 📋 Architecture Enforcement

Automated validation prevents common issues:

```bash
# Validate architecture compliance
npx ui-canvas validate
```

**Catches violations like:**
- ❌ Inline CSS in components (breaks single source of truth)
- ❌ Duplicate component HTML (violates DRY principle)
- ❌ Layer dependency violations (pages importing workflows)
- ❌ Missing component references (pages with raw HTML instead of component refs)

## CLI Commands

### Project Management
```bash
npx ui-canvas init [project-name]     # Initialize new project
npx ui-canvas check-prompts           # Analyze AI prompt setup
npx ui-canvas setup-prompts [1|2|3]   # Configure AI integration
npx ui-canvas serve                   # Start development server
npx ui-canvas validate                # Check architecture compliance
```

### Canvas Workflow
```bash
npx ui-canvas canvas stage <mockup>   # Stage SuperDesign mockup
npx ui-canvas canvas list             # List staged mockups  
npx ui-canvas canvas archive <file> <name>  # Archive approved mockup
npx ui-canvas canvas clear            # Clear staging area
```

### Component Development
```bash
npx ui-canvas create-component <name> --props "prop1,prop2"  # Create new component
npx ui-canvas init-components                                # Initialize web components infrastructure
```

### Component Registry
```bash
npx ui-canvas registry scan           # Update component registry
npx ui-canvas registry list           # List all components  
npx ui-canvas registry docs           # Generate documentation
npx ui-canvas registry info <name>    # Component details
```

### Testing & Validation
```bash
npx ui-canvas validate-all            # Complete validation suite
npx ui-canvas test                    # Visual regression tests
npx ui-canvas tokens                  # CSS token validation
npx ui-canvas screenshot <file>       # Take reference screenshot
```

## Configuration

Customize via `ui-canvas.config.js`:

```javascript
export default {
  // Project type
  framework: 'vanilla', // 'react', 'vue', 'angular'
  
  // Three-layer structure
  layers: {
    components: 'components',
    pages: 'pages', 
    workflows: 'workflows'
  },
  
  // Canvas staging
  canvas: {
    stagingDir: '.superdesign/design_iterations',
    approvedDir: 'mockups/approved',
    screenshotsDir: 'mockups/screenshots'
  },
  
  // Architecture enforcement
  validation: {
    cssSource: 'styles/main.css',
    enforceWebComponents: true,
    blockInlineCSS: true,
    preventDuplication: true
  },
  
  // Visual testing
  testing: {
    browsers: ['chromium', 'firefox', 'webkit'],
    viewports: [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1024, height: 768, name: 'desktop' }
    ]
  }
}
```

## Project Templates

Framework supports multiple project types:

```bash
# Pure HTML/CSS (default)
npx ui-canvas init --template=vanilla

# React with TypeScript  
npx ui-canvas init --template=react

# Vue 3 with Composition API
npx ui-canvas init --template=vue

# Angular 17+
npx ui-canvas init --template=angular
```

## Integration Examples

### With SuperDesign Extension

1. **Generate Design**: Use SuperDesign to create mockup from prompt
   ```
   SuperDesign: "Create a user dashboard with task cards and progress charts"
   → Generates: .superdesign/design_iterations/user-dashboard.html
   ```

2. **Stage for Development**: Framework stages mockup for iteration
   ```bash
   npx ui-canvas canvas stage user-dashboard
   → Available at: http://localhost:3000/canvas/user-dashboard.html
   ```

3. **Develop Components**: Break mockup into reusable components
   ```bash
   npx ui-canvas generate component task-card --type=card --variant=compact
   ```

4. **Archive Approved**: Move to permanent reference
   ```bash
   npx ui-canvas canvas archive user-dashboard.html dashboard-v1
   → Creates visual reference with screenshots
   ```

### Component Development Workflow

```html
<!-- SuperDesign generates this mockup -->
<div class="dashboard">
  <div class="task-card">
    <h3>Complete onboarding</h3>
    <p>Set up your profile</p>
    <span class="status">In Progress</span>
  </div>
</div>
```

```html
<!-- Framework converts to component reference -->
<!-- @component: components/cards/task_card_compact.html -->
<!-- @props: { title: "Complete onboarding", description: "Set up your profile", status: "in-progress" } -->
<!-- COMPONENT INSERTION POINT: task_card_compact -->
```

```javascript
// Framework generates web component
class TaskCardCompact extends HTMLElement {
  connectedCallback() {
    const { title, description, status } = this.dataset;
    this.className = 'card-compact task-card';
    this.innerHTML = `
      <h3>${title}</h3>
      <p>${description}</p>
      <span class="status status-${status}">${status}</span>
    `;
  }
}
customElements.define('task-card-compact', TaskCardCompact);
```

## Why Use This Framework?

### Without UI Canvas Framework
- ❌ SuperDesign mockups remain static files
- ❌ No systematic way to convert designs to production code
- ❌ Copy-paste leads to inconsistent components
- ❌ No testing for design regression
- ❌ Mockups get lost or become outdated

### With UI Canvas Framework  
- ✅ Structured pathway from mockup to production
- ✅ Enforced three-layer architecture prevents technical debt
- ✅ Reusable web components ensure consistency
- ✅ Visual testing catches regressions automatically
- ✅ Permanent mockup archive maintains design history
- ✅ Single source of truth CSS prevents style duplication

## Architecture Principles

### Single Source of Truth
- **CSS**: All styles in `styles/main.css`
- **Components**: One HTML file per component
- **References**: Pages use component references, not raw HTML

### Three-Layer Separation
- **Layer 1** (Components): Never imports from Layer 2 or 3
- **Layer 2** (Pages): Imports Layer 1, never Layer 3  
- **Layer 3** (Workflows): Can import Layer 1 and 2

### Component Consistency
- Standard naming: `{name}_{type}_{variant}.html`
- Props documentation in comments
- Development placeholders for references
- Web component JavaScript for interactivity

## 📚 Quick Reference

### Most Common Commands
```bash
# 🚀 Setup (one-time)
npx ui-canvas init my-project
npx ui-canvas setup-prompts 3
npx ui-canvas init-components

# 🏗️ Daily Development  
npx ui-canvas create-component my-component --props "title,status"
npx ui-canvas canvas stage mockup-name
npx ui-canvas validate-all

# 🔍 Before Every Commit
npx ui-canvas test
npx ui-canvas registry scan
npx ui-canvas validate-all
```

### Emergency Troubleshooting
```bash
# Component registry issues
npx ui-canvas registry scan --force

# Visual test failures  
npx ui-canvas test --update-snapshots

# Architecture violations
npx ui-canvas validate --fix
```

**💡 Need detailed guidance?** See the [**Recommended Workflow Guide**](./WORKFLOW.md)

## Contributing

This framework complements SuperDesign's design generation capabilities. Contributions should:

1. Maintain compatibility with SuperDesign's `.superdesign/` directory structure
2. Follow three-layer architecture principles
3. Include comprehensive visual testing
4. Provide clear integration examples
5. Focus on production infrastructure needs

## License

MIT © [Sati Bodhi](https://github.com/sati-bodhi)

---

**🤝 Works with [SuperDesign](https://github.com/superdesigndev/superdesign)** - The first design agent that lives inside your IDE