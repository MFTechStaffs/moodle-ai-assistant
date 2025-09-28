# 🔧 Troubleshooting Guide

**Common issues and solutions for Moodle AI Assistant**

## 🚨 Installation Issues

### Node.js Version Error
```
Error: Node.js version 18+ required
```
**Solution:**
```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Permission Denied
```
Error: EACCES: permission denied
```
**Solution:**
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

### Extension Installation Failed
```
Error: Extension not found
```
**Solution:**
```bash
# Manual installation
cd extension
npm run package
code --install-extension *.vsix --force
```

## 🔌 Connection Issues

### Server Not Starting
```
Error: Port 3000 already in use
```
**Solution:**
```bash
# Kill process on port 3000
sudo lsof -ti:3000 | xargs kill -9

# Or change port in config
# Edit config/config.json: "port": 3001
```

### Database Connection Failed
```
Error: ECONNREFUSED localhost:3306
```
**Solution:**
```bash
# Check MySQL/MariaDB status
sudo systemctl status mysql
sudo systemctl start mysql

# Check Moodle database access
mysql -u moodle -p -e "SHOW TABLES;" moodle
```

### VS Code Extension Not Loading
```
Extension activation failed
```
**Solution:**
```bash
# Check VS Code logs
# Help > Toggle Developer Tools > Console

# Reinstall extension
code --uninstall-extension moodle-ai-assistant
npm run extension:install
```

## 🤖 AI Integration Issues

### Browser Automation Failed
```
Error: Browser launch failed
```
**Solution:**
```bash
# Install Chrome dependencies
sudo apt-get update
sudo apt-get install -y chromium-browser

# Or use system Chrome
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

### AI Provider Not Responding
```
Error: Timeout waiting for response
```
**Solution:**
1. **Check internet connection**
2. **Login to AI service manually** (Claude/ChatGPT/Gemini)
3. **Increase timeout in config:**
```json
{
  "ai": {
    "browser": {
      "timeout": 60000
    }
  }
}
```

### Context Building Failed
```
Error: Failed to build context
```
**Solution:**
```bash
# Sync Moodle data
curl -X POST http://localhost:3000/api/sync/full \
  -H "Content-Type: application/json" \
  -d '{"moodleConfig": {...}}'

# Check database
sqlite3 local-server/data/moodle-memory.db ".tables"
```

## 💾 Database Issues

### SQLite Database Locked
```
Error: database is locked
```
**Solution:**
```bash
# Stop all processes
pkill -f "moodle-ai"

# Remove lock file
rm -f local-server/data/moodle-memory.db-wal
rm -f local-server/data/moodle-memory.db-shm

# Restart server
npm run dev
```

### Migration Failed
```
Error: table already exists
```
**Solution:**
```bash
# Reset database
rm -f local-server/data/moodle-memory.db
npm run db:migrate
```

### Sync Errors
```
Error: Access denied for user
```
**Solution:**
```bash
# Create read-only user
mysql -u root -p
CREATE USER 'moodle_ai'@'localhost' IDENTIFIED BY 'password';
GRANT SELECT ON moodle.* TO 'moodle_ai'@'localhost';
FLUSH PRIVILEGES;
```

## 🎨 VS Code Issues

### Sidebar Not Showing
```
Moodle AI sidebar missing
```
**Solution:**
1. **Check extension is activated:**
   - `Ctrl+Shift+P` → "Moodle AI: Activate"
2. **Reset VS Code workspace:**
   - Close VS Code
   - Delete `.vscode/settings.json`
   - Reopen workspace

### Chat Panel Not Opening
```
Webview failed to load
```
**Solution:**
```bash
# Check extension logs
# View > Output > Moodle AI Assistant

# Reload window
# Ctrl+Shift+P > "Developer: Reload Window"
```

### Commands Not Working
```
Command not found
```
**Solution:**
1. **Reload extension:**
   - `Ctrl+Shift+P` → "Developer: Reload Window"
2. **Check extension status:**
   - Extensions view → Moodle AI Assistant → Enabled

## 🔍 Debugging

### Enable Debug Logging
```json
// config/config.json
{
  "server": {
    "logging": {
      "level": "debug"
    }
  }
}
```

### Check Server Logs
```bash
# Real-time logs
tail -f local-server/logs/app.log

# Error logs
grep ERROR local-server/logs/app.log
```

### Test API Endpoints
```bash
# Health check
curl http://localhost:3000/api/health

# Stats
curl http://localhost:3000/api/stats

# Context building
curl -X POST http://localhost:3000/api/context/build \
  -H "Content-Type: application/json" \
  -d '{"query": "test", "sessionId": "debug"}'
```

### Database Inspection
```bash
# Connect to database
sqlite3 local-server/data/moodle-memory.db

# Check tables
.tables

# Check data
SELECT COUNT(*) FROM courses;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM ai_conversations;
```

## 🆘 Getting Help

### Collect Debug Information
```bash
# System info
node --version
npm --version
code --version

# Server status
curl -s http://localhost:3000/api/health | jq

# Extension status
code --list-extensions | grep moodle

# Database status
ls -la local-server/data/
```

### Common Log Locations
- **Server logs:** `local-server/logs/app.log`
- **VS Code logs:** Help > Toggle Developer Tools > Console
- **Extension logs:** View > Output > Moodle AI Assistant
- **Database logs:** `local-server/logs/db.log`

### Reset Everything
```bash
# Nuclear option - complete reset
rm -rf node_modules
rm -rf local-server/node_modules
rm -rf extension/node_modules
rm -rf local-server/data/moodle-memory.db
rm -rf browser-sessions

# Reinstall
npm install
./scripts/setup.sh
```

---

**Still having issues? Check the logs and provide specific error messages for better help!**