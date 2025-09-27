# 🎮 Usage Guide

**How to use your Moodle AI Assistant for daily administration tasks**

## 🚀 Getting Started

### First Time Setup
1. **Authenticate with Moodle**: Configure database connection
2. **Sync Data**: Import your existing Moodle structure
3. **Test Connection**: Verify everything works

```bash
# Start the assistant
npm run dev

# In VS Code, open Command Palette (Ctrl+Shift+P)
# Run: "Moodle AI: Test Connection"
```

## 💬 Basic Interactions

### Starting a Conversation
- Open VS Code sidebar → Moodle AI Assistant
- Type your request in natural language
- AI will analyze and respond with context

### Example Conversations

#### Course Management
```
You: "Review my electronics course and suggest improvements"

AI: "Analyzing your Electronics Fundamentals course...
     
     Current Status:
     - 5 modules, 23 enrolled students
     - 3 quizzes, average score 78%
     - Last updated 2 weeks ago
     
     Suggestions:
     1. Add circuit simulation lab after Module 3
     2. Update quiz questions - found 3 duplicates
     3. Create final project assignment
     
     Should I create a detailed improvement plan?"

You: "Yes, and fix the duplicate questions"

AI: "Creating improvement plan...
     
     Duplicate Questions Found:
     - 'What is Ohm's Law?' (appears 3 times)
     - 'Calculate current in series circuit' (appears 2 times)
     
     Proposed Actions:
     1. Merge duplicate questions, keep best version
     2. Add circuit diagram to remaining questions
     3. Create new lab module template
     
     Confirm these changes?"
```

#### User Management
```
You: "Enroll 15 new students to embedded systems course"

AI: "I found your 'Embedded Systems Programming' course.
     
     Current enrollment: 28 students
     Available capacity: 50 students
     
     To enroll 15 new students, I need:
     1. Student list (CSV file or manual entry)
     2. Enrollment method (manual/self/cohort)
     3. Start date for enrollment
     
     Do you have a student list ready?"

You: "I have a CSV file with student emails"

AI: "Perfect! Please upload the CSV file or paste the student emails.
     
     I'll use your standard pattern:
     - Role: Student
     - Enrollment method: Manual
     - Start date: Today
     - End date: Course end date
     
     Is this correct?"
```

#### Question Bank Management
```
You: "Create 10 MCQ questions about microcontrollers"

AI: "I'll create 10 MCQ questions about microcontrollers.
     
     Based on your patterns, I'll use:
     - Question type: Multiple Choice
     - Difficulty: Mixed (3 easy, 5 medium, 2 hard)
     - Points: 1 point each
     - Category: Electronics > Microcontrollers
     
     Topics to cover:
     1. Basic architecture
     2. GPIO operations
     3. Timers and interrupts
     4. Communication protocols
     5. Programming concepts
     
     Should I proceed with generation?"
```

## 🔧 Advanced Features

### Pattern Learning
The AI learns your preferences over time:

```
You: "Create a new course"

AI: "I notice you typically create courses with:
     - 5-6 modules
     - Weekly quizzes (10 questions each)
     - Final project (20% weight)
     - Discussion forums enabled
     - Self-enrollment with key
     
     Should I use this template or customize?"
```

### Context Awareness
The AI remembers your entire Moodle setup:

```
You: "Add lab sessions to my courses"

AI: "I found 3 courses that could benefit from lab sessions:
     
     1. Electronics Fundamentals (23 students)
        - Missing: Circuit simulation lab
        - Suggested: After Module 3 (Ohm's Law)
     
     2. Embedded Systems (28 students)
        - Missing: Hardware programming lab
        - Suggested: After Module 2 (GPIO)
     
     3. Digital Circuits (15 students)
        - Missing: Logic design lab
        - Suggested: After Module 4 (Boolean Algebra)
     
     Which courses should I update?"
```

### Batch Operations
Handle multiple tasks efficiently:

