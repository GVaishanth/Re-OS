# Re`OS — Production Project Skeleton

Re`OS is a 100% local-first, browser-native development operating environment engineered around:
- **70% Windows Command Prompt** (Permanent terminal core & control surface)
- **20% VS Code Modal Editor** (Lightweight code buffer editing)
- **10% Chrome File Tabs** (Exclusively for open code files)

## Architecture Overview
This project strictly implements the frozen Re`OS modular architecture. Every feature exists as an isolated module communicating over `ReOSBus` with zero cloud fallback or backend dependencies.

## Default Filesystem

On first launch, Re`OS automatically creates a realistic Windows-style filesystem:

### System Folders
- `C:\System`
- `C:\Windows`
- `C:\Program Files`
- `C:\Temp`
- `C:\Recycle Bin`

### User Folders
- `C:\Users\ReOS\Desktop`
- `C:\Users\ReOS\Documents`
- `C:\Users\ReOS\Downloads`
- `C:\Users\ReOS\Pictures`
- `C:\Users\ReOS\Projects`

### Protected Folder
- `C:\Admin` — Requires password to access (session-based unlock)

### Default Files
- `README.txt` — Project introduction
- `How To Use Re-OS.txt` — Complete user guide
- `hello.py`, `main.cpp`, `Main.java` — Sample code files

### Key Behaviors
- Deleted files are moved to **Recycle Bin** (not permanently removed)
- Use `emptybin` command to permanently clear Recycle Bin
- Protected folders cannot be deleted or renamed
- All changes persist in the browser (`localStorage` + `IndexedDB`)

## 🚀 GitHub Pages Deployment

This project is **100% static** and ready for GitHub Pages.

### Quick Deploy

1. Use the `index.html` file in the repository root
2. Push to GitHub
3. Enable GitHub Pages in repository settings (Source: `main` branch, Folder: `/ (root)`)

Your site will be live at: `https://username.github.io/Re-OS/`

### Features
- ✅ Animated boot screen with progress bar
- ✅ Fully functional terminal, editor, and explorer
- ✅ All data persists in browser (localStorage + IndexedDB)
- ✅ No build step required
- ✅ No backend dependencies

---

## Development

```bash
npm install
npm run dev
```

