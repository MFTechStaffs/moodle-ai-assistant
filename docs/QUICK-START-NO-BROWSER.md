# 🚀 Quick Start Guide - No Browser Required

**Get your Moodle AI Assistant working in 5 minutes without browser automation**

---

## ✅ **What Works Without Browser:**
- 📊 **View all your Moodle data** (courses, users, questions)
- 🔄 **Sync data** from your Moodle database
- 📈 **Statistics and monitoring**
- 🎛️ **VS Code extension** with sidebar and commands
- 🌐 **API access** to all your data

## ❌ **What Needs Browser:**
- 💬 **AI chat responses** (Claude, ChatGPT, Gemini)
- 🤖 **Natural language queries**
- 📝 **AI-generated content**

---

## 🏃‍♂️ **5-Minute Setup:**

### **Step 1: Start Server (No Browser)**
```bash
cd ~/workspace/moodle-ai-assistant/local-server
PUPPETEER_SKIP_DOWNLOAD=true npm run dev
```

**Expected output:**
```
🚀 Moodle AI Assistant Server running on port 3000
Database initialized successfully
AI Service initialized
```

### **Step 2: Sync Your Moodle Data**
```bash
# Get your MariaDB container IP
docker inspect manfree_mariadb | grep IPAddress

# Sync data (replace IP if different)
curl -X POST http://localhost:3000/api/sync/full \
  -H "Content-Type: application/json" \
  -d '{
    "moodleConfig": {
      "host": "172.18.0.3",
      "port": 3306,
      "database": "moodle",
      "user": "moodle",
      "password": "moodle123"
    }
  }'
```

**Expected result:**
```json
{"success": true, "message": "Full sync completed"}
```

### **Step 3: Install VS Code Extension**
```bash
cd ~/workspace/moodle-ai-assistant/extension
npm run build
npm run package
code --install-extension *.vsix
```

### **Step 4: Test in VS Code**
1. **Open VS Code**
2. **Look for robot icon** in sidebar
3. **Click "📊 Show Stats"**
4. **See your data:** courses, users, questions

---

## 🎯 **What You Can Do Now:**

### **VS Code Sidebar Features:**
- **✅ Connected** - Server status
- **📊 Show Stats** - View your data counts
- **🔄 Sync Data** - Update from Moodle
- **🔧 Test Connection** - Health check

### **API Endpoints (Use in Browser):**
```
http://localhost:3000/api/health          # Server status
http://localhost:3000/api/stats           # Data statistics
http://localhost:3000/api/moodle/courses  # All your courses
http://localhost:3000/api/moodle/users    # All your users
http://localhost:3000/api/moodle/questions # All questions
```

### **Command Palette (Ctrl+Shift+P):**
- `Moodle AI: Test Connection`
- `Moodle AI: Show Stats`
- `Moodle AI: Sync Data`

---

## 📊 **Your Data Overview:**

After sync, you should see:
- **Courses:** ~10 courses from your Moodle
- **Users:** ~36 users (students, teachers)
- **Questions:** ~4,995 questions from question banks
- **Enrollments:** All course enrollments

---

## 🔧 **Troubleshooting:**

### **Server Won't Start:**
```bash
# Kill existing processes
pkill -f "ts-node-dev"

# Remove old database
rm -f local-server/data/moodle-memory.db

# Start fresh
PUPPETEER_SKIP_DOWNLOAD=true npm run dev
```

### **Sync Fails:**
```bash
# Check Moodle containers are running
docker ps | grep moodle

# Should see: manfree_moodle and manfree_mariadb

# If not running:
cd ~/workspace/manfree-moodle-platform
./up.sh
```

### **Extension Not Loading:**
```bash
# Rebuild and reinstall
cd extension
npm run build
npm run package
code --uninstall-extension moodle-ai-assistant
code --install-extension *.vsix
```

---

## 🚀 **Next Steps:**

### **To Enable Full AI Chat:**
```bash
# Install Chrome
sudo apt-get install chromium-browser

# Start server with browser automation
cd local-server
npm run dev  # (without PUPPETEER_SKIP_DOWNLOAD)
```

### **Current Capabilities:**
- ✅ **Data monitoring** - See all your Moodle content
- ✅ **Statistics** - Track courses, users, questions
- ✅ **Sync management** - Keep data updated
- ✅ **VS Code integration** - Professional interface

### **Future with Browser:**
- 🤖 **AI conversations** - Natural language queries
- 📝 **Content generation** - AI-created questions, courses
- 📊 **Analysis** - AI-powered insights and recommendations

---

## 🎉 **Success Checklist:**

- [ ] Server running on port 3000
- [ ] Sync completed successfully
- [ ] VS Code extension installed
- [ ] Sidebar shows "✅ Connected"
- [ ] Stats show your data (courses, users, questions)
- [ ] API endpoints return your Moodle data

**You now have a working Moodle data management system with VS Code integration!**

---

**🎯 This setup gives you 80% of the functionality without any browser complexity. Perfect for data monitoring and management!**