import * as vscode from 'vscode';
import { ServerManager } from '../services/ServerManager';

export class ChatPanel {
    public static currentPanel: ChatPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private _disposables: vscode.Disposable[] = [];
    private static serverManager: ServerManager;

    public static createOrShow(extensionUri: vscode.Uri, serverManager: ServerManager) {
        ChatPanel.serverManager = serverManager;
        const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

        if (ChatPanel.currentPanel) {
            ChatPanel.currentPanel._panel.reveal(column);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'moodleAIChat',
            'Moodle AI Assistant',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'webview')]
            }
        );

        ChatPanel.currentPanel = new ChatPanel(panel, extensionUri);
    }

    public static sendMessage(message: string) {
        if (ChatPanel.currentPanel) {
            ChatPanel.currentPanel._panel.webview.postMessage({
                command: 'sendMessage',
                message: message
            });
        }
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._panel.webview.html = this._getHtmlForWebview();
        this._setWebviewMessageListener();
    }

    private _setWebviewMessageListener() {
        this._panel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case 'sendQuery':
                        try {
                            const sessionId = 'vscode-session-' + Date.now();
                            const response = await ChatPanel.serverManager.sendQuery(message.query, sessionId);
                            
                            this._panel.webview.postMessage({
                                command: 'receiveResponse',
                                response: response.content || 'No response received',
                                provider: response.provider || 'unknown'
                            });
                        } catch (error) {
                            this._panel.webview.postMessage({
                                command: 'receiveError',
                                error: (error as any).message
                            });
                        }
                        break;
                }
            },
            null,
            this._disposables
        );
    }

    private _getHtmlForWebview(): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Moodle AI Assistant</title>
    <style>
        body { font-family: var(--vscode-font-family); margin: 0; padding: 20px; }
        .chat-container { display: flex; flex-direction: column; height: 100vh; }
        .messages { flex: 1; overflow-y: auto; margin-bottom: 20px; }
        .message { margin: 10px 0; padding: 10px; border-radius: 5px; }
        .user-message { background: var(--vscode-button-background); color: var(--vscode-button-foreground); }
        .ai-message { background: var(--vscode-editor-background); border: 1px solid var(--vscode-panel-border); }
        .input-container { display: flex; gap: 10px; }
        .input-field { flex: 1; padding: 10px; border: 1px solid var(--vscode-input-border); background: var(--vscode-input-background); color: var(--vscode-input-foreground); }
        .send-button { padding: 10px 20px; background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; cursor: pointer; }
        .provider-info { font-size: 0.8em; color: var(--vscode-descriptionForeground); margin-top: 5px; }
    </style>
</head>
<body>
    <div class="chat-container">
        <div class="messages" id="messages">
            <div class="ai-message">
                <strong>Moodle AI Assistant</strong><br>
                Hello! I'm your personal Moodle administrator assistant. I can help you with:
                <ul>
                    <li>Course creation and management</li>
                    <li>User enrollment and management</li>
                    <li>Question bank review and creation</li>
                    <li>Performance analysis</li>
                    <li>Configuration updates</li>
                </ul>
                What would you like to do today?
            </div>
        </div>
        <div class="input-container">
            <input type="text" id="messageInput" class="input-field" placeholder="Ask me anything about your Moodle..." />
            <button id="sendButton" class="send-button">Send</button>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        const messagesDiv = document.getElementById('messages');
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');

        function addMessage(content, isUser = false, provider = null) {
            const messageDiv = document.createElement('div');
            messageDiv.className = isUser ? 'user-message message' : 'ai-message message';
            messageDiv.innerHTML = content;
            
            if (provider && !isUser) {
                const providerInfo = document.createElement('div');
                providerInfo.className = 'provider-info';
                providerInfo.textContent = 'Powered by ' + provider;
                messageDiv.appendChild(providerInfo);
            }
            
            messagesDiv.appendChild(messageDiv);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }

        function sendMessage() {
            const message = messageInput.value.trim();
            if (!message) return;

            addMessage('<strong>You:</strong> ' + message, true);
            messageInput.value = '';
            
            addMessage('<strong>AI:</strong> <em>Thinking...</em>');
            
            vscode.postMessage({
                command: 'sendQuery',
                query: message
            });
        }

        sendButton.addEventListener('click', sendMessage);
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });

        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.command) {
                case 'receiveResponse':
                    // Remove thinking message
                    const lastMessage = messagesDiv.lastElementChild;
                    if (lastMessage && lastMessage.textContent.includes('Thinking...')) {
                        messagesDiv.removeChild(lastMessage);
                    }
                    
                    addMessage('<strong>AI:</strong> ' + message.response, false, message.provider);
                    break;
                    
                case 'receiveError':
                    const errorMessage = messagesDiv.lastElementChild;
                    if (errorMessage && errorMessage.textContent.includes('Thinking...')) {
                        messagesDiv.removeChild(errorMessage);
                    }
                    
                    addMessage('<strong>Error:</strong> ' + message.error, false);
                    break;
                    
                case 'sendMessage':
                    messageInput.value = message.message;
                    sendMessage();
                    break;
            }
        });
    </script>
</body>
</html>`;
    }

    public dispose() {
        ChatPanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
}