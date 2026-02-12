const router = require('koa-router')();
const path = require('path');
const fs = require('fs');
const FILE = require('../../nkcModules/file');
const { OnlyUnbannedUser } = require('../../middlewares/permission');

/* 
  指定hash和size，返回需要上传的chunk列表
  每个chunk包含：filename, size, offset, exists
*/
router.get('/', OnlyUnbannedUser(), async (ctx, next) => {
  const { hash, size } = ctx.query;
  if (!isSafeHash(hash)) {
    ctx.throw(400, 'Invalid hash');
  }
  const totalSize = Number(size);
  if (Number.isNaN(totalSize) || totalSize <= 0) {
    ctx.throw(400, 'Invalid chunk size');
  }
  const { chunkFiles } = getChunkFiles(hash, totalSize);
  ctx.data.chunkFiles = [];
  for (const chunkFile of chunkFiles) {
    let exists = false;
    try {
      const stat = await fs.promises.stat(chunkFile.path);
      exists = stat.size === chunkFile.size;
    } catch (err) {
      exists = false;
    }
    ctx.data.chunkFiles.push({
      filename: chunkFile.filename,
      size: chunkFile.size,
      offset: chunkFile.offset,
      exists,
    });
  }
  await next();
});

// 上传单个chunk，指定hash、size和index
router.post('/', OnlyUnbannedUser(), async (ctx, next) => {
  const { hash, size, index } = ctx.body.fields;
  if (!isSafeHash(hash)) {
    ctx.throw(400, 'Invalid hash');
  }
  const chunk = ctx.body.files.chunk;
  const totalSize = Number(size);
  if (Number.isNaN(totalSize) || totalSize <= 0) {
    ctx.throw(400, 'Invalid chunk size');
  }
  const { chunkFiles } = getChunkFiles(hash, totalSize);
  if (index < 0 || index >= chunkFiles.length) {
    ctx.throw(400, 'Invalid chunk index');
  }
  const chunkFilePath = chunkFiles[index].path;
  await fs.promises.mkdir(path.dirname(chunkFilePath), { recursive: true });
  await fs.promises.rename(chunk.path, chunkFilePath);
  ctx.data.message = 'Chunk uploaded successfully';
  await next();
});

// 合并chunk，指定hash和size
router.post('/merge', OnlyUnbannedUser(), async (ctx, next) => {
  // 正常上传附件必须参数
  const { hash, size, name, toc, cid } = ctx.body;
  // 上传表情
  const { type, share } = ctx.body;
  if (!isSafeHash(hash) || !size) {
    ctx.throw(400, 'Invalid merge params');
  }
  const totalSize = Number(size);
  if (Number.isNaN(totalSize) || totalSize <= 0) {
    ctx.throw(400, 'Invalid merge size');
  }
  const { chunkFiles, mergedFilePath, chunkDirPath } = getChunkFiles(
    hash,
    totalSize,
  );
  await fs.promises.mkdir(path.dirname(mergedFilePath), { recursive: true });
  for (const chunkFile of chunkFiles) {
    try {
      await fs.promises.access(chunkFile.path);
    } catch (err) {
      ctx.throw(400, 'Chunk file missing');
    }
  }

  const writeStream = fs.createWriteStream(mergedFilePath);
  try {
    for (const chunkFile of chunkFiles) {
      await new Promise((resolve, reject) => {
        const readStream = fs.createReadStream(chunkFile.path);
        const onError = (err) => {
          readStream.destroy();
          reject(err);
        };
        readStream.on('error', onError);
        writeStream.once('error', onError);
        readStream.on('end', () => {
          writeStream.removeListener('error', onError);
          resolve();
        });
        readStream.pipe(writeStream, { end: false });
      });
    }
    await new Promise((resolve, reject) => {
      writeStream.end(() => resolve());
      writeStream.on('error', reject);
    });
  } catch (err) {
    writeStream.destroy();
    throw err;
  }

  await fs.promises.rm(chunkDirPath, { recursive: true, force: true });

  const file = await FILE.getFileObjectByFilePath(mergedFilePath);
  file.name = name || file.name;
  // 验证上传权限
  await ctx.db.ResourceModel.checkUploadPermission(ctx.data.user, file);

  const extension = await ctx.nkcModules.file.getFileExtension(file);

  const rid = await ctx.db.SettingModel.operateSystemID('resources', 1);

  const mediaType = ctx.db.ResourceModel.getMediaTypeByExtension(extension);
  const currentTime = Date.now();
  const oneHourInMs = 60 * 60 * 1000; // 一小时的毫秒数

  const resourceType =
    mediaType === 'mediaPicture' && type === 'sticker' ? 'sticker' : 'resource';

  const resourceInfo = {
    rid,
    type: resourceType,
    oname: name,
    ext: extension,
    size,
    hash,
    uid: ctx.state.uid,
    // toc: fields.toc || Date.now(),
    toc:
      toc &&
      Number(toc) >= currentTime - oneHourInMs &&
      Number(toc) <= currentTime + oneHourInMs
        ? toc
        : currentTime,
    mediaType,
    state: 'inProcess',
  };

  if (cid && cid !== 'default' && cid !== 'all' && cid !== 'trash') {
    resourceInfo.cid = cid;
  }

  const r = ctx.db.ResourceModel(resourceInfo);

  // 创建表情数据
  if (type === 'sticker') {
    if (mediaType !== 'mediaPicture') {
      ctx.throw(400, '图片格式错误');
    }
    await ctx.db.StickerModel.uploadSticker({
      rid,
      uid: ctx.data.user.uid,
      share: !!share,
    });
  }

  await r.save();
  ctx.data.r = r;
  // 将文件推送到 media service
  r.pushToMediaService(file.path).catch(async (err) => {
    await ctx.db.ResourceModel.updateResourceStatus({
      rid,
      status: false,
      error: err.message,
    });
  });

  await next();
});

module.exports = router;

function getChunkFiles(hash, size) {
  // 上传的临时文件夹路径
  const tmpDirPath = path.resolve(__dirname, '../../tmp');
  // 当前附件的临时文件夹路径
  const chunkDirPath = path.resolve(tmpDirPath, `chunks_${hash}`);
  // 合并后的文件路径
  const mergedFilePath = path.resolve(tmpDirPath, `upload_${hash}_merged`);
  if (!chunkDirPath.startsWith(tmpDirPath)) {
    throw new Error('Invalid hash');
  }
  if (!Number.isFinite(size) || size <= 0) {
    throw new Error('Invalid size');
  }
  const chunkSize = 1024 * 1024 * 20;
  const chunkCount = Math.ceil(size / chunkSize);
  if (chunkCount > 1000) {
    throw new Error('Chunk count exceeds limit(1000 chunks x 20MB)');
  }
  const chunkFiles = [];
  for (let i = 0; i < chunkCount; i++) {
    const chunkFileName = `chunk_${hash}_${i}`;
    const chunkFilePath = path.resolve(chunkDirPath, chunkFileName);
    chunkFiles.push({
      path: chunkFilePath,
      filename: chunkFileName,
      size: i === chunkCount - 1 ? size - chunkSize * i : chunkSize,
      offset: chunkSize * i,
    });
  }
  return {
    chunkDirPath,
    mergedFilePath,
    chunkFiles,
  };
}

function isSafeHash(hash) {
  return typeof hash === 'string' && /^[a-f0-9]{32,64}$/i.test(hash);
}
