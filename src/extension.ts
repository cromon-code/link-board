import * as vscode from 'vscode';
import * as path from 'path';

type LinkItem = {
    label: string;
    url: string;
    description?: string;
    tags?: string[];
};

let displayPanel: vscode.WebviewPanel | undefined = undefined;
let editPanel: vscode.WebviewPanel | undefined = undefined;
let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {

    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.command = 'link-board.show';
    statusBarItem.text = `$(link) Link Board`;
    statusBarItem.tooltip = 'Click to open Link Board';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    const initialConfig = vscode.workspace.getConfiguration('link-board');
    if (initialConfig.get<boolean>('showStatusBar')) {
        statusBarItem.show();
    } else {
        statusBarItem.hide();
    }

    // View Command
    context.subscriptions.push(
        vscode.commands.registerCommand('link-board.show', () => {
            if (displayPanel) {
                displayPanel.reveal(vscode.ViewColumn.One);
                return;
            }

            displayPanel = vscode.window.createWebviewPanel(
                'linkBoard',
                'Link Board',
                vscode.ViewColumn.One,
                {
                    localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'media'))],
                    retainContextWhenHidden: true,
                    enableScripts: true // スクリプトを有効化
                }
            );

            const config = vscode.workspace.getConfiguration('link-board');
            const linksConfig = config.get<LinkItem[]>('links') || [];
            displayPanel.webview.html = getDisplayWebviewContent(context, displayPanel.webview, linksConfig);

            displayPanel.onDidDispose(() => {
                displayPanel = undefined;
            }, null, context.subscriptions);
        })
    );

    // Edit Command
    context.subscriptions.push(
        vscode.commands.registerCommand('link-board.edit', async () => {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders) {
                vscode.window.showErrorMessage('フォルダが開かれていないため、リンクを編集できません。');
                return;
            }
    
            let targetFolderUri: vscode.Uri;
            if (workspaceFolders.length === 1) {
                targetFolderUri = workspaceFolders[0].uri;
            } else {
                const pickedFolder = await vscode.window.showQuickPick(
                    workspaceFolders.map(folder => ({
                        label: folder.name,
                        description: folder.uri.fsPath,
                        uri: folder.uri
                    })),
                    { placeHolder: 'リンクを編集するフォルダを選択してください' }
                );
                if (!pickedFolder) { return; }
                targetFolderUri = pickedFolder.uri;
            }

            if (editPanel) {
                editPanel.reveal(vscode.ViewColumn.One);
                return;
            }
            editPanel = vscode.window.createWebviewPanel(
                'linkBoardEdit', 'Edit Links', vscode.ViewColumn.One, {
                    enableScripts: true,
                    localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'media'))],
                    retainContextWhenHidden: true
                }
            );
    
            // 1. 編集用WebViewのHTMLコンテンツを設定
            editPanel.webview.html = getEditWebviewContent(context, editPanel.webview);
    
            // 2. 現在のリンク情報をWebViewに送信
            const config = vscode.workspace.getConfiguration('link-board', targetFolderUri);
            const linksConfig = config.get<LinkItem[]>('links') || [];
            editPanel.webview.postMessage({
                type: 'load',
                data: linksConfig
            });
    
            // 3. WebViewからのメッセージ（保存通知）を受け取る
            editPanel.webview.onDidReceiveMessage(
                async message => {
                    if (message.type === 'save') {
                        // 受け取ったデータでsettings.jsonを更新
                        await config.update('links', message.data, vscode.ConfigurationTarget.WorkspaceFolder);
                        vscode.window.showInformationMessage('リンクを保存しました！');
                        editPanel?.dispose(); // 保存したらパネルを閉じる
                    }
                },
                null,
                context.subscriptions
            );
    
            editPanel.onDidDispose(() => {
                editPanel = undefined;
            }, null, context.subscriptions);
        })
    );
    // configuration changes Listener
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(event => {
            if (event.affectsConfiguration('link-board.links') && displayPanel) {
                const config = vscode.workspace.getConfiguration('link-board');
                const linksConfig = config.get<LinkItem[]>('links') || [];
                displayPanel.webview.html = getDisplayWebviewContent(context, displayPanel.webview, linksConfig);
            }

            if (event.affectsConfiguration('link-board.showStatusBar')) {
                const config = vscode.workspace.getConfiguration('link-board');
                if (config.get<boolean>('showStatusBar')) {
                    statusBarItem.show();
                } else {
                    statusBarItem.hide();
                }
            }
        })
    );
}

function getDisplayWebviewContent(context: vscode.ExtensionContext, webview: vscode.Webview, items: LinkItem[]): string {
    const allTags = new Set<string>();
    items.forEach(item => {
        item.tags?.forEach(tag => allTags.add(tag));
    });

    const tagButtonsHtml = `<div id="tag-container">
        <button class="tag-btn active" data-tag="all">All</button>
        ${[...allTags].map(tag => `<button class="tag-btn" data-tag="${tag}">${tag}</button>`).join('')}
    </div>`;

    const linkCardsHtml = `<div class="card-container">
        ${items.map(createCardHtml).join('')}
    </div>`;
    
    const stylePath = vscode.Uri.file(path.join(context.extensionPath, 'media', 'style.css'));
    const styleUri = webview.asWebviewUri(stylePath);
    const scriptPath = vscode.Uri.file(path.join(context.extensionPath, 'media', 'main.js'));
    const scriptUri = webview.asWebviewUri(scriptPath);

    return `
        <!DOCTYPE html>
        <html lang="ja">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; img-src https: data:; script-src ${webview.cspSource};">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Link Board</title>
            <link rel="stylesheet" href="${styleUri}">
        </head>
        <body data-debounce-time="250">
            <h1>Link Board</h1>
            
            <input type="text" id="search-box" placeholder="Filter links...">
            
            ${tagButtonsHtml}
            <div id="no-results-message" class="hidden">一致するリンクはありませんでした。</div>
            ${linkCardsHtml}
            <script src="${scriptUri}"></script>
        </body>
        </html>
    `;
}

function getEditWebviewContent(context: vscode.ExtensionContext, webview: vscode.Webview): string {
    const styleUri = webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'media', 'edit-style.css')));
    const scriptUri = webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'media', 'edit.js')));

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src ${webview.cspSource};">
            <title>Edit Links</title>
            <link rel="stylesheet" href="${styleUri}">
        </head>
        <body>
            <h1>Edit Links</h1>
            
            <a href="#actions" class="scroll-link">Move to Bottom of Page ↓</a>

            <div id="links-container"></div>

            <div id="actions" class="actions-bar">
                <button id="add-link-btn">Add New Link</button>
                <button id="save-changes-btn">Save</button>
            </div>

            <script src="${scriptUri}"></script>
        </body>
        </html>
    `;
}

function createCardHtml(link: LinkItem): string {
    let hostname = '';
    try {
        hostname = new URL(link.url).hostname;
    } catch (e) {}
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;

    return `
        <a href="${link.url}" class="card" data-tags="${link.tags?.join(',') || ''}">
            <img src="${faviconUrl}" class="favicon" alt="" width="20" height="20">
            <div class="card-content">
                <div class="card-title">${link.label}</div>
                ${link.description ? `<div class="card-description">${link.description}</div>` : ''}
            </div>
        </a>
    `;
}

export function deactivate() {}