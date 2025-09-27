import * as vscode from 'vscode';
import axios from 'axios';

export class ServerManager {
    private serverUrl: string;
    private outputChannel: vscode.OutputChannel;

    constructor() {
        const config = vscode.workspace.getConfiguration('moodleAI');
        this.serverUrl = config.get('serverUrl', 'http://localhost:3000');
        this.outputChannel = vscode.window.createOutputChannel('Moodle AI Server');
    }

    async checkServerHealth(): Promise<boolean> {
        try {
            const response = await axios.get(`${this.serverUrl}/api/health`, { timeout: 5000 });
            return response.status === 200;
        } catch (error) {
            return false;
        }
    }

    async sendQuery(query: string, sessionId: string): Promise<any> {
        try {
            const response = await axios.post(`${this.serverUrl}/api/ai/query`, {
                query,
                sessionId
            });
            return response.data;
        } catch (error) {
            throw new Error(`Failed to send query: ${error.message}`);
        }
    }

    async getStats(): Promise<any> {
        try {
            const response = await axios.get(`${this.serverUrl}/api/stats`);
            return response.data;
        } catch (error) {
            throw new Error(`Failed to get stats: ${error.message}`);
        }
    }

    async syncMoodleData(): Promise<void> {
        const moodleConfig = {
            host: 'localhost',
            port: 3306,
            database: 'moodle',
            user: 'moodle',
            password: 'moodle123'
        };

        try {
            await axios.post(`${this.serverUrl}/api/sync/full`, { moodleConfig });
        } catch (error) {
            throw new Error(`Sync failed: ${error.message}`);
        }
    }

    dispose(): void {
        this.outputChannel.dispose();
    }
}