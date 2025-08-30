# UI Canvas Framework - Workflow Summary for AI Assistants

## Quick Development Protocol

### 🚀 Initial Setup (One-time)
```bash
npx ui-canvas init project-name
npx ui-canvas setup-prompts 3        # Integrated mode
npx ui-canvas init-components         # Initialize web components
npx ui-canvas registry init           # Create registry
```

### 🏗️ Component Development Flow
1. **Create Component**
   ```bash
   npx ui-canvas create-component task-card --props "title,status,priority"
   ```

2. **Test Component**
   ```bash
   npx ui-canvas canvas stage components/cards/task-card.html
   # Test at http://localhost:3000/canvas
   ```

3. **Validate Before Commit**
   ```bash
   npx ui-canvas validate-all  # REQUIRED before commits
   ```

### 🎨 SuperDesign Integration
- **Design Phase**: Create mockups in `.superdesign/design_iterations/`
- **Component Phase**: Extract components using `create-component`
- **Integration Phase**: Use component references in pages/workflows

### 📋 Component Reference Syntax
Always use this instead of duplicating HTML:
```html
<!-- @component: components/cards/task-card.html -->
<!-- @props: { title: "My Task", status: "open", priority: "high" } -->
<!-- COMPONENT INSERTION POINT: task-card -->
<div class="development-placeholder">
  <p>📋 Component Reference: task-card.html</p>
  <p>Props: title="My Task", status="open"</p>
</div>
```

### 🔍 Regression Prevention Requirements

#### Architecture Rules
- **CSS**: ALL styles in `styles/main.css` (single source of truth)
- **Components**: Use BEM naming (block__element--modifier)
- **Pages**: Only component references, never raw HTML duplication
- **Layers**: Components (L1) → Pages (L2) → Workflows (L3)

#### Essential Validation Commands
```bash
npx ui-canvas validate-all      # Complete suite (REQUIRED)
npx ui-canvas test              # Visual regression tests  
npx ui-canvas tokens            # Design system validation
npx ui-canvas registry scan     # Update component registry
```

#### Before Every Commit Checklist
- [ ] `npx ui-canvas validate-all` passes
- [ ] Visual tests pass (no unexpected changes)
- [ ] Component registry updated
- [ ] CSS tokens properly used (no hardcoded values)

### 🚨 Common Pitfalls to Avoid

#### ❌ Architecture Violations
- Inline CSS in components
- Duplicating component HTML across files
- Hardcoded values instead of CSS tokens
- Breaking layer dependencies

#### ✅ Correct Approach
- All CSS in `styles/main.css`
- Component references only
- CSS custom properties: `var(--color-primary)`
- Strict layer separation

### 📁 Directory Structure
```
project/
├── components/
│   ├── cards/           # Layer 1: Individual components
│   ├── sections/        # Reusable sections  
│   └── manifest.json    # Component registry
├── pages/               # Layer 2: Component compositions
├── workflows/           # Layer 3: User journey blueprints
├── styles/main.css      # Single source of truth CSS
├── tests/visual/        # Visual regression snapshots
└── .superdesign/        # SuperDesign mockups
```

### 🎯 Success Indicators
- `npx ui-canvas validate-all` passes completely
- Zero visual regression test failures  
- Component registry up to date
- Design system consistency maintained
- No hardcoded CSS values in codebase

### 🔧 Emergency Fixes
```bash
# Registry issues
npx ui-canvas registry scan --force

# Visual test updates (after intentional design changes)
npx ui-canvas test --update-snapshots

# Token violations
npx ui-canvas tokens --report  # See detailed issues
```

## Key Framework Commands for AI Implementation

### Component Creation
```bash
npx ui-canvas create-component component-name --props "prop1,prop2,prop3"
```

### Registry Management
```bash
npx ui-canvas registry scan     # Update after creating components
npx ui-canvas registry list     # Show all components
npx ui-canvas registry info name  # Component details
```

### Canvas & Testing
```bash
npx ui-canvas canvas stage mockup-name  # Stage for testing
npx ui-canvas serve                     # Start dev server
npx ui-canvas test                      # Visual regression tests
```

### Validation Suite
```bash
npx ui-canvas validate-all  # Complete validation (ESSENTIAL)
```

---

**🎯 AI Implementation Note**: Always run `npx ui-canvas validate-all` after implementing any component or page changes. This comprehensive validation prevents the regression loops that originally plagued UI development workflows.