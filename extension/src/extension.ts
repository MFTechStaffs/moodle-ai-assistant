import * as vscode from 'vscode';
import { MoodleAIProvider } from './providers/MoodleAIProvider';
import { ChatPanel } from './panels/ChatPanel';
import { ServerManager } from './services/ServerManager';

let aiProvider: MoodleAIProvider;
let serverManager: ServerManager;

export function activate(context: vscode.ExtensionContext) {
    console.log('Moodle AI Assistant is now active!');

    // Initialize services
    serverManager = new ServerManager();
    aiProvider = new MoodleAIProvider(context, serverManager);

    // Register tree data provider
    vscode.window.registerTreeDataProvider('moodleAI.sidebar', aiProvider);

    // Register commands
    const commands = [
        vscode.commands.registerCommand('moodleAI.activate', () => {
            vscode.window.showInformationMessage('Moodle AI Assistant activated!');
            aiProvider.refresh();
        }),

        vscode.commands.registerCommand('moodleAI.openChat', () => {
            ChatPanel.createOrShow(context.extensionUri, serverManager);
        }),

        vscode.commands.registerCommand('moodleAI.reviewCourse', async () => {
            const courseName = await vscode.window.showInputBox({
                prompt: 'Enter course name to review',
                placeHolder: 'e.g., Electronics Fundamentals'
            });
            
            if (courseName) {
                ChatPanel.createOrShow(context.extensionUri, serverManager);
                ChatPanel.sendMessage(`Review my ${courseName} course`);
            }
        }),

        vscode.commands.registerCommand('moodleAI.createCourse', async () => {
            const courseName = await vscode.window.showInputBox({
                prompt: 'Enter new course name',
                placeHolder: 'e.g., Advanced Embedded Systems'
            });
            
            if (courseName) {
                ChatPanel.createOrShow(context.extensionUri, serverManager);
                ChatPanel.sendMessage(`Create a new course: ${courseName}`);
            }
        }),

        vscode.commands.registerCommand('moodleAI.manageUsers', () => {
            ChatPanel.createOrShow(context.extensionUri, serverManager);
            ChatPanel.sendMessage('Help me manage users and enrollments');
        }),

        vscode.commands.registerCommand('moodleAI.questionBank', () => {
            ChatPanel.createOrShow(context.extensionUri, serverManager);
            ChatPanel.sendMessage('Review my question bank for duplicates and improvements');
        }),

        vscode.commands.registerCommand('moodleAI.testConnection', async () => {
            try {
                const isRunning = await serverManager.checkServerHealth();
                if (isRunning) {
                    vscode.window.showInformationMessage('✅ Moodle AI Assistant is connected and ready!');
                } else {
                    const startServer = await vscode.window.showWarningMessage(
                        'Local server is not running. Start it now?',
                        'Start Server',
                        'Cancel'
                    );
                    
                    if (startServer === 'Start Server') {
                        await serverManager.startServer();
                    }
                }
            } catch (error) {
                vscode.window.showErrorMessage(`Connection failed: ${error.message}`);
            }
        }),

        vscode.commands.registerCommand('moodleAI.syncData', async () => {
            try {
                await serverManager.syncMoodleData();
                vscode.window.showInformationMessage('✅ Moodle data synchronized successfully!');
                aiProvider.refresh();
            } catch (error) {
                vscode.window.showErrorMessage(`Sync failed: ${error.message}`);
            }
        }),

        vscode.commands.registerCommand('moodleAI.showStats', async () => {
            try {
                const stats = await serverManager.getStats();
                const message = `📊 Moodle AI Stats:
Courses: ${stats.courses}
Users: ${stats.users}  
Questions: ${stats.questions}
Conversations: ${stats.conversations}`;
                
                vscode.window.showInformationMessage(message);
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to get stats: ${error.message}`);
            }
        }),

        vscode.commands.registerCommand('moodleAI.refresh', () => {
            aiProvider.refresh();
        })
    ];

    // Add all commands to subscriptions
    commands.forEach(command => context.subscriptions.push(command));

    // Auto-start server if configured
    const config = vscode.workspace.getConfiguration('moodleAI');
    if (config.get('autoStart', true)) {
        serverManager.checkServerHealth().then(isRunning => {
            if (!isRunning) {
                serverManager.startServer().catch(error => {
                    console.error('Failed to auto-start server:', error);
                });
            }
        });
    }

    // Set context for when extension is activated
    vscode.commands.executeCommand('setContext', 'moodleAI.activated', true);
}

export function deactivate() {
    console.log('Moodle AI Assistant is now deactivated');
    
    if (serverManager) {
        serverManager.dispose();
    }
}