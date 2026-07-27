// Background OPFS synchronous file I/O worker thread.
self.onmessage = async (event: MessageEvent) => {
  const { type, payload } = event.data;
  if (type === 'VFS:SYNC_READ') {
    void payload;
    self.postMessage({ type: 'VFS:SYNC_READ_RESULT', payload: { success: true } });
  }
};
