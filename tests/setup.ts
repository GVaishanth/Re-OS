// Global Vitest setup file for Re`OS local-first environment mocking
import { beforeAll, afterAll, beforeEach } from 'vitest';

function clearStorage() {
  try {
    if (typeof localStorage !== 'undefined') localStorage.clear();
  } catch { /* ignore */ }
  try {
    if (typeof indexedDB !== 'undefined') {
      indexedDB.deleteDatabase('reos_vfs_db_v1');
    }
  } catch { /* ignore */ }
}

beforeAll(() => {
  clearStorage();
  // Mock OPFS and WebWorker globals if needed in Node/Happy-DOM test runners
});

beforeEach(() => {
  clearStorage();
});

afterAll(() => {
  clearStorage();
  // Clean up mocks
});
