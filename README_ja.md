# Link Board

VSCode内でプロジェクトに関連するリンクを管理・表示するための、カスタマイズ可能なダッシュボードです。

![Link Board デモ](https://i.imgur.com/your-image.gif)
ドキュメント、APIリファレンス、ステージング環境など、開発中に頻繁にアクセスするURLを`settings.json`で一元管理し、ブラウザとエディタを行き来する手間を省きます。

## 機能

* **✨ カードベースのUI**: リンクを視覚的に分かりやすいカード形式で、ファビコン付きで表示します。
* **🏷️ タグによるフィルタリング**: 各リンクにタグを付け、特定のタグを持つリンクだけを絞り込んで表示できます。
* **🔍 リアルタイム検索**: 検索バーに入力すると、即座にタイトルや説明文でリンクを絞り込みます。
* **🖍️ キーワードハイライト**: 検索語句がカード内でハイライトされ、見つけやすくなります。
* **✏️ GUIによる編集**: `settings.json`を直接編集することなく、専用の編集画面でリンクの追加・編集・削除が可能です。
* **⚡ ステータスバーからの高速アクセス**: ステータスバーのアイコンからワンクリックでボードを開けます（設定で非表示にできます）。
* **🔄 自動リロード**: `settings.json`を保存すると、開いているボードが自動で最新の状態に更新されます。

## 使い方

### Link Boardを開く

* VSCodeのステータスバーの左下にある `$(link) Link Board` をクリックします。
* または、コマンドパレット (`Ctrl+Shift+P` または `Cmd+Shift+P`) で `Link Board: Show` を実行します。

### リンクを編集する

* コマンドパレットで `Link Board: Edit Links` を実行すると、リンクを管理するための専用画面が開きます。

## 設定方法

ワークスペースの`.vscode/settings.json`ファイルに、`link-board.links`という項目を追加してリンクリストを定義します。

**`settings.json`の記述例:**

```json
{
  "link-board.links": [
    {
      "label": "React Docs",
      "url": "[https://react.dev/](https://react.dev/)",
      "description": "The official documentation for React.",
      "tags": ["react", "docs", "frontend"]
    },
    {
      "label": "MDN Web Docs",
      "url": "[https://developer.mozilla.org/](https://developer.mozilla.org/)",
      "description": "Resources for developers, by developers.",
      "tags": ["docs", "web"]
    }
  ]
}
```

## 拡張機能の設定項目

本拡張機能は以下の設定項目を提供します。

| 設定項目                 | 説明                                   | デフォルト値 |
| :------------------------- | :------------------------------------- | :----------: |
| `link-board.links`         | ボードに表示するリンクリスト           |     `[]`     |
| `link-board.debounceTime`  | 検索フィルターのデバウンス時間（ミリ秒） |    `250`     |
| `link-board.showStatusBar` | ステータスバーにショートカットを表示する |    `true`    |


## リリースノート

詳細は [CHANGELOG.md](CHANGELOG.md) を参照してください。

## ライセンス

[MIT](LICENSE.md)