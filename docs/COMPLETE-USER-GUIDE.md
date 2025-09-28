# 🎯 Complete User Guide - Moodle AI Assistant

**Step-by-step guide with GUI interactions and troubleshooting**

---

## 🚀 **Part 1: Initial Setup & Testing**

### **Step 1: Fix Common Issues First**
```bash
# Fix database issue
cd ~/workspace/moodle-ai-assistant
rm -f local-server/data/moodle-memory.db

# Fix Chrome dependencies
sudo apt-get update
sudo apt-get install -y libnss3 libatk-bridge2.0-0 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libxss1 libasound2
```

### **Step 2: Start the Server**
```bash
cd ~/workspace/moodle-ai-assistant/local-server
npm run dev
```

**✅ Expected Success Output:**
```
🚀 Moodle AI Assistant Server running on port 3000
📊 Health check: http://localhost:3000/api/health
Database initialized successfully
AI Service initialized
```

**❌ If You See Errors:**
- **Database error:** Run `rm -f data/moodle-memory.db` and restart
- **Chrome error:** Install dependencies above or use `PUPPETEER_SKIP_DOWNLOAD=true npm run dev`

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

### **Step 3: Test Moodle Connection**
1. **Open terminal**
2. **Run sync command:**
```bash
curl -X POST http://localhost:3000/api/sync/full \
  -H "Content-Type: application/json" \
  -d '{
    "moodleConfig": {
      "host": "localhost",
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

#### **Method 1: Command Line**
```bash
code --install-extension moodle-ai-assistant-0.1.0.vsix
```

#### **Method 2: VS Code GUI**
1. **Open VS Code**
2. **Press `Ctrl+Shift+X`** (Extensions view)
3. **Click the `...` menu** (top-right of Extensions panel)
4. **Select "Install from VSIX..."**
5. **Navigate to:** `~/workspace/moodle-ai-assistant/extension/`
6. **Select:** `moodle-ai-assistant-0.1.0.vsix`
7. **Click "Install"**

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

### **Step 4: Test AI Conversation**
1. **In chat panel, type:** `Hello, can you help me with my Moodle?`
2. **Press Enter or click Send**
3. **Expected:** AI responds (may take 10-30 seconds)

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

## 🎯 **Part 6: Real Usage Examples**

### **Example 1: Course Review**
1. **Click "📚 Review Course" in sidebar**
2. **Enter course name:** "Electronics Fundamentals"
3. **AI analyzes and responds with:**
   - Current enrollment
   - Module structure
   - Quiz performance
   - Improvement suggestions

### **Example 2: Question Management**
1. **Click "❓ Question Bank" in sidebar**
2. **AI reviews your questions and reports:**
   - Duplicate questions found
   - Difficulty distribution
   - Unused questions
   - Quality improvements

### **Example 3: User Management**
1. **Click "👥 Manage Users" in sidebar**
2. **Type:** "Enroll 10 new students to embedded systems course"
3. **AI guides you through:**
   - Student list requirements
   - Enrollment method
   - Course capacity check
   - Confirmation process

### **Example 4: Free-form Chat**
1. **Open chat panel**
2. **Type natural language:**
   - "What courses have low enrollment?"
   - "Create a quiz about microcontrollers"
   - "Show me students who are struggling"
   - "Update all assignment deadlines"

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
# Reset database
rm -f local-server/data/moodle-memory.db
cd local-server && npm run db:migrate
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
# Install missing dependencies
sudo apt-get install -y chromium-browser

# Or skip browser automation
export PUPPETEER_SKIP_DOWNLOAD=true
npm run dev
```

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
- [ ] Moodle sync completes successfully
- [ ] VS Code extension installs and loads
- [ ] Sidebar shows "✅ Connected"
- [ ] Chat panel opens and responds
- [ ] Commands work from Command Palette
- [ ] AI provides relevant responses
- [ ] Database stats show synced data

### **🎯 You're Ready When You Can:**
- [ ] Ask "Review my electronics course" and get analysis
- [ ] Request "Create 5 quiz questions" and get formatted questions
- [ ] Say "Show struggling students" and get actionable data
- [ ] Use "Sync my Moodle data" and see updated statistics
- [ ] Have natural conversations about your Moodle administration

---

## 🚀 **Part 10: Advanced Usage**

### **Custom Prompts**
```
"Create a course template for embedded systems with 6 modules"
"Generate assessment rubric for programming assignments"  
"Analyze student performance trends over last semester"
"Suggest improvements for low-engagement courses"
"Create automated enrollment workflow for new students"
```

### **Batch Operations**
```
"Update all quiz deadlines to next Friday"
"Enroll all computer science students to programming course"
"Create backup of all course materials"
"Generate progress reports for all instructors"
```

### **Integration Workflows**
```
"Import student list from CSV and enroll to courses"
"Export quiz results to Excel for analysis"
"Create course announcements for upcoming deadlines"
"Setup automated grading for multiple choice questions"
```

---

**🎉 Congratulations! Your Moodle AI Assistant is now fully operational with a complete GUI interface in VS Code!**

**For support, check the logs and refer to this guide. The AI assistant learns from your usage patterns and becomes more helpful over time.**