# Three-Layer Architecture for Component-Based UI Design

## Architecture Overview

This codebase implements a **three-layer architecture** that separates concerns between individual components, page composition, and user journey flows:

### Layer 1: Components (Building Blocks)
- **`components/cards/`** - Individual card variants organized by type:
  - `observation/` - Observation card blueprints (compact, embedded, standard)
  - `task/` - Task card blueprints (compact_observation, compact_independent, standard)
  - `plant/` - Plant identification card blueprints (compact, embedded, standard)
- **`components/sections/`** - Reusable sections that compose into cards:
  - `card_location_section.html` - Community map location selector
  - `card_status_badges.html` - Status indicator badges
  - `card_image_carousel.html` - Photo galleries and carousels
  - `card_embedded_universal.html` - Universal embedded content container
- **`components/manifest.json`** - Complete component documentation with props, usage patterns, and composition examples

### Layer 2: Pages (Composition Blueprints)
- **`pages/`** - Show how components compose into complete screen layouts, organized by page type:
  - `dashboards/` - Dashboard composition patterns
  - `tasks/` - Task management interface patterns
  - `community/` - Community features and social interactions
- Pages use **component reference syntax** instead of duplicating HTML:
  ```html
  <!-- @component: components/cards/observation/observation_card_compact.html -->
  <!-- @props: { title: "Task name", priority: "high", status: "open" } -->
  <!-- COMPONENT INSERTION POINT: observation_card_compact -->
  ```

### Layer 3: Workflows (User Journey Blueprints)
- **`workflows/`** - Multi-step user experiences organized by workflow type:
  - `observations/` - Complete observation creation journey
  - `tasks/` - Task management workflows
  - `community/` - Community interaction flows
- Shows state transitions, data flow, and navigation patterns between screens
- Workflows reference both components and pages to demonstrate complete user experiences

## Component Reference System

### Syntax
```html
<!-- @component: path/to/component.html -->
<!-- @props: { key: "value", priority: "high", status: "open" } -->
<!-- COMPONENT INSERTION POINT: component_name -->
<div class="development-placeholder">
  <p>📋 Component Reference: component_name.html</p>
  <p>Props: key="value", priority="high"</p>
</div>
```

### Benefits
- **Single Source of Truth**: Each component has one authoritative blueprint
- **No Duplication**: Pages reference components instead of copying HTML
- **Props Documentation**: All component interfaces clearly documented
- **Development Visibility**: Component references show as colored placeholders
- **Standards Enforcement**: Consistent component usage across the application

## Implementation Guidelines

### For Components (Layer 1)
- Each component is a complete, standalone HTML file
- Include comprehensive props documentation in comments
- Implement fallback designs for missing assets (images, etc.)
- Use consistent naming: `[type]_card_[variant].html`
- Test components in isolation before composing into pages

### For Pages (Layer 2)
- Never duplicate component HTML - always use component references
- Focus on layout patterns, spacing, and responsive behavior
- Document composition patterns and layout decisions
- Show different component states and variants
- Include visual placeholders during development

### For Workflows (Layer 3)
- Map complete user journeys across multiple pages
- Document state transitions and data flow
- Reference both components and pages appropriately
- Include navigation patterns and progress indicators
- Show error states and edge cases

## Development Workflow

1. **Design Individual Components** - Create blueprints in components/cards/ or components/sections/
2. **Test Component Isolation** - Use `npx ui-canvas canvas stage` to stage and test individual components
3. **Compose Page Layouts** - Create page compositions using component references
4. **Map User Journeys** - Document workflows showing complete user experiences
5. **Validate Architecture** - Run `npx ui-canvas validate` to ensure single source of truth is maintained

## UI Canvas Framework Commands

### Architecture Validation
Run the three-layer architecture integrity test:
```bash
npx ui-canvas validate
```

Validates:
- **CSS Single Source of Truth**: All styles consolidated in `styles/main.css`
- **Layer Dependencies**: Components don't reference other layers
- **Component References**: Pages/workflows use component reference syntax
- **No Inline CSS**: Prevents style duplication and inconsistency

### Canvas Management (Component Staging)
Stage and test individual components during development:
```bash
# Stage individual components for testing
npx ui-canvas canvas stage components/cards/observation/observation_card_compact.html
npx ui-canvas canvas stage mockup-name  # Creates new template

# List staged components
npx ui-canvas canvas list

# Show canvas status
npx ui-canvas canvas status

# Remove components from canvas
npx ui-canvas canvas unstage mockup-name.html

# Clear entire canvas
npx ui-canvas canvas clear
```

### Development Server
Start development server with canvas preview:
```bash
npx ui-canvas serve
# Accessible at http://localhost:3000
# Canvas mockups: http://localhost:3000/canvas
# Approved mockups: http://localhost:3000/mockups/approved
```

### Screenshot & Testing
Take reference screenshots for visual testing:
```bash
npx ui-canvas screenshot path/to/mockup.html
```

## CSS Architecture Requirements

### Single Source of Truth
- **ALL CSS must be in `styles/main.css`**
- No inline styles allowed in components
- No component-specific CSS files
- Use CSS custom properties for theming

### Component Styles
```css
/* Component-specific styles in main.css */
.card {
    background: var(--color-white);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
}

.card-observation {
    border-left: 4px solid var(--color-primary);
}

.card-task {
    border-left: 4px solid var(--color-secondary);
}
```

### Design Tokens
Use CSS custom properties for consistent theming:
```css
:root {
    /* Colors */
    --color-primary: #059669;
    --color-secondary: #f59e0b;
    
    /* Spacing */
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    
    /* Typography */
    --font-size-base: 1rem;
    --font-size-lg: 1.125rem;
    
    /* Borders & Radius */
    --radius-md: 0.375rem;
    --radius-lg: 0.5rem;
}
```

## Error Prevention

### Common Architecture Violations
❌ **Inline CSS in components**
```html
<div style="padding: 1rem; background: white;">  <!-- WRONG -->
```

✅ **CSS classes from main.css**
```html
<div class="card p-4 bg-white">  <!-- CORRECT -->
```

❌ **Duplicating component HTML**
```html
<!-- Copying entire component HTML in multiple files -->
```

✅ **Component references**
```html
<!-- @component: components/cards/observation/observation_card_compact.html -->
<!-- COMPONENT INSERTION POINT: observation_card_compact -->
```

### Validation Workflow
Always run validation before committing:
```bash
npx ui-canvas validate
# Fix any violations shown
git add .
git commit -m "feat: add new component with architecture compliance"
```

## Success Metrics

A properly architected project will show:
- ✅ **Zero architecture violations** in validation
- ✅ **Single CSS file** containing all styles
- ✅ **Component references** used consistently
- ✅ **No style duplication** across files
- ✅ **Clear layer separation** (Components → Pages → Workflows)

Follow this architecture to eliminate UI regression loops and maintain design consistency across your application.