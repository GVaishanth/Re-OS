# Re`OS — Production Project Skeleton

Re`OS is a 100% local-first, browser-native development operating environment engineered around:
- **70% Windows Command Prompt** (Permanent terminal core & control surface)
- **20% VS Code Modal Editor** (Lightweight code buffer editing)
- **10% Chrome File Tabs** (Exclusively for open code files)

## Architecture Overview
This project strictly implements the frozen Re`OS modular architecture. Every feature exists as an isolated module communicating over `ReOSBus` with zero cloud fallback or backend dependencies.

