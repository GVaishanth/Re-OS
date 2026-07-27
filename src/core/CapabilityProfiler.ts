export interface IBrowserCapabilityProfile {
  hasWebAssembly: boolean;
  hasOPFS: boolean;
  hasIndexedDB: boolean;
  hasSharedArrayBuffer: boolean;
  hasWebWorkers: boolean;
  preferredFilesystem: 'OPFS' | 'IndexedDB';
  preferredMemoryTransport: 'SharedArrayBuffer' | 'MessageChannel';
  preferredTerminalRenderer: 'Canvas' | 'DOM';
}

export class CapabilityProfiler {
  private static profile: IBrowserCapabilityProfile | null = null;

  public static async detectCapabilities(): Promise<IBrowserCapabilityProfile> {
    if (this.profile) {
      return this.profile;
    }

    const hasWebAssembly =
      typeof WebAssembly !== 'undefined' && typeof WebAssembly.instantiate === 'function';
    const hasWebWorkers = typeof Worker !== 'undefined';
    const hasSharedArrayBuffer =
      typeof SharedArrayBuffer !== 'undefined' && typeof Atomics !== 'undefined';
    const hasIndexedDB = typeof indexedDB !== 'undefined';

    let hasOPFS = false;
    try {
      if (
        typeof navigator !== 'undefined' &&
        navigator.storage &&
        typeof navigator.storage.getDirectory === 'function'
      ) {
        // Quick probe to verify sync access handles or directory access in current context
        await navigator.storage.getDirectory();
        hasOPFS = true;
      }
    } catch {
      hasOPFS = false;
    }

    let preferredTerminalRenderer: 'Canvas' | 'DOM' = 'DOM';
    try {
      if (typeof document !== 'undefined') {
        const canvas = document.createElement('canvas');
        if (canvas.getContext('2d')) {
          preferredTerminalRenderer = 'Canvas';
        }
      }
    } catch {
      preferredTerminalRenderer = 'DOM';
    }

    this.profile = {
      hasWebAssembly,
      hasOPFS,
      hasIndexedDB,
      hasSharedArrayBuffer,
      hasWebWorkers,
      preferredFilesystem: hasOPFS ? 'OPFS' : 'IndexedDB',
      preferredMemoryTransport: hasSharedArrayBuffer ? 'SharedArrayBuffer' : 'MessageChannel',
      preferredTerminalRenderer
    };

    return this.profile;
  }

  public static getProfile(): IBrowserCapabilityProfile | null {
    return this.profile;
  }
}
