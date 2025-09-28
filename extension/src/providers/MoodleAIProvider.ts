import * as vscode from 'vscode';
import { ServerManager } from '../services/ServerManager';

export class MoodleAIProvider implements vscode.TreeDataProvider<MoodleAIItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<MoodleAIItem | undefined | null | void> = new vscode.EventEmitter<MoodleAIItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<MoodleAIItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private context: vscode.ExtensionContext, private serverManager: ServerManager) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: MoodleAIItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: MoodleAIItem): Promise<MoodleAIItem[]> {
        if (!element) {
            return this.getRootItems();
        }
        return [];
    }

    private async getRootItems(): Promise<MoodleAIItem[]> {
        const items: MoodleAIItem[] = [];

        try {
            const isConnected = await this.serverManager.checkServerHealth();
            
            if (isConnected) {
                items.push(new MoodleAIItem('✅ Connected', 'Status: Ready', vscode.TreeItemCollapsibleState.None));
                items.push(new MoodleAIItem('💬 Open Chat', 'Start conversation', vscode.TreeItemCollapsibleState.None, 'moodleAI.openChat'));
                items.push(new MoodleAIItem('📚 Review Course', 'Analyze course content', vscode.TreeItemCollapsibleState.None, 'moodleAI.reviewCourse'));
                items.push(new MoodleAIItem('➕ Create Course', 'New course wizard', vscode.TreeItemCollapsibleState.None, 'moodleAI.createCourse'));
                items.push(new MoodleAIItem('👥 Manage Users', 'User operations', vscode.TreeItemCollapsibleState.None, 'moodleAI.manageUsers'));
                items.push(new MoodleAIItem('❓ Question Bank', 'Question management', vscode.TreeItemCollapsibleState.None, 'moodleAI.questionBank'));
                items.push(new MoodleAIItem('🔄 Sync Data', 'Update from Moodle', vscode.TreeItemCollapsibleState.None, 'moodleAI.syncData'));
                items.push(new MoodleAIItem('📊 Show Stats', 'System statistics', vscode.TreeItemCollapsibleState.None, 'moodleAI.showStats'));
            } else {
                items.push(new MoodleAIItem('❌ Disconnected', 'Server not running', vscode.TreeItemCollapsibleState.None));
                items.push(new MoodleAIItem('🔧 Test Connection', 'Check server status', vscode.TreeItemCollapsibleState.None, 'moodleAI.testConnection'));
            }
        } catch (error) {
            items.push(new MoodleAIItem('⚠️ Error', 'Connection failed', vscode.TreeItemCollapsibleState.None));
        }

        return items;
    }
}

class MoodleAIItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly tooltip: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        commandName?: string
    ) {
        super(label, collapsibleState);
        this.tooltip = tooltip;
        
        if (commandName) {
            this.command = {
                command: commandName,
                title: label
            };
        }
    }
}