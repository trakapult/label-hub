class CacheManager {
  constructor(windowSize) {
    this.cache = new Map();
    this.windowSize = windowSize;
  }
  isCached(sampleId) {
    return this.cache.has(sampleId);
  }
  getCachedFile(sampleId) {
    return this.cache.get(sampleId);
  }
  cacheFile(sampleId, fileData) {
    this.cache.set(sampleId, fileData);
  }
  deleteCache(sampleId) {
    const keysToDelete = [];
    for (let [key] of this.cache) {
      if (key < sampleId - this.windowSize || key > sampleId + this.windowSize) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => {
      // const blobUrl = this.cache.get(key).data.file;
      // URL.revokeObjectURL(blobUrl);
      this.cache.delete(key);
      // console.log(`Cache deleted: ${key}`);
    });
  }
}

export default new CacheManager(2);