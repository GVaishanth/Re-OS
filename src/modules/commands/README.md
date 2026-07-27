# Commands Module (`@modules/commands/*`)

Implements the decoupled Command-Dispatch architecture:

- `CommandDispatcher`: Lexical tokenizer, POSIX/Linux aliases translation (`ls -> dir`, `cat -> type`, `rm -> del`), and Levenshtein distance typo correction (`Did you mean: mkdir`).
- `ICommand`: Strict structural contract implemented by every independent command module.
- Individual Command Modules (`CdCommandModule`, `DirCommandModule`, `MkdirCommandModule`, `DelCommandModule`, `CopyCommandModule`, `MoveCommandModule`, `RenCommandModule`, `ClrCommandModule`, `TypeCommandModule`, `EditCommandModule`, `RunCommandModule`, `HistoryCommandModule`, `VersionCommandModule`, `HelpCommandModule`).
