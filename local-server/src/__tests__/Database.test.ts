import { Database } from '../database/Database';
import fs from 'fs';
import path from 'path';

describe('Database', () => {
    let db: Database;
    const testDbPath = 'data/test-memory.db';

    beforeEach(async () => {
        // Clean up test database
        const fullPath = path.resolve(__dirname, '../../', testDbPath);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }
        
        db = new Database(testDbPath);
        await new Promise(resolve => setTimeout(resolve, 100)); // Wait for initialization
    });

    afterEach(async () => {
        await db.close();
    });

    test('should initialize database with schema', async () => {
        const stats = await db.getStats();
        expect(stats).toHaveProperty('courses');
        expect(stats).toHaveProperty('users');
        expect(stats).toHaveProperty('questions');
        expect(stats).toHaveProperty('conversations');
    });

    test('should save and retrieve courses', async () => {
        const course = {
            id: 1,
            fullname: 'Test Course',
            shortname: 'TEST101',
            category: 1,
            summary: 'Test course summary',
            format: 'topics',
            startdate: Date.now(),
            enddate: Date.now() + 86400000,
            visible: 1
        };

        await db.saveCourse(course);
        const savedCourse = await db.getCourse(1);
        
        expect(savedCourse).toBeTruthy();
        expect(savedCourse.fullname).toBe('Test Course');
        expect(savedCourse.shortname).toBe('TEST101');
    });

    test('should save and retrieve users', async () => {
        const user = {
            id: 1,
            username: 'testuser',
            firstname: 'Test',
            lastname: 'User',
            email: 'test@example.com',
            role: 'student',
            lastaccess: Date.now()
        };

        await db.saveUser(user);
        const users = await db.getUsers();
        
        expect(users.length).toBeGreaterThan(0);
        expect(users[0].username).toBe('testuser');
    });

    test('should save and retrieve admin patterns', async () => {
        const patternData = {
            preferences: { modules: 5, quizzes: true },
            frequency: 1
        };

        await db.saveAdminPattern('course_creation', patternData);
        const pattern = await db.getAdminPattern('course_creation');
        
        expect(pattern).toBeTruthy();
        expect(pattern.preferences.modules).toBe(5);
    });

    test('should save conversation history', async () => {
        const sessionId = 'test-session';
        const userInput = 'Create a new course';
        const aiResponse = 'I can help you create a new course...';
        const context = { courses: [], users: [] };

        await db.saveConversation(sessionId, userInput, aiResponse, context);
        const history = await db.getConversationHistory(sessionId, 5);
        
        expect(history.length).toBe(1);
        expect(history[0].user_input).toBe(userInput);
        expect(history[0].ai_response).toBe(aiResponse);
    });
});