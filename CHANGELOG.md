# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.3] - 2025-07-18

### Fixed

- Fixed a bug where unsaved changes in the edit panel were lost when adding a new link.
- Fixed an issue where the status bar icon would not appear until a command was run by adding the `onStartupFinished` activation event.

## [1.0.2] - 2025-07-18

### Fixed

* Resolved an issue where the delete confirmation modal was blocked by the WebView's security sandbox, preventing links from being deleted. A custom modal is now used.
* Corrected various TypeScript and Webpack build configuration errors.

## [1.0.1] - 2025-07-18

### Fixed
- Fixed the link to the repository.

## [1.0.0] - 2025-07-17

### Added

* **🎉 Initial Release!**
* **Display Links**: View links from `.vscode/settings.json` in a WebView panel with a card-based UI.
* **Search & Filter**:
    * Real-time text search to filter links by title and description.
    * Tagging system to organize links and filter by tags.
    * Highlighting of matching keywords in search results.
    * A "No results found" message when filters yield no matches.
    * Debounce processing for the search input to improve performance.
* **GUI Editor**:
    * A dedicated WebView panel (`Link Board: Edit Links`) to graphically add, edit, and delete links.
    * A confirmation dialog before deleting a link to prevent mistakes.
    * Robust handling of settings for multi-root workspaces.
* **UX Improvements**:
    * A status bar shortcut for one-click access to the Link Board.
    * The Link Board panel automatically reloads when `settings.json` is saved.
    * Panel content is retained when switching tabs, preventing flickering.
* **Configuration**:
    * Added a setting to show/hide the status bar shortcut (`link-board.showStatusBar`).
    * Added a setting to configure the search debounce time (`link-board.debounceTime`).