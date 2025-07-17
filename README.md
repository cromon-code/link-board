# Link Board

A customizable dashboard for your project links, right inside VS Code.

![Link Board Demo](https://i.imgur.com/your-image.gif)
Link Board provides a WebView panel to display and manage a list of frequently used URLs like documentation, API references, or staging environments. Keep your important links organized and accessible without ever leaving your editor.

## Features

* **✨ Card-based UI:** Displays your links as clean, easy-to-read cards with favicons.
* **🏷️ Tag-based Filtering:** Organize your links with tags and filter the view with a single click.
* **🔍 Real-time Search:** Instantly find links by searching through titles and descriptions.
* **🖍️ Keyword Highlighting:** The search term is automatically highlighted on the cards for easy identification.
* **✏️ GUI for Editing:** A dedicated editor UI to add, edit, and delete links without manually touching `settings.json`.
* **⚡ Status Bar Shortcut:** A handy icon in the status bar for one-click access to your board (can be disabled in settings).
* **🔄 Automatic Reload:** The board automatically updates when you save changes to your `settings.json`.

## Usage

### Opening the Link Board

* Click the `$(link) Link Board` icon in the status bar.
* **OR**, open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`) and run `Link Board: Show`.

### Editing Your Links

* Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`) and run `Link Board: Edit Links`. This will open a graphical editor for your links.

## Configuration

Add a `link-board.links` array to your workspace's `.vscode/settings.json` file.

**Example `settings.json`:**

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

## Extension Settings

This extension contributes the following settings:

| Setting                    | Description                                              | Default |
| -------------------------- | -------------------------------------------------------- | :-----: |
| `link-board.links`         | An array of link objects to display on the board.        |  `[]`   |
| `link-board.debounceTime`  | The debounce time in milliseconds for the search filter. |  `250`  |
| `link-board.showStatusBar` | Show the Link Board shortcut in the status bar.          | `true`  |

## Release Notes

See CHANGELOG.md for details.

## License

MIT LICENSE
