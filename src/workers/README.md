# Web Workers Layer (`@workers/*`)

Dedicated background threads executing intensive operations off the main browser UI thread:

- `vfs.worker.ts`: Background synchronous Origin Private File System (OPFS) read/write operations.
- `compiler.c.worker.ts`: WebAssembly host thread for Clang/LLVM C/C++ compilation (`clang.wasm`, `lld.wasm`).
- `compiler.py.worker.ts`: WebAssembly host thread for Pyodide CPython execution (`python.wasm`).
- `compiler.java.worker.ts`: WebAssembly host thread for CheerpJ / ECJ Java compilation and JVM runtime.
