import { Database } from '../database/Database';

export interface ContextItem {
    type: string;
    entityId: number;
    data: any;
    relevanceScore: number;
}

export class ContextManager {
    private memoryDb: Database;
    private maxContextItems: number = 10;

    constructor(memoryDb: Database) {
        this.memoryDb = memoryDb;
    }

    /**
     * Build context for AI based on user query and current state
     */
    async buildContext(query: string, sessionId: string): Promise<string> {
        const contextItems: ContextItem[] = [];
        
        // Analyze query to determine what context is needed
        const queryAnalysis = this.analyzeQuery(query);
        
        // Get relevant context based on query analysis
        for (const contextType of queryAnalysis.contextTypes) {
            const items = await this.getRelevantContext(contextType, queryAnalysis.keywords);
            contextItems.push(...items);
        }

        // Get conversation history for continuity
        const conversationHistory = await this.memoryDb.getConversationHistory(sessionId, 3);
        
        // Get admin patterns that might be relevant
        const adminPatterns = await this.getRelevantAdminPatterns(queryAnalysis.actionType);

        // Build formatted context string
        return this.formatContext(contextItems, conversationHistory, adminPatterns, queryAnalysis);
    }

    private analyzeQuery(query: string): any {
        const lowerQuery = query.toLowerCase();
        const analysis = {
            contextTypes: [] as string[],
            actionType: 'unknown',
            keywords: [] as string[],
            entities: [] as string[]
        };

        // Determine action type
        if (lowerQuery.includes('create') || lowerQuery.includes('add') || lowerQuery.includes('new')) {
            analysis.actionType = 'create';
        } else if (lowerQuery.includes('review') || lowerQuery.includes('analyze') || lowerQuery.includes('check')) {
            analysis.actionType = 'review';
        } else if (lowerQuery.includes('modify') || lowerQuery.includes('update') || lowerQuery.includes('change')) {
            analysis.actionType = 'modify';
        } else if (lowerQuery.includes('delete') || lowerQuery.includes('remove')) {
            analysis.actionType = 'delete';
        }

        // Determine context types needed
        if (lowerQuery.includes('course')) {
            analysis.contextTypes.push('course');
            analysis.keywords.push('course');
        }
        if (lowerQuery.includes('user') || lowerQuery.includes('student') || lowerQuery.includes('enroll')) {
            analysis.contextTypes.push('user');
            analysis.keywords.push('user', 'student', 'enrollment');
        }
        if (lowerQuery.includes('question') || lowerQuery.includes('quiz') || lowerQuery.includes('test')) {
            analysis.contextTypes.push('question');
            analysis.keywords.push('question', 'quiz', 'assessment');
        }

        // Extract specific entities (course names, user names, etc.)
        const coursePattern = /(?:course|electronics|embedded|programming|java|python|c\+\+)/gi;
        const matches = query.match(coursePattern);
        if (matches) {
            analysis.entities.push(...matches);
        }

        return analysis;
    }

