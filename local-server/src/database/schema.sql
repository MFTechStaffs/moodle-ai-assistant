-- Moodle AI Assistant Memory Database Schema
-- Stores context and patterns for AI assistance

-- Core Moodle entities
CREATE TABLE courses (
    id INTEGER PRIMARY KEY,
    moodle_id INTEGER UNIQUE NOT NULL,
    fullname TEXT NOT NULL,
    shortname TEXT NOT NULL,
    category_id INTEGER,
    summary TEXT,
    format TEXT,
    startdate INTEGER,
    enddate INTEGER,
    visible INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    moodle_id INTEGER UNIQUE NOT NULL,
    username TEXT NOT NULL,
    firstname TEXT,
    lastname TEXT,
    email TEXT,
    role TEXT,
    last_access INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE enrollments (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    course_id INTEGER,
    role TEXT,
    status TEXT,
    timestart INTEGER,
    timeend INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE TABLE questions (
    id INTEGER PRIMARY KEY,
    moodle_id INTEGER UNIQUE NOT NULL,
    category_id INTEGER,
    name TEXT NOT NULL,
    questiontext TEXT,
    qtype TEXT,
    defaultmark REAL,
    penalty REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quizzes (
    id INTEGER PRIMARY KEY,
    moodle_id INTEGER UNIQUE NOT NULL,
    course_id INTEGER,
    name TEXT NOT NULL,
    intro TEXT,
    timeopen INTEGER,
    timeclose INTEGER,
    timelimit INTEGER,
    attempts INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- AI Assistant specific tables
CREATE TABLE admin_patterns (
    id INTEGER PRIMARY KEY,
    pattern_type TEXT NOT NULL, -- 'course_creation', 'user_management', etc.
    pattern_data TEXT NOT NULL, -- JSON data
    frequency INTEGER DEFAULT 1,
    last_used DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ai_conversations (
    id INTEGER PRIMARY KEY,
    session_id TEXT NOT NULL,
    user_input TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    context_used TEXT, -- JSON of context data used
    action_taken TEXT, -- What action was performed
    ai_provider TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE memory_context (
    id INTEGER PRIMARY KEY,
    context_type TEXT NOT NULL, -- 'course', 'user', 'question', etc.
    entity_id INTEGER NOT NULL,
    context_data TEXT NOT NULL, -- JSON context
    relevance_score REAL DEFAULT 1.0,
    last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ai_tasks (
    id INTEGER PRIMARY KEY,
    task_type TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, in_progress, completed, failed
    input_data TEXT NOT NULL, -- JSON
    output_data TEXT,
    ai_provider TEXT,
    started_at DATETIME,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_courses_moodle_id ON courses(moodle_id);
CREATE INDEX idx_users_moodle_id ON users(moodle_id);
CREATE INDEX idx_questions_moodle_id ON questions(moodle_id);
CREATE INDEX idx_enrollments_user_course ON enrollments(user_id, course_id);
CREATE INDEX idx_admin_patterns_type ON admin_patterns(pattern_type);
CREATE INDEX idx_conversations_session ON ai_conversations(session_id);
CREATE INDEX idx_memory_context_type_entity ON memory_context(context_type, entity_id);
CREATE INDEX idx_ai_tasks_status ON ai_tasks(status);

-- Views for common queries
CREATE VIEW course_summary AS
SELECT 
    c.id,
    c.fullname,
    c.shortname,
    COUNT(DISTINCT e.user_id) as enrolled_users,
    COUNT(DISTINCT q.id) as quiz_count
FROM courses c
LEFT JOIN enrollments e ON c.id = e.course_id
LEFT JOIN quizzes q ON c.id = q.course_id
GROUP BY c.id, c.fullname, c.shortname;

CREATE VIEW user_activity AS
SELECT 
    u.id,
    u.username,
    u.firstname,
    u.lastname,
    COUNT(DISTINCT e.course_id) as enrolled_courses,
    MAX(u.last_access) as last_activity
FROM users u
LEFT JOIN enrollments e ON u.id = e.user_id
GROUP BY u.id, u.username, u.firstname, u.lastname;