```
You: "Update all quiz deadlines to next Friday"

AI: "Found 12 quizzes across 4 courses with upcoming deadlines:
     
     Electronics Fundamentals: 3 quizzes
     Embedded Systems: 4 quizzes
     Digital Circuits: 2 quizzes
     Programming Basics: 3 quizzes
     
     New deadline: Friday, Oct 27, 2023 at 11:59 PM
     
     This will affect 89 students total.
     Confirm batch update?"
```

## 📊 Monitoring and Analytics

### Course Performance
```
You: "Analyze performance of my electronics course"

AI: "Electronics Fundamentals Performance Analysis:
     
     📈 Enrollment Trends:
     - 23 active students (2 dropped)
     - 87% attendance rate
     - Peak activity: Tuesday evenings
     
     📝 Assessment Results:
     - Quiz average: 78% (target: 75%)
     - 3 students struggling (< 60%)
     - Top performers: 8 students (> 90%)
     
     🎯 Recommendations:
     1. Offer extra help sessions for struggling students
     2. Create advanced challenges for top performers
     3. Review Module 4 content (lowest scores)
     
     Should I create intervention plans?"
```

### Question Bank Analysis
```
You: "Review my question bank for duplicates and quality"

AI: "Question Bank Analysis Complete:
     
     📊 Statistics:
     - Total questions: 247
     - Categories: 8
     - Question types: MCQ (180), Essay (45), Numerical (22)
     
     🔍 Issues Found:
     - 12 duplicate questions
     - 8 questions with unclear wording
     - 15 questions never used in quizzes
     - 3 questions with 100% correct rate (too easy)
     
     🛠️ Suggested Actions:
     1. Merge similar questions
     2. Rewrite unclear questions
     3. Archive unused questions
     4. Increase difficulty of easy questions
     
     Start with duplicates?"
```

## 🎯 Command Reference

### Quick Commands
Use VS Code Command Palette (`Ctrl+Shift+P`):

- `Moodle AI: Review Course` - Analyze specific course
- `Moodle AI: Create Course` - New course wizard
- `Moodle AI: Manage Users` - User operations
- `Moodle AI: Question Bank` - Question management
- `Moodle AI: Test Connection` - System health check

### Chat Commands
Type these in the chat interface:

- `status` - Show system status
- `sync` - Sync with Moodle database
- `help [topic]` - Get help on specific topic
- `history` - Show recent actions
- `patterns` - Show learned patterns

## 🔄 Workflow Examples

### Weekly Course Maintenance
```
1. You: "Weekly course review"
   AI: Shows summary of all courses, highlights issues

2. You: "Update quiz deadlines for next week"
   AI: Batch updates all upcoming deadlines

3. You: "Check for struggling students"
   AI: Identifies students needing help, suggests interventions

4. You: "Generate progress report"
   AI: Creates comprehensive report for all courses
```

### New Semester Setup
```
1. You: "Prepare for new semester"
   AI: Reviews course templates, suggests updates

2. You: "Clone electronics course for fall semester"
   AI: Creates copy with updated dates and settings

3. You: "Import student list from CSV"
   AI: Processes enrollment file, handles duplicates

4. You: "Set up gradebook categories"
   AI: Applies your standard grading scheme
```

### Assessment Creation
```
1. You: "Create midterm exam for embedded systems"
   AI: Suggests question mix based on course content

2. You: "Review question difficulty distribution"
   AI: Analyzes and balances question difficulty

3. You: "Set up automated grading"
   AI: Configures rubrics and feedback rules

4. You: "Schedule exam and notifications"
   AI: Sets dates and creates student notifications
```

## 💡 Tips and Best Practices

### Effective Communication
- **Be specific**: "Review electronics course Module 3" vs "review course"
- **Provide context**: "For struggling students" vs "create help materials"
- **Confirm actions**: Always review before applying changes

### Pattern Building
- **Consistent naming**: Use similar patterns for course/quiz names
- **Regular feedback**: Tell AI when suggestions are good/bad
- **Document preferences**: AI learns from your choices

### Data Management
- **Regular syncs**: Keep memory database updated
- **Backup important**: Export configurations before major changes
- **Monitor performance**: Check system stats regularly

---

**Your AI assistant gets smarter with every interaction!**