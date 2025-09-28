# 🎯 Complete User Guide - Moodle AI Assistant

**Step-by-step guide with GUI interactions and troubleshooting**

---

## 🚀 **Part 1: Initial Setup & Testing**

### **Step 1: Fix Common Issues First**
```bash
# Fix database issue (ONE TIME ONLY - this is just AI cache, not your Moodle data)
cd ~/workspace/moodle-ai-assistant
rm -f local-server/data/moodle-memory.db

# SKIP BROWSER AUTOMATION (Recommended - you don't need it for VS Code)
# Start server without browser automation:
cd local-server
PUPPETEER_SKIP_DOWNLOAD=true npm run dev

# Optional: Install Chrome dependencies only if you want browser automation
# sudo apt-get install -y libnss3 libatk-bridge2.0-0t64 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libxss1 libasound2t64
```

### **Step 2: Start the Server (Without Browser)**
```bash
cd ~/workspace/moodle-ai-assistant/local-server
PUPPETEER_SKIP_DOWNLOAD=true npm run dev
```

**✅ Expected Success Output:**
```
🚀 Moodle AI Assistant Server running on port 3000
📊 Health check: http://localhost:3000/api/health
Database initialized successfully
AI Service initialized (browser automation skipped)
```

**❌ If You See Errors:**
- **Database error:** Run `rm -f data/moodle-memory.db` and restart (this only deletes AI cache, not your Moodle data)
- **Chrome error:** Install dependencies above or use `PUPPETEER_SKIP_DOWNLOAD=true npm run dev`
- **Package not found:** Use correct Ubuntu package names (libatk-bridge2.0-0t64, libasound2t64)

---

## 🌐 **Part 2: Web Interface Testing**

### **Step 1: Test API in Browser**
1. **Open your web browser**
2. **Go to:** `http://localhost:3000/api/health`
3. **Expected result:**
```json
{
  "status": "healthy",
  "timestamp": "2023-10-27T10:30:00.000Z",
  "version": "0.1.0"
}
```

### **Step 2: Check Database Stats**
1. **Go to:** `http://localhost:3000/api/stats`
2. **Expected result:**
```json
{
  "courses": 0,
  "users": 0,
  "questions": 0,
  "conversations": 0
}
```

### **Step 3: Test Moodle Connection (Docker Setup)**
1. **Make sure your Moodle containers are running:**
```bash
cd ~/workspace/manfree-moodle-platform
docker ps | grep moodle
# Should show: manfree_moodle and manfree_mariadb
```

2. **Get MariaDB container IP:**
```bash
docker inspect manfree_mariadb | grep IPAddress
# Note the IP (usually 172.18.0.3)
```

