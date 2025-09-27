import puppeteer, { Browser, Page } from 'puppeteer';
import fs from 'fs';
import path from 'path';

export class BrowserAutomation {
    private browser: Browser | null = null;
    private pages: Map<string, Page> = new Map();
    private userDataDir: string;

    constructor(userDataDir: string = './browser-sessions') {
        this.userDataDir = path.resolve(userDataDir);
        this.ensureUserDataDir();
    }

    private ensureUserDataDir(): void {
        if (!fs.existsSync(this.userDataDir)) {
            fs.mkdirSync(this.userDataDir, { recursive: true });
        }
    }

    async initialize(): Promise<void> {
        if (this.browser) return;

        this.browser = await puppeteer.launch({
            headless: false, // Keep visible for free tier usage
            userDataDir: this.userDataDir,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ]
        });

        console.log('Browser automation initialized');
    }

    async getPage(provider: string): Promise<Page> {
        if (!this.browser) {
            await this.initialize();
        }

        let page = this.pages.get(provider);
        
        if (!page) {
            page = await this.browser!.newPage();
            
            // Set user agent to avoid detection
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            
            // Set viewport
            await page.setViewport({ width: 1280, height: 720 });
            
            this.pages.set(provider, page);
        }

        return page;
    }

    async sendToClaude(prompt: string, context: string): Promise<string> {
        const page = await this.getPage('claude');
        
        try {
            // Navigate to Claude if not already there
            if (!page.url().includes('claude.ai')) {
                await page.goto('https://claude.ai', { waitUntil: 'networkidle2' });
                await this.waitForLogin(page, 'claude');
            }

            // Combine context and prompt
            const fullPrompt = `${context}\n\nUser Request: ${prompt}`;

            // Find and click the input area
            await page.waitForSelector('[contenteditable="true"], textarea, input[type="text"]', { timeout: 10000 });
            
            // Clear existing content and type new prompt
            await page.evaluate(() => {
                const input = document.querySelector('[contenteditable="true"], textarea, input[type="text"]') as HTMLElement;
                if (input) {
                    if (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA') {
                        (input as HTMLInputElement).value = '';
                    } else {
                        input.innerHTML = '';
                    }
                    input.focus();
                }
            });

            await page.type('[contenteditable="true"], textarea, input[type="text"]', fullPrompt);
            
            // Send the message
            await page.keyboard.press('Enter');
            
            // Wait for response
            await this.waitForResponse(page, 'claude');
            
            // Extract response
            const response = await this.extractClaudeResponse(page);
            return response;
            
        } catch (error) {
            console.error('Claude automation failed:', error);
            throw new Error(`Claude automation failed: ${error.message}`);
        }
    }

    async sendToChatGPT(prompt: string, context: string): Promise<string> {
        const page = await this.getPage('chatgpt');
        
        try {
            // Navigate to ChatGPT if not already there
            if (!page.url().includes('chat.openai.com')) {
                await page.goto('https://chat.openai.com', { waitUntil: 'networkidle2' });
                await this.waitForLogin(page, 'chatgpt');
            }

            const fullPrompt = `${context}\n\nUser Request: ${prompt}`;

            // Find the input textarea
            await page.waitForSelector('#prompt-textarea, textarea[placeholder*="message"]', { timeout: 10000 });
            
            // Clear and type prompt
            await page.evaluate(() => {
                const textarea = document.querySelector('#prompt-textarea, textarea[placeholder*="message"]') as HTMLTextAreaElement;
                if (textarea) {
                    textarea.value = '';
                    textarea.focus();
                }
            });

            await page.type('#prompt-textarea, textarea[placeholder*="message"]', fullPrompt);
            
            // Send message
            await page.keyboard.press('Enter');
            
            // Wait for response
            await this.waitForResponse(page, 'chatgpt');
            
            // Extract response
            const response = await this.extractChatGPTResponse(page);
            return response;
            
        } catch (error) {
            console.error('ChatGPT automation failed:', error);
            throw new Error(`ChatGPT automation failed: ${error.message}`);
        }
    }

    async sendToGemini(prompt: string, context: string): Promise<string> {
        const page = await this.getPage('gemini');
        
        try {
            // Navigate to Gemini if not already there
            if (!page.url().includes('gemini.google.com')) {
                await page.goto('https://gemini.google.com', { waitUntil: 'networkidle2' });
                await this.waitForLogin(page, 'gemini');
            }

            const fullPrompt = `${context}\n\nUser Request: ${prompt}`;

            // Find input area
            await page.waitForSelector('[contenteditable="true"], textarea', { timeout: 10000 });
            
            // Clear and type prompt
            await page.evaluate(() => {
                const input = document.querySelector('[contenteditable="true"], textarea') as HTMLElement;
                if (input) {
                    if (input.tagName === 'TEXTAREA') {
                        (input as HTMLTextAreaElement).value = '';
                    } else {
                        input.innerHTML = '';
                    }
                    input.focus();
                }
            });

            await page.type('[contenteditable="true"], textarea', fullPrompt);
            
            // Send message (usually Enter or a send button)
            await page.keyboard.press('Enter');
            
            // Wait for response
            await this.waitForResponse(page, 'gemini');
            
            // Extract response
            const response = await this.extractGeminiResponse(page);
            return response;
            
        } catch (error) {
            console.error('Gemini automation failed:', error);
            throw new Error(`Gemini automation failed: ${error.message}`);
        }
    }

    private async waitForLogin(page: Page, provider: string): Promise<void> {
        console.log(`Waiting for ${provider} login...`);
        
        // Wait up to 60 seconds for user to login manually
        const timeout = 60000;
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
            const url = page.url();
            
            // Check if we're past login pages
            if (provider === 'claude' && url.includes('claude.ai') && !url.includes('login')) {
                break;
            }
            if (provider === 'chatgpt' && url.includes('chat.openai.com') && !url.includes('auth')) {
                break;
            }
            if (provider === 'gemini' && url.includes('gemini.google.com') && !url.includes('accounts')) {
                break;
            }
            
            await page.waitForTimeout(1000);
        }
        
        console.log(`${provider} login completed`);
    }

    private async waitForResponse(page: Page, provider: string): Promise<void> {
        // Wait for AI response to appear
        const timeout = 30000;
        
        try {
            if (provider === 'claude') {
                await page.waitForFunction(() => {
                    const messages = document.querySelectorAll('[data-testid="message"]');
                    return messages.length > 0;
                }, { timeout });
            } else if (provider === 'chatgpt') {
                await page.waitForFunction(() => {
                    const responses = document.querySelectorAll('[data-message-author-role="assistant"]');
                    return responses.length > 0;
                }, { timeout });
            } else if (provider === 'gemini') {
                await page.waitForFunction(() => {
                    const responses = document.querySelectorAll('[data-response-index]');
                    return responses.length > 0;
                }, { timeout });
            }
        } catch (error) {
            console.log('Response timeout, proceeding with extraction...');
        }
        
        // Additional wait for content to fully load
        await page.waitForTimeout(2000);
    }

    private async extractClaudeResponse(page: Page): Promise<string> {
        return await page.evaluate(() => {
            const messages = document.querySelectorAll('[data-testid="message"]');
            const lastMessage = messages[messages.length - 1];
            return lastMessage ? lastMessage.textContent || '' : 'No response received';
        });
    }

    private async extractChatGPTResponse(page: Page): Promise<string> {
        return await page.evaluate(() => {
            const responses = document.querySelectorAll('[data-message-author-role="assistant"]');
            const lastResponse = responses[responses.length - 1];
            return lastResponse ? lastResponse.textContent || '' : 'No response received';
        });
    }

    private async extractGeminiResponse(page: Page): Promise<string> {
        return await page.evaluate(() => {
            const responses = document.querySelectorAll('[data-response-index]');
            const lastResponse = responses[responses.length - 1];
            return lastResponse ? lastResponse.textContent || '' : 'No response received';
        });
    }

    async close(): Promise<void> {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.pages.clear();
            console.log('Browser automation closed');
        }
    }
}