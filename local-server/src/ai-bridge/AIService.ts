import { AIRouter, AIRequest, AIResponse } from './AIRouter';
import { BrowserAutomation } from './BrowserAutomation';
import { ContextManager } from '../memory/ContextManager';
import { Database } from '../database/Database';

export class AIService {
    private router: AIRouter;
    private browser: BrowserAutomation;
    private contextManager: ContextManager;
    private memoryDb: Database;

    constructor(memoryDb: Database) {
        this.memoryDb = memoryDb;
        this.router = new AIRouter();
        this.browser = new BrowserAutomation();
        this.contextManager = new ContextManager(memoryDb);
    }

    async initialize(): Promise<void> {
        await this.browser.initialize();
        console.log('AI Service initialized');
    }

    /**
     * Process user query with full context and AI routing
     */
    async processQuery(query: string, sessionId: string): Promise<AIResponse> {
        try {
            // Build context from memory
            const context = await this.contextManager.buildContext(query, sessionId);
            
            // Determine task type from query
            const taskType = this.determineTaskType(query);
            
            // Create AI request
            const request: AIRequest = {
                prompt: query,
                context: context,
                taskType: taskType,
                maxTokens: 2000
            };

            // Route to appropriate AI provider
            const response = await this.routeToProvider(request);
            
            // Save interaction for learning
            await this.contextManager.saveInteractionContext(
                sessionId,
                query,
                response.content,
                [], // Context items will be populated by context manager
                this.extractActionFromResponse(response.content)
            );

            return response;
            
        } catch (error) {
            console.error('Query processing failed:', error);
            throw new Error(`Failed to process query: ${error.message}`);
        }
    }

    private async routeToProvider(request: AIRequest): Promise<AIResponse> {
        // First try the router's provider selection
        try {
            return await this.router.routeRequest(request);
        } catch (error) {
            console.error('Router failed, trying browser automation:', error);
            
            // Fallback to browser automation
            return await this.browserFallback(request);
        }
    }

    private async browserFallback(request: AIRequest): Promise<AIResponse> {
        const startTime = Date.now();
        
        try {
            // Try Claude first (usually most reliable)
            const response = await this.browser.sendToClaude(request.prompt, request.context);
            
            return {
                content: response,
                provider: 'claude-browser',
                processingTime: Date.now() - startTime,
                confidence: 0.85
            };
        } catch (claudeError) {
            console.log('Claude failed, trying ChatGPT...');
            
            try {
                const response = await this.browser.sendToChatGPT(request.prompt, request.context);
                
                return {
                    content: response,
                    provider: 'chatgpt-browser',
                    processingTime: Date.now() - startTime,
                    confidence: 0.8
                };
            } catch (gptError) {
                console.log('ChatGPT failed, trying Gemini...');
                
                const response = await this.browser.sendToGemini(request.prompt, request.context);
                
                return {
                    content: response,
                    provider: 'gemini-browser',
                    processingTime: Date.now() - startTime,
                    confidence: 0.75
                };
            }
        }
    }

    private determineTaskType(query: string): string {
        const lowerQuery = query.toLowerCase();
        
        // Course management
        if (lowerQuery.includes('course') && (lowerQuery.includes('create') || lowerQuery.includes('new'))) {
            return 'course_creation';
        }
        if (lowerQuery.includes('course') && (lowerQuery.includes('review') || lowerQuery.includes('analyze'))) {
            return 'content_review';
        }
        
        // Question management
        if (lowerQuery.includes('question') && lowerQuery.includes('generate')) {
            return 'question_generation';
        }
        if (lowerQuery.includes('question') && (lowerQuery.includes('review') || lowerQuery.includes('duplicate'))) {
            return 'content_review';
        }
        
        // User management
        if (lowerQuery.includes('user') || lowerQuery.includes('student') || lowerQuery.includes('enroll')) {
            return 'user_management';
        }
        
        // Data analysis
        if (lowerQuery.includes('analyze') || lowerQuery.includes('performance') || lowerQuery.includes('stats')) {
            return 'data_analysis';
        }
        
        // Code/configuration
        if (lowerQuery.includes('code') || lowerQuery.includes('config') || lowerQuery.includes('setting')) {
            return 'code_analysis';
        }
        
        return 'general';
    }

    private extractActionFromResponse(response: string): string | undefined {
        const lowerResponse = response.toLowerCase();
        
        if (lowerResponse.includes('creating') || lowerResponse.includes('will create')) {
            return 'create';
        }
        if (lowerResponse.includes('updating') || lowerResponse.includes('will update')) {
            return 'update';
        }
        if (lowerResponse.includes('deleting') || lowerResponse.includes('will delete')) {
            return 'delete';
        }
        if (lowerResponse.includes('analyzing') || lowerResponse.includes('analysis')) {
            return 'analyze';
        }
        
        return undefined;
    }

    /**
     * Execute specific Moodle actions based on AI recommendations
     */
    async executeAction(action: string, parameters: any, sessionId: string): Promise<any> {
        console.log(`Executing action: ${action}`, parameters);
        
        try {
            switch (action) {
                case 'create_course':
                    return await this.createCourse(parameters);
                case 'enroll_users':
                    return await this.enrollUsers(parameters);
                case 'create_questions':
                    return await this.createQuestions(parameters);
                case 'update_quiz':
                    return await this.updateQuiz(parameters);
                default:
                    throw new Error(`Unknown action: ${action}`);
            }
        } catch (error) {
            console.error(`Action execution failed: ${action}`, error);
            throw error;
        }
    }

    private async createCourse(params: any): Promise<any> {
        // This would integrate with Moodle API or database
        console.log('Creating course:', params);
        
        // For now, just save the pattern for learning
        await this.memoryDb.saveAdminPattern('course_creation', {
            template: params,
            timestamp: new Date().toISOString()
        });
        
        return { success: true, message: 'Course creation pattern saved' };
    }

    private async enrollUsers(params: any): Promise<any> {
        console.log('Enrolling users:', params);
        
        await this.memoryDb.saveAdminPattern('user_enrollment', {
            pattern: params,
            timestamp: new Date().toISOString()
        });
        
        return { success: true, message: 'User enrollment pattern saved' };
    }

    private async createQuestions(params: any): Promise<any> {
        console.log('Creating questions:', params);
        
        await this.memoryDb.saveAdminPattern('question_creation', {
            template: params,
            timestamp: new Date().toISOString()
        });
        
        return { success: true, message: 'Question creation pattern saved' };
    }

    private async updateQuiz(params: any): Promise<any> {
        console.log('Updating quiz:', params);
        
        await this.memoryDb.saveAdminPattern('quiz_update', {
            changes: params,
            timestamp: new Date().toISOString()
        });
        
        return { success: true, message: 'Quiz update pattern saved' };
    }

    /**
     * Get AI service statistics
     */
    async getStats(): Promise<any> {
        const providerStats = this.router.getProviderStats();
        const conversationCount = await this.memoryDb.get('SELECT COUNT(*) as count FROM ai_conversations');
        
        return {
            providers: providerStats,
            totalConversations: conversationCount?.count || 0,
            browserAutomation: {
                initialized: this.browser !== null,
                status: 'ready'
            }
        };
    }

    async close(): Promise<void> {
        await this.browser.close();
        console.log('AI Service closed');
    }
}