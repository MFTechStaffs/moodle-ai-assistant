# 🛠️ Setup Guide

**Complete installation and configuration guide for Moodle AI Assistant**

## 📋 Prerequisites

### System Requirements
- **Node.js** 18.0.0 or higher
- **VS Code** 1.80.0 or higher
- **Git** for version control
- **Internet connection** for AI services

### Moodle Requirements
- **Moodle LMS** running (your existing setup)
- **Database access** (MySQL/MariaDB/PostgreSQL)
- **Admin privileges** in Moodle
- **Web services enabled** (optional, for API access)

## 🚀 Installation

### Step 1: Clone Repository
```bash
# Clone to your workspace
cd ~/workspace
git clone <repository-url> moodle-ai-assistant
cd moodle-ai-assistant
```

### Step 2: Install Dependencies
```bash
# Install all dependencies
npm run setup

# Or install manually
npm install
cd extension && npm install
cd ../local-server && npm install
```

### Step 3: Configuration

#### Create Configuration Files
```bash
# Copy example configurations
cp config/config.example.json config/config.json
cp config/secrets.example.json config/secrets.json
```

#### Configure Moodle Connection
Edit `config/config.json`:
```json
{
  "moodle": {
    "url": "https://learning.manfreetechnologies.com",
    "database": {
      "host": "localhost",
      "port": 3306,
      "database": "moodle",
      "user": "moodle",
      "password": "your-password"
    },
    "webservice": {
      "enabled": true,
      "token": "your-webservice-token"
    }
  },
  "ai": {
    "providers": ["chatgpt", "gemini", "claude"],
    "defaultProvider": "claude",
    "rotationEnabled": true
  },
  "memory": {
    "database": "local-server/data/moodle-memory.db",
    "retentionDays": 365,
    "autoBackup": true
  }
}
```

### Step 4: Database Setup
```bash
# Initialize memory database
npm run db:migrate

# Import your Moodle data (optional)
npm run db:seed
```

### Step 5: Install VS Code Extension
```bash
# Build and install extension
npm run extension:build
npm run extension:install
```

## 🔧 Configuration Details

### Moodle Database Connection

#### Option 1: Direct Database Access (Recommended)
```json
{
  "moodle": {
    "database": {
      "type": "mysql",
      "host": "localhost",
      "port": 3306,
      "database": "moodle",
      "user": "moodle_readonly",
      "password": "secure_password",
      "ssl": false
    }
  }
}
```

#### Option 2: Web Services API
```json
{
  "moodle": {
    "webservice": {
      "enabled": true,
      "url": "https://learning.manfreetechnologies.com/webservice/rest/server.php",
      "token": "your-webservice-token",
      "format": "json"
    }
  }
}
```

### AI Provider Configuration

#### Browser Automation Settings
```json
{
  "ai": {
    "browser": {
      "headless": false,
      "timeout": 30000,
      "userDataDir": "./browser-sessions"
    },
    "providers": {
      "chatgpt": {
        "url": "https://chat.openai.com",
        "enabled": true,
        "priority": 1
      },
      "gemini": {
        "url": "https://gemini.google.com",
        "enabled": true,
        "priority": 2
      },
      "claude": {
        "url": "https://claude.ai",
        "enabled": true,
        "priority": 3
      }
    }
  }
}
```

## 🧪 Testing Installation

### Test Local Server
```bash
# Start local server
npm run server

# Test API endpoints
curl http://localhost:3000/api/health
curl http://localhost:3000/api/moodle/courses
```

### Test VS Code Extension
1. Open VS Code
2. Open Command Palette (`Ctrl+Shift+P`)
3. Run: `Moodle AI: Test Connection`
4. Check output panel for results

### Test AI Integration
```bash
# Test AI router
npm run test:ai

# Test browser automation
npm run test:browser
```

## 🔒 Security Configuration

### Database Security
```bash
# Create read-only database user for Moodle
mysql -u root -p
CREATE USER 'moodle_ai'@'localhost' IDENTIFIED BY 'secure_password';
GRANT SELECT ON moodle.* TO 'moodle_ai'@'localhost';
FLUSH PRIVILEGES;
```

### File Permissions
```bash
# Secure configuration files
chmod 600 config/config.json
chmod 600 config/secrets.json

# Secure database directory
chmod 700 local-server/data/
```

## 🐛 Troubleshooting

### Common Issues

#### Extension Not Loading
```bash
# Check VS Code logs
# Help > Toggle Developer Tools > Console

# Reinstall extension
npm run extension:build
code --uninstall-extension moodle-ai-assistant
npm run extension:install
```

#### Database Connection Failed
```bash
# Test database connection
npm run test:db

# Check Moodle database
mysql -u moodle -p -e "SHOW TABLES;" moodle
```

#### AI Services Not Working
```bash
# Test browser automation
npm run test:browser

# Check browser sessions
ls -la browser-sessions/
```

### Log Files
- **Extension logs**: VS Code Output Panel > Moodle AI Assistant
- **Server logs**: `local-server/logs/app.log`
- **Database logs**: `local-server/logs/db.log`
- **AI logs**: `local-server/logs/ai.log`

## 📈 Performance Optimization

### Memory Database
```json
{
  "memory": {
    "cacheSize": "100MB",
    "indexing": true,
    "compression": true,
    "autoVacuum": true
  }
}
```

### AI Response Caching
```json
{
  "ai": {
    "cache": {
      "enabled": true,
      "ttl": 3600,
      "maxSize": "50MB"
    }
  }
}
```

## 🔄 Updates and Maintenance

### Update Assistant
```bash
# Pull latest changes
git pull origin main

# Update dependencies
npm run setup

# Rebuild extension
npm run build
npm run extension:install
```

### Backup Data
```bash
# Backup memory database
npm run db:backup

# Backup configuration
cp -r config/ backup/config-$(date +%Y%m%d)/
```

---

**Setup complete! Your Moodle AI Assistant is ready to use.**