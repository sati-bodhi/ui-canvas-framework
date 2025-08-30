#!/usr/bin/env bash
#
# Canvas Staging System for GrowTogether UI
# Manages full-page mockups and visual design workflow
#

set -e

CANVAS_DIR=".superdesign/design_iterations"
MOCKUP_DIR="mockups"
APPROVED_DIR="$MOCKUP_DIR/approved"
SCREENSHOTS_DIR="$MOCKUP_DIR/screenshots"
ITERATIONS_DIR="$MOCKUP_DIR/iterations"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

usage() {
    echo "Canvas Staging System"
    echo "===================="
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  stage <file>           Stage a mockup for development"
    echo "  unstage <file>         Remove mockup from staging"
    echo "  list                   List all staged mockups"
    echo "  clear                  Clear all staged mockups"
    echo "  status                 Show canvas status"
    echo "  serve                  Start development server"
    echo "  archive <file> <name>  Archive approved mockup"
    echo "  screenshot <file>      Take reference screenshot"
    echo "  compare <file1> <file2> Visual comparison"
    echo ""
    echo "Examples:"
    echo "  $0 stage dashboard-mobile.html"
    echo "  $0 archive dashboard-mobile.html dashboard-v3"
    echo "  $0 screenshot mockups/approved/dashboard-v3.html"
}

ensure_directories() {
    mkdir -p "$CANVAS_DIR" "$APPROVED_DIR" "$SCREENSHOTS_DIR" "$ITERATIONS_DIR"
}

stage_mockup() {
    local file="$1"
    
    if [ -z "$file" ]; then
        echo -e "${RED}❌ Error: File name required${NC}"
        echo "Usage: $0 stage <file.html>"
        exit 1
    fi
    
    # Add .html extension if missing
    if [[ "$file" != *.html ]]; then
        file="${file}.html"
    fi
    
    local staged_file="$CANVAS_DIR/$file"
    
    if [ -f "$staged_file" ]; then
        echo -e "${YELLOW}⚠️  File already staged: $file${NC}"
        return
    fi
    
    # Create basic HTML template if file doesn't exist
    if [ ! -f "$file" ]; then
        create_mockup_template "$staged_file" "$file"
        echo -e "${GREEN}✅ Created new mockup template: $file${NC}"
    else
        cp "$file" "$staged_file"
        echo -e "${GREEN}✅ Staged mockup: $file${NC}"
    fi
    
    echo -e "${BLUE}🌐 View at: http://localhost:3000/canvas/$file${NC}"
}

