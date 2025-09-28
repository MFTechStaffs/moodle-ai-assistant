#!/bin/bash

# Test script for Moodle AI Assistant
set -e

echo "🧪 Running Moodle AI Assistant Tests..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Test server
test_server() {
    log_info "Testing local server..."
    
    cd local-server
    npm test
    cd ..
    
    log_success "Server tests passed"
}

# Test extension
test_extension() {
    log_info "Testing VS Code extension..."
    
    cd extension
    npm test
    cd ..
    
    log_success "Extension tests passed"
}

# Integration test
test_integration() {
    log_info "Running integration tests..."
    
    # Start server in background
    cd local-server
    npm start &
    SERVER_PID=$!
    cd ..
    
    sleep 5
    
    # Test health endpoint
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        log_success "Health check passed"
    else
        log_error "Health check failed"
        kill $SERVER_PID
        exit 1
    fi
    
    # Test stats endpoint
    if curl -f http://localhost:3000/api/stats > /dev/null 2>&1; then
        log_success "Stats endpoint working"
    else
        log_error "Stats endpoint failed"
    fi
    
    # Stop server
    kill $SERVER_PID
    
    log_success "Integration tests passed"
}

# Main test flow
main() {
    test_server
    test_extension
    test_integration
    
    echo ""
    log_success "All tests passed! 🎉"
}

main "$@"