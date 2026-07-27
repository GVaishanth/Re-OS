# Utilities Layer (`@utils/*`)

Provides stateless, pure helper utilities:

- `levenshtein.ts`: Levenshtein edit-distance calculation used by `CommandDispatcherModule` for command typo correction (`Did you mean: mkdir`).
- `path.ts`: Path normalization bridging Windows CMD syntax (`C:\Project\main.c`) to POSIX WASM paths (`/workspace/Project/main.c`).
