# Filesystem Module (`@modules/filesystem/*`)

Manages virtualized local storage and high-speed in-memory POSIX overlay:

- `VFSModule`: In-memory directory tree representing Windows CMD paths (`C:\Users\ReOS`) synced with POSIX WASM paths (`/workspace/users/reos`).
- `StorageAdapterModule`: Multi-tier persistence backed natively by **Origin Private File System (OPFS)** for sub-millisecond Web Worker file handles, with IndexedDB fallback.
- `FileTransferModule`: Local zip/file drag-and-drop upload/download bridge without backend or cloud dependencies.
