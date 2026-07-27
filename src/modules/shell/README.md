# Shell Module (`@modules/shell/*`)

Manages the top-level application layout and viewport zoning:

- `AppShellModule`: Enforces adaptive split-screen layout between the permanent terminal (70%) and modal editor (20%). Never hardcodes viewport percentages.
- `TabManagerModule`: Manages the 10% Chrome tab strip **exclusively for open editor files** (`main.cpp •`, `utils.h`). Never represents the terminal as a tab.
- `StatusBarModule`: Bottom telemetry strip reporting execution status, detected language, cursor line/col, word wrap, encoding, and dynamic storage usage (`Storage Used / Available`).
