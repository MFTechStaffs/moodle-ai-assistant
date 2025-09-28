import sqlite3 from 'sqlite3';
import { Database as SQLiteDB } from 'sqlite3';
import fs from 'fs';
import path from 'path';

export class Database {
    private db: SQLiteDB;
    private dbPath: string;

    constructor(dbPath: string = 'data/moodle-memory.db') {
        this.dbPath = path.resolve(__dirname, '../../', dbPath);
        this.ensureDataDirectory();
        this.db = new sqlite3.Database(this.dbPath);
        this.initialize();
    }

    private ensureDataDirectory(): void {
        const dataDir = path.dirname(this.dbPath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
    }

    private async initialize(): Promise<void> {
        return new Promise((resolve, reject) => {
            const schemaPath = path.join(__dirname, 'schema.sql');
            const schema = fs.readFileSync(schemaPath, 'utf8');
            
            this.db.exec(schema, (err) => {
                if (err) {
                    console.error('Database initialization failed:', err);
                    reject(err);
                } else {
                    console.log('Database initialized successfully');
                    resolve();
                }
            });
        });
    }

    // Generic query methods
    async run(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve({ lastID: this.lastID, changes: this.changes });
            });
        });
    }

    async get<T>(sql: string, params: any[] = []): Promise<T | undefined> {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row as T);
            });
        });
    }

    async all<T>(sql: string, params: any[] = []): Promise<T[]> {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows as T[]);
            });
        });
    }

    // Course operations
    async saveCourse(course: any): Promise<number> {
        const sql = `
            INSERT OR REPLACE INTO courses 
            (moodle_id, fullname, shortname, category_id, summary, format, startdate, enddate, visible, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `;
        const result = await this.run(sql, [
            course.id, course.fullname, course.shortname, course.category,
            course.summary, course.format, course.startdate, course.enddate, course.visible
        ]);
        return result.lastID;
    }

    async getCourses(): Promise<any[]> {
        return this.all('SELECT * FROM course_summary ORDER BY fullname');
    }

    async getCourse(moodleId: number): Promise<any> {
        return this.get('SELECT * FROM courses WHERE moodle_id = ?', [moodleId]);
    }

    // User operations
    async saveUser(user: any): Promise<number> {
        const sql = `
            INSERT OR REPLACE INTO users 
            (moodle_id, username, firstname, lastname, email, role, last_access, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `;
        const result = await this.run(sql, [
            user.id, user.username, user.firstname, user.lastname, 
            user.email, user.role, user.lastaccess
        ]);
        return result.lastID;
    }

    async getUsers(): Promise<any[]> {
        return this.all('SELECT * FROM user_activity ORDER BY lastname, firstname');
    }

    // Question operations
    async saveQuestion(question: any): Promise<number> {
        const sql = `
            INSERT OR REPLACE INTO questions 
            (moodle_id, category_id, name, questiontext, qtype, defaultmark, penalty, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `;
        const result = await this.run(sql, [
            question.id, question.category, question.name, question.questiontext,
            question.qtype, question.defaultmark, question.penalty
        ]);
        return result.lastID;
    }

    async getQuestions(categoryId?: number): Promise<any[]> {
        const sql = categoryId 
            ? 'SELECT * FROM questions WHERE category_id = ? ORDER BY name'
            : 'SELECT * FROM questions ORDER BY name';
        const params = categoryId ? [categoryId] : [];
        return this.all(sql, params);
    }

    // Admin pattern operations
    async saveAdminPattern(type: string, data: any): Promise<void> {
        const existing = await this.get(
            'SELECT * FROM admin_patterns WHERE pattern_type = ?', 
            [type]
        );

        if (existing) {
            await this.run(
                'UPDATE admin_patterns SET pattern_data = ?, frequency = frequency + 1, last_used = CURRENT_TIMESTAMP WHERE pattern_type = ?',
                [JSON.stringify(data), type]
            );
        } else {
            await this.run(
                'INSERT INTO admin_patterns (pattern_type, pattern_data) VALUES (?, ?)',
                [type, JSON.stringify(data)]
            );
        }
    }

    async getAdminPattern(type: string): Promise<any> {
        const pattern = await this.get<any>(
            'SELECT * FROM admin_patterns WHERE pattern_type = ?',
            [type]
        );
        return pattern ? JSON.parse(pattern.pattern_data) : null;
    }

    // AI conversation operations
    async saveConversation(sessionId: string, userInput: string, aiResponse: string, context: any, action?: string, provider?: string): Promise<void> {
        await this.run(
            'INSERT INTO ai_conversations (session_id, user_input, ai_response, context_used, action_taken, ai_provider) VALUES (?, ?, ?, ?, ?, ?)',
            [sessionId, userInput, aiResponse, JSON.stringify(context), action, provider]
        );
    }

    async getConversationHistory(sessionId: string, limit: number = 10): Promise<any[]> {
        return this.all(
            'SELECT * FROM ai_conversations WHERE session_id = ? ORDER BY created_at DESC LIMIT ?',
            [sessionId, limit]
        );
    }

    // Memory context operations
    async saveContext(type: string, entityId: number, contextData: any, relevanceScore: number = 1.0): Promise<void> {
        await this.run(
            'INSERT OR REPLACE INTO memory_context (context_type, entity_id, context_data, relevance_score, last_accessed) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
            [type, entityId, JSON.stringify(contextData), relevanceScore]
        );
    }

    async getRelevantContext(type: string, limit: number = 5): Promise<any[]> {
        const contexts = await this.all(
            'SELECT * FROM memory_context WHERE context_type = ? ORDER BY relevance_score DESC, last_accessed DESC LIMIT ?',
            [type, limit]
        );
        return contexts.map((ctx: any) => ({
            ...ctx,
            context_data: JSON.parse(ctx.context_data)
        }));
    }

    // Utility methods
    async getStats(): Promise<any> {
        const [courses, users, questions, conversations] = await Promise.all([
            this.get('SELECT COUNT(*) as count FROM courses'),
            this.get('SELECT COUNT(*) as count FROM users'),
            this.get('SELECT COUNT(*) as count FROM questions'),
            this.get('SELECT COUNT(*) as count FROM ai_conversations')
        ]);

        return {
            courses: (courses as any)?.count || 0,
            users: (users as any)?.count || 0,
            questions: (questions as any)?.count || 0,
            conversations: (conversations as any)?.count || 0
        };
    }

    async close(): Promise<void> {
        return new Promise((resolve) => {
            this.db.close((err) => {
                if (err) console.error('Error closing database:', err);
                resolve();
            });
        });
    }
}