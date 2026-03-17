#!/bin/bash
# DevPortal Tunnel CLI Installer for macOS/Linux
# Usage: curl -fsSL https://devportal.stylnode.in/install.sh | bash

set -e

BOLD='\033[1m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}${BOLD}"
echo "╔═══════════════════════════════════════════════════╗"
echo "║         DevPortal Tunnel CLI Installer            ║"
echo "╚═══════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if Node.js is installed
check_node() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v | cut -d'v' -f2)
        MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1)
        if [ "$MAJOR_VERSION" -ge 18 ]; then
            echo -e "${GREEN}✓${NC} Node.js v$NODE_VERSION detected"
            return 0
        else
            echo -e "${YELLOW}⚠${NC} Node.js v$NODE_VERSION found, but v18+ is required"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠${NC} Node.js not found"
        return 1
    fi
}

# Install Node.js
install_node() {
    echo -e "${BLUE}→${NC} Installing Node.js..."

    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install node
        else
            echo -e "${YELLOW}Installing Homebrew first...${NC}"
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            brew install node
        fi
    else
        # Linux
        if command -v apt-get &> /dev/null; then
            # Debian/Ubuntu
            curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
            sudo apt-get install -y nodejs
        elif command -v yum &> /dev/null; then
            # RHEL/CentOS
            curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
            sudo yum install -y nodejs
        elif command -v pacman &> /dev/null; then
            # Arch Linux
            sudo pacman -S nodejs npm
        else
            echo -e "${RED}✗${NC} Could not detect package manager. Please install Node.js manually:"
            echo "  https://nodejs.org/en/download/"
            exit 1
        fi
    fi

    echo -e "${GREEN}✓${NC} Node.js installed successfully"
}

# Install devportal-tunnel
install_cli() {
    echo -e "${BLUE}→${NC} Installing devportal-tunnel..."
    npm install -g devportal-tunnel
    echo -e "${GREEN}✓${NC} devportal-tunnel installed successfully"
}

# Main installation
main() {
    if ! check_node; then
        install_node
    fi

    install_cli

    echo ""
    echo -e "${GREEN}${BOLD}Installation complete!${NC}"
    echo ""
    echo -e "Get started with:"
    echo -e "  ${BOLD}devportal-tunnel start 3000${NC}    # Expose port 3000"
    echo -e "  ${BOLD}devportal-tunnel ls${NC}            # List active tunnels"
    echo -e "  ${BOLD}devportal-tunnel --help${NC}        # Show all commands"
    echo ""
    echo -e "Documentation: ${BLUE}https://devportal.stylnode.in/docs${NC}"
}

main
