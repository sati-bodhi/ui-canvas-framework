# UI Canvas Framework - Recommended Development Workflow

## Overview

This workflow ensures regression-free UI development by combining the three-layer architecture with automated validation and testing at each stage.

## 🚀 Getting Started

### 1. Initialize Your Project
```bash
npx ui-canvas init my-project
npx ui-canvas check-prompts    # Analyze current AI setup
npx ui-canvas setup-prompts 3  # Choose integrated mode (recommended)
```

### 2. Set Up Component Infrastructure
```bash
npx ui-canvas init-components   # Initialize web components framework
npx ui-canvas registry init     # Create component registry
```

## 🏗️ Component Development Workflow

### Phase 1: Design Components (Layer 1)
```bash
# Create individual components
npx ui-canvas create-component task-card --props "title,status,priority"
npx ui-canvas create-component user-profile --props "name,avatar,role"

# Update registry after creating components
npx ui-canvas registry scan
```

**Best Practice**: Test each component in isolation before composing into pages.

### Phase 2: Compose Pages (Layer 2)
```bash
# Stage components for testing
npx ui-canvas canvas stage components/cards/task-card.html
npx ui-canvas canvas stage components/cards/user-profile.html

# Create page compositions using component references
# (Manual creation using component reference syntax)
```

### Phase 3: Document Workflows (Layer 3)
```bash
# Archive approved compositions
npx ui-canvas canvas archive staged-page.html dashboard-v1

# Document complete user journeys in workflows/
```

## 🔍 Continuous Validation Workflow

### Before Every Commit
```bash
# Run complete validation suite
npx ui-canvas validate-all

# This runs:
# 1. Architecture validation
# 2. Component registry validation  
# 3. CSS token validation
# 4. Visual regression tests
```

### Component-Specific Testing
```bash
# Test individual components
npx ui-canvas test --component task-card

# Update visual snapshots when design changes
npx ui-canvas test --update-snapshots
```

### CSS & Design System Validation
```bash
# Validate design tokens and BEM consistency
npx ui-canvas tokens --report

# Check for hardcoded values and inconsistencies
npx ui-canvas tokens
```

## 📋 Registry Management Workflow

### Daily Development
```bash
# List all components
npx ui-canvas registry list

# Search for specific components
npx ui-canvas registry list --search "card"

# Get component details
npx ui-canvas registry info task-card
```

### Documentation Generation
```bash
# Generate component documentation
npx ui-canvas registry docs

# Validate registry integrity
npx ui-canvas registry validate
```

## 🎨 SuperDesign Integration Workflow

### Mockup to Component Flow
1. **Design Phase**: Use SuperDesign to create mockups in `.superdesign/design_iterations/`
2. **Component Extraction**: Identify reusable components from mockups
3. **Component Creation**: Use `npx ui-canvas create-component` to scaffold
4. **Reference Integration**: Replace mockup sections with component references
5. **Validation**: Run `npx ui-canvas validate-all` before approval

### Context Switching
- **CLAUDE.md**: Main context switcher
- **CLAUDE-superdesign.md**: SuperDesign mockup workflow
- **CLAUDE-framework.md**: Component development workflow

## 🚨 Regression Prevention Protocol

### When Visual Tests Fail
```bash
# 1. Review the differences
npx ui-canvas test
# Check diff images in tests/visual/snapshots/

# 2. If changes are intentional
npx ui-canvas test --update-snapshots

# 3. If changes are bugs, fix and retest
# Fix the component
npx ui-canvas test --component specific-component
```

### When Token Validation Fails
```bash
# 1. Check hardcoded values
npx ui-canvas tokens --report

# 2. Fix violations by using design tokens
# Replace hardcoded colors with var(--color-primary)
# Replace hardcoded spacing with var(--spacing-md)

# 3. Validate BEM naming consistency
# Ensure all classes follow block__element--modifier pattern
```

## 🔄 Recommended Daily Workflow

### Morning Setup
```bash
git status                           # Check current state
npx ui-canvas registry scan          # Ensure registry is up to date
npx ui-canvas canvas status          # Check staged components
```

### During Development
```bash
# For each new component:
npx ui-canvas create-component my-component --props "prop1,prop2"
npx ui-canvas canvas stage components/cards/my-component.html
# Test in browser, iterate
npx ui-canvas test --component my-component

# For each page composition:
# Create page with component references
npx ui-canvas validate              # Quick architecture check
```

### Before Commits
```bash
npx ui-canvas validate-all          # Complete validation
git add .
git commit -m "feat: add my-component with validation"
```

## 🎯 Key Success Metrics

### Regression Prevention
- ✅ All visual tests passing
- ✅ Zero hardcoded CSS values
- ✅ BEM naming consistency
- ✅ Component registry integrity

### Architecture Compliance
- ✅ Single source of truth CSS
- ✅ Component reference usage (no duplication)
- ✅ Three-layer separation maintained
- ✅ Framework-agnostic outputs

### Development Efficiency
- ✅ Components reused across pages
- ✅ Design system tokens consistently used
- ✅ Automated documentation up to date
- ✅ Clear component discovery via registry

## 🆘 Troubleshooting Common Issues

### "Component not found in registry"
```bash
npx ui-canvas registry scan --force
```

### "Visual test failures"
```bash
# Review what changed
ls tests/visual/snapshots/*-diff.png
# Update if changes are intentional
npx ui-canvas test --update-snapshots
```

### "CSS token violations"
```bash
# Generate detailed report
npx ui-canvas tokens --report
# Fix hardcoded values in styles/main.css
```

### "Architecture violations"
```bash
npx ui-canvas validate
# Follow guidance to fix layer separation issues
```

## 📚 Additional Resources

- Component examples: `components/cards/` and `components/sections/`
- Registry documentation: Run `npx ui-canvas registry docs`
- Visual test snapshots: `tests/visual/snapshots/`
- Architecture validation: `npx ui-canvas validate --help`

---

**Remember**: The framework prevents regression loops by enforcing consistency at every stage. Trust the validation tools and fix issues immediately when they're detected.