#!/bin/bash

# Moodle AI Assistant Setup Script
set -e

echo "🚀 Setting up Moodle AI Assistant..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Check Node.js
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js not installed. Install Node.js 18+ first."
        exit 1
    fi
    
    log_success "Prerequisites OK"
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    
    npm install
    cd local-server && npm install && cd ..
    cd extension && npm install && cd ..
    
    log_success "Dependencies installed"
}

# Setup config
setup_configuration() {
    log_info "Setting up configuration..."
    
    if [ ! -f "config/config.json" ]; then
        cp config/config.example.json config/config.json
        log_warning "Edit config/config.json with your Moodle details"
    fi
    
    mkdir -p local-server/data local-server/logs browser-sessions
    log_success "Configuration ready"
}

# Initialize database
initialize_database() {
    log_info "Initializing database..."
    cd local-server && npm run db:migrate && cd ..
    log_success "Database initialized"
}

# Build extension
build_extension() {
    log_info "Building extension..."
    cd extension && npm run build && cd ..
    log_success "Extension built"
}

# Main setup
main() {
    check_prerequisites
    install_dependencies
    setup_configuration
    initialize_database
    build_extension
    
    echo ""
    log_success "Setup Complete!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Edit config/config.json"
    echo "2. Run: npm run dev"
    echo "3. Open VS Code"
    echo "4. Install extension from extension/*.vsix"
}

main "$@"