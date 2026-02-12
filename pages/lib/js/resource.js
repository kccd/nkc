import { getFileMD5 } from './file';
import { nkcAPI, nkcUploadFile } from './netAPI';
import { newQueue } from '@henrygd/queue';

// ueditor 编辑器在使用的文件上传
export function UploadResource(props) {
  const { file, cid, defaultFileName = '', onProgress = () => {} } = props;
  return uploadResourceAsChunks({
    file,
    onProgress,
    filename: defaultFileName,
    cid,
    type: 'resource',
  });
}
// tiptap 编辑器在使用的文件上传
export function UploadResourceV2(props) {
  const { file, cid, defaultFileName = '', onProgress = () => {} } = props;
  return uploadResourceAsChunks({
    file,
    onProgress,
    filename: defaultFileName,
    cid,
    type: 'resource',
  });
}

// props.file: File对象
// props.onProgress: 上传进度回调，参数为 { type: 'preparing' | 'uploading' | 'processing' | 'done', progress: 0-100 }
// props.filename: 上传后的文件名，默认为 file.name
// props.type: resource, sticker
// props.cid: 附件分类ID
// props.toc: 从文件管理器选择附件的时间
// props.share: 作为表情时，是否需要分享
export async function uploadResourceAsChunks(props) {
  const { file, onProgress, filename, cid, type, toc, share } = props;
  onProgress({ type: 'preparing', progress: 0 });
  const md5 = await getFileMD5(file, (progress) => {
    onProgress({ type: 'preparing', progress });
  });
  const md5Res = await nkcAPI('/rs/md5', 'POST', {
    md5,
    filename: filename || file.name,
  });
  // 如果文件已存在，直接返回
  if (md5Res.uploaded) {
    onProgress({ type: 'done', progress: 100 });
    return;
  }
  const { chunkFiles } = await nkcAPI(
    `/rs/chunk?hash=${md5}&size=${file.size}`,
    'GET',
  );

  let uploadedSize = 0;
  const pendingChunks = [];
  for (let i = 0; i < chunkFiles.length; i++) {
    const chunkFile = chunkFiles[i];
    if (chunkFile.exists) {
      uploadedSize += chunkFile.size || 0;
      continue;
    }
    pendingChunks.push({
      index: i,
      offset: chunkFile.offset,
      size: chunkFile.size,
    });
  }
  onProgress({ type: 'uploading', progress: 0 });
  if (file.size > 0) {
    onProgress({
      type: 'uploading',
      progress: Number(
        Math.min(100, (uploadedSize / file.size) * 100).toFixed(1),
      ),
    });
  }
  const queue = newQueue(10);
  const chunkProgressMap = new Map();
  const getTotalUploaded = () => {
    let inFlight = 0;
    for (const value of chunkProgressMap.values()) {
      inFlight += value;
    }
    return uploadedSize + inFlight;
  };
  pendingChunks.map((chunk) => {
    queue.add(() => {
      const blob = file.slice(chunk.offset, chunk.offset + chunk.size);
      const formData = new FormData();
      formData.append('index', chunk.index);
      formData.append('hash', md5);
      formData.append('size', file.size);
      formData.append('chunk', blob, file.name || Date.now() + '.bin');

      return nkcUploadFile(
        `/rs/chunk`,
        'POST',
        formData,
        function (e, progress) {
          const loaded = e && typeof e.loaded === 'number' ? e.loaded : 0;
          const currentChunkUploaded = Math.min(loaded, chunk.size || 0);
          chunkProgressMap.set(chunk.index, currentChunkUploaded);
          const current = getTotalUploaded();
          if (file.size > 0) {
            onProgress({
              type: 'uploading',
              progress: Number(
                Math.min(100, (current / file.size) * 100).toFixed(1),
              ),
            });
          }
        },
        60 * 60 * 1000,
      );
    });
  });
  await queue.done();
  onProgress({ type: 'processing', progress: 100 });
  const res = await nkcAPI('/rs/chunk/merge', 'POST', {
    hash: md5,
    size: file.size,
    name: filename || file.name,
    cid: cid,
    toc: toc,
    share: share,
    type: type, // resource, sticker
  });
  onProgress({ type: 'done', progress: 100 });
  return res;
}