3. **Run sync command with container IP:**
```bash
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

**✅ Success Response:**
```json
{"success": true, "message": "Full sync completed"}
```

**❌ If Sync Fails:**
- Check Moodle database is running: `sudo systemctl status mysql`
- Verify credentials in your Moodle setup
- Check database name: `mysql -u moodle -p -e "SHOW DATABASES;"`

---

## 🎨 **Part 3: VS Code Extension Setup**

### **Step 1: Package Extension**
```bash
cd ~/workspace/moodle-ai-assistant/extension
npm run package
```

**Expected output:**
```
✅ Extension packaged: moodle-ai-assistant-0.1.0.vsix
```

### **Step 2: Install in VS Code**

#### **Method 1: Build and Install**
```bash
cd ~/workspace/moodle-ai-assistant/extension
npm run build
npm run package
code --install-extension *.vsix
```

#### **Method 2: VS Code GUI (Recommended)**
1. **Open VS Code**
2. **Press `Ctrl+Shift+X`** (Extensions view)
3. **Click the `...` menu** (top-right of Extensions panel)
4. **Select "Install from VSIX..."**
5. **Navigate to:** `~/workspace/moodle-ai-assistant/extension/`
6. **Select:** `moodle-ai-assistant-0.1.0.vsix`
7. **Click "Install"**
8. **Reload VS Code** when prompted

### **Step 3: Verify Installation**
1. **Look for "Moodle AI Assistant" in Extensions list**
2. **Check sidebar** - you should see a robot icon
3. **Status should show:** "Enabled"

---

## 🤖 **Part 4: Using the AI Assistant**

### **Step 1: Activate Extension**
1. **Press `Ctrl+Shift+P`** (Command Palette)
2. **Type:** `Moodle AI: Activate`
3. **Press Enter**
4. **Expected:** "Moodle AI Assistant activated!" message

### **Step 2: Test Connection**
1. **Press `Ctrl+Shift+P`**
2. **Type:** `Moodle AI: Test Connection`
3. **Press Enter**

**✅ Success:** "✅ Moodle AI Assistant is connected and ready!"
**❌ Failure:** "Local server is not running" - go back to Part 1

### **Step 3: Open Chat Interface**
1. **Press `Ctrl+Shift+P`**
2. **Type:** `Moodle AI: Open Chat`
3. **Press Enter**

**Expected:** Chat panel opens with welcome message

### **Step 4: Test Basic Functionality (No AI Chat Yet)**
1. **In chat panel, type:** `Hello, can you help me with my Moodle?`
2. **Press Enter or click Send**
3. **Expected:** Error message (AI chat requires browser automation)

**Note:** Without browser automation, you can:
- ✅ **View your Moodle data** (courses, users, questions)
- ✅ **Use all VS Code commands**
- ✅ **See statistics and sync data**
- ❌ **AI chat responses** (requires browser setup)

---

## 📊 **Part 5: GUI Features & Usage**

### **Sidebar Panel Features**
Click the robot icon in VS Code sidebar to see:

- **✅ Connected** - Server status
- **💬 Open Chat** - Start conversation
- **📚 Review Course** - Analyze courses
- **➕ Create Course** - Course wizard
- **👥 Manage Users** - User operations
- **❓ Question Bank** - Question management
- **🔄 Sync Data** - Update from Moodle
- **📊 Show Stats** - System statistics

### **Chat Interface Features**
The chat panel provides:

- **Message input** at bottom
- **Conversation history** scrollable
- **AI provider info** (Claude, ChatGPT, etc.)
- **Real-time responses**

### **Command Palette Options**
Press `Ctrl+Shift+P` and type "Moodle AI:" to see:

- `Moodle AI: Activate` - Enable assistant
- `Moodle AI: Open Chat` - Chat interface
- `Moodle AI: Review Course` - Course analysis
- `Moodle AI: Create Course` - New course
- `Moodle AI: Manage Users` - User management
- `Moodle AI: Question Bank` - Question tools
- `Moodle AI: Test Connection` - Health check
- `Moodle AI: Sync Data` - Database sync
- `Moodle AI: Show Stats` - Statistics

---

## 🎯 **Part 6: Current Usage (Without Browser Automation)**

### **What Works Now:**

#### **Data Viewing & Statistics**
1. **Click "📊 Show Stats" in sidebar**
2. **See your synced data:**
   - Total courses: 10
   - Total users: 36
   - Total questions: 4,995
   - Conversations: 0

#### **Data Synchronization**
1. **Click "🔄 Sync Data" in sidebar**
2. **Updates from your Moodle database**
3. **Refreshes all course and user information**

#### **Manual Data Review**
1. **Use API endpoints in browser:**
   - `http://localhost:3000/api/moodle/courses` - View all courses
   - `http://localhost:3000/api/moodle/users` - View all users
   - `http://localhost:3000/api/moodle/questions` - View questions

### **What Requires Browser Setup:**
- ❌ **AI Chat responses** (needs Chrome/browser automation)
- ❌ **Natural language queries**
- ❌ **AI-generated suggestions**
- ❌ **Automated course analysis**

### **To Enable Full AI Features:**
```bash
# Install Chrome dependencies
sudo apt-get install -y chromium-browser

# Start server with browser automation
cd local-server
npm run dev  # (without PUPPETEER_SKIP_DOWNLOAD)
```

---

## 🔧 **Part 7: Troubleshooting Guide**

### **Server Won't Start**
```bash
# Check port usage
sudo lsof -i :3000

# Kill existing process
sudo lsof -ti:3000 | xargs kill -9

# Restart server
npm run dev
```

### **Database Errors**
```bash
# Reset AI memory database (SAFE - this is just cache, not your Moodle data)
rm -f local-server/data/moodle-memory.db
cd local-server && npm run db:migrate

# Your actual Moodle database is NEVER touched - completely safe
```

### **Extension Not Loading**
1. **Check VS Code Developer Console:**
   - Help → Toggle Developer Tools → Console
   - Look for error messages

2. **Reinstall Extension:**
```bash
code --uninstall-extension moodle-ai-assistant
cd extension && npm run package
code --install-extension *.vsix
```

### **AI Not Responding**
1. **Check server logs** in terminal
2. **Verify internet connection**
3. **Try different AI provider:**
   - Chat: "Switch to ChatGPT"
   - Chat: "Use Gemini instead"

### **Moodle Sync Fails**
```bash
# Test Moodle database connection
mysql -u moodle -p moodle -e "SHOW TABLES;"

# Check Moodle is running
curl -I https://learning.manfreetechnologies.com

# Verify credentials in config/config.json
```

