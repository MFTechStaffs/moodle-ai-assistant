import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { Database } from './database/Database';
import { MoodleConnector } from './moodle-api/MoodleConnector';
import { ContextManager } from './memory/ContextManager';
import { AIService } from './ai-bridge/AIService';

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database and services
const memoryDb = new Database();
const contextManager = new ContextManager(memoryDb);
const aiService = new AIService(memoryDb);

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

// AI query endpoint
app.post('/api/ai/query', async (req, res) => {
    try {
        const { query, sessionId } = req.body;
        
        if (!query || !sessionId) {
            return res.status(400).json({ error: 'Query and sessionId are required' });
        }

        const response = await aiService.processQuery(query, sessionId);
        res.json(response);
    } catch (error) {
        console.error('AI query failed:', error);
        res.status(500).json({ error: 'Failed to process query' });
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

// Initialize AI service
aiService.initialize().then(() => {
    console.log('AI Service initialized');
}).catch(error => {
    console.error('AI Service initialization failed:', error);
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
    await aiService.close();
    process.exit(0);
});