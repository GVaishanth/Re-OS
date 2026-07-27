# Config Module (`@modules/config/*`)

Manages strict system preferences without scope creep:

- `SettingsModule`: Strict 6-parameter JSON configuration store (`Theme`, `Font Size`, `Auto Save`, `Word Wrap`, `Reset Settings`, `About`). Removes arbitrary customization like cursor styles.
- `ThemeModule`: Dynamically applies CSS variable palettes across DOM boundaries without page reloads for all 5 built-in themes (`Pure Black`, `Classic CMD`, `VS Code Dark+`, `Matrix`, `Light`).
