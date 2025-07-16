import * as vscode from 'vscode';
import * as path from 'path';

// 型定義 (変更なし)
type LinkItem = {
    label: string;
    url: string;
    description?: string;
};
type GroupItem = {
    group: string;
    links: LinkItem[];
};
type ConfigItem = LinkItem | GroupItem;

// パネルのキャッシュ用変数 (変更なし)
let panel: vscode.WebviewPanel | undefined = undefined;

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('link-board.show', () => {

          if (panel) {
                panel.reveal(vscode.ViewColumn.One);
                return;
            }

            panel = vscode.window.createWebviewPanel(
                'linkBoard',
                'Link Board',
                vscode.ViewColumn.One,
                {
                    // mediaフォルダへのアクセスとスクリプトを有効にする
                    localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'media'))],
                    retainContextWhenHidden: true 
                }
            );

            const config = vscode.workspace.getConfiguration('link-board');
            const linksConfig = config.get<ConfigItem[]>('links');

            if (!linksConfig || linksConfig.length === 0) {
                vscode.window.showInformationMessage('No links configured in settings.json for Link Board.');
                panel.dispose();
                return;
            }

            // コンテンツを生成して設定
            panel.webview.html = getWebviewContent(context, panel.webview, linksConfig);

            panel.onDidDispose(() => {
                panel = undefined;
            }, null, context.subscriptions);
        })
    );

  // 3. 設定変更を監視するリスナー (ここから追記)
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(event => {
      // 変更が 'link-board.links' に影響するかチェック
      if (event.affectsConfiguration('link-board.links')) {
        // パネルが開かれている場合のみ、リロード処理を実行
        if (panel) {
          console.log('Link Boardの設定が変更されたため、WebViewをリロードします。');
          const config = vscode.workspace.getConfiguration('link-board');
          const linksConfig = config.get<ConfigItem[]>('links') || [];
          panel.webview.html = getWebviewContent(context, panel.webview, linksConfig);
        }
      }
    })
  );
}

function getWebviewContent(context: vscode.ExtensionContext, webview: vscode.Webview, items: ConfigItem[]): string {
    let linkCardsHtml = '';

    // ★ リンクのHTML生成部分を変更
    for (const item of items) {
        if ('group' in item) {
            linkCardsHtml += `<h2>${item.group}</h2>`;
            const groupLinksHtml = item.links.map(link => createCardHtml(link)).join('');
            linkCardsHtml += `<div class="card-container">${groupLinksHtml}</div>`;
        } else {
            linkCardsHtml += `<div class="card-container">${createCardHtml(item)}</div>`;
        }
    }

    // ★ CSSファイルを読み込むためのURIを生成
    const stylePath = vscode.Uri.file(path.join(context.extensionPath, 'media', 'style.css'));
    const styleUri = webview.asWebviewUri(stylePath);

    // ★ HTMLテンプレートを返す
    return `
        <!DOCTYPE html>
        <html lang="ja">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; img-src https: data:;">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Link Board</title>
            <link rel="stylesheet" href="${styleUri}">
        </head>
        <body>
            <h1>Link Board</h1>
            ${linkCardsHtml}
        </body>
        </html>
    `;
}

// ★ カード1枚分のHTMLを生成するヘルパー関数を追加
function createCardHtml(link: LinkItem): string {
    let hostname = '';
    try {
        // URLからホスト名を取得
        hostname = new URL(link.url).hostname;
    } catch (e) {
        // URLが不正な形式の場合は何もしない
    }
    // Googleのサービスを使ってファビコンのURLを生成
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;

    return `
        <a href="${link.url}" class="card">
            <img src="${faviconUrl}" class="favicon" alt="" width="20" height="20">
            <div class="card-content">
                <div class="card-title">${link.label}</div>
                ${link.description ? `<div class="card-description">${link.description}</div>` : ''}
            </div>
        </a>
    `;
}

export function deactivate() {}