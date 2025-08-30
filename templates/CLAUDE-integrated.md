# Context-Aware UI Development

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
- Run `npx ui-canvas validate` for compliance

**Commands:**
```bash
npx ui-canvas validate          # Check architecture
npx ui-canvas canvas stage      # Stage components  
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