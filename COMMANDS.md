# UI Canvas Framework - Command Cheat Sheet

## 🚀 Initial Setup

```bash
# Create new project
npx ui-canvas init my-project

# Analyze AI setup  
npx ui-canvas check-prompts

# Setup AI integration (recommended: option 3)
npx ui-canvas setup-prompts 3

# Initialize web components infrastructure
npx ui-canvas init-components

# Start development server
npx ui-canvas serve
```

## 🏗️ Component Development

```bash
# Create new component
npx ui-canvas create-component task-card --props "title,status,priority"

# Create component with specific layer
npx ui-canvas create-component user-profile --layer component --props "name,avatar"

# Initialize component registry
npx ui-canvas registry init

# Update component registry  
npx ui-canvas registry scan

# List all components
npx ui-canvas registry list

# Search components
npx ui-canvas registry list --search "card"

# Get component info
npx ui-canvas registry info task-card

# Generate component docs
npx ui-canvas registry docs

# Validate registry integrity
npx ui-canvas registry validate
```

## 🎨 Canvas Management

```bash
# Stage mockup for development
npx ui-canvas canvas stage dashboard-mockup

# List staged mockups
npx ui-canvas canvas list

# Archive approved mockup
npx ui-canvas canvas archive staged-file.html dashboard-v1

# Clear staging area
npx ui-canvas canvas clear

# Check canvas status
npx ui-canvas canvas status
```

## 🧪 Testing & Validation

```bash
# Run complete validation suite (recommended before commits)
npx ui-canvas validate-all

# Architecture validation only
npx ui-canvas validate

# Visual regression tests
npx ui-canvas test

# Test specific component
npx ui-canvas test --component task-card

# Update visual snapshots (after intentional design changes)
npx ui-canvas test --update-snapshots

# CSS token validation
npx ui-canvas tokens

# Generate token report
npx ui-canvas tokens --report

# Take reference screenshot
npx ui-canvas screenshot mockup.html
```

## 🔧 Daily Workflow Commands

### Morning Setup
```bash
npx ui-canvas registry scan
npx ui-canvas canvas status
git status
```

### During Development  
```bash
# Create component → Test → Validate
npx ui-canvas create-component my-component --props "prop1,prop2"
npx ui-canvas canvas stage components/cards/my-component.html  
npx ui-canvas test --component my-component
```

### Before Commits
```bash
npx ui-canvas validate-all
```

## 🚨 Troubleshooting

```bash
# Force registry rescan
npx ui-canvas registry scan --force

# Update visual snapshots after design changes
npx ui-canvas test --update-snapshots

# Fix architecture violations (if supported)
npx ui-canvas validate --fix

# Generate detailed token report  
npx ui-canvas tokens --report

# Clear and rebuild canvas
npx ui-canvas canvas clear
npx ui-canvas canvas status
```

## 📁 File Locations

```bash
# Component registry
components/manifest.json

# Visual test snapshots
tests/visual/snapshots/

# CSS token report
css-token-report.json

# Component documentation
docs/components/

# Canvas staging
.superdesign/design_iterations/

# Approved mockups
mockups/approved/

# Architecture config
ui-canvas.config.js
```

## 🎯 Success Indicators

### ✅ Healthy Project State
- `npx ui-canvas validate-all` passes completely
- No visual test failures
- Component registry up to date
- Zero hardcoded CSS values
- BEM naming consistency maintained

### ❌ Needs Attention  
- Visual tests failing → Review changes, update snapshots if intentional
- Architecture violations → Fix layer separation issues
- Registry out of sync → Run `npx ui-canvas registry scan`
- CSS token violations → Replace hardcoded values with design tokens

---

**💡 Pro Tip**: Bookmark this cheat sheet and keep `WORKFLOW.md` open during development for detailed guidance!