export const WORKER_PATHS = {
  vfs: new URL('./vfs.worker.ts', import.meta.url),
  compilerC: new URL('./compiler.c.worker.ts', import.meta.url),
  compilerPy: new URL('./compiler.py.worker.ts', import.meta.url),
  compilerJava: new URL('./compiler.java.worker.ts', import.meta.url)
} as const;
