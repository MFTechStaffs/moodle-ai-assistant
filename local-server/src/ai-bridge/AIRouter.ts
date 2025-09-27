export interface AIProvider {
    name: string;
    priority: number;
    enabled: boolean;
    url: string;
    capabilities: string[];
}

export interface AIRequest {
    prompt: string;
    context: string;
    taskType: string;
    maxTokens?: number;
}

export interface AIResponse {
    content: string;
    provider: string;
    tokensUsed?: number;
    processingTime: number;
    confidence?: number;
}

export class AIRouter {
    private providers: Map<string, AIProvider> = new Map();
    private currentProvider: string = 'claude';
    private rotationEnabled: boolean = true;

    constructor() {
        this.initializeProviders();
    }

    private initializeProviders(): void {
        const providers: AIProvider[] = [
            {
                name: 'claude',
                priority: 1,
                enabled: true,
                url: 'https://claude.ai',
                capabilities: ['reasoning', 'analysis', 'planning', 'code']
            },
            {
                name: 'chatgpt',
                priority: 2,
                enabled: true,
                url: 'https://chat.openai.com',
                capabilities: ['general', 'creative', 'technical', 'questions']
            },
            {
                name: 'gemini',
                priority: 3,
                enabled: true,
                url: 'https://gemini.google.com',
                capabilities: ['analysis', 'technical', 'multimodal']
            }
        ];

        providers.forEach(provider => {
            this.providers.set(provider.name, provider);
        });
    }

    /**
     * Route request to best AI provider based on task type
     */
    async routeRequest(request: AIRequest): Promise<AIResponse> {
        const provider = this.selectProvider(request.taskType);
        
        if (!provider) {
            throw new Error('No suitable AI provider available');
        }

        console.log(`Routing ${request.taskType} to ${provider.name}`);
        
        const startTime = Date.now();
        
        try {
            const response = await this.sendToProvider(provider, request);
            const processingTime = Date.now() - startTime;
            
            return {
                ...response,
                provider: provider.name,
                processingTime
            };
        } catch (error) {
            console.error(`Provider ${provider.name} failed:`, error);
            
            // Try fallback provider
            const fallback = this.getFallbackProvider(provider.name);
            if (fallback) {
                console.log(`Falling back to ${fallback.name}`);
                const response = await this.sendToProvider(fallback, request);
                const processingTime = Date.now() - startTime;
                
                return {
                    ...response,
                    provider: fallback.name,
                    processingTime
                };
            }
            
            throw error;
        }
    }

    private selectProvider(taskType: string): AIProvider | null {
        // Task-specific provider selection
        const providerMap: { [key: string]: string } = {
            'course_creation': 'claude',      // Best at structured planning
            'question_generation': 'chatgpt', // Good at content creation
            'code_analysis': 'gemini',        // Strong technical analysis
            'user_management': 'claude',      // Excellent reasoning
            'content_review': 'chatgpt',      // Good at analysis
            'data_analysis': 'claude',        // Superior analytical skills
            'general': 'claude'               // Default to Claude
        };

        const preferredProvider = providerMap[taskType] || providerMap['general'];
        const provider = this.providers.get(preferredProvider);
        
        if (provider && provider.enabled) {
            return provider;
        }

        // Fallback to any available provider
        for (const [name, prov] of this.providers) {
            if (prov.enabled) {
                return prov;
            }
        }

        return null;
    }

    private getFallbackProvider(failedProvider: string): AIProvider | null {
        const priorities = Array.from(this.providers.values())
            .filter(p => p.enabled && p.name !== failedProvider)
            .sort((a, b) => a.priority - b.priority);
        
        return priorities[0] || null;
    }

    private async sendToProvider(provider: AIProvider, request: AIRequest): Promise<Partial<AIResponse>> {
        // This will be implemented by specific provider handlers
        switch (provider.name) {
            case 'claude':
                return this.sendToClaude(request);
            case 'chatgpt':
                return this.sendToChatGPT(request);
            case 'gemini':
                return this.sendToGemini(request);
            default:
                throw new Error(`Unknown provider: ${provider.name}`);
        }
    }

    private async sendToClaude(request: AIRequest): Promise<Partial<AIResponse>> {
        // Placeholder - will be implemented with browser automation
        return {
            content: `[Claude Response] ${request.prompt}`,
            confidence: 0.9
        };
    }

    private async sendToChatGPT(request: AIRequest): Promise<Partial<AIResponse>> {
        // Placeholder - will be implemented with browser automation
        return {
            content: `[ChatGPT Response] ${request.prompt}`,
            confidence: 0.85
        };
    }

    private async sendToGemini(request: AIRequest): Promise<Partial<AIResponse>> {
        // Placeholder - will be implemented with browser automation
        return {
            content: `[Gemini Response] ${request.prompt}`,
            confidence: 0.8
        };
    }

    /**
     * Get provider statistics
     */
    getProviderStats(): any {
        return Array.from(this.providers.values()).map(provider => ({
            name: provider.name,
            enabled: provider.enabled,
            priority: provider.priority,
            capabilities: provider.capabilities
        }));
    }

    /**
     * Enable/disable provider
     */
    setProviderEnabled(name: string, enabled: boolean): void {
        const provider = this.providers.get(name);
        if (provider) {
            provider.enabled = enabled;
        }
    }

    /**
     * Set provider priority
     */
    setProviderPriority(name: string, priority: number): void {
        const provider = this.providers.get(name);
        if (provider) {
            provider.priority = priority;
        }
    }
}