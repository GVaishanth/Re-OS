# Execution Module (`@modules/execution/*`)

Implements the zero-config `run` execution engine and local WebAssembly worker orchestration:

- `RunCommandController`: Master traffic controller linking `run` CLI invocations, dirty buffer flushing, and process management.
- `LanguageDetectionModule`: Deterministic 5-step heuristics algorithm identifying `C`, `C++`, `Python`, or `Java` without build-system friction.
- `ExecutionEngineModule`: Spawns dedicated background Web Workers (`Process #104`) and manages interactive standard input (`stdin`) via `SharedArrayBuffer` atomics (`Atomics.wait()`/`Atomics.notify()`).
- `CompilerRuntimeModule`: Local WASM runtime toolchains (`Clang/LLVM`, `Pyodide`, `CheerpJ/ECJ`) with strict local-first error boundaries if browser capabilities are missing.
