# Context-Aware UI Development with Regression Prevention

**📚 IMPORTANT**: This framework includes comprehensive regression prevention. Follow the [Recommended Development Workflow](./WORKFLOW.md) for step-by-step guidance.

**🤖 For AI Assistants**: See [Workflow Summary](./WORKFLOW-SUMMARY.md) for condensed implementation guidance and essential commands.

## Context Switching

### 🎨 SuperDesign Mode
**When:** User asks to "design", "create mockup", "prototype" OR working in `.superdesign/` folder

**Reference:** See `CLAUDE-superdesign.md` for complete SuperDesign workflow and guidelines

**Output:** Creative mockups in `.superdesign/design_iterations/`

---

### 🏗️ Framework Mode  
**When:** User asks to "build component", "create architecture", "validate" OR working in `components/`, `pages/`, `workflows/` folders

**Reference:** See `CLAUDE-framework.md` for three-layer architecture guidelines

**Key Requirements:**
- Components (Layer 1) → Pages (Layer 2) → Workflows (Layer 3)
- CSS single source of truth in `styles/main.css`
- Component references instead of HTML duplication
- **Regression prevention** with automated validation and testing

**Essential Commands:**
```bash
# Complete validation suite (use before commits)
npx ui-canvas validate-all

# Component development
npx ui-canvas create-component my-card --props "title,status"
npx ui-canvas registry scan

# Testing
npx ui-canvas test              # Visual regression tests
npx ui-canvas tokens            # CSS token validation

# Canvas staging
npx ui-canvas canvas stage mockup-name
npx ui-canvas serve            # Development server
```

---

## Mode Switching Commands
- "Switch to design mode" → Activates SuperDesign workflow from `CLAUDE-superdesign.md`
- "Switch to framework mode" → Activates architecture enforcement from `CLAUDE-framework.md`
- "Show current mode" → Displays active context and available commands
- Default: Auto-detect from user request and file context

## Project-Specific Instructions
[Add your project-specific guidelines, naming conventions, and requirements here]