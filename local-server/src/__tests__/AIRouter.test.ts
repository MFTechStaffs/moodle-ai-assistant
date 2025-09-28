import { AIRouter } from '../ai-bridge/AIRouter';

describe('AIRouter', () => {
    let router: AIRouter;

    beforeEach(() => {
        router = new AIRouter();
    });

    test('should initialize with default providers', () => {
        const stats = router.getProviderStats();
        expect(stats.length).toBe(3);
        expect(stats.map(p => p.name)).toContain('claude');
        expect(stats.map(p => p.name)).toContain('chatgpt');
        expect(stats.map(p => p.name)).toContain('gemini');
    });

    test('should route course creation to claude', async () => {
        const request = {
            prompt: 'Create a new electronics course',
            context: 'User wants to create course',
            taskType: 'course_creation'
        };

        const response = await router.routeRequest(request);
        expect(response.provider).toBe('claude');
        expect(response.content).toContain('Claude Response');
    });

    test('should route question generation to chatgpt', async () => {
        const request = {
            prompt: 'Generate 10 MCQ questions about circuits',
            context: 'Question generation task',
            taskType: 'question_generation'
        };

        const response = await router.routeRequest(request);
        expect(response.provider).toBe('chatgpt');
        expect(response.content).toContain('ChatGPT Response');
    });

    test('should enable/disable providers', () => {
        router.setProviderEnabled('claude', false);
        const stats = router.getProviderStats();
        const claude = stats.find(p => p.name === 'claude');
        expect(claude?.enabled).toBe(false);
    });

    test('should set provider priority', () => {
        router.setProviderPriority('gemini', 1);
        const stats = router.getProviderStats();
        const gemini = stats.find(p => p.name === 'gemini');
        expect(gemini?.priority).toBe(1);
    });
});