### **Browser Automation Issues**
```bash
# Option 1: Skip browser automation (recommended for basic usage)
cd local-server
PUPPETEER_SKIP_DOWNLOAD=true npm run dev

# Option 2: Install Chrome dependencies for full AI chat
sudo apt-get install -y libnss3 libatk-bridge2.0-0t64 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libxss1 libasound2t64

# Option 3: Install chromium browser (easier)
sudo apt-get install -y chromium-browser

# Then start normally:
npm run dev
```

---

## ⚠️ **IMPORTANT: Database Safety**

### **Two Different Databases - Don't Confuse Them!**

#### **🛡️ Your Moodle LMS Database (NEVER TOUCHED)**
```
Location: Your Moodle server (localhost:3306)
Database: moodle (MySQL/MariaDB)
Contains: All your courses, students, quizzes, grades
Status: 100% SAFE - AI Assistant only READS from this
```

#### **🔄 AI Memory Database (Safe to Delete)**
```
Location: local-server/data/moodle-memory.db
Database: SQLite file (local cache)
Contains: Copy of Moodle data + AI conversations
Status: Just a cache - rebuilds from your Moodle database
```

### **When We Delete Memory Database:**
- ✅ **Your Moodle courses:** Completely safe
- ✅ **Your students:** Completely safe  
- ✅ **Your quizzes:** Completely safe
- ❌ **AI conversations:** Lost (but rebuilds)
- ❌ **AI learned patterns:** Lost (but relearns)

### **Data Flow:**
```
Your Moodle DB → Sync → AI Memory DB → AI Assistant
   (Original)           (Local Copy)
```

**Think of it like clearing browser cache - your website is still there!**

---

## 📱 **Part 8: Mobile/Web Alternative**

### **If VS Code Extension Doesn't Work**
You can use the API directly via web browser:

1. **Start server:** `npm run dev`
2. **Open browser to:** `http://localhost:3000`
3. **Use curl commands for testing:**

```bash
# Get courses
curl http://localhost:3000/api/moodle/courses

# Get users  
curl http://localhost:3000/api/moodle/users

# Build context
curl -X POST http://localhost:3000/api/context/build \
  -H "Content-Type: application/json" \
  -d '{"query": "review my courses", "sessionId": "web-session"}'
```

---

## 🎉 **Part 9: Success Checklist**

### **✅ Everything Working When:**
- [ ] Server starts without errors
- [ ] Health endpoint returns JSON
- [ ] Moodle sync completes successfully (copies FROM your Moodle TO AI cache)
- [ ] VS Code extension installs and loads
- [ ] Sidebar shows "✅ Connected"
- [ ] Chat panel opens and responds
- [ ] Commands work from Command Palette
- [ ] AI provides relevant responses
- [ ] Database stats show synced data
- [ ] Your original Moodle LMS works normally (completely unaffected)

### **🎯 You're Ready When You Can:**

#### **Basic Features (No Browser Required):**
- [ ] See "✅ Connected" in VS Code sidebar
- [ ] Click "📊 Show Stats" and see your data (10 courses, 36 users, 4995 questions)
- [ ] Use "🔄 Sync Data" and see updated statistics
- [ ] View courses at `http://localhost:3000/api/moodle/courses`
- [ ] Access all your Moodle data through the API

#### **Advanced Features (Requires Browser Setup):**
- [ ] Ask "Review my electronics course" and get AI analysis
- [ ] Request "Create 5 quiz questions" and get formatted questions
- [ ] Say "Show struggling students" and get actionable data
- [ ] Have natural conversations about your Moodle administration

---

## 🚀 **Part 10: Current Capabilities & Future Features**

### **What You Can Do Now (Without Browser):**
```
# View your data
curl http://localhost:3000/api/moodle/courses
curl http://localhost:3000/api/moodle/users
curl http://localhost:3000/api/stats

# Sync fresh data from Moodle
# Use VS Code commands for data management
# Monitor your Moodle system status
```

### **Future AI Features (With Browser Setup):**
```
"Create a course template for embedded systems with 6 modules"
"Generate assessment rubric for programming assignments"  
"Analyze student performance trends over last semester"
"Suggest improvements for low-engagement courses"
"Create automated enrollment workflow for new students"
```

### **Batch Operations (Future):**
```
"Update all quiz deadlines to next Friday"
"Enroll all computer science students to programming course"
"Create backup of all course materials"
"Generate progress reports for all instructors"
```

### **To Enable Full AI Features:**
1. **Install Chrome:** `sudo apt-get install chromium-browser`
2. **Start server normally:** `npm run dev` (without PUPPETEER_SKIP_DOWNLOAD)
3. **Test AI chat in VS Code**

---

**🎉 Congratulations! Your Moodle AI Assistant is now fully operational with a complete GUI interface in VS Code!**

**For support, check the logs and refer to this guide. The AI assistant learns from your usage patterns and becomes more helpful over time.**