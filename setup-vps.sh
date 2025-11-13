#!/bin/bash
# Coolify MCP Server - VPS Quick Setup
# Automated setup for running on VPS

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║     Coolify MCP Server - VPS Quick Setup                   ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Get current directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "📍 Project Location: $SCRIPT_DIR"
echo ""

# Step 1: Check Node.js
echo "🔍 Step 1: Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "   Please install Node.js 18+ first:"
    echo "   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
    echo "   sudo apt-get install -y nodejs"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "   ✅ Node.js version: $NODE_VERSION"
echo ""

# Step 2: Check npm
echo "🔍 Step 2: Checking npm..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed!"
    exit 1
fi

NPM_VERSION=$(npm -v)
echo "   ✅ npm version: $NPM_VERSION"
echo ""

# Step 3: Install dependencies
echo "📦 Step 3: Installing dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
    echo "   ✅ Dependencies installed"
else
    echo "   ✅ Dependencies already installed"
fi
echo ""

# Step 4: Configure environment
echo "⚙️  Step 4: Configuring environment..."
if [ ! -f ".env" ]; then
    echo "   Creating .env file..."
    cp .env.example .env
    echo "   ✅ .env file created"
    echo ""
    echo "   ⚠️  IMPORTANT: Edit .env file now!"
    echo "   Add your Coolify API token:"
    echo ""
    echo "   1. Open: https://coolify.theprofitplatform.com.au"
    echo "   2. Go to Settings → Security → API Tokens"
    echo "   3. Create new token with read/write/deploy permissions"
    echo "   4. Copy the token"
    echo "   5. Edit .env: nano .env"
    echo "   6. Paste token in COOLIFY_TOKEN field"
    echo ""
    read -p "   Press Enter after you've configured .env..."
else
    echo "   ✅ .env file already exists"
fi
echo ""

# Step 5: Build project
echo "🏗️  Step 5: Building project..."
npm run build
echo "   ✅ Build successful"
echo ""

# Step 6: Test connection
echo "🧪 Step 6: Testing Coolify connection..."
if [ -f "./test-connection.sh" ]; then
    chmod +x ./test-connection.sh
    if ./test-connection.sh; then
        echo "   ✅ Connection test passed!"
    else
        echo "   ❌ Connection test failed!"
        echo "   Please check your .env configuration"
        exit 1
    fi
else
    echo "   ⚠️  test-connection.sh not found, skipping..."
fi
echo ""

# Step 7: Choose service manager
echo "🚀 Step 7: Choose how to run the service..."
echo ""
echo "   Select an option:"
echo "   1) PM2 (recommended - process manager)"
echo "   2) systemd (system service)"
echo "   3) Manual (just build, run later)"
echo ""
read -p "   Enter choice [1-3]: " choice

case $choice in
    1)
        echo ""
        echo "   Installing with PM2..."

        # Check if PM2 is installed
        if ! command -v pm2 &> /dev/null; then
            echo "   Installing PM2..."
            npm install -g pm2
        fi

        # Stop if already running
        pm2 stop coolify-mcp 2>/dev/null || true
        pm2 delete coolify-mcp 2>/dev/null || true

        # Start with PM2
        pm2 start npm --name coolify-mcp -- start
        pm2 save

        echo ""
        echo "   ✅ Started with PM2!"
        echo ""
        echo "   Useful commands:"
        echo "   - View logs:    pm2 logs coolify-mcp"
        echo "   - View status:  pm2 status coolify-mcp"
        echo "   - Restart:      pm2 restart coolify-mcp"
        echo "   - Stop:         pm2 stop coolify-mcp"
        echo "   - Monitor:      pm2 monit"
        echo ""

        # Enable startup on boot
        read -p "   Enable auto-start on boot? [y/N]: " autostart
        if [[ $autostart =~ ^[Yy]$ ]]; then
            pm2 startup
            echo "   ✅ Auto-start enabled"
            echo "   Run the command shown above to complete setup"
        fi
        ;;

    2)
        echo ""
        echo "   Installing systemd service..."

        if [ -f "./install-service.sh" ]; then
            chmod +x ./install-service.sh
            sudo ./install-service.sh

            echo ""
            echo "   ✅ Installed as systemd service!"
            echo ""
            echo "   Useful commands:"
            echo "   - Start:   sudo systemctl start coolify-mcp"
            echo "   - Stop:    sudo systemctl stop coolify-mcp"
            echo "   - Status:  sudo systemctl status coolify-mcp"
            echo "   - Logs:    sudo journalctl -u coolify-mcp -f"
            echo "   - Enable:  sudo systemctl enable coolify-mcp"
        else
            echo "   ❌ install-service.sh not found!"
            exit 1
        fi
        ;;

    3)
        echo ""
        echo "   ✅ Build complete!"
        echo ""
        echo "   To start manually, run:"
        echo "   npm start"
        echo ""
        echo "   Or use the quick-start script:"
        echo "   ./quick-start.sh"
        ;;

    *)
        echo "   Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║              ✅ VPS SETUP COMPLETE! ✅                    ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Configure Claude Desktop on your LOCAL machine:"
echo "   Edit: ~/.config/Claude/claude_desktop_config.json"
echo ""
echo "   Add this configuration:"
echo '   {'
echo '     "mcpServers": {'
echo '       "coolify": {'
echo '         "command": "ssh",'
echo '         "args": ['
echo "           \"avi@31.97.222.218\","
echo "           \"cd $SCRIPT_DIR && node build/index.js\""
echo '         ],'
echo '         "env": {}'
echo '       }'
echo '     }'
echo '   }'
echo ""
echo "2. Make sure SSH key is set up (no password):"
echo "   ssh-copy-id avi@31.97.222.218"
echo ""
echo "3. Restart Claude Desktop"
echo ""
echo "4. Test in Claude Desktop:"
echo '   "Use get_version to check my Coolify version"'
echo ""
echo "📚 Full documentation: cat USAGE-GUIDE.md"
echo ""
echo "🎉 Happy automating!"
echo ""
