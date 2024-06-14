import api from "../api";
import cacheManager from "./cacheManager";

/*
const binaryToBytes = (binary) => {
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

const cacheBlob = (res) => {
  const blob = new Blob([binaryToBytes(res.data.file)], {type: res.data.fileInfo.contentType});
  res.data.file = URL.createObjectURL(blob);
  cacheManager.cacheFile(res.data.fileInfo.sampleId, res);
}
*/

export default {
  create (token, dataset) {
    return api(token).post("datasets", dataset);
  },
  edit (token, datasetId, dataset) {
    return api(token).put(`dataset/${datasetId}`, dataset);
  },
  delete (token, datasetId) {
    return api(token).delete(`dataset/${datasetId}`);
  },
  getAll (token, search, selections) {
    const {admin, type, dataType, labelType, segments} = selections;
    return api(token).get(`datasets?search=${search}&admin=${admin}&type=${type}&dataType=${dataType}&labelType=${labelType}&segments=${segments}`);
  },
  get (token, datasetId) {
    return api(token).get(`dataset/${datasetId}`);
  },
  async getFile(token, datasetId, sampleId) {
    let res = null;
    if (cacheManager.isCached(sampleId)) {
      // console.log(`Cache hit: ${sampleId}`);
      res = cacheManager.getCachedFile(sampleId);
    } else {
      // console.log(`Cache miss: ${sampleId}`);
      res = await api(token).get(`file/${datasetId}/${sampleId}`);
      cacheManager.cacheFile(sampleId, res);
    }
    for (let i = 1; i <= cacheManager.windowSize; i++) {
      const prefetchId = sampleId + i;
      if (!cacheManager.isCached(prefetchId)) {
        api(token).get(`file/${datasetId}/${prefetchId}`)
          .then((prefetchRes) => cacheManager.cacheFile(prefetchId, prefetchRes));
      }
    }
    for (let i = 1; i <= cacheManager.windowSize; i++) {
      const prefetchId = sampleId - i;
      if (prefetchId < 0) break;
      if (!cacheManager.isCached(prefetchId)) {
        api(token).get(`file/${datasetId}/${prefetchId}`)
          .then((prefetchRes) => cacheManager.cacheFile(prefetchId, prefetchRes));
      }
    }
    cacheManager.deleteCache(sampleId);
    return res;
  }
}