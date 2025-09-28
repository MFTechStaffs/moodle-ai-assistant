# 🤖 Moodle AI Assistant

**Personal AI Assistant for Moodle LMS Administration**

An intelligent VS Code extension that remembers your Moodle setup and helps automate administrative tasks using free AI services.

## 🎯 Features

- **Persistent Memory** - Remembers all your Moodle courses, users, and configurations
- **Admin Automation** - Automates course creation, user management, question banking
- **Free AI Integration** - Uses ChatGPT, Gemini, Claude web interfaces (no API costs)
- **Interactive Workflow** - Confirms before making changes, learns your patterns
- **Review & Modify** - Analyzes existing content and suggests improvements

## 🏗️ Architecture

```
VS Code Extension ↔ Local Server ↔ Moodle Database
                 ↕
            AI Services (Web)
                 ↕
           Memory Database (SQLite)
```

## 🚀 Quick Start

### Prerequisites
- VS Code
- Node.js 18+
- Your existing Moodle LMS running

### Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd moodle-ai-assistant

# Automated setup
./scripts/setup.sh
```

### Configuration
Edit `config/config.json` with your Moodle details:
```json
{
  "moodle": {
    "url": "https://learning.manfreetechnologies.com",
    "database": {
      "host": "localhost",
      "port": 3306,
      "database": "moodle",
      "user": "moodle",
      "password": "moodle123"
    }
  }
}
```

### Usage
```bash
# Start the assistant
npm run dev

# In VS Code:
# 1. Install extension from extension/*.vsix
# 2. Open Command Palette (Ctrl+Shift+P)
# 3. Run: "Moodle AI: Test Connection"
# 4. Start chatting with your AI assistant!
```

## 📚 Documentation

- **[Setup Guide](docs/SETUP.md)** - Detailed installation and configuration
- **[Usage Examples](docs/USAGE.md)** - Common workflows and commands
- **[API Documentation](docs/API.md)** - Technical reference
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and solutions

## 🎮 Example Usage

```
You: "Review my electronics course and suggest improvements"

AI: "Analyzing your Electronics Fundamentals course...
     Found: 5 modules, 23 students, 15 quiz questions
     
     Suggestions:
     - Add circuit simulation lab after Module 3
     - 3 duplicate questions in quiz bank
     - Missing assessment for IoT module
     
     Should I create detailed improvement plan?"

You: "Yes, and fix the duplicate questions"

AI: "Creating improvement plan...
     Merging duplicate Ohm's law questions...
     Preview changes before applying?"
```

## 🔧 Development

```bash
# Development mode
npm run dev

# Run tests
./scripts/test.sh

# Build extension
npm run build
```

## 📋 Project Status

- [x] Phase 1: Foundation & Project Setup
- [x] Phase 2: Memory System & Moodle Connector
- [x] Phase 3: AI Integration & Router
- [x] Phase 4: Testing, Documentation & Polish

## 🤝 Contributing

This is a personal project for Moodle administration. See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

---

**Built for efficient Moodle administration with AI assistance**