import { ContextManager } from '../memory/ContextManager';
import { Database } from '../database/Database';

describe('ContextManager', () => {
    let contextManager: ContextManager;
    let db: Database;

    beforeEach(async () => {
        db = new Database('data/test-context.db');
        contextManager = new ContextManager(db);
        
        // Add test data
        await db.saveCourse({
            id: 1,
            fullname: 'Electronics Fundamentals',
            shortname: 'ELEC101',
            category: 1,
            summary: 'Basic electronics course',
            format: 'topics',
            startdate: Date.now(),
            enddate: Date.now() + 86400000,
            visible: 1
        });
    });

    afterEach(async () => {
        await db.close();
    });

    test('should build context for course query', async () => {
        const query = 'Review my electronics course';
        const sessionId = 'test-session';
        
        const context = await contextManager.buildContext(query, sessionId);
        
        expect(context).toContain('MOODLE CONTEXT');
        expect(context).toContain('Electronics Fundamentals');
        expect(context).toContain('review');
    });

    test('should analyze query correctly', async () => {
        const queries = [
            { query: 'Create new course', expectedAction: 'create' },
            { query: 'Review existing course', expectedAction: 'review' },
            { query: 'Update course settings', expectedAction: 'modify' },
            { query: 'Delete old course', expectedAction: 'delete' }
        ];

        for (const { query, expectedAction } of queries) {
            const context = await contextManager.buildContext(query, 'test');
            expect(context).toContain(`Action Type: ${expectedAction}`);
        }
    });

    test('should save interaction context', async () => {
        const sessionId = 'test-session';
        const userInput = 'Create electronics course';
        const aiResponse = 'I can help create the course';
        const contextUsed = [];

        await contextManager.saveInteractionContext(
            sessionId,
            userInput,
            aiResponse,
            contextUsed,
            'create'
        );

        const history = await db.getConversationHistory(sessionId, 1);
        expect(history.length).toBe(1);
        expect(history[0].user_input).toBe(userInput);
    });

    test('should learn from interactions', async () => {
        const actionType = 'course_creation';
        const preferences = { modules: 5, format: 'topics' };

        await contextManager.learnFromInteraction(actionType, preferences);
        const pattern = await db.getAdminPattern(actionType);
        
        expect(pattern).toBeTruthy();
        expect(pattern.preferences.modules).toBe(5);
    });
});