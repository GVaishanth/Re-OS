# Editor Module (`@modules/editor/*`)

Delivers the modal 20% VS Code editing buffer and minimalist Explorer:

- `EditorModule`: Monospaced syntax-highlighting code editor (`monaco-core`/`CodeMirror`). Strictly modal and buffer-oriented: **No preview panels** (no Markdown preview, browser preview, or split preview) and **no Quick Open (`Ctrl+P`)**.
- `ExplorerModule`: Lightweight, CLI-driven overlay tree using crisp **monochrome 16×16 SVG vector icons** (`[C SVG]`, `[Python SVG]`) that inherit `currentColor` without visual dominance.