    private async getRelevantContext(contextType: string, keywords: string[]): Promise<ContextItem[]> {
        const items: ContextItem[] = [];

        switch (contextType) {
            case 'course':
                const courses = await this.memoryDb.getCourses();
                for (const course of courses.slice(0, 5)) {
                    const relevance = this.calculateRelevance(course, keywords);
                    if (relevance > 0.3) {
                        items.push({
                            type: 'course',
                            entityId: course.id,
                            data: course,
                            relevanceScore: relevance
                        });
                    }
                }
                break;

            case 'user':
                const users = await this.memoryDb.getUsers();
                for (const user of users.slice(0, 5)) {
                    const relevance = this.calculateRelevance(user, keywords);
                    if (relevance > 0.3) {
                        items.push({
                            type: 'user',
                            entityId: user.id,
                            data: user,
                            relevanceScore: relevance
                        });
                    }
                }
                break;

            case 'question':
                const questions = await this.memoryDb.getQuestions();
                for (const question of questions.slice(0, 5)) {
                    const relevance = this.calculateRelevance(question, keywords);
                    if (relevance > 0.3) {
                        items.push({
                            type: 'question',
                            entityId: question.id,
                            data: question,
                            relevanceScore: relevance
                        });
                    }
                }
                break;
        }

        return items.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    private calculateRelevance(item: any, keywords: string[]): number {
        let score = 0;
        const itemText = JSON.stringify(item).toLowerCase();

        for (const keyword of keywords) {
            if (itemText.includes(keyword.toLowerCase())) {
                score += 0.3;
            }
        }

        // Boost score for recently accessed items
        if (item.updated_at) {
            const daysSinceUpdate = (Date.now() - new Date(item.updated_at).getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceUpdate < 7) score += 0.2;
            if (daysSinceUpdate < 1) score += 0.3;
        }

        return Math.min(score, 1.0);
    }

    private async getRelevantAdminPatterns(actionType: string): Promise<any[]> {
        const patterns = [];
        
        // Get patterns for the specific action type
        const pattern = await this.memoryDb.getAdminPattern(actionType);
        if (pattern) {
            patterns.push({ type: actionType, data: pattern });
        }

        // Get general patterns that might be relevant
        const generalPattern = await this.memoryDb.getAdminPattern('general');
        if (generalPattern) {
            patterns.push({ type: 'general', data: generalPattern });
        }

        return patterns;
    }

    private formatContext(
        contextItems: ContextItem[], 
        conversationHistory: any[], 
        adminPatterns: any[], 
        queryAnalysis: any
    ): string {
        let context = "=== MOODLE CONTEXT ===\n\n";

        // Add system overview
        context += "SYSTEM OVERVIEW:\n";
        context += `- Action Type: ${queryAnalysis.actionType}\n`;
        context += `- Context Types: ${queryAnalysis.contextTypes.join(', ')}\n`;
        context += `- Keywords: ${queryAnalysis.keywords.join(', ')}\n\n`;

        // Add relevant data
        if (contextItems.length > 0) {
            context += "RELEVANT DATA:\n";
            
            const courseItems = contextItems.filter(item => item.type === 'course');
            if (courseItems.length > 0) {
                context += "\nCourses:\n";
                courseItems.forEach(item => {
                    context += `- ${item.data.fullname} (${item.data.shortname}): ${item.data.enrolled_users || 0} students\n`;
                });
            }

            const userItems = contextItems.filter(item => item.type === 'user');
            if (userItems.length > 0) {
                context += "\nUsers:\n";
                userItems.forEach(item => {
                    context += `- ${item.data.firstname} ${item.data.lastname} (${item.data.username}): ${item.data.enrolled_courses || 0} courses\n`;
                });
            }

            const questionItems = contextItems.filter(item => item.type === 'question');
            if (questionItems.length > 0) {
                context += "\nQuestions:\n";
                questionItems.forEach(item => {
                    context += `- ${item.data.name} (${item.data.qtype}): ${item.data.defaultmark} marks\n`;
                });
            }
        }

        // Add admin patterns
        if (adminPatterns.length > 0) {
            context += "\nADMIN PATTERNS:\n";
            adminPatterns.forEach(pattern => {
                context += `- ${pattern.type}: Used ${pattern.data.frequency || 1} times\n`;
                if (pattern.data.preferences) {
                    context += `  Preferences: ${JSON.stringify(pattern.data.preferences)}\n`;
                }
            });
        }

        // Add conversation history
        if (conversationHistory.length > 0) {
            context += "\nRECENT CONVERSATION:\n";
            conversationHistory.reverse().forEach(conv => {
                context += `User: ${conv.user_input}\n`;
                context += `AI: ${conv.ai_response.substring(0, 100)}...\n\n`;
            });
        }

        context += "=== END CONTEXT ===\n\n";
        context += "Based on this context, please provide a helpful response that:\n";
        context += "1. Uses the relevant data from above\n";
        context += "2. Follows established admin patterns\n";
        context += "3. Asks for confirmation before making changes\n";
        context += "4. Provides specific, actionable suggestions\n\n";

        return context;
    }

    /**
     * Save context after AI interaction for future reference
     */
    async saveInteractionContext(
        sessionId: string, 
        userInput: string, 
        aiResponse: string, 
        contextUsed: ContextItem[], 
        actionTaken?: string
    ): Promise<void> {
        // Save the conversation
        await this.memoryDb.saveConversation(
            sessionId, 
            userInput, 
            aiResponse, 
            contextUsed, 
            actionTaken
        );

        // Update relevance scores for used context items
        for (const item of contextUsed) {
            await this.memoryDb.saveContext(
                item.type, 
                item.entityId, 
                item.data, 
                item.relevanceScore + 0.1 // Boost relevance for used items
            );
        }
    }

    /**
     * Learn from user patterns and save for future use
     */
    async learnFromInteraction(actionType: string, userPreferences: any): Promise<void> {
        await this.memoryDb.saveAdminPattern(actionType, {
            preferences: userPreferences,
            timestamp: new Date().toISOString()
        });
    }
}