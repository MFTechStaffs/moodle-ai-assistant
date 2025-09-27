import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { Database } from './database/Database';
import { MoodleConnector } from './moodle-api/MoodleConnector';
import { ContextManager } from './memory/ContextManager';

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database and services
const memoryDb = new Database();
const contextManager = new ContextManager(memoryDb);

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        version: '0.1.0'
    });
});

// Database stats endpoint
app.get('/api/stats', async (req, res) => {
    try {
        const stats = await memoryDb.getStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get stats' });
    }
});

// Moodle data endpoints
app.get('/api/moodle/courses', async (req, res) => {
    try {
        const courses = await memoryDb.getCourses();
        res.json(courses);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get courses' });
    }
});

app.get('/api/moodle/users', async (req, res) => {
    try {
        const users = await memoryDb.getUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get users' });
    }
});

app.get('/api/moodle/questions', async (req, res) => {
    try {
        const categoryId = req.query.category ? parseInt(req.query.category as string) : undefined;
        const questions = await memoryDb.getQuestions(categoryId);
        res.json(questions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get questions' });
    }
});

// Context building endpoint
app.post('/api/context/build', async (req, res) => {
    try {
        const { query, sessionId } = req.body;
        
        if (!query || !sessionId) {
            return res.status(400).json({ error: 'Query and sessionId are required' });
        }

        const context = await contextManager.buildContext(query, sessionId);
        res.json({ context });
    } catch (error) {
        console.error('Context building failed:', error);
        res.status(500).json({ error: 'Failed to build context' });
    }
});

// Save interaction endpoint
app.post('/api/context/save', async (req, res) => {
    try {
        const { sessionId, userInput, aiResponse, contextUsed, actionTaken } = req.body;
        
        await contextManager.saveInteractionContext(
            sessionId, 
            userInput, 
            aiResponse, 
            contextUsed || [], 
            actionTaken
        );
        
        res.json({ success: true });
    } catch (error) {
        console.error('Failed to save interaction:', error);
        res.status(500).json({ error: 'Failed to save interaction' });
    }
});

// Sync endpoints
app.post('/api/sync/full', async (req, res) => {
    try {
        const { moodleConfig } = req.body;
        
        if (!moodleConfig) {
            return res.status(400).json({ error: 'Moodle configuration required' });
        }

        const connector = new MoodleConnector(moodleConfig, memoryDb);
        await connector.fullSync();
        
        res.json({ success: true, message: 'Full sync completed' });
    } catch (error) {
        console.error('Sync failed:', error);
        res.status(500).json({ error: 'Sync failed', details: error.message });
    }
});

app.post('/api/sync/courses', async (req, res) => {
    try {
        const { moodleConfig } = req.body;
        const connector = new MoodleConnector(moodleConfig, memoryDb);
        await connector.syncCourses();
        res.json({ success: true, message: 'Courses synced' });
    } catch (error) {
        res.status(500).json({ error: 'Course sync failed', details: error.message });
    }
});

// Admin patterns endpoints
app.get('/api/patterns/:type', async (req, res) => {
    try {
        const pattern = await memoryDb.getAdminPattern(req.params.type);
        res.json(pattern);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get pattern' });
    }
});

app.post('/api/patterns/:type', async (req, res) => {
    try {
        const { data } = req.body;
        await memoryDb.saveAdminPattern(req.params.type, data);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save pattern' });
    }
});

// Conversation history endpoint
app.get('/api/conversations/:sessionId', async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
        const history = await memoryDb.getConversationHistory(req.params.sessionId, limit);
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get conversation history' });
    }
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Moodle AI Assistant Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📈 Stats: http://localhost:${PORT}/api/stats`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    await memoryDb.close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('Shutting down gracefully...');
    await memoryDb.close();
    process.exit(0);
});