create_mockup_template() {
    local file="$1"
    local name="$2"
    
    cat > "$file" << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>$name - Mockup</title>
    <link rel="stylesheet" href="../../styles/main.css">
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
    <style>
        /* Mockup-specific styles (will be moved to main.css in production) */
        body { 
            background: #f3f4f6; 
            margin: 0; 
            padding: 1rem; 
        }
        .mockup-container { 
            max-width: 375px; 
            margin: 0 auto; 
            background: white; 
            min-height: 667px; 
            border-radius: 1rem;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
    </style>
</head>
<body>
    <div class="mockup-container">
        <div style="padding: 1rem;">
            <h1>$name Mockup</h1>
            <p>Start designing your full-page mockup here.</p>
            <p>This template includes:</p>
            <ul>
                <li>Main CSS stylesheet</li>
                <li>Lucide icons</li>
                <li>Mobile container (375px)</li>
                <li>Design tokens available</li>
            </ul>
        </div>
    </div>
    
    <script>
        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    </script>
</body>
</html>
EOF
}

unstage_mockup() {
    local file="$1"
    
    if [ -z "$file" ]; then
        echo -e "${RED}❌ Error: File name required${NC}"
        exit 1
    fi
    
    if [[ "$file" != *.html ]]; then
        file="${file}.html"
    fi
    
    local staged_file="$CANVAS_DIR/$file"
    
    if [ ! -f "$staged_file" ]; then
        echo -e "${YELLOW}⚠️  File not staged: $file${NC}"
        exit 1
    fi
    
    rm "$staged_file"
    echo -e "${GREEN}✅ Unstaged mockup: $file${NC}"
}

list_mockups() {
    echo -e "${BLUE}📋 Staged Mockups${NC}"
    echo "=================="
    
    if [ ! -d "$CANVAS_DIR" ] || [ -z "$(ls -A "$CANVAS_DIR" 2>/dev/null)" ]; then
        echo "No mockups staged"
        return
    fi
    
    for file in "$CANVAS_DIR"/*.html; do
        if [ -f "$file" ]; then
            local basename=$(basename "$file")
            local size=$(du -h "$file" | cut -f1)
            local modified=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M" "$file" 2>/dev/null || stat -c "%y" "$file" 2>/dev/null | cut -d' ' -f1,2 | cut -d'.' -f1)
            echo "  $basename ($size) - $modified"
        fi
    done
}

clear_canvas() {
    if [ -d "$CANVAS_DIR" ]; then
        rm -f "$CANVAS_DIR"/*.html
        echo -e "${GREEN}✅ Canvas cleared${NC}"
    else
        echo -e "${YELLOW}⚠️  Canvas already empty${NC}"
    fi
}

show_status() {
    echo -e "${BLUE}📊 Canvas Status${NC}"
    echo "=================="
    
    local staged_count=0
    if [ -d "$CANVAS_DIR" ]; then
        staged_count=$(find "$CANVAS_DIR" -name "*.html" | wc -l)
    fi
    
    local approved_count=0
    if [ -d "$APPROVED_DIR" ]; then
        approved_count=$(find "$APPROVED_DIR" -name "*.html" | wc -l)
    fi
    
    echo "Staged mockups: $staged_count"
    echo "Approved mockups: $approved_count"
    
    if [ $staged_count -gt 0 ]; then
        echo ""
        echo -e "${BLUE}📋 Recent Activity:${NC}"
        find "$CANVAS_DIR" -name "*.html" -exec stat -f "%Sm %N" -t "%m-%d %H:%M" {} \; 2>/dev/null | sort -r | head -5 | while read line; do
            echo "  $line"
        done 2>/dev/null || find "$CANVAS_DIR" -name "*.html" -printf "%TY-%Tm-%Td %TH:%TM %f\n" 2>/dev/null | sort -r | head -5 | while read line; do
            echo "  $line"
        done 2>/dev/null || echo "  (status info unavailable)"
    fi
}

start_server() {
    echo -e "${BLUE}🚀 Starting Canvas Development Server${NC}"
    echo "===================================="
    echo ""
    echo -e "${GREEN}Canvas available at: http://localhost:3000/canvas/${NC}"
    echo -e "${GREEN}Mockups available at: http://localhost:3000/mockups/${NC}"
    echo ""
    echo "Press Ctrl+C to stop server"
    
    # Start development server with canvas and mockups accessible
    npm run dev
}

archive_mockup() {
    local file="$1"
    local name="$2"
    
    if [ -z "$file" ] || [ -z "$name" ]; then
        echo -e "${RED}❌ Error: File and name required${NC}"
        echo "Usage: $0 archive <file.html> <archive-name>"
        exit 1
    fi
    
    if [[ "$file" != *.html ]]; then
        file="${file}.html"
    fi
    
    local source_file="$CANVAS_DIR/$file"
    if [ ! -f "$source_file" ]; then
        source_file="$file"  # Try direct path
        if [ ! -f "$source_file" ]; then
            echo -e "${RED}❌ Error: Source file not found: $file${NC}"
            exit 1
        fi
    fi
    
    local archived_file="$APPROVED_DIR/${name}.html"
    
    ensure_directories
    cp "$source_file" "$archived_file"
    
    echo -e "${GREEN}✅ Archived mockup: ${name}.html${NC}"
    echo -e "${BLUE}📁 Location: $archived_file${NC}"
    
    # Automatically take reference screenshot using mockup tools
    echo -e "${BLUE}📸 Taking reference screenshots...${NC}"
    node mockup-tools.js archive "$source_file" "$name" 2>/dev/null || echo "Note: Screenshots require dev server running"
}

take_screenshot() {
    local file="$1"
    
    if [ -z "$file" ]; then
        echo -e "${RED}❌ Error: File required${NC}"
        echo "Usage: $0 screenshot <file.html>"
        exit 1
    fi
    
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ Error: File not found: $file${NC}"
        exit 1
    fi
    
    local basename=$(basename "$file" .html)
    local screenshot_file="$SCREENSHOTS_DIR/${basename}.png"
    
    ensure_directories
    
    echo -e "${BLUE}📸 Taking screenshot: $basename${NC}"
    
    # Use mockup-tools.js for screenshot capture
    if node mockup-tools.js screenshot "$file" "$screenshot_file" 2>/dev/null; then
        echo -e "${GREEN}✅ Screenshot saved: ${basename}.png${NC}"
    else
        echo -e "${YELLOW}⚠️  Screenshot capture failed. Ensure dev server is running.${NC}"
        echo "   Start server: npm run dev"
    fi
}

# Main command dispatcher
case "${1:-}" in
    stage)
        ensure_directories
        stage_mockup "$2"
        ;;
    unstage)
        unstage_mockup "$2"
        ;;
    list)
        list_mockups
        ;;
    clear)
        clear_canvas
        ;;
    status)
        show_status
        ;;
    serve)
        start_server
        ;;
    archive)
        archive_mockup "$2" "$3"
        ;;
    screenshot)
        take_screenshot "$2"
        ;;
    compare)
        echo "Visual comparison: $2 vs $3"
        echo "TODO: Implement visual diff tool"
        ;;
    help|--help|-h)
        usage
        ;;
    *)
        echo -e "${RED}❌ Error: Unknown command '${1:-}'${NC}"
        echo ""
        usage
        exit 1
        ;;
esac